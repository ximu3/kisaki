/**
 * Base database columns and Drizzle custom types
 *
 * Contains the base column definitions and all Drizzle customType implementations
 * for SQLite JSON serialization/deserialization.
 */

import { text, integer, customType } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'

import {
  MEDIA_TYPES,
  CONTENT_ENTITY_TYPES,
  ALL_ENTITY_TYPES,
  type MediaType,
  type ContentEntityType,
  type AllEntityType
} from '../common'
import { LOCALES, APP_LOCALES, type Locale, type AppLocale } from '../locale'

import type {
  Status,
  GameLauncherMode,
  GameMonitorMode,
  Gender,
  GamePersonType,
  GameCharacterType,
  GameCompanyType,
  CharacterPersonType,
  BloodType,
  CupSize,
  MainWindowCloseAction
} from './enums'

import type {
  RelatedSite,
  SaveBackup,
  FailedScan,
  ScannerIgnoredNames,
  NameExtractionRule,
  PartialDate,
  FilterState,
  DynamicCollectionConfig,
  ScraperSlotConfigs,
  SlotConfig,
  SectionLayout,
  SectionItemSize,
  SectionOpenMode,
  SortDirection
} from './json-types'

const PARTIAL_DATE_KEYS = new Set(['year', 'month', 'day'])

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value)
}

function isPartialDate(value: unknown): value is PartialDate {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }

  const record = value as Record<string, unknown>
  const keys = Object.keys(record)

  if (keys.length === 0) {
    return false
  }

  if (keys.some((key) => !PARTIAL_DATE_KEYS.has(key))) {
    return false
  }

  const hasYear = 'year' in record
  const hasMonth = 'month' in record
  const hasDay = 'day' in record

  if (hasYear && hasDay && !hasMonth) {
    return false
  }

  if (hasYear && !isInteger(record.year)) {
    return false
  }

  if (hasMonth && !isInteger(record.month)) {
    return false
  }

  if (hasDay && !isInteger(record.day)) {
    return false
  }

  return true
}

function normalizePartialDate(value: PartialDate | null | undefined): PartialDate | null {
  if (!isPartialDate(value)) {
    return null
  }

  const normalized: PartialDate = {}
  if (value.year !== undefined) {
    normalized.year = value.year
  }
  if (value.month !== undefined) {
    normalized.month = value.month
  }
  if (value.day !== undefined) {
    normalized.day = value.day
  }
  return normalized
}

// =============================================================================
// Base Columns
// =============================================================================

export const baseColumns = {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
}

// =============================================================================
// Enum Type Factories
// =============================================================================

/**
 * Creates a Drizzle custom type for required enum values
 *
 * @param validValues - Array of valid enum string values
 * @param defaultValue - Fallback value when reading invalid data from DB
 * @param typeName - Human-readable name for error messages
 */
function createEnumType<T extends string>(
  validValues: readonly T[],
  defaultValue: T,
  typeName: string
) {
  return customType<{ data: T; driverData: string }>({
    dataType() {
      return 'text'
    },

    fromDriver(value: string): T {
      if (validValues.includes(value as T)) {
        return value as T
      }
      console.warn(`Invalid ${typeName} value from database:`, value)
      return defaultValue
    },

    toDriver(value: T): string {
      if (validValues.includes(value)) {
        return value
      }
      throw new Error(`Invalid ${typeName} value: ${value}`)
    }
  })
}

/**
 * Creates a Drizzle custom type for nullable enum values
 *
 * @param validValues - Array of valid enum string values
 * @param typeName - Human-readable name for error messages
 */
function createNullableEnumType<T extends string>(validValues: readonly T[], typeName: string) {
  return customType<{ data: T | null; driverData: string | null }>({
    dataType() {
      return 'text'
    },

    fromDriver(value: string | null): T | null {
      if (!value) return null
      if (validValues.includes(value as T)) {
        return value as T
      }
      console.warn(`Invalid ${typeName} value from database:`, value)
      return null
    },

    toDriver(value: T | null): string | null {
      if (!value) return null
      if (validValues.includes(value)) {
        return value
      }
      throw new Error(`Invalid ${typeName} value: ${value}`)
    }
  })
}

// =============================================================================
// Enum Custom Types (using factories)
// =============================================================================

const STATUS_VALUES = [
  'notStarted',
  'inProgress',
  'partial',
  'completed',
  'multiple',
  'shelved'
] as const
export const status = createEnumType<Status>(STATUS_VALUES, 'notStarted', 'status')

