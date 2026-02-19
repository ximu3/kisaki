import { eq, inArray } from 'drizzle-orm'
import type { DbContext, DbService } from '@main/services/db'
import type {
  PersonMetadataUpdateField,
  PersonMetadataUpdateInput,
  UpdatePersonMetadataOptions,
  UpdatePersonMetadataResult
} from '@shared/metadata-updater'
import { personExternalIds, persons, personTagLinks, tags, type Person } from '@shared/db'
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

const PERSON_FIELDS: readonly PersonMetadataUpdateField[] = [
  'name',
  'originalName',
  'birthDate',
  'deathDate',
  'gender',
  'description',
  'relatedSites',
  'externalIds',
  'tags',
  'photos'
]

export class PersonMetadataUpdaterHandler {
  constructor(private db: DbService) {}

  async updatePerson(
    personId: string,
    metadata: PersonMetadataUpdateInput,
    options?: UpdatePersonMetadataOptions
  ): Promise<UpdatePersonMetadataResult> {
    this.preCheckExternalIdConflicts(personId, metadata, options)

    const asset = { photoUrl: undefined as string | undefined }
    const result = this.db.db.transaction((tx) =>
      this.updatePersonInternal(personId, metadata, options, tx, asset)
    )
    if (asset.photoUrl) {
      await this.db.attachment.setFile(persons, personId, 'photoFile', {
        kind: 'url',
        url: asset.photoUrl
      })
    }

    return result
  }

  private updatePersonInternal(
    personId: string,
    metadata: PersonMetadataUpdateInput,
    options: UpdatePersonMetadataOptions | undefined,
    tx: DbContext,
    asset: { photoUrl?: string }
  ): UpdatePersonMetadataResult {
    const person = tx.select().from(persons).where(eq(persons.id, personId)).limit(1).all()[0]
    if (!person) {
      throw new Error(`Person not found: ${personId}`)
    }

    const resolved = resolveUpdateOptions<PersonMetadataUpdateField>(options, PERSON_FIELDS)
    if (resolved.fields.length === 0) {
      return { personId, updatedFields: [] }
    }

    const updatedFields: PersonMetadataUpdateField[] = []
    const patch: Partial<Person> = {}
    const personRecord = person as Record<string, unknown>

    for (const field of resolved.fields) {
      switch (field) {
        case 'name':
        case 'originalName':
        case 'birthDate':
        case 'deathDate':
        case 'gender':
        case 'description': {
          const incoming = metadata[field]
          const current = personRecord[field]
          if (shouldApplyUpdate(current, incoming, resolved.apply)) {
            ;(patch as Record<string, unknown>)[field] = incoming
            updatedFields.push(field)
          }
          break
        }

        case 'relatedSites': {
          const incoming = metadata.relatedSites
          if (!incoming?.length) break

          const next = mergeRelatedSites(person.relatedSites ?? [], incoming, resolved.strategy)
          if (
            resolved.strategy === 'replace' ||
            shouldApplyUpdate(person.relatedSites, incoming, resolved.apply)
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
            .from(personExternalIds)
            .where(eq(personExternalIds.personId, personId))
            .all()

          const existing = existingRows.map((row) => ({ source: row.source, id: row.externalId }))
          const next = mergeExternalIds(existing, incoming, resolved.strategy)

          if (
            resolved.strategy === 'replace' ||
            shouldApplyUpdate(existing, incoming, resolved.apply)
          ) {
            this.replacePersonExternalIds(tx, personId, next)
            updatedFields.push(field)
          }
          break
        }

        case 'tags': {
          const incoming = metadata.tags
          if (!incoming?.length) break

          const existing = this.getPersonTags(tx, personId)
          const next = mergeTags(existing, incoming, resolved.strategy)
          if (
            resolved.strategy === 'replace' ||
            shouldApplyUpdate(existing, incoming, resolved.apply)
          ) {
            this.replacePersonTags(tx, personId, next)
            updatedFields.push(field)
          }
          break
        }

        case 'photos': {
          const incoming = metadata.photos
          if (!incoming?.length || !incoming[0]) break

          const mode = toImageMode(resolved.strategy)
          if (mode === 'replace' || !person.photoFile) {
            asset.photoUrl = incoming[0]
            updatedFields.push(field)
          }
          break
        }
      }
    }

    if (Object.keys(patch).length > 0) {
      tx.update(persons)
        .set(patch as any)
        .where(eq(persons.id, personId))
        .run()
    }

    return { personId, updatedFields }
  }

  private preCheckExternalIdConflicts(
    personId: string,
    metadata: PersonMetadataUpdateInput,
    options?: UpdatePersonMetadataOptions
  ): void {
    const resolved = resolveUpdateOptions<PersonMetadataUpdateField>(options, PERSON_FIELDS)
    if (!resolved.fields.includes('externalIds')) return

    for (const externalId of metadata.externalIds ?? []) {
      const existing = this.db.helper.findExistingPerson({ externalIds: [externalId] })
      if (existing && existing.id !== personId) {
        throw new Error(
          `External ID already belongs to another person: ${externalId.source}:${externalId.id}`
        )
      }
    }
  }

  private replacePersonExternalIds(
    tx: DbContext,
    personId: string,
    externalIds: ExternalId[]
  ): void {
    tx.delete(personExternalIds).where(eq(personExternalIds.personId, personId)).run()

    const uniqueExternalIds = new Map<string, ExternalId>()
    for (const externalId of externalIds) {
      uniqueExternalIds.set(toExternalIdKey(externalId), externalId)
    }

    const values = [...uniqueExternalIds.values()].map((externalId, index) => ({
      personId,
      source: externalId.source,
      externalId: externalId.id,
      orderInPerson: index
    }))

    if (!values.length) return
    tx.insert(personExternalIds).values(values).run()
  }

  private getPersonTags(tx: DbContext, personId: string): Tag[] {
    const rows = tx
      .select()
      .from(personTagLinks)
      .innerJoin(tags, eq(personTagLinks.tagId, tags.id))
      .where(eq(personTagLinks.personId, personId))
      .all()

    return rows.map((row) => ({
      name: row.tags.name,
      isNsfw: row.tags.isNsfw,
      isSpoiler: row.person_tag_links.isSpoiler,
      note: row.person_tag_links.note ?? undefined
    }))
  }

  private replacePersonTags(tx: DbContext, personId: string, nextTags: Tag[]): void {
    tx.delete(personTagLinks).where(eq(personTagLinks.personId, personId)).run()

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
          personId,
          tagId,
          isSpoiler: tag.isSpoiler ?? false,
          note: tag.note ?? null,
          orderInPerson: index,
          orderInTag: 0
        }
      })
      .filter((value): value is NonNullable<typeof value> => value !== null)

    if (!linkValues.length) return
    tx.insert(personTagLinks).values(linkValues).run()
  }
}
