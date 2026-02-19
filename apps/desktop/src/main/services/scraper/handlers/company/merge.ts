import { COMPANY_SCRAPER_SLOTS, type MergeStrategy, type ScraperProfile } from '@shared/db'
import type { CompanyMetadata } from '@shared/metadata'
import { applyImageStrategy, applyStrategy, filterBySlot, sortByPriority } from '../../utils'
import type {
  CompanyScraperInfoResult,
  CompanyScraperLogosResult,
  CompanyScraperResult,
  CompanyScraperTagsResult
} from './types'

/**
 * Merge all provider results into final CompanyMetadata.
 * Returns null if no valid name could be determined from any provider.
 */
export function mergeCompanyScraperMetadata(
  results: CompanyScraperResult[],
  profile: ScraperProfile
): CompanyMetadata | null {
  const metadata: Partial<CompanyMetadata> = {}

  for (const slot of COMPANY_SCRAPER_SLOTS) {
    const config = profile.slotConfigs[slot]
    const strategy = config.mergeStrategy

    switch (slot) {
      case 'info':
        mergeInfo(metadata, filterBySlot(results, 'info'), strategy)
        break
      case 'tags':
        mergeTags(metadata, filterBySlot(results, 'tags'), strategy)
        break
      case 'logos':
        mergeLogos(metadata, filterBySlot(results, 'logos'), strategy)
        break
    }
  }

  return finalize(metadata)
}

function mergeInfo(
  metadata: Partial<CompanyMetadata>,
  results: CompanyScraperInfoResult[],
  strategy: MergeStrategy
): void {
  const sorted = sortByPriority(results)

  for (const result of sorted) {
    const info = result.data

    if (!metadata.name && info.name) metadata.name = info.name
    if (!metadata.originalName && info.originalName) metadata.originalName = info.originalName
    if (!metadata.foundedDate && info.foundedDate) metadata.foundedDate = info.foundedDate
    if (!metadata.description && info.description) metadata.description = info.description

    if (info.relatedSites?.length) {
      metadata.relatedSites = applyStrategy(
        metadata.relatedSites,
        info.relatedSites,
        strategy,
        (s) => s.url
      )
    }

    if (info.externalIds?.length) {
      metadata.externalIds = applyStrategy(
        metadata.externalIds,
        info.externalIds,
        strategy,
        (e) => `${e.source}:${e.id}`
      )
    }

    if (strategy === 'first' && metadata.name) break
  }
}

function mergeTags(
  metadata: Partial<CompanyMetadata>,
  results: CompanyScraperTagsResult[],
  strategy: MergeStrategy
): void {
  const sorted = sortByPriority(results)

  for (const result of sorted) {
    if (!result.data.length) continue
    metadata.tags = applyStrategy(metadata.tags, result.data, strategy, (t) => t.name)
    if (strategy === 'first' && metadata.tags?.length) break
  }
}

function mergeLogos(
  metadata: Partial<CompanyMetadata>,
  results: CompanyScraperLogosResult[],
  strategy: MergeStrategy
): void {
  const sorted = sortByPriority(results)

  for (const result of sorted) {
    if (!result.data.length) continue
    metadata.logos = applyImageStrategy(metadata.logos, result.data, strategy)
    if (strategy === 'first' && metadata.logos?.length) break
  }
}

function finalize(partial: Partial<CompanyMetadata>): CompanyMetadata | null {
  if (!partial.name) return null

  return {
    name: partial.name,
    originalName: partial.originalName,
    foundedDate: partial.foundedDate,
    description: partial.description ?? '',
    relatedSites: partial.relatedSites ?? [],
    externalIds: partial.externalIds ?? [],
    tags: partial.tags,
    logos: partial.logos
  }
}
