import type { DbContext, DbService } from '@main/services/db'
import type { AddCharacterOptions, AddCharacterResult } from '@shared/adder'
import type { CharacterMetadata } from '@shared/metadata'
import { nanoid } from 'nanoid'
import log from 'electron-log/main'
import {
  collectionCharacterLinks,
  characterExternalIds,
  characterTagLinks,
  characters,
  tags,
  type NewCollectionCharacterLink,
  type NewCharacter
} from '@shared/db'
import type { AddCharacterInternalResult, PendingAssetTask } from '../types'

export class CharacterAdderHandler {
  constructor(private db: DbService) {}

  addCharacter(
    metadata: CharacterMetadata,
    options?: AddCharacterOptions
  ): Promise<AddCharacterResult>
  addCharacter(
    metadata: CharacterMetadata,
    options: AddCharacterOptions | undefined,
    ctx: DbContext
  ): Promise<AddCharacterInternalResult>
  async addCharacter(
    metadata: CharacterMetadata,
    options?: AddCharacterOptions,
    ctx?: DbContext
  ): Promise<AddCharacterResult | AddCharacterInternalResult> {
    if (ctx) {
      return this.addCharacterInternal(metadata, options, ctx)
    }

    const result = this.db.db.transaction((tx) => this.addCharacterInternal(metadata, options, tx))
    await this.flushPendingAssets(result.pendingAssets)
    return this.toPublicResult(result)
  }

  addCharacterInternal(
    metadata: CharacterMetadata,
    options: AddCharacterOptions | undefined,
    tx: DbContext
  ): AddCharacterInternalResult {
    const targetCollectionId = options?.targetCollectionId
    if (metadata.externalIds?.length) {
      const existingByExtId = this.db.helper.findExistingCharacter(
        { externalIds: metadata.externalIds },
        tx
      )
      if (existingByExtId) {
        this.addToCollection(tx, existingByExtId.id, targetCollectionId)
        return {
          characterId: existingByExtId.id,
          isNew: false,
          existingReason: 'externalId',
          pendingAssets: []
        }
      }
    }

    const characterId = nanoid()
    const newCharacter: NewCharacter = {
      id: characterId,
      name: metadata.name,
      originalName: metadata.originalName,
      birthDate: metadata.birthDate,
      gender: metadata.gender,
      age: metadata.age,
      bloodType: metadata.bloodType,
      height: metadata.height,
      weight: metadata.weight,
      bust: metadata.bust,
      waist: metadata.waist,
      hips: metadata.hips,
      cup: metadata.cup,
      description: metadata.description,
      relatedSites: metadata.relatedSites || []
    }
    tx.insert(characters).values(newCharacter).run()

    for (const [index, extId] of (metadata.externalIds ?? []).entries()) {
      tx.insert(characterExternalIds)
        .values({
          characterId,
          source: extId.source,
          externalId: extId.id,
          orderInCharacter: index
        })
        .onConflictDoNothing()
        .run()
    }

    for (let i = 0; i < (metadata.tags?.length ?? 0); i++) {
      const tagData = metadata.tags![i]
      try {
        tx.insert(tags)
          .values({ name: tagData.name, isNsfw: tagData.isNsfw })
          .onConflictDoNothing()
          .run()

        const existingTag = this.db.helper.findExistingTag({ name: tagData.name }, tx)
        if (!existingTag) {
          continue
        }

        tx.insert(characterTagLinks)
          .values({
            characterId,
            tagId: existingTag.id,
            isSpoiler: tagData.isSpoiler || false,
            note: tagData.note || null,
            orderInCharacter: i,
            orderInTag: 0
          })
          .run()
      } catch (error) {
        log.warn(`[Adder] Failed to process character tag "${tagData.name}": ${error}`)
      }
    }

    const pendingAssets: PendingAssetTask[] = []
    if (metadata.photos?.[0]) {
      pendingAssets.push({ type: 'character', characterId, url: metadata.photos[0] })
    }

    this.addToCollection(tx, characterId, targetCollectionId)

    return { characterId, isNew: true, pendingAssets }
  }

  private addToCollection(tx: DbContext, characterId: string, targetCollectionId?: string): void {
    if (!targetCollectionId) return

    const collectionLink: NewCollectionCharacterLink = {
      collectionId: targetCollectionId,
      characterId,
      orderInCollection: 0
    }
    tx.insert(collectionCharacterLinks).values(collectionLink).onConflictDoNothing().run()
  }

  private async flushPendingAssets(pendingAssets: PendingAssetTask[]): Promise<void> {
    await Promise.all(
      pendingAssets
        .filter((asset) => asset.type === 'character')
        .map(async (asset) => {
          try {
            await this.db.attachment.setFile(characters, asset.characterId, 'photoFile', {
              kind: 'url',
              url: asset.url
            })
          } catch (error) {
            log.warn(`[Adder] Failed to save character photo: ${error}`)
          }
        })
    )
  }

  private toPublicResult(result: AddCharacterInternalResult): AddCharacterResult {
    const { pendingAssets, ...publicResult } = result
    void pendingAssets
    return publicResult
  }
}