const GAME_LAUNCHER_MODE_VALUES = ['file', 'url', 'exec'] as const
export const gameLauncherMode = createEnumType<GameLauncherMode>(
  GAME_LAUNCHER_MODE_VALUES,
  'file',
  'gameLauncherMode'
)

const GAME_MONITOR_MODE_VALUES = ['file', 'folder', 'process'] as const
export const gameMonitorMode = createEnumType<GameMonitorMode>(
  GAME_MONITOR_MODE_VALUES,
  'folder',
  'gameMonitorMode'
)

const GENDER_VALUES = ['male', 'female', 'other'] as const
export const gender = createNullableEnumType<Gender>(GENDER_VALUES, 'gender')

const GAME_PERSON_TYPE_VALUES = [
  'director',
  'scenario',
  'illustration',
  'music',
  'programmer',
  'actor',
  'other'
] as const
export const gamePersonType = createEnumType<GamePersonType>(
  GAME_PERSON_TYPE_VALUES,
  'other',
  'gamePersonType'
)

const GAME_CHARACTER_TYPE_VALUES = ['main', 'supporting', 'cameo', 'other'] as const
export const gameCharacterType = createEnumType<GameCharacterType>(
  GAME_CHARACTER_TYPE_VALUES,
  'other',
  'gameCharacterType'
)

const GAME_COMPANY_TYPE_VALUES = ['developer', 'publisher', 'distributor', 'other'] as const
export const gameCompanyType = createEnumType<GameCompanyType>(
  GAME_COMPANY_TYPE_VALUES,
  'other',
  'gameCompanyType'
)

const CHARACTER_PERSON_TYPE_VALUES = ['actor', 'illustration', 'designer', 'other'] as const
export const characterPersonType = createEnumType<CharacterPersonType>(
  CHARACTER_PERSON_TYPE_VALUES,
  'other',
  'characterPersonType'
)

const BLOOD_TYPE_VALUES = ['a', 'b', 'ab', 'o'] as const
export const bloodType = createNullableEnumType<BloodType>(BLOOD_TYPE_VALUES, 'bloodType')

const CUP_SIZE_VALUES = [
  'aaa',
  'aa',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k'
] as const
export const cupSize = createNullableEnumType<CupSize>(CUP_SIZE_VALUES, 'cupSize')

export const mediaType = createEnumType<MediaType>(MEDIA_TYPES, 'game', 'mediaType')
export const locale = createNullableEnumType<Locale>(LOCALES, 'locale')
export const appLocale = createNullableEnumType<AppLocale>(APP_LOCALES, 'appLocale')

const MAIN_WINDOW_CLOSE_ACTION_VALUES = ['exit', 'tray'] as const
export const mainWindowCloseAction = createEnumType<MainWindowCloseAction>(
  MAIN_WINDOW_CLOSE_ACTION_VALUES,
  'exit',
  'mainWindowCloseAction'
)
export const contentEntityType = createEnumType<ContentEntityType>(
  CONTENT_ENTITY_TYPES,
  'game',
  'contentEntityType'
)
export const allEntityType = createEnumType<AllEntityType>(
  ALL_ENTITY_TYPES,
  'game',
  'allEntityType'
)

const SECTION_LAYOUT_VALUES = ['horizontal', 'grid'] as const
export const sectionLayout = createEnumType<SectionLayout>(
  SECTION_LAYOUT_VALUES,
  'horizontal',
  'sectionLayout'
)

const SECTION_ITEM_SIZE_VALUES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
export const sectionItemSize = createEnumType<SectionItemSize>(
  SECTION_ITEM_SIZE_VALUES,
  'md',
  'sectionItemSize'
)

const SECTION_OPEN_MODE_VALUES = ['page', 'dialog'] as const
export const sectionOpenMode = createEnumType<SectionOpenMode>(
  SECTION_OPEN_MODE_VALUES,
  'page',
  'sectionOpenMode'
)

const SORT_DIRECTION_VALUES = ['asc', 'desc'] as const
export const sortDirection = createEnumType<SortDirection>(
  SORT_DIRECTION_VALUES,
  'asc',
  'sortDirection'
)

// =============================================================================
// Partial Date Custom Type
// =============================================================================

