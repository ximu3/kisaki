import { GAME_SCRAPER_SLOTS, type MergeStrategy, type ScraperProfile } from '@shared/db'
import type { GameCharacter, GameCompany, GameMetadata, GamePerson } from '@shared/metadata'
import {
  applyEntityStrategy,
  applyImageStrategy,
  applyStrategy,
  buildEntityMergeKeys,
  buildEntityMergeKeysWithType,
  filterBySlot,
  mergeCharacterMetadataFields,
  mergeCompanyMetadataFields,
  mergePersonMetadataFields,
  sortByPriority
} from '../../utils'
import type {
  GameScraperCharactersResult,
  GameScraperCompaniesResult,
  GameScraperImageResult,
  GameScraperInfoResult,
  GameScraperPersonsResult,
  GameScraperResult,
  GameScraperTagsResult
} from './types'

function mergeGamePerson(existing: GamePerson, incoming: GamePerson): GamePerson {
  return {
    ...mergePersonMetadataFields(existing, incoming),
    type: existing.type,
    note: existing.note || incoming.note
  }
}

function mergeGameCharacter(
  existing: GameCharacter,
  incoming: GameCharacter,
  personStrategy: MergeStrategy
): GameCharacter {
  return {
    ...mergeCharacterMetadataFields(existing, incoming, personStrategy),
    type: existing.type,
    note: existing.note || incoming.note
  }
}

function mergeGameCompany(existing: GameCompany, incoming: GameCompany): GameCompany {
  return {
    ...mergeCompanyMetadataFields(existing, incoming),
    type: existing.type,
    note: existing.note || incoming.note
  }
}

/**
 * Merge all provider results into final GameMetadata.
 * Returns null if no valid name could be determined from any provider.
 */
export function mergeGameScraperMetadata(
  results: GameScraperResult[],
  profile: ScraperProfile
): GameMetadata | null {
  const metadata: Partial<GameMetadata> = {}

  for (const slot of GAME_SCRAPER_SLOTS) {
    const config = profile.slotConfigs[slot]
    const strategy = config.mergeStrategy

    switch (slot) {
      case 'info':
        mergeInfo(metadata, filterBySlot(results, 'info'), strategy)
        break
      case 'tags':
        mergeTags(metadata, filterBySlot(results, 'tags'), strategy)
        break
      case 'characters': {
        const personStrategy = profile.slotConfigs['persons'].mergeStrategy
        mergeCharacters(metadata, filterBySlot(results, 'characters'), strategy, personStrategy)
        break
      }
      case 'persons':
        mergePersons(metadata, filterBySlot(results, 'persons'), strategy)
        break
      case 'companies':
        mergeCompanies(metadata, filterBySlot(results, 'companies'), strategy)
        break
      case 'covers':
      case 'backdrops':
      case 'logos':
      case 'icons':
        mergeImages(metadata, slot, filterByImageSlot(results, slot), strategy)
        break
    }
  }

  return finalize(metadata)
}

/**
 * Merge image results for picker dialogs.
 */
export function mergeGameScraperImages(
  results: GameScraperImageResult[],
  strategy: MergeStrategy
): string[] {
  const sorted = sortByPriority(results)
  const allImages: string[] = []

  for (const result of sorted) {
    if (!result.data.length) continue

    if (strategy === 'first') {
      return result.data
    }
    allImages.push(...result.data)
  }

  return [...new Set(allImages)]
}

function filterByImageSlot(
  results: GameScraperResult[],
  slot: 'covers' | 'backdrops' | 'logos' | 'icons'
): GameScraperImageResult[] {
  return results.filter((result): result is GameScraperImageResult => result.slot === slot)
}

