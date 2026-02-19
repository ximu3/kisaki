import { PERSON_SCRAPER_SLOTS, type MergeStrategy, type ScraperProfile } from '@shared/db'
import type { PersonMetadata } from '@shared/metadata'
import { applyImageStrategy, applyStrategy, filterBySlot, sortByPriority } from '../../utils'
import type {
  PersonScraperPhotosResult,
  PersonScraperInfoResult,
  PersonScraperResult,
  PersonScraperTagsResult
} from './types'

/**
 * Merge all provider results into final PersonMetadata.
 * Returns null if no valid name could be determined from any provider.
 */
export function mergePersonScraperMetadata(
  results: PersonScraperResult[],
  profile: ScraperProfile
): PersonMetadata | null {
  const metadata: Partial<PersonMetadata> = {}

  for (const slot of PERSON_SCRAPER_SLOTS) {
    const config = profile.slotConfigs[slot]
    const strategy = config.mergeStrategy

    switch (slot) {
      case 'info':
        mergeInfo(metadata, filterBySlot(results, 'info'), strategy)
        break
      case 'tags':
        mergeTags(metadata, filterBySlot(results, 'tags'), strategy)
        break
      case 'photos':
        mergePhotos(metadata, filterBySlot(results, 'photos'), strategy)
        break
    }
  }

  return finalize(metadata)
}

function mergeInfo(
  metadata: Partial<PersonMetadata>,
  results: PersonScraperInfoResult[],
  strategy: MergeStrategy
): void {
  const sorted = sortByPriority(results)

  for (const result of sorted) {
    const info = result.data

    if (!metadata.name && info.name) metadata.name = info.name
    if (!metadata.originalName && info.originalName) metadata.originalName = info.originalName
    if (!metadata.birthDate && info.birthDate) metadata.birthDate = info.birthDate
    if (!metadata.deathDate && info.deathDate) metadata.deathDate = info.deathDate
    if (!metadata.gender && info.gender) metadata.gender = info.gender
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
  metadata: Partial<PersonMetadata>,
  results: PersonScraperTagsResult[],
  strategy: MergeStrategy
): void {
  const sorted = sortByPriority(results)

  for (const result of sorted) {
    if (!result.data.length) continue
    metadata.tags = applyStrategy(metadata.tags, result.data, strategy, (t) => t.name)
    if (strategy === 'first' && metadata.tags?.length) break
  }
}

function mergePhotos(
  metadata: Partial<PersonMetadata>,
  results: PersonScraperPhotosResult[],
  strategy: MergeStrategy
): void {
  const sorted = sortByPriority(results)

  for (const result of sorted) {
    if (!result.data.length) continue
    metadata.photos = applyImageStrategy(metadata.photos, result.data, strategy)
    if (strategy === 'first' && metadata.photos?.length) break
  }
}

function finalize(partial: Partial<PersonMetadata>): PersonMetadata | null {
  if (!partial.name) return null

  return {
    name: partial.name,
    originalName: partial.originalName,
    birthDate: partial.birthDate,
    deathDate: partial.deathDate,
    gender: partial.gender,
    description: partial.description ?? '',
    relatedSites: partial.relatedSites ?? [],
    externalIds: partial.externalIds ?? [],
    tags: partial.tags,
    photos: partial.photos
  }
}
