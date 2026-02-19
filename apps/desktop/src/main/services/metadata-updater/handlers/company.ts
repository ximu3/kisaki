import { eq, inArray } from 'drizzle-orm'
import type { DbContext, DbService } from '@main/services/db'
import type {
  CompanyMetadataUpdateField,
  CompanyMetadataUpdateInput,
  UpdateCompanyMetadataOptions,
  UpdateCompanyMetadataResult
} from '@shared/metadata-updater'
import { companies, companyExternalIds, companyTagLinks, tags, type Company } from '@shared/db'
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

const COMPANY_FIELDS: readonly CompanyMetadataUpdateField[] = [
  'name',
  'originalName',
  'foundedDate',
  'description',
  'relatedSites',
  'externalIds',
  'tags',
  'logos'
]

export class CompanyMetadataUpdaterHandler {
  constructor(private db: DbService) {}

  async updateCompany(
    companyId: string,
    metadata: CompanyMetadataUpdateInput,
    options?: UpdateCompanyMetadataOptions
  ): Promise<UpdateCompanyMetadataResult> {
    this.preCheckExternalIdConflicts(companyId, metadata, options)

    const asset = { logoUrl: undefined as string | undefined }
    const result = this.db.db.transaction((tx) =>
      this.updateCompanyInternal(companyId, metadata, options, tx, asset)
    )
    if (asset.logoUrl) {
      await this.db.attachment.setFile(companies, companyId, 'logoFile', {
        kind: 'url',
        url: asset.logoUrl
      })
    }

    return result
  }

  private updateCompanyInternal(
    companyId: string,
    metadata: CompanyMetadataUpdateInput,
    options: UpdateCompanyMetadataOptions | undefined,
    tx: DbContext,
    asset: { logoUrl?: string }
  ): UpdateCompanyMetadataResult {
    const company = tx.select().from(companies).where(eq(companies.id, companyId)).limit(1).all()[0]
    if (!company) {
      throw new Error(`Company not found: ${companyId}`)
    }

    const resolved = resolveUpdateOptions<CompanyMetadataUpdateField>(options, COMPANY_FIELDS)
    if (resolved.fields.length === 0) {
      return { companyId, updatedFields: [] }
    }

    const updatedFields: CompanyMetadataUpdateField[] = []
    const patch: Partial<Company> = {}
    const companyRecord = company as Record<string, unknown>

    for (const field of resolved.fields) {
      switch (field) {
        case 'name':
        case 'originalName':
        case 'foundedDate':
        case 'description': {
          const incoming = metadata[field]
          const current = companyRecord[field]
          if (shouldApplyUpdate(current, incoming, resolved.apply)) {
            ;(patch as Record<string, unknown>)[field] = incoming
            updatedFields.push(field)
          }
          break
        }

        case 'relatedSites': {
          const incoming = metadata.relatedSites
          if (!incoming?.length) break

          const next = mergeRelatedSites(company.relatedSites ?? [], incoming, resolved.strategy)
          if (
            resolved.strategy === 'replace' ||
            shouldApplyUpdate(company.relatedSites, incoming, resolved.apply)
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
            .from(companyExternalIds)
            .where(eq(companyExternalIds.companyId, companyId))
            .all()

          const existing = existingRows.map((row) => ({ source: row.source, id: row.externalId }))
          const next = mergeExternalIds(existing, incoming, resolved.strategy)
          if (
            resolved.strategy === 'replace' ||
            shouldApplyUpdate(existing, incoming, resolved.apply)
          ) {
            this.replaceCompanyExternalIds(tx, companyId, next)
            updatedFields.push(field)
          }
          break
        }

        case 'tags': {
          const incoming = metadata.tags
          if (!incoming?.length) break

          const existing = this.getCompanyTags(tx, companyId)
          const next = mergeTags(existing, incoming, resolved.strategy)
          if (
            resolved.strategy === 'replace' ||
            shouldApplyUpdate(existing, incoming, resolved.apply)
          ) {
            this.replaceCompanyTags(tx, companyId, next)
            updatedFields.push(field)
          }
          break
        }

        case 'logos': {
          const incoming = metadata.logos
          if (!incoming?.length || !incoming[0]) break

          const mode = toImageMode(resolved.strategy)
          if (mode === 'replace' || !company.logoFile) {
            asset.logoUrl = incoming[0]
            updatedFields.push(field)
          }
          break
        }
      }
    }

    if (Object.keys(patch).length > 0) {
      tx.update(companies)
        .set(patch as any)
        .where(eq(companies.id, companyId))
        .run()
    }

    return { companyId, updatedFields }
  }

  private preCheckExternalIdConflicts(
    companyId: string,
    metadata: CompanyMetadataUpdateInput,
    options?: UpdateCompanyMetadataOptions
  ): void {
    const resolved = resolveUpdateOptions<CompanyMetadataUpdateField>(options, COMPANY_FIELDS)
    if (!resolved.fields.includes('externalIds')) return

    for (const externalId of metadata.externalIds ?? []) {
      const existing = this.db.helper.findExistingCompany({ externalIds: [externalId] })
      if (existing && existing.id !== companyId) {
        throw new Error(
          `External ID already belongs to another company: ${externalId.source}:${externalId.id}`
        )
      }
    }
  }

  private replaceCompanyExternalIds(
    tx: DbContext,
    companyId: string,
    externalIds: ExternalId[]
  ): void {
    tx.delete(companyExternalIds).where(eq(companyExternalIds.companyId, companyId)).run()

    const uniqueExternalIds = new Map<string, ExternalId>()
    for (const externalId of externalIds) {
      uniqueExternalIds.set(toExternalIdKey(externalId), externalId)
    }

    const values = [...uniqueExternalIds.values()].map((externalId, index) => ({
      companyId,
      source: externalId.source,
      externalId: externalId.id,
      orderInCompany: index
    }))

    if (!values.length) return
    tx.insert(companyExternalIds).values(values).run()
  }

  private getCompanyTags(tx: DbContext, companyId: string): Tag[] {
    const rows = tx
      .select()
      .from(companyTagLinks)
      .innerJoin(tags, eq(companyTagLinks.tagId, tags.id))
      .where(eq(companyTagLinks.companyId, companyId))
      .all()

    return rows.map((row) => ({
      name: row.tags.name,
      isNsfw: row.tags.isNsfw,
      isSpoiler: row.company_tag_links.isSpoiler,
      note: row.company_tag_links.note ?? undefined
    }))
  }

  private replaceCompanyTags(tx: DbContext, companyId: string, nextTags: Tag[]): void {
    tx.delete(companyTagLinks).where(eq(companyTagLinks.companyId, companyId)).run()

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
          companyId,
          tagId,
          isSpoiler: tag.isSpoiler ?? false,
          note: tag.note ?? null,
          orderInCompany: index,
          orderInTag: 0
        }
      })
      .filter((value): value is NonNullable<typeof value> => value !== null)

    if (!linkValues.length) return
    tx.insert(companyTagLinks).values(linkValues).run()
  }
}
