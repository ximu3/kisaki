import { eq, inArray } from 'drizzle-orm'
import type { DbContext, DbService } from '@main/services/db'
import type {
  CharacterMetadataUpdateField,
  CharacterMetadataUpdateInput,
  UpdateCharacterMetadataOptions,
  UpdateCharacterMetadataResult
} from '@shared/metadata-updater'
import {
  characterExternalIds,
  characterTagLinks,
  characters,
  tags,
  type Character
} from '@shared/db'
import type { ExternalId, Tag } from '@shared/metadata'
import {
  mergeExternalIds,
  mergeRelatedSites,
  mergeTags,
  resolveUpdateOptions,
  shouldApplyUpdate,
  toExternalIdKey,
  toImageMode
} from '../utils'

const CHARACTER_FIELDS: readonly CharacterMetadataUpdateField[] = [
  'name',
  'originalName',
  'birthDate',
  'gender',
  'age',
  'bloodType',
  'height',
  'weight',
  'bust',
  'waist',
  'hips',
  'cup',
  'description',
  'relatedSites',
  'externalIds',
  'tags',
  'photos'
]

export class CharacterMetadataUpdaterHandler {
  constructor(private db: DbService) {}

  async updateCharacter(
    characterId: string,
    metadata: CharacterMetadataUpdateInput,
    options?: UpdateCharacterMetadataOptions
  ): Promise<UpdateCharacterMetadataResult> {
    this.preCheckExternalIdConflicts(characterId, metadata, options)

    const asset = { photoUrl: undefined as string | undefined }
    const result = this.db.db.transaction((tx) =>
      this.updateCharacterInternal(characterId, metadata, options, tx, asset)
    )
    if (asset.photoUrl) {
      await this.db.attachment.setFile(characters, characterId, 'photoFile', {
        kind: 'url',
        url: asset.photoUrl
      })
    }

    return result
  }

  private updateCharacterInternal(
    characterId: string,
    metadata: CharacterMetadataUpdateInput,
    options: UpdateCharacterMetadataOptions | undefined,
    tx: DbContext,
    asset: { photoUrl?: string }
  ): UpdateCharacterMetadataResult {
    const character = tx
      .select()
      .from(characters)
      .where(eq(characters.id, characterId))
      .limit(1)
      .all()[0]
    if (!character) {
      throw new Error(`Character not found: ${characterId}`)
    }

    const resolved = resolveUpdateOptions<CharacterMetadataUpdateField>(options, CHARACTER_FIELDS)
    if (resolved.fields.length === 0) {
      return { characterId, updatedFields: [] }
    }

    const updatedFields: CharacterMetadataUpdateField[] = []
    const patch: Partial<Character> = {}
    const characterRecord = character as Record<string, unknown>

    for (const field of resolved.fields) {
      switch (field) {
        case 'name':
        case 'originalName':
        case 'birthDate':
        case 'gender':
        case 'age':
        case 'bloodType':
        case 'height':
        case 'weight':
        case 'bust':
        case 'waist':
        case 'hips':
        case 'cup':
        case 'description': {
          const incoming = metadata[field]
          const current = characterRecord[field]
          if (shouldApplyUpdate(current, incoming, resolved.apply)) {
            ;(patch as Record<string, unknown>)[field] = incoming
            updatedFields.push(field)
          }
          break
        }

        case 'relatedSites': {
          const incoming = metadata.relatedSites
          if (!incoming?.length) break

          const next = mergeRelatedSites(character.relatedSites ?? [], incoming, resolved.strategy)
          if (
            resolved.strategy === 'replace' ||
            shouldApplyUpdate(character.relatedSites, incoming, resolved.apply)
          ) {
            patch.relatedSites = next
            updatedFields.push(field)
          }
          break
        }

        case 'externalIds': {
          const incoming = metadata.externalIds
          if (!incoming?.length) break

          const existingRows = tx
            .select()
            .from(characterExternalIds)
            .where(eq(characterExternalIds.characterId, characterId))
            .all()

          const existing = existingRows.map((row) => ({ source: row.source, id: row.externalId }))
          const next = mergeExternalIds(existing, incoming, resolved.strategy)
          if (
            resolved.strategy === 'replace' ||
            shouldApplyUpdate(existing, incoming, resolved.apply)
          ) {
            this.replaceCharacterExternalIds(tx, characterId, next)
            updatedFields.push(field)
          }
          break
        }

        case 'tags': {
          const incoming = metadata.tags
          if (!incoming?.length) break

          const existing = this.getCharacterTags(tx, characterId)
          const next = mergeTags(existing, incoming, resolved.strategy)
          if (
            resolved.strategy === 'replace' ||
            shouldApplyUpdate(existing, incoming, resolved.apply)
          ) {
            this.replaceCharacterTags(tx, characterId, next)
            updatedFields.push(field)
          }
          break
        }

        case 'photos': {
          const incoming = metadata.photos
          if (!incoming?.length || !incoming[0]) break

          const mode = toImageMode(resolved.strategy)
          if (mode === 'replace' || !character.photoFile) {
            asset.photoUrl = incoming[0]
            updatedFields.push(field)
          }
          break
        }
      }
    }

    if (Object.keys(patch).length > 0) {
      tx.update(characters)
        .set(patch as any)
        .where(eq(characters.id, characterId))
        .run()
    }

    return { characterId, updatedFields }
  }