/** Custom type for storing partial date JSON object. */
export const partialDate = customType<{
  data: PartialDate | null
  driverData: string | null
}>({
  dataType() {
    return 'text'
  },

  fromDriver(value: string | null): PartialDate | null {
    if (!value) return null
    try {
      const parsed = JSON.parse(value)
      const normalized = normalizePartialDate(parsed)
      if (!normalized) {
        console.warn('Invalid partialDate value from database:', value)
      }
      return normalized
    } catch (error) {
      console.error('Failed to parse partialDate:', error)
      return null
    }
  },

  toDriver(value: PartialDate | null): string | null {
    if (!value) return null
    const normalized = normalizePartialDate(value)
    if (!normalized) {
      throw new Error('partialDate must be a valid PartialDate object or null')
    }
    return JSON.stringify(normalized)
  }
})

// =============================================================================
// Array/Object JSON Custom Types
// =============================================================================

/** Custom type for storing string array as JSON in SQLite */
export const stringArrayJson = customType<{
  data: string[]
  driverData: string
}>({
  dataType() {
    return 'text'
  },

  fromDriver(value: string): string[] {
    if (!value || value === '[]') return []
    try {
      const parsed = JSON.parse(value)
      if (!Array.isArray(parsed)) {
        console.warn('stringArrayJson value is not an array:', value)
        return []
      }
      return parsed.filter((v) => typeof v === 'string') as string[]
    } catch (error) {
      console.error('Failed to parse stringArrayJson:', error)
      return []
    }
  },

  toDriver(value: string[]): string {
    if (!Array.isArray(value)) {
      throw new Error('stringArrayJson must be an array')
    }
    if (!value.every((v) => typeof v === 'string')) {
      throw new Error('stringArrayJson must be an array of strings')
    }
    return JSON.stringify(value)
  }
})

/** Custom type for storing RelatedSite array as JSON in SQLite */
export const relatedSites = customType<{
  data: RelatedSite[]
  driverData: string
}>({
  dataType() {
    return 'text'
  },

  fromDriver(value: string): RelatedSite[] {
    if (!value || value === '[]') return []

    try {
      const parsed = JSON.parse(value)
      if (!Array.isArray(parsed)) {
        console.warn('RelatedSites value is not an array:', value)
        return []
      }

      const validated = parsed.filter((item): item is RelatedSite => {
        if (!item || typeof item !== 'object') return false
        if (typeof item.label !== 'string' || !item.label.trim()) return false
        if (typeof item.url !== 'string' || !item.url.trim()) return false
        try {
          new URL(item.url)
          return true
        } catch {
          return false
        }
      })

      return validated
    } catch (error) {
      console.error('Failed to parse relatedSites:', error)
      return []
    }
  },

  toDriver(value: RelatedSite[]): string {
    if (!Array.isArray(value)) {
      throw new Error('RelatedSites must be an array')
    }

    const errors: string[] = []
    value.forEach((site, index) => {
      if (!site || typeof site !== 'object') {
        errors.push(`Site at index ${index} is not an object`)
        return
      }
      if (typeof site.label !== 'string' || !site.label.trim()) {
        errors.push(`Site at index ${index} has invalid label`)
      }
      if (typeof site.url !== 'string' || !site.url.trim()) {
        errors.push(`Site at index ${index} has invalid url`)
      } else {
        try {
          new URL(site.url)
        } catch {
          errors.push(`Site at index ${index} has invalid URL format: ${site.url}`)
        }
      }
    })

    if (errors.length > 0) {
      throw new Error(`RelatedSites validation failed:\n${errors.join('\n')}`)
    }

    const uniqueSites = Array.from(new Map(value.map((site) => [site.url, site])).values())
    return JSON.stringify(uniqueSites)
  }
})

/** Custom type for storing SaveBackup array as JSON in SQLite */
export const saveBackups = customType<{
  data: SaveBackup[]
  driverData: string
}>({
  dataType() {
    return 'text'
  },

  fromDriver(value: string): SaveBackup[] {
    if (!value || value === '[]') return []
    try {
      const parsed = JSON.parse(value)
      if (!Array.isArray(parsed)) {
        console.warn('SaveBackups value is not an array:', value)
        return []
      }
      return parsed.filter(
        (item): item is SaveBackup =>
          item &&
          typeof item === 'object' &&
          typeof item.backupAt === 'number' &&
          typeof item.note === 'string' &&
          typeof item.locked === 'boolean' &&
          typeof item.saveFile === 'string'
      )
    } catch (error) {
      console.error('Failed to parse saveBackups:', error)
      return []
    }
  },

  toDriver(value: SaveBackup[]): string {
    if (!Array.isArray(value)) {
      throw new Error('SaveBackups must be an array')
    }
    value.forEach((item, index) => {
      if (
        !item ||
        typeof item !== 'object' ||
        typeof item.backupAt !== 'number' ||
        typeof item.note !== 'string' ||
        typeof item.locked !== 'boolean' ||
        typeof item.saveFile !== 'string'
      ) {
        throw new Error(`Invalid saveBackup object at index ${index}`)
      }
    })
    return JSON.stringify(value)
  }
})

