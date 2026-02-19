import type { DbContext, DbService } from '@main/services/db'
import type { AddPersonOptions, AddPersonResult } from '@shared/adder'
import type { PersonMetadata } from '@shared/metadata'
import { nanoid } from 'nanoid'
import log from 'electron-log/main'
import {
  collectionPersonLinks,
  personExternalIds,
  personTagLinks,
  persons,
  tags,
  type NewCollectionPersonLink,
  type NewPerson
} from '@shared/db'
import type { AddPersonInternalResult, PendingAssetTask } from '../types'

export class PersonAdderHandler {
  constructor(private db: DbService) {}

  addPerson(metadata: PersonMetadata, options?: AddPersonOptions): Promise<AddPersonResult>
  addPerson(
    metadata: PersonMetadata,
    options: AddPersonOptions | undefined,
    ctx: DbContext
  ): Promise<AddPersonInternalResult>
  async addPerson(
    metadata: PersonMetadata,
    options?: AddPersonOptions,
    ctx?: DbContext
  ): Promise<AddPersonResult | AddPersonInternalResult> {
    if (ctx) {
      return this.addPersonInternal(metadata, options, ctx)
    }

    const result = this.db.db.transaction((tx) => this.addPersonInternal(metadata, options, tx))
    await this.flushPendingAssets(result.pendingAssets)
    return this.toPublicResult(result)
  }

  addPersonInternal(
    metadata: PersonMetadata,
    options: AddPersonOptions | undefined,
    tx: DbContext
  ): AddPersonInternalResult {
    const targetCollectionId = options?.targetCollectionId
    if (metadata.externalIds?.length) {
      const existingByExtId = this.db.helper.findExistingPerson(
        { externalIds: metadata.externalIds },
        tx
      )
      if (existingByExtId) {
        this.addToCollection(tx, existingByExtId.id, targetCollectionId)
        return {
          personId: existingByExtId.id,
          isNew: false,
          existingReason: 'externalId',
          pendingAssets: []
        }
      }
    }

    const personId = nanoid()
    const newPerson: NewPerson = {
      id: personId,
      name: metadata.name,
      originalName: metadata.originalName,
      birthDate: metadata.birthDate,
      deathDate: metadata.deathDate,
      gender: metadata.gender,
      description: metadata.description,
      relatedSites: metadata.relatedSites || []
    }
    tx.insert(persons).values(newPerson).run()

    for (const [index, extId] of (metadata.externalIds ?? []).entries()) {
      tx.insert(personExternalIds)
        .values({
          personId,
          source: extId.source,
          externalId: extId.id,
          orderInPerson: index
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

        tx.insert(personTagLinks)
          .values({
            personId,
            tagId: existingTag.id,
            isSpoiler: tagData.isSpoiler || false,
            note: tagData.note || null,
            orderInPerson: i,
            orderInTag: 0
          })
          .run()
      } catch (error) {
        log.warn(`[Adder] Failed to process person tag "${tagData.name}": ${error}`)
      }
    }

    const pendingAssets: PendingAssetTask[] = []
    if (metadata.photos?.[0]) {
      pendingAssets.push({ type: 'person', personId, url: metadata.photos[0] })
    }

    this.addToCollection(tx, personId, targetCollectionId)

    return { personId, isNew: true, pendingAssets }
  }

  private addToCollection(tx: DbContext, personId: string, targetCollectionId?: string): void {
    if (!targetCollectionId) return

    const collectionLink: NewCollectionPersonLink = {
      collectionId: targetCollectionId,
      personId,
      orderInCollection: 0
    }
    tx.insert(collectionPersonLinks).values(collectionLink).onConflictDoNothing().run()
  }

  private async flushPendingAssets(pendingAssets: PendingAssetTask[]): Promise<void> {
    await Promise.all(
      pendingAssets
        .filter((asset) => asset.type === 'person')
        .map(async (asset) => {
          try {
            await this.db.attachment.setFile(persons, asset.personId, 'photoFile', {
              kind: 'url',
              url: asset.url
            })
          } catch (error) {
            log.warn(`[Adder] Failed to save person photo: ${error}`)
          }
        })
    )
  }

  private toPublicResult(result: AddPersonInternalResult): AddPersonResult {
    const { pendingAssets, ...publicResult } = result
    void pendingAssets
    return publicResult
  }
}