  private preCheckExternalIdConflicts(
    characterId: string,
    metadata: CharacterMetadataUpdateInput,
    options?: UpdateCharacterMetadataOptions
  ): void {
    const resolved = resolveUpdateOptions<CharacterMetadataUpdateField>(options, CHARACTER_FIELDS)
    if (!resolved.fields.includes('externalIds')) return

    for (const externalId of metadata.externalIds ?? []) {
      const existing = this.db.helper.findExistingCharacter({ externalIds: [externalId] })
      if (existing && existing.id !== characterId) {
        throw new Error(
          `External ID already belongs to another character: ${externalId.source}:${externalId.id}`
        )
      }
    }
  }

  private replaceCharacterExternalIds(
    tx: DbContext,
    characterId: string,
    externalIds: ExternalId[]
  ): void {
    tx.delete(characterExternalIds).where(eq(characterExternalIds.characterId, characterId)).run()

    const uniqueExternalIds = new Map<string, ExternalId>()
    for (const externalId of externalIds) {
      uniqueExternalIds.set(toExternalIdKey(externalId), externalId)
    }

    const values = [...uniqueExternalIds.values()].map((externalId, index) => ({
      characterId,
      source: externalId.source,
      externalId: externalId.id,
      orderInCharacter: index
    }))

    if (!values.length) return
    tx.insert(characterExternalIds).values(values).run()
  }

  private getCharacterTags(tx: DbContext, characterId: string): Tag[] {
    const rows = tx
      .select()
      .from(characterTagLinks)
      .innerJoin(tags, eq(characterTagLinks.tagId, tags.id))
      .where(eq(characterTagLinks.characterId, characterId))
      .all()

    return rows.map((row) => ({
      name: row.tags.name,
      isNsfw: row.tags.isNsfw,
      isSpoiler: row.character_tag_links.isSpoiler,
      note: row.character_tag_links.note ?? undefined
    }))
  }

  private replaceCharacterTags(tx: DbContext, characterId: string, nextTags: Tag[]): void {
    tx.delete(characterTagLinks).where(eq(characterTagLinks.characterId, characterId)).run()

    if (!nextTags.length) return

    const tagNames = [...new Set(nextTags.map((item) => item.name))]
    for (const tag of nextTags) {
      tx.insert(tags)
        .values({ name: tag.name, isNsfw: tag.isNsfw ?? false })
        .onConflictDoNothing()
        .run()
    }

    const tagRows = tx.select().from(tags).where(inArray(tags.name, tagNames)).all()
    const tagIdByName = new Map(tagRows.map((row) => [row.name, row.id]))

    const linkValues = nextTags
      .map((tag, index) => {
        const tagId = tagIdByName.get(tag.name)
        if (!tagId) return null

        return {
          characterId,
          tagId,
          isSpoiler: tag.isSpoiler ?? false,
          note: tag.note ?? null,
          orderInCharacter: index,
          orderInTag: 0
        }
      })
      .filter((value): value is NonNullable<typeof value> => value !== null)

    if (!linkValues.length) return
    tx.insert(characterTagLinks).values(linkValues).run()
  }
}