function mergeInfo(
  metadata: Partial<GameMetadata>,
  results: GameScraperInfoResult[],
  strategy: MergeStrategy
): void {
  const sorted = sortByPriority(results)

  for (const result of sorted) {
    const info = result.data

    if (!metadata.name && info.name) metadata.name = info.name
    if (!metadata.originalName && info.originalName) metadata.originalName = info.originalName
    if (!metadata.releaseDate && info.releaseDate) {
      metadata.releaseDate = info.releaseDate
    }
    if (!metadata.description && info.description) metadata.description = info.description

    if (info.relatedSites?.length) {
      metadata.relatedSites = applyStrategy(
        metadata.relatedSites,
        info.relatedSites,
        strategy,
        (site) => site.url
      )
    }

    if (info.externalIds?.length) {
      metadata.externalIds = applyStrategy(
        metadata.externalIds,
        info.externalIds,
        strategy,
        (externalId) => `${externalId.source}:${externalId.id}`
      )
    }

    if (strategy === 'first' && isInfoComplete(metadata)) break
  }
}

function isInfoComplete(metadata: Partial<GameMetadata>): boolean {
  return !!(metadata.name && metadata.releaseDate && metadata.description)
}

function mergeTags(
  metadata: Partial<GameMetadata>,
  results: GameScraperTagsResult[],
  strategy: MergeStrategy
): void {
  const sorted = sortByPriority(results)

  for (const result of sorted) {
    if (!result.data.length) continue

    metadata.tags = applyStrategy(metadata.tags, result.data, strategy, (tag) => tag.name)

    if (strategy === 'first' && metadata.tags?.length) break
  }
}

function mergeCharacters(
  metadata: Partial<GameMetadata>,
  results: GameScraperCharactersResult[],
  strategy: MergeStrategy,
  personStrategy: MergeStrategy
): void {
  const sorted = sortByPriority(results)

  for (const result of sorted) {
    if (!result.data.length) continue

    metadata.characters = applyEntityStrategy(
      metadata.characters,
      result.data,
      strategy,
      buildEntityMergeKeys,
      (existing, incoming) => mergeGameCharacter(existing, incoming, personStrategy)
    )

    if (strategy === 'first' && metadata.characters?.length) break
  }
}

function mergePersons(
  metadata: Partial<GameMetadata>,
  results: GameScraperPersonsResult[],
  strategy: MergeStrategy
): void {
  const sorted = sortByPriority(results)

  for (const result of sorted) {
    if (!result.data.length) continue

    metadata.persons = applyEntityStrategy(
      metadata.persons,
      result.data,
      strategy,
      buildEntityMergeKeysWithType,
      mergeGamePerson
    )

    if (strategy === 'first' && metadata.persons?.length) break
  }
}

function mergeCompanies(
  metadata: Partial<GameMetadata>,
  results: GameScraperCompaniesResult[],
  strategy: MergeStrategy
): void {
  const sorted = sortByPriority(results)

  for (const result of sorted) {
    if (!result.data.length) continue

    metadata.companies = applyEntityStrategy(
      metadata.companies,
      result.data,
      strategy,
      buildEntityMergeKeysWithType,
      mergeGameCompany
    )

    if (strategy === 'first' && metadata.companies?.length) break
  }
}

type ImageSlot = 'covers' | 'backdrops' | 'logos' | 'icons'

function mergeImages(
  metadata: Partial<GameMetadata>,
  slot: ImageSlot,
  results: GameScraperImageResult[],
  strategy: MergeStrategy
): void {
  const sorted = sortByPriority(results)

  for (const result of sorted) {
    if (!result.data.length) continue

    metadata[slot] = applyImageStrategy(metadata[slot], result.data, strategy)

    if (strategy === 'first' && metadata[slot]?.length) break
  }
}

function finalize(partial: Partial<GameMetadata>): GameMetadata | null {
  if (!partial.name) return null

  return {
    name: partial.name,
    originalName: partial.originalName,
    releaseDate: partial.releaseDate,
    description: partial.description ?? '',
    relatedSites: partial.relatedSites ?? [],
    externalIds: partial.externalIds ?? [],
    tags: partial.tags,
    persons: partial.persons,
    characters: partial.characters,
    companies: partial.companies,
    covers: partial.covers,
    backdrops: partial.backdrops,
    logos: partial.logos,
    icons: partial.icons
  }
}
