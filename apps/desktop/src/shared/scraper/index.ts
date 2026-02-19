/**
 * Scraper types module
 *
 * Exports all scraper-related types and utilities.
 */

// Slot utilities and universal types
export {
  type ScraperCapability,
  type ScraperMediaType,
  type ScraperLookup,
  type ScraperImageSlot,
  type GameImageSlot,
  GAME_IMAGE_SLOTS,
  SCRAPER_IMAGE_SLOTS,
  isArraySlot,
  isImageSlot,
  getDefaultMergeStrategy,
  createSlotConfig,
  createEmptySlotConfig,
  createSlotConfigs,
  getScraperSlotsForMediaType,
  normalizeSlotConfigs,
  type ProfileCleanupAction
} from './slot'

export type { ExternalId } from '@shared/metadata'

// Game-specific types
export {
  type GameScraperProviderInfo,
  type GameSearchResult,
  type GameScraperOptions
} from './game'

// Metadata entity scraper types
export {
  type PersonScraperProviderInfo,
  type PersonSearchResult,
  type PersonScraperOptions
} from './person'
export {
  type CharacterScraperProviderInfo,
  type CharacterSearchResult,
  type CharacterScraperOptions
} from './character'
export {
  type CompanyScraperProviderInfo,
  type CompanySearchResult,
  type CompanyScraperOptions
} from './company'
