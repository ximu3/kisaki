/**
 * Slot Utilities
 *
 * Universal slot-related type definitions and utility functions.
 * These are media-type agnostic and apply to all scraper operations.
 */

import type { MergeStrategy, ScraperSlot, SlotConfig, ScraperSlotConfigs } from '@shared/db'
import type { ExternalId } from '@shared/metadata'
import type { Locale } from '@shared/locale'
import type { ContentEntityType } from '@shared/common'
import {
  GAME_SCRAPER_SLOTS,
  PERSON_SCRAPER_SLOTS,
  COMPANY_SCRAPER_SLOTS,
  CHARACTER_SCRAPER_SLOTS
} from '@shared/db'

export type ScraperMediaType = ContentEntityType

export function getScraperSlotsForMediaType(mediaType: ScraperMediaType): readonly ScraperSlot[] {
  switch (mediaType) {
    case 'game':
      return GAME_SCRAPER_SLOTS
    case 'person':
      return PERSON_SCRAPER_SLOTS
    case 'company':
      return COMPANY_SCRAPER_SLOTS
    case 'character':
      return CHARACTER_SCRAPER_SLOTS
  }
}

function isSlotConfig(value: unknown): value is SlotConfig {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<SlotConfig>
  return Array.isArray(candidate.providers) && typeof candidate.mergeStrategy === 'string'
}

/**
 * Normalize a profile's slotConfigs:
 * - Keep only the slots relevant to the mediaType
 * - Ensure every required slot exists (fallback to empty config)
 */
export function normalizeSlotConfigs(
  mediaType: ScraperMediaType,
  slotConfigs: ScraperSlotConfigs | null | undefined
): ScraperSlotConfigs {
  const normalized: ScraperSlotConfigs = {}
  const slots = getScraperSlotsForMediaType(mediaType)

  for (const slot of slots) {
    const config = slotConfigs?.[slot]
    normalized[slot] = isSlotConfig(config) ? config : createEmptySlotConfig()
  }

  return normalized
}

// =============================================================================
// Universal Lookup Types
// =============================================================================

/**
 * Universal lookup identifier for scraper operations.
 *
 * Uses name as the cross-provider identifier, with optional known IDs for precision.
 * When a provider's ID is in knownIds, it will be used directly without searching.
 * Otherwise, the handler will search by name to resolve the provider's internal ID.
 */
export interface ScraperLookup {
  /** Entity name - universal identifier across providers */
  name: string
  /** Preferred locale for results */
  locale?: Locale
  /** Known external IDs (e.g., from search selection or database) */
  knownIds?: ExternalId[]
}

// =============================================================================
// Capability Types
// =============================================================================

/** Universal scraper provider capability */
export type ScraperCapability = 'search' | ScraperSlot

// =============================================================================
// Slot Classification
// =============================================================================

/** Image slot type - union of all image-related slots across all media types */
export type ScraperImageSlot = 'covers' | 'backdrops' | 'logos' | 'icons' | 'photos'

/** Game image slot types */
export type GameImageSlot = 'covers' | 'backdrops' | 'logos' | 'icons'

/** Game image slot list */
export const GAME_IMAGE_SLOTS: GameImageSlot[] = ['covers', 'backdrops', 'logos', 'icons']

/** Image slot types */
export const SCRAPER_IMAGE_SLOTS: ScraperImageSlot[] = [...GAME_IMAGE_SLOTS, 'photos']

/** Check if slot returns arrays (all slots except 'info' return arrays) */
export function isArraySlot(slot: ScraperSlot): boolean {
  return slot !== 'info'
}

/** Check if slot is an image type */
export function isImageSlot(slot: ScraperSlot): slot is ScraperImageSlot {
  return (SCRAPER_IMAGE_SLOTS as readonly string[]).includes(slot)
}

/** Get default merge strategy for a slot */
export function getDefaultMergeStrategy(_slot: ScraperSlot): MergeStrategy {
  return 'merge'
}

// =============================================================================
// Slot Config Factory Functions
// =============================================================================

/**
 * Create a slot config from provider IDs and merge strategy
 */
export function createSlotConfig(
  providerIds: string[],
  mergeStrategy: MergeStrategy = 'merge',
  locale?: Locale
): SlotConfig {
  return {
    providers: providerIds.map((providerId, index) => ({
      providerId,
      enabled: true,
      priority: index,
      locale
    })),
    mergeStrategy
  }
}

/**
 * Create an empty slot config (no providers)
 */
export function createEmptySlotConfig(): SlotConfig {
  return {
    providers: [],
    mergeStrategy: 'first'
  }
}

/**
 * Create all slot configs for a provider based on its capabilities.
 *
 * Only adds the provider to slots it actually supports.
 * Slots not supported by the provider will have empty providers array.
 *
 * @param providerId - The provider ID
 * @param capabilities - Array of capabilities the provider supports
 * @param locale - Optional locale preference
 */
export function createSlotConfigs(
  mediaType: ScraperMediaType,
  providerId: string,
  capabilities: ScraperCapability[],
  locale?: Locale
): ScraperSlotConfigs {
  const configs = {} as ScraperSlotConfigs
  const slots = getScraperSlotsForMediaType(mediaType)
  for (const slot of slots) {
    // Check if provider supports this slot
    const supportsSlot = capabilities.includes(slot)
    configs[slot] = supportsSlot
      ? createSlotConfig([providerId], 'first', locale)
      : createEmptySlotConfig()
  }
  return configs
}

// =============================================================================
// Profile Cleanup Types
// =============================================================================

/** Action taken when ensuring profile validity */
export type ProfileCleanupAction = 'deleted' | 'updated' | 'unchanged'
