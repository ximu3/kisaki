import type { DbContext, DbService } from '@main/services/db'
import type { AddCompanyOptions, AddCompanyResult } from '@shared/adder'
import type { CompanyMetadata } from '@shared/metadata'
import { nanoid } from 'nanoid'
import log from 'electron-log/main'
import {
  collectionCompanyLinks,
  companies,
  companyExternalIds,
  companyTagLinks,
  tags,
  type NewCollectionCompanyLink,
  type NewCompany
} from '@shared/db'
import type { AddCompanyInternalResult, PendingAssetTask } from '../types'

export class CompanyAdderHandler {
  constructor(private db: DbService) {}

  addCompany(metadata: CompanyMetadata, options?: AddCompanyOptions): Promise<AddCompanyResult>
  addCompany(
    metadata: CompanyMetadata,
    options: AddCompanyOptions | undefined,
    ctx: DbContext
  ): Promise<AddCompanyInternalResult>
  async addCompany(
    metadata: CompanyMetadata,
    options?: AddCompanyOptions,
    ctx?: DbContext
  ): Promise<AddCompanyResult | AddCompanyInternalResult> {
    if (ctx) {
      return this.addCompanyInternal(metadata, options, ctx)
    }

    const result = this.db.db.transaction((tx) => this.addCompanyInternal(metadata, options, tx))
    await this.flushPendingAssets(result.pendingAssets)
    return this.toPublicResult(result)
  }

  addCompanyInternal(
    metadata: CompanyMetadata,
    options: AddCompanyOptions | undefined,
    tx: DbContext
  ): AddCompanyInternalResult {
    const targetCollectionId = options?.targetCollectionId
    if (metadata.externalIds?.length) {
      const existingByExtId = this.db.helper.findExistingCompany(
        { externalIds: metadata.externalIds },
        tx
      )
      if (existingByExtId) {
        this.addToCollection(tx, existingByExtId.id, targetCollectionId)
        return {
          companyId: existingByExtId.id,
          isNew: false,
          existingReason: 'externalId',
          pendingAssets: []
        }
      }
    }

    const companyId = nanoid()
    const newCompany: NewCompany = {
      id: companyId,
      name: metadata.name,
      originalName: metadata.originalName,
      foundedDate: metadata.foundedDate,
      description: metadata.description,
      relatedSites: metadata.relatedSites || []
    }
    tx.insert(companies).values(newCompany).run()

    for (const [index, extId] of (metadata.externalIds ?? []).entries()) {
      tx.insert(companyExternalIds)
        .values({
          companyId,
          source: extId.source,
          externalId: extId.id,
          orderInCompany: index
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

        tx.insert(companyTagLinks)
          .values({
            companyId,
            tagId: existingTag.id,
            isSpoiler: tagData.isSpoiler || false,
            note: tagData.note || null,
            orderInCompany: i,
            orderInTag: 0
          })
          .run()
      } catch (error) {
        log.warn(`[Adder] Failed to process company tag "${tagData.name}": ${error}`)
      }
    }

    const pendingAssets: PendingAssetTask[] = []
    if (metadata.logos?.[0]) {
      pendingAssets.push({ type: 'company', companyId, url: metadata.logos[0] })
    }

    this.addToCollection(tx, companyId, targetCollectionId)

    return { companyId, isNew: true, pendingAssets }
  }

  private addToCollection(tx: DbContext, companyId: string, targetCollectionId?: string): void {
    if (!targetCollectionId) return

    const collectionLink: NewCollectionCompanyLink = {
      collectionId: targetCollectionId,
      companyId,
      orderInCollection: 0
    }
    tx.insert(collectionCompanyLinks).values(collectionLink).onConflictDoNothing().run()
  }

  private async flushPendingAssets(pendingAssets: PendingAssetTask[]): Promise<void> {
    await Promise.all(
      pendingAssets
        .filter((asset) => asset.type === 'company')
        .map(async (asset) => {
          try {
            await this.db.attachment.setFile(companies, asset.companyId, 'logoFile', {
              kind: 'url',
              url: asset.url
            })
          } catch (error) {
            log.warn(`[Adder] Failed to save company logo: ${error}`)
          }
        })
    )
  }

  private toPublicResult(result: AddCompanyInternalResult): AddCompanyResult {
    const { pendingAssets, ...publicResult } = result
    void pendingAssets
    return publicResult
  }
}
