/**
 * Database JSON field types
 *
 * Type definitions for complex JSON structures stored in SQLite text columns.
 */

import type { Locale } from '@shared/locale'

/** Related site link */
export interface RelatedSite {
  label: string
  url: string
}

/** Game save backup record */
export interface SaveBackup {
  backupAt: number
  note: string
  locked: boolean
  saveFile: string
  sizeBytes?: number
}

/** Failed scan record */
export interface FailedScan {
  name: string
  reason: string
  path: string
}

/** Name extraction rule for scanner */
export interface NameExtractionRule {
  /** Unique identifier for ordering/management */
  id: string
  /** Human-readable description */
  description: string
  /** Regex pattern with named capture group 'name', e.g. ^\[.*?\]\s*(?<name>.+) */
  pattern: string
  /** Whether this rule is enabled */
  enabled: boolean
}

/** Scanner ignored folder names */
export type ScannerIgnoredNames = string[]

/**
 * Partial date object stored as JSON.
 *
 * Supported forms:
 * - { year }
 * - { year, month }
 * - { year, month, day }
 * - { month, day }
 * - { month }
 * - { day }
 */
export interface PartialDate {
  year?: number
  month?: number
  day?: number
}

// =============================================================================
// Library Filter Types
// =============================================================================

/** Date range value for dateRange fields */
export interface DateRangeValue {
  /** YYYY-MM-DD */
  from?: string
  /** YYYY-MM-DD */
  to?: string
}

/** Number range value for numberRange fields */
export interface NumberRangeValue {
  min?: number
  max?: number
}

/** Relation filter value */
export interface RelationValue {
  match: 'any' | 'all'
  ids: string[]
}

export type FilterValue =
  | true
  | string
  | string[]
  | NumberRangeValue
  | DateRangeValue
  | RelationValue

/** Filter state stored as JSON (field key -> value). */
export type FilterState = Record<string, FilterValue>

/** Showcase section layout type */
export type SectionLayout = 'horizontal' | 'grid'

/** Showcase section item size */
export type SectionItemSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** Showcase section open mode */
export type SectionOpenMode = 'page' | 'dialog'

// =============================================================================
// Dynamic Collection Types
// =============================================================================

/** Sort direction */
export type SortDirection = 'asc' | 'desc'

/** Filter + sort config for one entity type in dynamic collection */
export interface DynamicEntityConfig {
  /** Whether this entity type is included in the dynamic collection */
  enabled: boolean
  /** Filter state */
  filter: FilterState
  /** Sort field */
  sortField: string
  /** Sort direction */
  sortDirection: SortDirection
}

/** Full dynamic collection configuration - always contains all 4 entity types */
export type DynamicCollectionConfig = Record<
  'game' | 'character' | 'person' | 'company',
  DynamicEntityConfig
>

// =============================================================================
// Scraper Profile Types (stored as JSON in scraperProfiles table)
// =============================================================================

// -----------------------------------------------------------------------------
// Scraper Slots (per media type)
// -----------------------------------------------------------------------------

export type GameScraperSlot =
  | 'info'
  | 'tags'
  | 'characters'
  | 'persons'
  | 'companies'
  | 'covers'
  | 'backdrops'
  | 'logos'
  | 'icons'

export const GAME_SCRAPER_SLOTS: GameScraperSlot[] = [
  'info',
  'tags',
  'characters',
  'persons',
  'companies',
  'covers',
  'backdrops',
  'logos',
  'icons'
]

export type PersonScraperSlot = 'info' | 'tags' | 'photos'

export const PERSON_SCRAPER_SLOTS: PersonScraperSlot[] = ['info', 'tags', 'photos']

export type CompanyScraperSlot = 'info' | 'tags' | 'logos'

export const COMPANY_SCRAPER_SLOTS: CompanyScraperSlot[] = ['info', 'tags', 'logos']

export type CharacterScraperSlot = 'info' | 'tags' | 'persons' | 'photos'

export const CHARACTER_SCRAPER_SLOTS: CharacterScraperSlot[] = ['info', 'tags', 'persons', 'photos']

/**
 * Union of all slot names used across all scraper media types.
 *
 * Used for:
 * - Provider capability declarations
 * - Renderer filtering (ScraperProviderSelect requiredCapabilities)
 * - Slot config editing UI
 */
export type ScraperSlot =
  | GameScraperSlot
  | PersonScraperSlot
  | CompanyScraperSlot
  | CharacterScraperSlot

/** Merge strategy for multi-provider results */
export type MergeStrategy = 'first' | 'merge' | 'append'

/** Configuration for a provider within a slot */
export interface ScraperProviderEntry {
  providerId: string
  enabled: boolean
  priority: number
  locale?: Locale | null
}

/** Configuration for a single slot */
export interface SlotConfig {
  providers: ScraperProviderEntry[]
  mergeStrategy: MergeStrategy
}

/**
 * Scraper slot configurations stored in DB.
 *
 * Each profile stores only the slots relevant to its mediaType.
 */
export type ScraperSlotConfigs = Record<string, SlotConfig>

export type GameScraperSlotConfigs = Record<GameScraperSlot, SlotConfig>
export type PersonScraperSlotConfigs = Record<PersonScraperSlot, SlotConfig>
export type CompanyScraperSlotConfigs = Record<CompanyScraperSlot, SlotConfig>
export type CharacterScraperSlotConfigs = Record<CharacterScraperSlot, SlotConfig>