/** Custom type for storing FailedScan array as JSON in SQLite */
export const failedScans = customType<{
  data: FailedScan[]
  driverData: string
}>({
  dataType() {
    return 'text'
  },

  fromDriver(value: string): FailedScan[] {
    if (!value || value === '[]') return []
    try {
      const parsed = JSON.parse(value)
      if (!Array.isArray(parsed)) {
        console.warn('FailedScans value is not an array:', value)
        return []
      }
      return parsed.filter(
        (item): item is FailedScan =>
          item &&
          typeof item === 'object' &&
          typeof item.name === 'string' &&
          typeof item.reason === 'string' &&
          typeof item.path === 'string'
      )
    } catch (error) {
      console.error('Failed to parse failedScans:', error)
      return []
    }
  },

  toDriver(value: FailedScan[]): string {
    if (!Array.isArray(value)) {
      throw new Error('FailedScans must be an array')
    }
    value.forEach((item, index) => {
      if (
        !item ||
        typeof item !== 'object' ||
        typeof item.name !== 'string' ||
        typeof item.reason !== 'string' ||
        typeof item.path !== 'string'
      ) {
        throw new Error(`Invalid failedScan object at index ${index}`)
      }
    })
    return JSON.stringify(value)
  }
})

/** Custom type for storing scanner ignored names as JSON in SQLite */
export const scannerIgnoredNames = customType<{
  data: ScannerIgnoredNames
  driverData: string
}>({
  dataType() {
    return 'text'
  },

  fromDriver(value: string): ScannerIgnoredNames {
    if (!value || value === '[]') return []
    try {
      const parsed = JSON.parse(value)
      if (!Array.isArray(parsed)) {
        console.warn('scannerIgnoredNames value is not an array:', value)
        return []
      }
      return parsed.filter((item): item is string => typeof item === 'string')
    } catch (error) {
      console.error('Failed to parse scannerIgnoredNames:', error)
      return []
    }
  },

  toDriver(value: ScannerIgnoredNames): string {
    if (!Array.isArray(value)) {
      throw new Error('scannerIgnoredNames must be an array')
    }
    value.forEach((item, index) => {
      if (typeof item !== 'string') {
        throw new Error(`Invalid scannerIgnoredName at index ${index}`)
      }
    })
    return JSON.stringify(value)
  }
})

/** Custom type for storing name extraction rules as JSON in SQLite */
export const nameExtractionRules = customType<{
  data: NameExtractionRule[]
  driverData: string
}>({
  dataType() {
    return 'text'
  },

  fromDriver(value: string): NameExtractionRule[] {
    if (!value || value === '[]') return []
    try {
      const parsed = JSON.parse(value)
      if (!Array.isArray(parsed)) {
        console.warn('nameExtractionRules value is not an array:', value)
        return []
      }
      return parsed.filter(
        (item): item is NameExtractionRule =>
          item &&
          typeof item === 'object' &&
          typeof item.id === 'string' &&
          typeof item.description === 'string' &&
          typeof item.pattern === 'string' &&
          typeof item.enabled === 'boolean'
      )
    } catch (error) {
      console.error('Failed to parse nameExtractionRules:', error)
      return []
    }
  },

  toDriver(value: NameExtractionRule[]): string {
    if (!Array.isArray(value)) {
      throw new Error('nameExtractionRules must be an array')
    }
    return JSON.stringify(value)
  }
})

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeFilterValueForStorage(value: unknown): FilterState[string] | undefined {
  if (value === undefined || value === null) return undefined

  if (value === true) return true
  if (value === false) return undefined

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed ? trimmed : undefined
  }

  if (Array.isArray(value)) {
    const strings = value
      .filter((v): v is string => typeof v === 'string')
      .map((v) => v.trim())
      .filter(Boolean)
    return strings.length > 0 ? strings : undefined
  }

  if (!isPlainObject(value)) return undefined

  // Relation
  if ('match' in value && 'ids' in value) {
    const match = value.match
    const ids = value.ids
    if (match !== 'any' && match !== 'all') return undefined
    if (!Array.isArray(ids)) return undefined
    const normalizedIds = ids
      .filter((v): v is string => typeof v === 'string')
      .map((v) => v.trim())
      .filter(Boolean)
    return normalizedIds.length > 0
      ? ({ match, ids: normalizedIds } as FilterState[string])
      : undefined
  }

  // Number range
  if ('min' in value || 'max' in value) {
    const min = value.min
    const max = value.max
    const normalizedMin = typeof min === 'number' ? min : undefined
    const normalizedMax = typeof max === 'number' ? max : undefined
    return normalizedMin === undefined && normalizedMax === undefined
      ? undefined
      : ({ min: normalizedMin, max: normalizedMax } as FilterState[string])
  }

  // Date range
  if ('from' in value || 'to' in value) {
    const from = typeof value.from === 'string' && value.from.trim() ? value.from.trim() : undefined
    const to = typeof value.to === 'string' && value.to.trim() ? value.to.trim() : undefined
    return from || to ? ({ from, to } as FilterState[string]) : undefined
  }

  return undefined
}

/** Custom type for storing filter state as JSON in SQLite */
export const filterState = customType<{
  data: FilterState
  driverData: string
}>({
  dataType() {
    return 'text'
  },

  fromDriver(value: string): FilterState {
    if (!value || value === '{}' || value === 'null') return {}
    try {
      const parsed = JSON.parse(value)
      if (!isPlainObject(parsed)) {
        console.warn('filterState value is not an object:', value)
        return {}
      }

      const record = parsed as Record<string, unknown>
      const normalized: Record<string, FilterState[string]> = {}
      for (const [key, rawValue] of Object.entries(record)) {
        const normalizedValue = normalizeFilterValueForStorage(rawValue)
        if (normalizedValue !== undefined) {
          normalized[key] = normalizedValue
        }
      }
      return normalized
    } catch (error) {
      console.error('Failed to parse filterState:', error)
      return {}
    }
  },

  toDriver(value: FilterState): string {
    if (!isPlainObject(value)) {
      throw new Error('filterState must be an object')
    }
    for (const [key, rawValue] of Object.entries(value)) {
      const normalizedValue = normalizeFilterValueForStorage(rawValue)
      if (normalizedValue === undefined) {
        throw new Error(`Invalid filterState value for key: ${key}`)
      }
    }
    return JSON.stringify(value)
  }
})

/** Custom type for storing dynamic collection config as JSON in SQLite */
export const dynamicCollectionConfig = customType<{
  data: DynamicCollectionConfig | null
  driverData: string | null
}>({
  dataType() {
    return 'text'
  },

  fromDriver(value: string | null): DynamicCollectionConfig | null {
    if (!value) return null
    try {
      const parsed = JSON.parse(value)
      if (typeof parsed !== 'object' || parsed === null) {
        console.warn('dynamicCollectionConfig value is not an object:', value)
        return null
      }
      return parsed as DynamicCollectionConfig
    } catch (error) {
      console.error('Failed to parse dynamicCollectionConfig:', error)
      return null
    }
  },

  toDriver(value: DynamicCollectionConfig | null): string | null {
    if (value === null || value === undefined) return null
    if (typeof value !== 'object') {
      throw new Error('dynamicCollectionConfig must be an object or null')
    }
    return JSON.stringify(value)
  }
})

// No legacy filter conversion is supported.

// =============================================================================
// Scraper Profile Custom Types
// =============================================================================

/** Custom type for storing scraper slot configs as JSON in SQLite */
export const scraperSlotConfigs = customType<{
  data: ScraperSlotConfigs
  driverData: string
}>({
  dataType() {
    return 'text'
  },

  fromDriver(value: string): ScraperSlotConfigs {
    if (!value || value === '{}') return {}
    try {
      const parsed = JSON.parse(value)
      if (typeof parsed !== 'object' || parsed === null) {
        console.warn('scraperSlotConfigs value is not an object:', value)
        return {}
      }

      const configs: ScraperSlotConfigs = {}
      for (const [slot, slotConfig] of Object.entries(parsed as Record<string, unknown>)) {
        if (!slotConfig || typeof slotConfig !== 'object') continue
        const candidate = slotConfig as Partial<SlotConfig>
        if (!Array.isArray(candidate.providers) || typeof candidate.mergeStrategy !== 'string') {
          continue
        }
        configs[slot] = candidate as SlotConfig
      }

      return configs
    } catch (error) {
      console.error('Failed to parse scraperSlotConfigs:', error)
      return {}
    }
  },

  toDriver(value: ScraperSlotConfigs): string {
    if (typeof value !== 'object' || value === null) {
      throw new Error('scraperSlotConfigs must be an object')
    }
    return JSON.stringify(value)
  }
})
