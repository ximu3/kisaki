/**
 * Kisaki Plugin SDK - Main Process Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 * Generated from apps/desktop/src/main/services/plugin/api.ts
 *
 * @packageDocumentation
 */

import Database from 'better-sqlite3'
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as drizzle_orm_sqlite_core313 from 'drizzle-orm/sqlite-core'
import { SQLiteTable, SQLiteTransaction } from 'drizzle-orm/sqlite-core'
import * as drizzle_orm0 from 'drizzle-orm'
import { ExtractTablesWithRelations, InferInsertModel, InferSelectModel, Table } from 'drizzle-orm'
import * as electron from 'electron'
import {
  BrowserWindow,
  IpcMainEvent,
  IpcMainInvokeEvent,
  OpenDialogOptions,
  OpenDialogReturnValue
} from 'electron'
import 'i18next'
import log from 'electron-log/main'

//#region rolldown:runtime
//#endregion
//#region src/shared/common.d.ts
/**
 * Entity Type System
 *
 * Unified type definitions for all entity types in the application.
 * This is the single source of truth - all modules should import from here.
 *
 * Entity Categories:
 * 1. Media Types - Primary content entities (game, ...)
 * 2. Metadata Types - Entities associated with media (character, person, company)
 * 3. Organizer Types - Container entities for grouping (collection, tag)
 */
/**
 * Media types - Primary content entities that users manage
 *
 * Each media type has:
 * - Dedicated database table
 * - Scanner support
 * - Scraper support
 * - Independent library page at /library/$mediaType
 *
 * Future: May expand to include 'book' | 'movie' | 'music' | 'tv'
 */
type MediaType = 'game'
/**
 * Metadata entity types - Entities associated with media
 *
 * These entities:
 * - Have their own database tables
 * - Are primarily created through scraping (not user-created)
 * - Have independent detail pages
 * - Can be browsed at /library/$metadataType
 */
type MetadataType = 'character' | 'person' | 'company'
/**
 * Organizer entity types - Container entities for grouping content
 *
 * These entities:
 * - Group/categorize content entities (MediaType | MetadataType)
 * - Have their own database tables
 * - collection: has list page + detail page
 * - tag: has detail dialog (no dedicated page)
 */
type OrganizerType = 'collection' | 'tag'
/**
 * Content entity types - Entities that can be organized by collection/tag
 *
 * Used for:
 * - Router params at /library/$entityType
 * - Filter schemas and query building
 * - Collection/Tag entity type tabs
 * - EntityCard rendering in Showcase
 */
type ContentEntityType = MediaType | MetadataType
/**
 * All entity types - Every entity with independent CRUD operations
 *
 * Used for:
 * - Showcase sections (all entity types can be displayed as cards)
 * - Complete entity type validation
 */
type AllEntityType = ContentEntityType | OrganizerType
//#endregion
//#region src/shared/db/enums.d.ts
/**
 * Database enum types
 *
 * Pure type definitions for database enum columns.
 * These are the type definitions only - the Drizzle customType implementations
 * are in ./custom-types.ts
 */
/** Game/media completion status */
type Status = 'notStarted' | 'inProgress' | 'partial' | 'completed' | 'multiple' | 'shelved'
/** Game launcher mode */
type GameLauncherMode = 'file' | 'url' | 'exec'
/** Game process monitor mode */
type GameMonitorMode = 'file' | 'folder' | 'process'
/** Person gender */
type Gender = 'male' | 'female' | 'other'
/** Game-Person relationship type */
type GamePersonType =
  | 'director'
  | 'scenario'
  | 'illustration'
  | 'music'
  | 'programmer'
  | 'actor'
  | 'other'
/** Game-Character relationship type */
type GameCharacterType = 'main' | 'supporting' | 'cameo' | 'other'
/** Game-Company relationship type */
type GameCompanyType = 'developer' | 'publisher' | 'distributor' | 'other'
/** Character-Person relationship type */
type CharacterPersonType = 'actor' | 'illustration' | 'designer' | 'other'
/** Blood type */
type BloodType = 'a' | 'b' | 'ab' | 'o'
/** Cup size (for female characters) */
type CupSize = 'aaa' | 'aa' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k'
/** Main window close button behavior */
type MainWindowCloseAction = 'exit' | 'tray'
//#endregion
//#region src/shared/locale.d.ts
/**
 * Locale type definitions
 * Using BCP 47 language tags
 */
/**
 * Common BCP 47 language tags for scraper providers
 */
type Locale =
  | 'en'
  | 'zh-Hans'
  | 'zh-Hant'
  | 'ja'
  | 'ko'
  | 'de'
  | 'fr'
  | 'es'
  | 'pt'
  | 'it'
  | 'ru'
  | 'vi'
  | 'th'
  | 'id'
  | 'pl'
  | 'tr'
  | 'ar'
  | 'uk'
/**
 * Application UI supported locales (subset of Locale)
 * Only languages with translation files available
 */
type AppLocale = 'zh-Hans' | 'en' | 'ja'
//#endregion
//#region src/shared/db/json-types.d.ts
/** Related site link */
interface RelatedSite {
  label: string
  url: string
}
/** Game save backup record */
interface SaveBackup {
  backupAt: number
  note: string
  locked: boolean
  saveFile: string
  sizeBytes?: number
}
/** Failed scan record */
interface FailedScan {
  name: string
  reason: string
  path: string
}
/** Name extraction rule for scanner */
interface NameExtractionRule {
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
type ScannerIgnoredNames = string[]
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
interface PartialDate {
  year?: number
  month?: number
  day?: number
}
/** Date range value for dateRange fields */
interface DateRangeValue {
  /** YYYY-MM-DD */
  from?: string
  /** YYYY-MM-DD */
  to?: string
}
/** Number range value for numberRange fields */
interface NumberRangeValue {
  min?: number
  max?: number
}
/** Relation filter value */
interface RelationValue {
  match: 'any' | 'all'
  ids: string[]
}
type FilterValue = true | string | string[] | NumberRangeValue | DateRangeValue | RelationValue
/** Filter state stored as JSON (field key -> value). */
type FilterState = Record<string, FilterValue>
/** Showcase section layout type */
type SectionLayout = 'horizontal' | 'grid'
/** Showcase section item size */
type SectionItemSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
/** Showcase section open mode */
type SectionOpenMode = 'page' | 'dialog'
/** Sort direction */
type SortDirection = 'asc' | 'desc'
/** Filter + sort config for one entity type in dynamic collection */
interface DynamicEntityConfig {
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
type DynamicCollectionConfig = Record<
  'game' | 'character' | 'person' | 'company',
  DynamicEntityConfig
>
type GameScraperSlot =
  | 'info'
  | 'tags'
  | 'characters'
  | 'persons'
  | 'companies'
  | 'covers'
  | 'backdrops'
  | 'logos'
  | 'icons'
declare const GAME_SCRAPER_SLOTS: GameScraperSlot[]
type PersonScraperSlot = 'info' | 'tags' | 'photos'
declare const PERSON_SCRAPER_SLOTS: PersonScraperSlot[]
type CompanyScraperSlot = 'info' | 'tags' | 'logos'
declare const COMPANY_SCRAPER_SLOTS: CompanyScraperSlot[]
type CharacterScraperSlot = 'info' | 'tags' | 'persons' | 'photos'
declare const CHARACTER_SCRAPER_SLOTS: CharacterScraperSlot[]
/**
 * Union of all slot names used across all scraper media types.
 *
 * Used for:
 * - Provider capability declarations
 * - Renderer filtering (ScraperProviderSelect requiredCapabilities)
 * - Slot config editing UI
 */
type ScraperSlot = GameScraperSlot | PersonScraperSlot | CompanyScraperSlot | CharacterScraperSlot
/** Merge strategy for multi-provider results */
type MergeStrategy = 'first' | 'merge' | 'append'
/** Configuration for a provider within a slot */
interface ScraperProviderEntry {
  providerId: string
  enabled: boolean
  priority: number
  locale?: Locale | null
}
/** Configuration for a single slot */
interface SlotConfig {
  providers: ScraperProviderEntry[]
  mergeStrategy: MergeStrategy
}
/**
 * Scraper slot configurations stored in DB.
 *
 * Each profile stores only the slots relevant to its mediaType.
 */
type ScraperSlotConfigs = Record<string, SlotConfig>
type GameScraperSlotConfigs = Record<GameScraperSlot, SlotConfig>
type PersonScraperSlotConfigs = Record<PersonScraperSlot, SlotConfig>
type CompanyScraperSlotConfigs = Record<CompanyScraperSlot, SlotConfig>
type CharacterScraperSlotConfigs = Record<CharacterScraperSlot, SlotConfig>
//#endregion
//#region src/shared/db/custom-types.d.ts
declare const baseColumns: {
  id: drizzle_orm0.HasRuntimeDefault<
    drizzle_orm0.HasDefault<
      drizzle_orm0.IsPrimaryKey<
        drizzle_orm0.NotNull<
          drizzle_orm_sqlite_core313.SQLiteTextBuilderInitial<
            'id',
            [string, ...string[]],
            number | undefined
          >
        >
      >
    >
  >
  createdAt: drizzle_orm0.HasRuntimeDefault<
    drizzle_orm0.HasDefault<
      drizzle_orm0.NotNull<drizzle_orm_sqlite_core313.SQLiteTimestampBuilderInitial<'created_at'>>
    >
  >
  updatedAt: drizzle_orm0.HasDefault<
    drizzle_orm0.HasRuntimeDefault<
      drizzle_orm0.HasDefault<
        drizzle_orm0.NotNull<drizzle_orm_sqlite_core313.SQLiteTimestampBuilderInitial<'updated_at'>>
      >
    >
  >
}
declare const status: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: Status
    driverParam: string
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: Status
    driverParam: string
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: Status
    driverParam: string
    enumValues: undefined
  }>
}
declare const gameLauncherMode: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: GameLauncherMode
    driverParam: string
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: GameLauncherMode
    driverParam: string
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: GameLauncherMode
    driverParam: string
    enumValues: undefined
  }>
}
declare const gameMonitorMode: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: GameMonitorMode
    driverParam: string
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: GameMonitorMode
    driverParam: string
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: GameMonitorMode
    driverParam: string
    enumValues: undefined
  }>
}
declare const gender: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: Gender | null
    driverParam: string | null
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: Gender | null
    driverParam: string | null
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: Gender | null
    driverParam: string | null
    enumValues: undefined
  }>
}
declare const gamePersonType: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: GamePersonType
    driverParam: string
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: GamePersonType
    driverParam: string
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: GamePersonType
    driverParam: string
    enumValues: undefined
  }>
}
declare const gameCharacterType: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: GameCharacterType
    driverParam: string
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: GameCharacterType
    driverParam: string
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: GameCharacterType
    driverParam: string
    enumValues: undefined
  }>
}
declare const gameCompanyType: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: GameCompanyType
    driverParam: string
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: GameCompanyType
    driverParam: string
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: GameCompanyType
    driverParam: string
    enumValues: undefined
  }>
}
declare const characterPersonType: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: CharacterPersonType
    driverParam: string
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: CharacterPersonType
    driverParam: string
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: CharacterPersonType
    driverParam: string
    enumValues: undefined
  }>
}
declare const bloodType: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: BloodType | null
    driverParam: string | null
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: BloodType | null
    driverParam: string | null
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: BloodType | null
    driverParam: string | null
    enumValues: undefined
  }>
}
declare const cupSize: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: CupSize | null
    driverParam: string | null
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: CupSize | null
    driverParam: string | null
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: CupSize | null
    driverParam: string | null
    enumValues: undefined
  }>
}
declare const mediaType: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: 'game'
    driverParam: string
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: 'game'
    driverParam: string
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: 'game'
    driverParam: string
    enumValues: undefined
  }>
}
declare const locale: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: Locale | null
    driverParam: string | null
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: Locale | null
    driverParam: string | null
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: Locale | null
    driverParam: string | null
    enumValues: undefined
  }>
}
declare const appLocale: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: AppLocale | null
    driverParam: string | null
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: AppLocale | null
    driverParam: string | null
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: AppLocale | null
    driverParam: string | null
    enumValues: undefined
  }>
}
declare const mainWindowCloseAction: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: MainWindowCloseAction
    driverParam: string
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: MainWindowCloseAction
    driverParam: string
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: MainWindowCloseAction
    driverParam: string
    enumValues: undefined
  }>
}
declare const contentEntityType: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: ContentEntityType
    driverParam: string
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: ContentEntityType
    driverParam: string
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: ContentEntityType
    driverParam: string
    enumValues: undefined
  }>
}
declare const allEntityType: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: AllEntityType
    driverParam: string
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: AllEntityType
    driverParam: string
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: AllEntityType
    driverParam: string
    enumValues: undefined
  }>
}
declare const sectionLayout: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: SectionLayout
    driverParam: string
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: SectionLayout
    driverParam: string
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: SectionLayout
    driverParam: string
    enumValues: undefined
  }>
}
declare const sectionItemSize: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: SectionItemSize
    driverParam: string
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: SectionItemSize
    driverParam: string
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: SectionItemSize
    driverParam: string
    enumValues: undefined
  }>
}
declare const sectionOpenMode: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: SectionOpenMode
    driverParam: string
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: SectionOpenMode
    driverParam: string
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: SectionOpenMode
    driverParam: string
    enumValues: undefined
  }>
}
declare const sortDirection: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: SortDirection
    driverParam: string
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: SortDirection
    driverParam: string
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: SortDirection
    driverParam: string
    enumValues: undefined
  }>
}
/** Custom type for storing partial date JSON object. */
declare const partialDate: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: PartialDate | null
    driverParam: string | null
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: PartialDate | null
    driverParam: string | null
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: PartialDate | null
    driverParam: string | null
    enumValues: undefined
  }>
}
/** Custom type for storing string array as JSON in SQLite */
declare const stringArrayJson: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: string[]
    driverParam: string
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: string[]
    driverParam: string
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: string[]
    driverParam: string
    enumValues: undefined
  }>
}
/** Custom type for storing RelatedSite array as JSON in SQLite */
declare const relatedSites: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: RelatedSite[]
    driverParam: string
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: RelatedSite[]
    driverParam: string
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: RelatedSite[]
    driverParam: string
    enumValues: undefined
  }>
}
/** Custom type for storing SaveBackup array as JSON in SQLite */
declare const saveBackups: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: SaveBackup[]
    driverParam: string
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: SaveBackup[]
    driverParam: string
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: SaveBackup[]
    driverParam: string
    enumValues: undefined
  }>
}
/** Custom type for storing FailedScan array as JSON in SQLite */
declare const failedScans: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: FailedScan[]
    driverParam: string
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: FailedScan[]
    driverParam: string
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: FailedScan[]
    driverParam: string
    enumValues: undefined
  }>
}
/** Custom type for storing scanner ignored names as JSON in SQLite */
declare const scannerIgnoredNames: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: ScannerIgnoredNames
    driverParam: string
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: ScannerIgnoredNames
    driverParam: string
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: ScannerIgnoredNames
    driverParam: string
    enumValues: undefined
  }>
}
/** Custom type for storing name extraction rules as JSON in SQLite */
declare const nameExtractionRules: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: NameExtractionRule[]
    driverParam: string
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: NameExtractionRule[]
    driverParam: string
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: NameExtractionRule[]
    driverParam: string
    enumValues: undefined
  }>
}
/** Custom type for storing filter state as JSON in SQLite */
declare const filterState: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: FilterState
    driverParam: string
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: FilterState
    driverParam: string
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: FilterState
    driverParam: string
    enumValues: undefined
  }>
}
/** Custom type for storing dynamic collection config as JSON in SQLite */
declare const dynamicCollectionConfig: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: DynamicCollectionConfig | null
    driverParam: string | null
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: DynamicCollectionConfig | null
    driverParam: string | null
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: DynamicCollectionConfig | null
    driverParam: string | null
    enumValues: undefined
  }>
}
/** Custom type for storing scraper slot configs as JSON in SQLite */
declare const scraperSlotConfigs: {
  (): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: ScraperSlotConfigs
    driverParam: string
    enumValues: undefined
  }>
  <TConfig extends Record<string, any>>(
    fieldConfig?: TConfig | undefined
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: ''
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: ScraperSlotConfigs
    driverParam: string
    enumValues: undefined
  }>
  <TName extends string>(
    dbName: TName,
    fieldConfig?: unknown
  ): drizzle_orm_sqlite_core313.SQLiteCustomColumnBuilder<{
    name: TName
    dataType: 'custom'
    columnType: 'SQLiteCustomColumn'
    data: ScraperSlotConfigs
    driverParam: string
    enumValues: undefined
  }>
}
declare namespace schema_d_exports {
  export {
    Character,
    CharacterExternalId,
    CharacterPersonLink,
    CharacterTagLink,
    Collection,
    CollectionCharacterLink,
    CollectionCompanyLink,
    CollectionGameLink,
    CollectionPersonLink,
    Company,
    CompanyExternalId,
    CompanyTagLink,
    Game,
    GameCharacterLink,
    GameCompanyLink,
    GameExternalId,
    GameNote,
    GamePersonLink,
    GameSession,
    GameTagLink,
    NewCharacter,
    NewCharacterExternalId,
    NewCharacterPersonLink,
    NewCharacterTagLink,
    NewCollection,
    NewCollectionCharacterLink,
    NewCollectionCompanyLink,
    NewCollectionGameLink,
    NewCollectionPersonLink,
    NewCompany,
    NewCompanyExternalId,
    NewCompanyTagLink,
    NewGame,
    NewGameCharacterLink,
    NewGameCompanyLink,
    NewGameExternalId,
    NewGameNote,
    NewGamePersonLink,
    NewGameSession,
    NewGameTagLink,
    NewPerson,
    NewPersonExternalId,
    NewPersonTagLink,
    NewPluginData,
    NewScanner,
    NewScraperProfile,
    NewSettings,
    NewShowcaseSection,
    NewTag,
    Person,
    PersonExternalId,
    PersonTagLink,
    PluginData,
    Scanner,
    ScraperProfile,
    Settings,
    ShowcaseSection,
    ShowcaseSectionFormItem,
    Tag$1 as Tag,
    characterExternalIds,
    characterPersonLinks,
    characterTagLinks,
    characters,
    collectionCharacterLinks,
    collectionCompanyLinks,
    collectionGameLinks,
    collectionPersonLinks,
    collections,
    companies,
    companyExternalIds,
    companyTagLinks,
    gameCharacterLinks,
    gameCompanyLinks,
    gameExternalIds,
    gameNotes,
    gamePersonLinks,
    gameSessions,
    gameTagLinks,
    games,
    personExternalIds,
    personTagLinks,
    persons,
    pluginData,
    scanners,
    scraperProfiles,
    settings,
    showcaseSections,
    tags
  }
}
declare const games: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'games'
  schema: undefined
  columns: {
    name: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'name'
        tableName: 'games'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    originalName: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'original_name'
        tableName: 'games'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    sortName: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'sort_name'
        tableName: 'games'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    coverFile: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'cover_file'
        tableName: 'games'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    backdropFile: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'backdrop_file'
        tableName: 'games'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    logoFile: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'logo_file'
        tableName: 'games'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    iconFile: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'icon_file'
        tableName: 'games'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    score: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'score'
        tableName: 'games'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    isFavorite: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'is_favorite'
        tableName: 'games'
        dataType: 'boolean'
        columnType: 'SQLiteBoolean'
        data: boolean
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    releaseDate: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'release_date'
        tableName: 'games'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: PartialDate | null
        driverParam: string | null
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    description: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'description'
        tableName: 'games'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    relatedSites: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'related_sites'
        tableName: 'games'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: RelatedSite[]
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    status: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'status'
        tableName: 'games'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: Status
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    lastActiveAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'last_active_at'
        tableName: 'games'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    totalDuration: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'total_duration'
        tableName: 'games'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    savePath: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'save_path'
        tableName: 'games'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    saveBackups: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'save_backups'
        tableName: 'games'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: SaveBackup[]
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    maxSaveBackups: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'max_save_backups'
        tableName: 'games'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    launcherMode: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'launcher_mode'
        tableName: 'games'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: GameLauncherMode
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    launcherPath: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'launcher_path'
        tableName: 'games'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    monitorMode: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'monitor_mode'
        tableName: 'games'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: GameMonitorMode
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    monitorPath: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'monitor_path'
        tableName: 'games'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    gameDirPath: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'game_dir_path'
        tableName: 'games'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    isNsfw: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'is_nsfw'
        tableName: 'games'
        dataType: 'boolean'
        columnType: 'SQLiteBoolean'
        data: boolean
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    descriptionInlineFiles: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'description_inline_files'
        tableName: 'games'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: string[]
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'games'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'games'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'games'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
type Game = InferSelectModel<typeof games>
type NewGame = InferInsertModel<typeof games>
declare const gameNotes: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'game_notes'
  schema: undefined
  columns: {
    gameId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'game_id'
        tableName: 'game_notes'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    name: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'name'
        tableName: 'game_notes'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    content: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'content'
        tableName: 'game_notes'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    contentInlineFiles: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'content_inline_files'
        tableName: 'game_notes'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: string[]
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    coverFile: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'cover_file'
        tableName: 'game_notes'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    orderInGame: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order_in_game'
        tableName: 'game_notes'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'game_notes'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'game_notes'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'game_notes'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
type GameNote = InferSelectModel<typeof gameNotes>
type NewGameNote = InferInsertModel<typeof gameNotes>
declare const persons: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'persons'
  schema: undefined
  columns: {
    name: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'name'
        tableName: 'persons'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    originalName: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'original_name'
        tableName: 'persons'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    sortName: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'sort_name'
        tableName: 'persons'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    photoFile: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'photo_file'
        tableName: 'persons'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    score: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'score'
        tableName: 'persons'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    isFavorite: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'is_favorite'
        tableName: 'persons'
        dataType: 'boolean'
        columnType: 'SQLiteBoolean'
        data: boolean
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    isNsfw: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'is_nsfw'
        tableName: 'persons'
        dataType: 'boolean'
        columnType: 'SQLiteBoolean'
        data: boolean
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    birthDate: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'birth_date'
        tableName: 'persons'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: PartialDate | null
        driverParam: string | null
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    deathDate: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'death_date'
        tableName: 'persons'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: PartialDate | null
        driverParam: string | null
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    gender: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'gender'
        tableName: 'persons'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: Gender | null
        driverParam: string | null
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    description: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'description'
        tableName: 'persons'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    relatedSites: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'related_sites'
        tableName: 'persons'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: RelatedSite[]
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'persons'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'persons'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'persons'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
type Person = InferSelectModel<typeof persons>
type NewPerson = InferInsertModel<typeof persons>
declare const companies: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'companies'
  schema: undefined
  columns: {
    name: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'name'
        tableName: 'companies'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    originalName: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'original_name'
        tableName: 'companies'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    sortName: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'sort_name'
        tableName: 'companies'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    foundedDate: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'founded_date'
        tableName: 'companies'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: PartialDate | null
        driverParam: string | null
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    logoFile: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'logo_file'
        tableName: 'companies'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    score: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'score'
        tableName: 'companies'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    isFavorite: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'is_favorite'
        tableName: 'companies'
        dataType: 'boolean'
        columnType: 'SQLiteBoolean'
        data: boolean
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    isNsfw: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'is_nsfw'
        tableName: 'companies'
        dataType: 'boolean'
        columnType: 'SQLiteBoolean'
        data: boolean
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    relatedSites: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'related_sites'
        tableName: 'companies'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: RelatedSite[]
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    description: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'description'
        tableName: 'companies'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'companies'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'companies'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'companies'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
type Company = InferSelectModel<typeof companies>
type NewCompany = InferInsertModel<typeof companies>
declare const characters: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'characters'
  schema: undefined
  columns: {
    name: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'name'
        tableName: 'characters'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    originalName: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'original_name'
        tableName: 'characters'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    sortName: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'sort_name'
        tableName: 'characters'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    photoFile: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'photo_file'
        tableName: 'characters'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    birthDate: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'birth_date'
        tableName: 'characters'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: PartialDate | null
        driverParam: string | null
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    gender: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'gender'
        tableName: 'characters'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: Gender | null
        driverParam: string | null
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    bloodType: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'blood_type'
        tableName: 'characters'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: BloodType | null
        driverParam: string | null
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    height: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'height'
        tableName: 'characters'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    weight: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'weight'
        tableName: 'characters'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    bust: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'bust'
        tableName: 'characters'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    waist: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'waist'
        tableName: 'characters'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    hips: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'hips'
        tableName: 'characters'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    cup: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'cup'
        tableName: 'characters'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: CupSize | null
        driverParam: string | null
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    age: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'age'
        tableName: 'characters'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    score: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'score'
        tableName: 'characters'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    isFavorite: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'is_favorite'
        tableName: 'characters'
        dataType: 'boolean'
        columnType: 'SQLiteBoolean'
        data: boolean
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    isNsfw: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'is_nsfw'
        tableName: 'characters'
        dataType: 'boolean'
        columnType: 'SQLiteBoolean'
        data: boolean
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    description: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'description'
        tableName: 'characters'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    relatedSites: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'related_sites'
        tableName: 'characters'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: RelatedSite[]
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'characters'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'characters'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'characters'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
type Character = InferSelectModel<typeof characters>
type NewCharacter = InferInsertModel<typeof characters>
declare const gameExternalIds: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'game_external_ids'
  schema: undefined
  columns: {
    gameId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'game_id'
        tableName: 'game_external_ids'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    source: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'source'
        tableName: 'game_external_ids'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    externalId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'external_id'
        tableName: 'game_external_ids'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'game_external_ids'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'game_external_ids'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'game_external_ids'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
declare const personExternalIds: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'person_external_ids'
  schema: undefined
  columns: {
    personId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'person_id'
        tableName: 'person_external_ids'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    source: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'source'
        tableName: 'person_external_ids'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    externalId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'external_id'
        tableName: 'person_external_ids'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'person_external_ids'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'person_external_ids'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'person_external_ids'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
declare const companyExternalIds: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'company_external_ids'
  schema: undefined
  columns: {
    companyId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'company_id'
        tableName: 'company_external_ids'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    source: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'source'
        tableName: 'company_external_ids'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    externalId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'external_id'
        tableName: 'company_external_ids'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'company_external_ids'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'company_external_ids'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'company_external_ids'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
declare const characterExternalIds: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'character_external_ids'
  schema: undefined
  columns: {
    characterId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'character_id'
        tableName: 'character_external_ids'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    source: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'source'
        tableName: 'character_external_ids'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    externalId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'external_id'
        tableName: 'character_external_ids'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'character_external_ids'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'character_external_ids'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'character_external_ids'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
type GameExternalId = InferSelectModel<typeof gameExternalIds>
type NewGameExternalId = InferInsertModel<typeof gameExternalIds>
type PersonExternalId = InferSelectModel<typeof personExternalIds>
type NewPersonExternalId = InferInsertModel<typeof personExternalIds>
type CompanyExternalId = InferSelectModel<typeof companyExternalIds>
type NewCompanyExternalId = InferInsertModel<typeof companyExternalIds>
type CharacterExternalId = InferSelectModel<typeof characterExternalIds>
type NewCharacterExternalId = InferInsertModel<typeof characterExternalIds>
declare const tags: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'tags'
  schema: undefined
  columns: {
    name: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'name'
        tableName: 'tags'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    description: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'description'
        tableName: 'tags'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    isNsfw: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'is_nsfw'
        tableName: 'tags'
        dataType: 'boolean'
        columnType: 'SQLiteBoolean'
        data: boolean
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'tags'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'tags'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'tags'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
declare const gameTagLinks: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'game_tag_links'
  schema: undefined
  columns: {
    gameId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'game_id'
        tableName: 'game_tag_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    tagId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'tag_id'
        tableName: 'game_tag_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    isSpoiler: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'is_spoiler'
        tableName: 'game_tag_links'
        dataType: 'boolean'
        columnType: 'SQLiteBoolean'
        data: boolean
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    note: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'note'
        tableName: 'game_tag_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    orderInGame: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order_in_game'
        tableName: 'game_tag_links'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    orderInTag: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order_in_tag'
        tableName: 'game_tag_links'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'game_tag_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'game_tag_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'game_tag_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
declare const characterTagLinks: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'character_tag_links'
  schema: undefined
  columns: {
    characterId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'character_id'
        tableName: 'character_tag_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    tagId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'tag_id'
        tableName: 'character_tag_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    isSpoiler: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'is_spoiler'
        tableName: 'character_tag_links'
        dataType: 'boolean'
        columnType: 'SQLiteBoolean'
        data: boolean
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    note: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'note'
        tableName: 'character_tag_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    orderInCharacter: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order_in_character'
        tableName: 'character_tag_links'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    orderInTag: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order_in_tag'
        tableName: 'character_tag_links'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'character_tag_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'character_tag_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'character_tag_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
declare const personTagLinks: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'person_tag_links'
  schema: undefined
  columns: {
    personId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'person_id'
        tableName: 'person_tag_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    tagId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'tag_id'
        tableName: 'person_tag_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    isSpoiler: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'is_spoiler'
        tableName: 'person_tag_links'
        dataType: 'boolean'
        columnType: 'SQLiteBoolean'
        data: boolean
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    note: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'note'
        tableName: 'person_tag_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    orderInPerson: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order_in_person'
        tableName: 'person_tag_links'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    orderInTag: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order_in_tag'
        tableName: 'person_tag_links'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'person_tag_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'person_tag_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'person_tag_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
declare const companyTagLinks: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'company_tag_links'
  schema: undefined
  columns: {
    companyId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'company_id'
        tableName: 'company_tag_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    tagId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'tag_id'
        tableName: 'company_tag_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    isSpoiler: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'is_spoiler'
        tableName: 'company_tag_links'
        dataType: 'boolean'
        columnType: 'SQLiteBoolean'
        data: boolean
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    note: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'note'
        tableName: 'company_tag_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    orderInCompany: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order_in_company'
        tableName: 'company_tag_links'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    orderInTag: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order_in_tag'
        tableName: 'company_tag_links'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'company_tag_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'company_tag_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'company_tag_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
type Tag$1 = InferSelectModel<typeof tags>
type NewTag = InferInsertModel<typeof tags>
type GameTagLink = InferSelectModel<typeof gameTagLinks>
type NewGameTagLink = InferInsertModel<typeof gameTagLinks>
type CharacterTagLink = InferSelectModel<typeof characterTagLinks>
type NewCharacterTagLink = InferInsertModel<typeof characterTagLinks>
type PersonTagLink = InferSelectModel<typeof personTagLinks>
type NewPersonTagLink = InferInsertModel<typeof personTagLinks>
type CompanyTagLink = InferSelectModel<typeof companyTagLinks>
type NewCompanyTagLink = InferInsertModel<typeof companyTagLinks>
declare const collections: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'collections'
  schema: undefined
  columns: {
    name: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'name'
        tableName: 'collections'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    description: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'description'
        tableName: 'collections'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    coverFile: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'cover_file'
        tableName: 'collections'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    isNsfw: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'is_nsfw'
        tableName: 'collections'
        dataType: 'boolean'
        columnType: 'SQLiteBoolean'
        data: boolean
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    order: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order'
        tableName: 'collections'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    isDynamic: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'is_dynamic'
        tableName: 'collections'
        dataType: 'boolean'
        columnType: 'SQLiteBoolean'
        data: boolean
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    dynamicConfig: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'dynamic_config'
        tableName: 'collections'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: DynamicCollectionConfig | null
        driverParam: string | null
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'collections'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'collections'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'collections'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
type Collection = InferSelectModel<typeof collections>
type NewCollection = InferInsertModel<typeof collections>
declare const gameSessions: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'game_sessions'
  schema: undefined
  columns: {
    gameId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'game_id'
        tableName: 'game_sessions'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    startedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'started_at'
        tableName: 'game_sessions'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    endedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'ended_at'
        tableName: 'game_sessions'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'game_sessions'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'game_sessions'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'game_sessions'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
type GameSession = InferSelectModel<typeof gameSessions>
type NewGameSession = InferInsertModel<typeof gameSessions>
declare const scraperProfiles: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'scraper_profiles'
  schema: undefined
  columns: {
    name: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'name'
        tableName: 'scraper_profiles'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    description: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'description'
        tableName: 'scraper_profiles'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    mediaType: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'media_type'
        tableName: 'scraper_profiles'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: ContentEntityType
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    sourcePresetId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'source_preset_id'
        tableName: 'scraper_profiles'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    defaultLocale: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'default_locale'
        tableName: 'scraper_profiles'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: Locale | null
        driverParam: string | null
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    searchProviderId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'search_provider_id'
        tableName: 'scraper_profiles'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    slotConfigs: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'slot_configs'
        tableName: 'scraper_profiles'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: ScraperSlotConfigs
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    order: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order'
        tableName: 'scraper_profiles'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'scraper_profiles'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'scraper_profiles'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'scraper_profiles'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
type ScraperProfile = InferSelectModel<typeof scraperProfiles>
type NewScraperProfile = InferInsertModel<typeof scraperProfiles>
declare const scanners: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'scanners'
  schema: undefined
  columns: {
    name: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'name'
        tableName: 'scanners'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    path: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'path'
        tableName: 'scanners'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    type: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'type'
        tableName: 'scanners'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: 'game'
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    scraperProfileId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'scraper_profile_id'
        tableName: 'scanners'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    targetCollectionId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'target_collection_id'
        tableName: 'scanners'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    scanIntervalMinutes: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'scan_interval_minutes'
        tableName: 'scanners'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    entityDepth: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'entity_depth'
        tableName: 'scanners'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    nameExtractionRules: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'name_extraction_rules'
        tableName: 'scanners'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: NameExtractionRule[]
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'scanners'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'scanners'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'scanners'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
type Scanner = InferSelectModel<typeof scanners>
type NewScanner = InferInsertModel<typeof scanners>
declare const settings: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'settings'
  schema: undefined
  columns: {
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'settings'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    locale: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'locale'
        tableName: 'settings'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: AppLocale | null
        driverParam: string | null
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    mainWindowCloseAction: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'main_window_close_action'
        tableName: 'settings'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: MainWindowCloseAction
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    scannerIgnoredNames: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'scanner_ignored_names'
        tableName: 'settings'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: ScannerIgnoredNames
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    scannerUsePhash: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'scanner_use_phash'
        tableName: 'settings'
        dataType: 'boolean'
        columnType: 'SQLiteBoolean'
        data: boolean
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    scannerStartAtOpen: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'scanner_start_at_open'
        tableName: 'settings'
        dataType: 'boolean'
        columnType: 'SQLiteBoolean'
        data: boolean
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
type Settings = InferSelectModel<typeof settings>
type NewSettings = InferInsertModel<typeof settings>
declare const pluginData: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'plugin_data'
  schema: undefined
  columns: {
    pluginId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'plugin_id'
        tableName: 'plugin_data'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    key: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'key'
        tableName: 'plugin_data'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    value: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'value'
        tableName: 'plugin_data'
        dataType: 'json'
        columnType: 'SQLiteTextJson'
        data: unknown
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'plugin_data'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'plugin_data'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'plugin_data'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
type PluginData = InferSelectModel<typeof pluginData>
type NewPluginData = InferInsertModel<typeof pluginData>
declare const showcaseSections: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'showcase_sections'
  schema: undefined
  columns: {
    name: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'name'
        tableName: 'showcase_sections'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    entityType: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'entity_type'
        tableName: 'showcase_sections'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: AllEntityType
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    order: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order'
        tableName: 'showcase_sections'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    isVisible: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'is_visible'
        tableName: 'showcase_sections'
        dataType: 'boolean'
        columnType: 'SQLiteBoolean'
        data: boolean
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    layout: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'layout'
        tableName: 'showcase_sections'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: SectionLayout
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    itemSize: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'item_size'
        tableName: 'showcase_sections'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: SectionItemSize
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    openMode: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'open_mode'
        tableName: 'showcase_sections'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: SectionOpenMode
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    limit: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'limit'
        tableName: 'showcase_sections'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    filter: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'filter'
        tableName: 'showcase_sections'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: FilterState
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    sortField: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'sort_field'
        tableName: 'showcase_sections'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    sortDirection: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'sort_direction'
        tableName: 'showcase_sections'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: SortDirection
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'showcase_sections'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'showcase_sections'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'showcase_sections'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
type ShowcaseSection = InferSelectModel<typeof showcaseSections>
type NewShowcaseSection = InferInsertModel<typeof showcaseSections>
/** Form state type for showcase section editing (ShowcaseSection without timestamps, plus isNew flag) */
type ShowcaseSectionFormItem = Omit<ShowcaseSection, 'createdAt' | 'updatedAt'> & {
  isNew?: boolean
}
declare const gamePersonLinks: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'game_person_links'
  schema: undefined
  columns: {
    gameId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'game_id'
        tableName: 'game_person_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    personId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'person_id'
        tableName: 'game_person_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    isSpoiler: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'is_spoiler'
        tableName: 'game_person_links'
        dataType: 'boolean'
        columnType: 'SQLiteBoolean'
        data: boolean
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    type: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'type'
        tableName: 'game_person_links'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: GamePersonType
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    note: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'note'
        tableName: 'game_person_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    orderInGame: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order_in_game'
        tableName: 'game_person_links'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    orderInPerson: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order_in_person'
        tableName: 'game_person_links'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'game_person_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'game_person_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'game_person_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
declare const gameCompanyLinks: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'game_company_links'
  schema: undefined
  columns: {
    gameId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'game_id'
        tableName: 'game_company_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    companyId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'company_id'
        tableName: 'game_company_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    isSpoiler: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'is_spoiler'
        tableName: 'game_company_links'
        dataType: 'boolean'
        columnType: 'SQLiteBoolean'
        data: boolean
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    type: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'type'
        tableName: 'game_company_links'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: GameCompanyType
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    note: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'note'
        tableName: 'game_company_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    orderInGame: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order_in_game'
        tableName: 'game_company_links'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    orderInCompany: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order_in_company'
        tableName: 'game_company_links'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'game_company_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'game_company_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'game_company_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
declare const gameCharacterLinks: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'game_character_links'
  schema: undefined
  columns: {
    gameId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'game_id'
        tableName: 'game_character_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    characterId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'character_id'
        tableName: 'game_character_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    isSpoiler: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'is_spoiler'
        tableName: 'game_character_links'
        dataType: 'boolean'
        columnType: 'SQLiteBoolean'
        data: boolean
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    type: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'type'
        tableName: 'game_character_links'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: GameCharacterType
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    note: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'note'
        tableName: 'game_character_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    orderInGame: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order_in_game'
        tableName: 'game_character_links'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    orderInCharacter: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order_in_character'
        tableName: 'game_character_links'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'game_character_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'game_character_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'game_character_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
declare const collectionGameLinks: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'collection_game_links'
  schema: undefined
  columns: {
    collectionId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'collection_id'
        tableName: 'collection_game_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    gameId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'game_id'
        tableName: 'collection_game_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    note: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'note'
        tableName: 'collection_game_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    orderInCollection: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order_in_collection'
        tableName: 'collection_game_links'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'collection_game_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'collection_game_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'collection_game_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
declare const collectionCharacterLinks: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'collection_character_links'
  schema: undefined
  columns: {
    collectionId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'collection_id'
        tableName: 'collection_character_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    characterId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'character_id'
        tableName: 'collection_character_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    note: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'note'
        tableName: 'collection_character_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    orderInCollection: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order_in_collection'
        tableName: 'collection_character_links'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'collection_character_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'collection_character_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'collection_character_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
declare const collectionPersonLinks: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'collection_person_links'
  schema: undefined
  columns: {
    collectionId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'collection_id'
        tableName: 'collection_person_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    personId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'person_id'
        tableName: 'collection_person_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    note: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'note'
        tableName: 'collection_person_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    orderInCollection: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order_in_collection'
        tableName: 'collection_person_links'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'collection_person_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'collection_person_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'collection_person_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
declare const collectionCompanyLinks: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'collection_company_links'
  schema: undefined
  columns: {
    collectionId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'collection_id'
        tableName: 'collection_company_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    companyId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'company_id'
        tableName: 'collection_company_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    note: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'note'
        tableName: 'collection_company_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    orderInCollection: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order_in_collection'
        tableName: 'collection_company_links'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'collection_company_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'collection_company_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'collection_company_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
declare const characterPersonLinks: drizzle_orm_sqlite_core313.SQLiteTableWithColumns<{
  name: 'character_person_links'
  schema: undefined
  columns: {
    characterId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'character_id'
        tableName: 'character_person_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    personId: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'person_id'
        tableName: 'character_person_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    isSpoiler: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'is_spoiler'
        tableName: 'character_person_links'
        dataType: 'boolean'
        columnType: 'SQLiteBoolean'
        data: boolean
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    type: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'type'
        tableName: 'character_person_links'
        dataType: 'custom'
        columnType: 'SQLiteCustomColumn'
        data: CharacterPersonType
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        sqliteColumnBuilderBrand: 'SQLiteCustomColumnBuilderBrand'
      }
    >
    note: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'note'
        tableName: 'character_person_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    orderInCharacter: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order_in_character'
        tableName: 'character_person_links'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    orderInPerson: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'order_in_person'
        tableName: 'character_person_links'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    id: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'id'
        tableName: 'character_person_links'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: true
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'character_person_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    updatedAt: drizzle_orm_sqlite_core313.SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'character_person_links'
        dataType: 'date'
        columnType: 'SQLiteTimestamp'
        data: Date
        driverParam: number
        notNull: true
        hasDefault: true
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: true
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
  }
  dialect: 'sqlite'
}>
type GamePersonLink = InferSelectModel<typeof gamePersonLinks>
type NewGamePersonLink = InferInsertModel<typeof gamePersonLinks>
type GameCompanyLink = InferSelectModel<typeof gameCompanyLinks>
type NewGameCompanyLink = InferInsertModel<typeof gameCompanyLinks>
type GameCharacterLink = InferSelectModel<typeof gameCharacterLinks>
type NewGameCharacterLink = InferInsertModel<typeof gameCharacterLinks>
type CollectionGameLink = InferSelectModel<typeof collectionGameLinks>
type NewCollectionGameLink = InferInsertModel<typeof collectionGameLinks>
type CollectionCharacterLink = InferSelectModel<typeof collectionCharacterLinks>
type NewCollectionCharacterLink = InferInsertModel<typeof collectionCharacterLinks>
type CollectionPersonLink = InferSelectModel<typeof collectionPersonLinks>
type NewCollectionPersonLink = InferInsertModel<typeof collectionPersonLinks>
type CollectionCompanyLink = InferSelectModel<typeof collectionCompanyLinks>
type NewCollectionCompanyLink = InferInsertModel<typeof collectionCompanyLinks>
type CharacterPersonLink = InferSelectModel<typeof characterPersonLinks>
type NewCharacterPersonLink = InferInsertModel<typeof characterPersonLinks>
//#endregion
//#region src/shared/db/schema-relations.d.ts
/**
 * Database schema - Relations
 *
 * Drizzle ORM relations for all tables.
 * Separated from table definitions to avoid circular imports.
 */
declare const gamesRelations: drizzle_orm0.Relations<
  'games',
  {
    sessions: drizzle_orm0.Many<'game_sessions'>
    notes: drizzle_orm0.Many<'game_notes'>
    gamePersonLinks: drizzle_orm0.Many<'game_person_links'>
    gameCompanyLinks: drizzle_orm0.Many<'game_company_links'>
    gameCharacterLinks: drizzle_orm0.Many<'game_character_links'>
    collectionGameLinks: drizzle_orm0.Many<'collection_game_links'>
    gameTagLinks: drizzle_orm0.Many<'game_tag_links'>
    externalIds: drizzle_orm0.Many<'game_external_ids'>
  }
>
declare const gameNotesRelations: drizzle_orm0.Relations<
  'game_notes',
  {
    game: drizzle_orm0.One<'games', true>
  }
>
declare const gameSessionsRelations: drizzle_orm0.Relations<
  'game_sessions',
  {
    game: drizzle_orm0.One<'games', true>
  }
>
declare const gamePersonLinksRelations: drizzle_orm0.Relations<
  'game_person_links',
  {
    game: drizzle_orm0.One<'games', true>
    person: drizzle_orm0.One<'persons', true>
  }
>
declare const gameCompanyLinksRelations: drizzle_orm0.Relations<
  'game_company_links',
  {
    game: drizzle_orm0.One<'games', true>
    company: drizzle_orm0.One<'companies', true>
  }
>
declare const gameCharacterLinksRelations: drizzle_orm0.Relations<
  'game_character_links',
  {
    game: drizzle_orm0.One<'games', true>
    character: drizzle_orm0.One<'characters', true>
  }
>
declare const personsRelations: drizzle_orm0.Relations<
  'persons',
  {
    gamePersonLinks: drizzle_orm0.Many<'game_person_links'>
    characterPersonLinks: drizzle_orm0.Many<'character_person_links'>
    collectionPersonLinks: drizzle_orm0.Many<'collection_person_links'>
    personTagLinks: drizzle_orm0.Many<'person_tag_links'>
    externalIds: drizzle_orm0.Many<'person_external_ids'>
  }
>
declare const companiesRelations: drizzle_orm0.Relations<
  'companies',
  {
    gameCompanyLinks: drizzle_orm0.Many<'game_company_links'>
    collectionCompanyLinks: drizzle_orm0.Many<'collection_company_links'>
    companyTagLinks: drizzle_orm0.Many<'company_tag_links'>
    externalIds: drizzle_orm0.Many<'company_external_ids'>
  }
>
declare const charactersRelations: drizzle_orm0.Relations<
  'characters',
  {
    gameCharacterLinks: drizzle_orm0.Many<'game_character_links'>
    characterPersonLinks: drizzle_orm0.Many<'character_person_links'>
    collectionCharacterLinks: drizzle_orm0.Many<'collection_character_links'>
    characterTagLinks: drizzle_orm0.Many<'character_tag_links'>
    externalIds: drizzle_orm0.Many<'character_external_ids'>
  }
>
declare const characterPersonLinksRelations: drizzle_orm0.Relations<
  'character_person_links',
  {
    character: drizzle_orm0.One<'characters', true>
    person: drizzle_orm0.One<'persons', true>
  }
>
declare const collectionsRelations: drizzle_orm0.Relations<
  'collections',
  {
    collectionGameLinks: drizzle_orm0.Many<'collection_game_links'>
    collectionCharacterLinks: drizzle_orm0.Many<'collection_character_links'>
    collectionPersonLinks: drizzle_orm0.Many<'collection_person_links'>
    collectionCompanyLinks: drizzle_orm0.Many<'collection_company_links'>
    scanners: drizzle_orm0.Many<'scanners'>
  }
>
declare const collectionGameLinksRelations: drizzle_orm0.Relations<
  'collection_game_links',
  {
    collection: drizzle_orm0.One<'collections', true>
    game: drizzle_orm0.One<'games', true>
  }
>
declare const collectionCharacterLinksRelations: drizzle_orm0.Relations<
  'collection_character_links',
  {
    collection: drizzle_orm0.One<'collections', true>
    character: drizzle_orm0.One<'characters', true>
  }
>
declare const collectionPersonLinksRelations: drizzle_orm0.Relations<
  'collection_person_links',
  {
    collection: drizzle_orm0.One<'collections', true>
    person: drizzle_orm0.One<'persons', true>
  }
>
declare const collectionCompanyLinksRelations: drizzle_orm0.Relations<
  'collection_company_links',
  {
    collection: drizzle_orm0.One<'collections', true>
    company: drizzle_orm0.One<'companies', true>
  }
>
declare const scraperProfilesRelations: drizzle_orm0.Relations<
  'scraper_profiles',
  {
    scanners: drizzle_orm0.Many<'scanners'>
  }
>
declare const scannersRelations: drizzle_orm0.Relations<
  'scanners',
  {
    scraperProfile: drizzle_orm0.One<'scraper_profiles', true>
    targetCollection: drizzle_orm0.One<'collections', false>
  }
>
declare const tagsRelations: drizzle_orm0.Relations<
  'tags',
  {
    gameTagLinks: drizzle_orm0.Many<'game_tag_links'>
    characterTagLinks: drizzle_orm0.Many<'character_tag_links'>
    personTagLinks: drizzle_orm0.Many<'person_tag_links'>
    companyTagLinks: drizzle_orm0.Many<'company_tag_links'>
  }
>
declare const gameTagLinksRelations: drizzle_orm0.Relations<
  'game_tag_links',
  {
    game: drizzle_orm0.One<'games', true>
    tag: drizzle_orm0.One<'tags', true>
  }
>
declare const characterTagLinksRelations: drizzle_orm0.Relations<
  'character_tag_links',
  {
    character: drizzle_orm0.One<'characters', true>
    tag: drizzle_orm0.One<'tags', true>
  }
>
declare const personTagLinksRelations: drizzle_orm0.Relations<
  'person_tag_links',
  {
    person: drizzle_orm0.One<'persons', true>
    tag: drizzle_orm0.One<'tags', true>
  }
>
declare const companyTagLinksRelations: drizzle_orm0.Relations<
  'company_tag_links',
  {
    company: drizzle_orm0.One<'companies', true>
    tag: drizzle_orm0.One<'tags', true>
  }
>
declare const gameExternalIdsRelations: drizzle_orm0.Relations<
  'game_external_ids',
  {
    game: drizzle_orm0.One<'games', true>
  }
>
declare const personExternalIdsRelations: drizzle_orm0.Relations<
  'person_external_ids',
  {
    person: drizzle_orm0.One<'persons', true>
  }
>
declare const companyExternalIdsRelations: drizzle_orm0.Relations<
  'company_external_ids',
  {
    company: drizzle_orm0.One<'companies', true>
  }
>
declare const characterExternalIdsRelations: drizzle_orm0.Relations<
  'character_external_ids',
  {
    character: drizzle_orm0.One<'characters', true>
  }
>
//#endregion
//#region src/shared/db/attachment.d.ts
type AttachmentInput =
  | {
      kind: 'buffer'
      buffer: Uint8Array
    }
  | {
      kind: 'url'
      url: string
    }
  | {
      kind: 'path'
      path: string
    }
/** Extract column names from Drizzle table type */
type ExtractColumns<T> = T extends SQLiteTable<infer Config> ? keyof Config['columns'] : never
/** Filter fields ending with 'File' */
type FileColumns<T> = Extract<ExtractColumns<T>, `${string}File`>
/** Filter fields ending with 'Files' */
type FilesColumns<T> = Extract<ExtractColumns<T>, `${string}Files`>
declare namespace index_d_exports {
  export {
    AttachmentInput,
    BloodType,
    CHARACTER_SCRAPER_SLOTS,
    COMPANY_SCRAPER_SLOTS,
    Character,
    CharacterExternalId,
    CharacterPersonLink,
    CharacterPersonType,
    CharacterScraperSlot,
    CharacterScraperSlotConfigs,
    CharacterTagLink,
    Collection,
    CollectionCharacterLink,
    CollectionCompanyLink,
    CollectionGameLink,
    CollectionPersonLink,
    Company,
    CompanyExternalId,
    CompanyScraperSlot,
    CompanyScraperSlotConfigs,
    CompanyTagLink,
    CupSize,
    DateRangeValue,
    DynamicCollectionConfig,
    DynamicEntityConfig,
    ExtractColumns,
    FailedScan,
    FileColumns,
    FilesColumns,
    FilterState,
    FilterValue,
    GAME_SCRAPER_SLOTS,
    Game,
    GameCharacterLink,
    GameCharacterType,
    GameCompanyLink,
    GameCompanyType,
    GameExternalId,
    GameLauncherMode,
    GameMonitorMode,
    GameNote,
    GamePersonLink,
    GamePersonType,
    GameScraperSlot,
    GameScraperSlotConfigs,
    GameSession,
    GameTagLink,
    Gender,
    MainWindowCloseAction,
    MergeStrategy,
    NameExtractionRule,
    NewCharacter,
    NewCharacterExternalId,
    NewCharacterPersonLink,
    NewCharacterTagLink,
    NewCollection,
    NewCollectionCharacterLink,
    NewCollectionCompanyLink,
    NewCollectionGameLink,
    NewCollectionPersonLink,
    NewCompany,
    NewCompanyExternalId,
    NewCompanyTagLink,
    NewGame,
    NewGameCharacterLink,
    NewGameCompanyLink,
    NewGameExternalId,
    NewGameNote,
    NewGamePersonLink,
    NewGameSession,
    NewGameTagLink,
    NewPerson,
    NewPersonExternalId,
    NewPersonTagLink,
    NewPluginData,
    NewScanner,
    NewScraperProfile,
    NewSettings,
    NewShowcaseSection,
    NewTag,
    NumberRangeValue,
    PERSON_SCRAPER_SLOTS,
    PartialDate,
    Person,
    PersonExternalId,
    PersonScraperSlot,
    PersonScraperSlotConfigs,
    PersonTagLink,
    PluginData,
    RelatedSite,
    RelationValue,
    SaveBackup,
    Scanner,
    ScannerIgnoredNames,
    ScraperProfile,
    ScraperProviderEntry,
    ScraperSlot,
    ScraperSlotConfigs,
    SectionItemSize,
    SectionLayout,
    SectionOpenMode,
    Settings,
    ShowcaseSection,
    ShowcaseSectionFormItem,
    SlotConfig,
    SortDirection,
    Status,
    Tag$1 as Tag,
    allEntityType,
    appLocale,
    baseColumns,
    bloodType,
    characterExternalIds,
    characterExternalIdsRelations,
    characterPersonLinks,
    characterPersonLinksRelations,
    characterPersonType,
    characterTagLinks,
    characterTagLinksRelations,
    characters,
    charactersRelations,
    collectionCharacterLinks,
    collectionCharacterLinksRelations,
    collectionCompanyLinks,
    collectionCompanyLinksRelations,
    collectionGameLinks,
    collectionGameLinksRelations,
    collectionPersonLinks,
    collectionPersonLinksRelations,
    collections,
    collectionsRelations,
    companies,
    companiesRelations,
    companyExternalIds,
    companyExternalIdsRelations,
    companyTagLinks,
    companyTagLinksRelations,
    contentEntityType,
    cupSize,
    dynamicCollectionConfig,
    failedScans,
    filterState,
    gameCharacterLinks,
    gameCharacterLinksRelations,
    gameCharacterType,
    gameCompanyLinks,
    gameCompanyLinksRelations,
    gameCompanyType,
    gameExternalIds,
    gameExternalIdsRelations,
    gameLauncherMode,
    gameMonitorMode,
    gameNotes,
    gameNotesRelations,
    gamePersonLinks,
    gamePersonLinksRelations,
    gamePersonType,
    gameSessions,
    gameSessionsRelations,
    gameTagLinks,
    gameTagLinksRelations,
    games,
    gamesRelations,
    gender,
    locale,
    mainWindowCloseAction,
    mediaType,
    nameExtractionRules,
    partialDate,
    personExternalIds,
    personExternalIdsRelations,
    personTagLinks,
    personTagLinksRelations,
    persons,
    personsRelations,
    pluginData,
    relatedSites,
    saveBackups,
    scannerIgnoredNames,
    scanners,
    scannersRelations,
    scraperProfiles,
    scraperProfilesRelations,
    scraperSlotConfigs,
    sectionItemSize,
    sectionLayout,
    sectionOpenMode,
    settings,
    showcaseSections,
    sortDirection,
    status,
    stringArrayJson,
    tags,
    tagsRelations
  }
}
//#endregion
//#region src/shared/network.d.ts
/**
 * Network Types
 *
 * Shared type definitions for the network layer.
 */
/**
 * Network request options
 */
interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: string | Buffer
  /** Timeout in ms (overrides global setting) */
  timeout?: number
  /** Retry count (overrides global setting) */
  retries?: number
  /** Rate limit key (must be registered via registerRateLimit first) */
  rateLimitKey?: string
}
/**
 * Rate limit configuration (sliding window)
 */
interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
}
//#endregion
//#region src/main/services/network/service.d.ts
declare class NetworkService implements IService {
  readonly id = 'network'
  readonly deps: readonly []
  private readonly defaultTimeoutMs
  private readonly defaultRetryCount
  private rateLimiters
  init(_container: ServiceInitContainer<this>): Promise<void>
  /**
   * Unified fetch with timeout, retry, and rate limiting.
   * Uses Electron's net.fetch which respects session proxy settings.
   */
  fetch(url: string, options?: FetchOptions): Promise<Response>
  /**
   * Download content as Buffer
   */
  downloadBuffer(url: string, options?: FetchOptions): Promise<Buffer>
  /**
   * Download content to a file via streaming (avoids buffering the full response in memory).
   */
  downloadToFile(url: string, destPath: string, options?: FetchOptions): Promise<void>
  /**
   * Register a rate limiter for a domain key.
   * Callers are responsible for registering their own rate limit configurations.
   */
  registerRateLimit(key: string, config: RateLimitConfig): void
  /**
   * Unregister a rate limiter
   */
  unregisterRateLimit(key: string): void
  /**
   * ===========================================================================
   * Private Helpers
   * ===========================================================================
   */
  private fetchWithTimeout
  private executeWithRetry
  private sleep
}
//#endregion
//#region src/main/services/db/types.d.ts
/** Thumbnail fit mode */
type ThumbnailFit = 'cover' | 'contain' | 'fill' | 'inside' | 'outside' | 'smart'
/** Thumbnail size options */
interface ThumbnailOptions {
  width?: number
  height?: number
  fit?: ThumbnailFit
  quality?: number
}
/**
 * Database context - either a database connection or a transaction.
 * Used for functions that can work within an existing transaction.
 */
type DbContext =
  | BetterSQLite3Database<typeof index_d_exports>
  | SQLiteTransaction<
      'sync',
      any,
      typeof index_d_exports,
      ExtractTablesWithRelations<typeof index_d_exports>
    >
//#endregion
//#region src/main/services/db/thumbnail.d.ts
/**
 * Thumbnail generation and caching manager.
 * Generates WebP thumbnails with various resize modes including smart crop.
 */
declare class ThumbnailStore {
  private mutexMap
  private cleanerInterval?
  constructor()
  /**
   * Get existing thumbnail or create new one.
   * Thumbnails are cached on disk and reused for subsequent requests.
   */
  getOrCreate(
    originalPath: string,
    thumbnailDir: string,
    options: ThumbnailOptions
  ): Promise<string>
  /**
   * Delete all thumbnails for an original file.
   */
  delete(originalPath: string, thumbnailDir: string): Promise<void>
  /**
   * Parse thumbnail options from URL search params.
   */
  parseOptions(searchParams: URLSearchParams): ThumbnailOptions | null
  /**
   * Generate thumbnail filename based on options.
   */
  getFileName(originalFileName: string, options: ThumbnailOptions): string
  /**
   * Cleanup resources.
   */
  dispose(): void
  private getMutex
  private generateSmartCrop
  private escapeRegex
  private startMutexCleaner
}
//#endregion
//#region src/main/services/db/attachment.d.ts
/**
 * Attachment storage manager.
 * Handles file operations with mutex protection for concurrent access.
 */
declare class AttachmentStore {
  private readonly db
  private readonly storageDir
  private readonly thumbnailStore
  private readonly network
  private mutexMap
  private mutexLastUsed
  private cleanerInterval?
  private readonly FILE_DELETE_DELAY_MS
  private readonly FILE_DELETE_MAX_RETRIES
  private readonly FILE_DELETE_RETRY_DELAY_MS
  constructor(
    db: BetterSQLite3Database<typeof index_d_exports>,
    storageDir: string,
    thumbnailStore: ThumbnailStore,
    network: NetworkService
  )
  /**
   * Set a single-file attachment field (e.g. coverFile, photoFile).
   * Replaces the previous file (if any) and deletes it from disk.
   */
  setFile<TTable extends SQLiteTable>(
    table: TTable,
    rowId: string,
    field: FileColumns<TTable>,
    input: AttachmentInput
  ): Promise<string>
  /**
   * Clear a single-file attachment field and delete the file from disk.
   */
  clearFile<TTable extends SQLiteTable>(
    table: TTable,
    rowId: string,
    field: FileColumns<TTable>
  ): Promise<void>
  /**
   * Add a file to an array attachment field (e.g. descriptionInlineFiles).
   * Returns the generated fileName.
   */
  addFile<TTable extends SQLiteTable>(
    table: TTable,
    rowId: string,
    field: FilesColumns<TTable>,
    input: AttachmentInput
  ): Promise<string>
  /**
   * Remove all occurrences of a fileName from an array attachment field
   * and delete the file from disk.
   */
  removeFile<TTable extends SQLiteTable>(
    table: TTable,
    rowId: string,
    field: FilesColumns<TTable>,
    fileName: string
  ): Promise<void>
  /**
   * List files from an array attachment field.
   */
  listFiles<TTable extends SQLiteTable>(
    table: TTable,
    rowId: string,
    field: FilesColumns<TTable>
  ): Promise<string[]>
  /**
   * Clear an array attachment field and delete all files from disk.
   */
  clearFiles<TTable extends SQLiteTable>(
    table: TTable,
    rowId: string,
    field: FilesColumns<TTable>
  ): Promise<void>
  /**
   * Cleanup storage directory for a deleted row.
   * Intended to be called from db:deleted event listeners.
   */
  cleanupRow(tableName: string, rowId: string): Promise<void>
  /**
   * Get absolute path to attachment file.
   */
  getPath(tableName: string, rowId: string, fileName: string): string
  /**
   * Cleanup resources.
   */
  dispose(): void
  private getMutex
  private getRowLockKey
  private startMutexCleaner
  private getRow
  private writeNewFile
  private getExtHint
  private createFileName
  private createFileNameWithId
  private detectExt
  private readFileHeader
  private scheduleDeleteFile
  private deleteFile
  private assertSafeFileName
  private coerceStringArray
}
//#endregion
//#region src/shared/metadata/common.d.ts
/**
 * Common Metadata Types
 *
 * Shared type definitions used across entity metadata.
 */
/**
 * External ID reference for cross-provider entity matching.
 */
interface ExternalId {
  source: string
  id: string
}
/**
 * Tag data for any entity.
 */
interface Tag {
  name: string
  isSpoiler?: boolean
  note?: string
  isNsfw?: boolean
}
//#endregion
//#region src/shared/metadata/person.d.ts
/**
 * Core person info.
 *
 * Minimal person information with required name and optional fields.
 */
interface PersonInfo {
  name: string
  originalName?: string
  birthDate?: PartialDate
  deathDate?: PartialDate
  gender?: Gender
  description?: string
  relatedSites?: RelatedSite[]
  externalIds: ExternalId[]
}
/**
 * Person metadata.
 *
 * Base metadata for a person entity (voice actors, staff, etc.).
 * All fields optional except name for flexibility in different contexts.
 */
interface PersonMetadata extends PersonInfo {
  tags?: Tag[]
  photos?: string[]
}
//#endregion
//#region src/shared/metadata/character.d.ts
/**
 * Core character info.
 *
 * Minimal character information with required name and optional fields.
 */
interface CharacterInfo {
  name: string
  originalName?: string
  birthDate?: PartialDate
  gender?: Gender
  age?: number
  bloodType?: BloodType
  height?: number
  weight?: number
  bust?: number
  waist?: number
  hips?: number
  cup?: CupSize
  description?: string
  relatedSites?: RelatedSite[]
  externalIds: ExternalId[]
}
/**
 * Person linked to a character with type.
 *
 * Used for voice actors, illustrators, character designers, etc.
 * Follows link table convention: character_person_links → CharacterMetadata.persons
 */
interface CharacterPerson extends PersonMetadata {
  type: CharacterPersonType
  isSpoiler?: boolean
  note?: string
}
/**
 * Character metadata.
 *
 * Base metadata for a character entity.
 * All fields optional except name for flexibility in different contexts.
 */
interface CharacterMetadata extends CharacterInfo {
  tags?: Tag[]
  persons?: CharacterPerson[]
  photos?: string[]
}
//#endregion
//#region src/shared/metadata/company.d.ts
/**
 * Core company info.
 *
 * Minimal company information with required name and optional fields.
 */
interface CompanyInfo {
  name: string
  originalName?: string
  foundedDate?: PartialDate
  description?: string
  relatedSites?: RelatedSite[]
  externalIds: ExternalId[]
}
/**
 * Company metadata.
 *
 * Base metadata for a company entity (developers, publishers, etc.).
 * All fields optional except name for flexibility in different contexts.
 */
interface CompanyMetadata extends CompanyInfo {
  tags?: Tag[]
  logos?: string[]
}
//#endregion
//#region src/shared/metadata/game.d.ts
/**
 * Core game info.
 *
 * Basic fields returned by scraper providers for the info slot.
 */
interface GameInfo {
  name: string
  originalName?: string
  releaseDate?: PartialDate
  description?: string
  relatedSites?: RelatedSite[]
  externalIds: ExternalId[]
}
/**
 * Person linked to a game with type.
 *
 * Extends PersonMetadata with game-specific relationship info.
 * Follows link table convention: game_person_links → GameMetadata.persons
 */
interface GamePerson extends PersonMetadata {
  type: GamePersonType
  isSpoiler?: boolean
  note?: string
}
/**
 * Character linked to a game with type.
 *
 * Extends CharacterMetadata with game-specific relationship info.
 * CharacterMetadata.persons contains voice actors etc.
 * Follows link table convention: game_character_links → GameMetadata.characters
 */
interface GameCharacter extends CharacterMetadata {
  type: GameCharacterType
  isSpoiler?: boolean
  note?: string
}
/**
 * Company linked to a game with type.
 *
 * Extends CompanyMetadata with game-specific relationship info.
 * Follows link table convention: game_company_links → GameMetadata.companies
 */
interface GameCompany extends CompanyMetadata {
  type: GameCompanyType
  isSpoiler?: boolean
  note?: string
}
/**
 * Complete game metadata.
 *
 * Contains all information about a game including related entities.
 * Used as the common type for scraper output and adder input.
 */
interface GameMetadata extends GameInfo {
  tags?: Tag[]
  persons?: GamePerson[]
  characters?: GameCharacter[]
  companies?: GameCompany[]
  covers?: string[]
  backdrops?: string[]
  logos?: string[]
  icons?: string[]
}
//#endregion
//#region src/main/services/db/helper.d.ts
declare class HelperStore {
  private db
  constructor(db: BetterSQLite3Database<typeof index_d_exports>)
  /**
   * Get db context (either provided transaction or default db instance)
   */
  private getDb
  findExistingPerson(
    params: {
      name?: string
      externalIds?: ExternalId[]
    },
    ctx?: DbContext
  ): Person | undefined
  findExistingCompany(
    params: {
      name?: string
      externalIds?: ExternalId[]
    },
    ctx?: DbContext
  ): Company | undefined
  findExistingCharacter(
    params: {
      name?: string
      externalIds?: ExternalId[]
    },
    ctx?: DbContext
  ): Character | undefined
  findExistingGame(
    params: {
      name?: string
      externalIds?: ExternalId[]
      path?: string
    },
    ctx?: DbContext
  ): Game | undefined
  getAppSettings(): {
    id: number
    locale: AppLocale | null
    mainWindowCloseAction: MainWindowCloseAction
    scannerIgnoredNames: ScannerIgnoredNames
    scannerUsePhash: boolean
    scannerStartAtOpen: boolean
  }
  /**
   * Find existing tag by name
   */
  findExistingTag(
    params: {
      name: string
    },
    ctx?: DbContext
  ): Tag$1 | undefined
}
//#endregion
//#region src/main/services/db/fts.d.ts
/** Entity types that support FTS */
type FtsEntityType = 'game' | 'character' | 'person' | 'company'
declare class FtsStore {
  private sqlite
  constructor(sqlite: Database.Database)
  /**
   * Initialize FTS tables and triggers
   * Called during DbService.init()
   */
  init(): void
  /**
   * Rebuild FTS index for a specific entity type
   * Use for recovery or after bulk imports
   */
  rebuild(entityType: FtsEntityType): void
  /**
   * Rebuild all FTS indexes
   */
  rebuildAll(): void
  /**
   * Check if FTS is available for an entity type
   */
  isSupported(entityType: string): entityType is FtsEntityType
  /**
   * Get FTS table name for an entity type
   */
  getFtsTableName(entityType: FtsEntityType): string
  /**
   * Get source table name for an entity type
   */
  getSourceTableName(entityType: FtsEntityType): string
  /**
   * Create FTS table if it doesn't exist
   * @returns true if table was newly created, false if it already existed
   */
  private createFtsTable
  /**
   * Populate FTS table with existing data from source table
   * Called after creating a new FTS table
   */
  private populateFromSource
  private createTriggers
}
//#endregion
//#region src/shared/db/table-names.d.ts
/**
 * Extract actual SQL table name from a Drizzle table object.
 * Uses Drizzle's internal `_` property which contains the table configuration.
 */
type ExtractTableName<T> = T extends Table ? T['_']['name'] : never
/**
 * Extract table names from all exports of a schema module.
 */
type ExtractTableNames<T> = { [K in keyof T]: ExtractTableName<T[K]> }[keyof T]
/**
 * Union of all SQL table names in the database.
 * Automatically derived from schema exports using Drizzle's internal types.
 *
 * @example
 * // Results in: "games" | "persons" | "game_person_links" | ...
 */
type TableName = ExtractTableNames<typeof schema_d_exports>
//#endregion
//#region src/shared/events.d.ts
/**
 * Application event definitions
 *
 * This interface is exported and can be extended via declaration merging.
 * Each event maps to a tuple of its argument types.
 */
interface AppEvents {
  'db:ready': [boolean]
  'db:inserted': [
    {
      table: TableName
      id: string
    }
  ]
  'db:updated': [
    {
      table: TableName
      id: string
    }
  ]
  'db:deleted': [
    {
      table: TableName
      id: string
    }
  ]
  'game:added': [
    {
      gameId: string
      name: string
    }
  ]
  'game:removed': [
    {
      gameId: string
    }
  ]
  'game:updated': [
    {
      gameId: string
      fields: string[]
    }
  ]
  'game:launched': [
    {
      gameId: string
      pid?: number
    }
  ]
  'game:closed': [
    {
      gameId: string
      playTime?: number
    }
  ]
  'collection:added': [
    {
      collectionId: string
      name: string
    }
  ]
  'collection:removed': [
    {
      collectionId: string
    }
  ]
  'collection:updated': [
    {
      collectionId: string
      fields: string[]
    }
  ]
  'character:added': [
    {
      characterId: string
      name: string
    }
  ]
  'character:removed': [
    {
      characterId: string
    }
  ]
  'character:updated': [
    {
      characterId: string
      fields: string[]
    }
  ]
  'person:added': [
    {
      personId: string
      name: string
    }
  ]
  'person:removed': [
    {
      personId: string
    }
  ]
  'person:updated': [
    {
      personId: string
      fields: string[]
    }
  ]
  'company:added': [
    {
      companyId: string
      name: string
    }
  ]
  'company:removed': [
    {
      companyId: string
    }
  ]
  'company:updated': [
    {
      companyId: string
      fields: string[]
    }
  ]
  'scanner:added': [
    {
      scannerId: string
      name: string
    }
  ]
  'scanner:removed': [
    {
      scannerId: string
    }
  ]
  'scanner:updated': [
    {
      scannerId: string
      fields: string[]
    }
  ]
  'scanner:started': [
    {
      scannerId: string
      scannerName: string
    }
  ]
  'scanner:progress': [
    {
      scannerId: string
      current: number
      total: number
    }
  ]
  'scanner:completed': [
    {
      scannerId: string
      stats: Record<string, number>
    }
  ]
  'scanner:error': [
    {
      scannerId: string
      error: string
    }
  ]
  'monitor:status-changed': [
    {
      gameId: string
      isRunning: boolean
      isForeground: boolean
    }
  ]
  'monitor:process-started': [
    {
      gameId: string
      pid: number
      processName: string
    }
  ]
  'monitor:process-stopped': [
    {
      gameId: string
      exitCode?: number
    }
  ]
  'monitor:foreground-changed': [
    {
      gameId: string
      isForeground: boolean
    }
  ]
  'scraper:fetch-started': [
    {
      profileId: string
      identifier: string
    }
  ]
  'scraper:fetch-completed': [
    {
      profileId: string
      identifier: string
      success: boolean
    }
  ]
  'scraper:fetch-error': [
    {
      profileId: string
      identifier: string
      error: string
    }
  ]
  'app:ready': []
  'app:theme-changed': [
    {
      theme: 'light' | 'dark' | 'system'
    }
  ]
  'app:locale-changed': [
    {
      locale: AppLocale | null
    }
  ]
  'app:settings-changed': [
    {
      setting: string
      value: unknown
    }
  ]
  'app:portable-mode-change-pending': [
    {
      targetMode: 'portable' | 'normal'
    }
  ]
  'app:portable-mode-change-cancelled': []
  'plugin:storage-changed': [
    {
      pluginId: string
      data: Record<string, unknown>
    }
  ]
}
/**
 * Event listener function type
 */
type AppEventListener<K extends keyof AppEvents> = (...args: AppEvents[K]) => void | Promise<void>
/**
 * Event unsubscribe function
 */
type EventUnsubscribe = () => void
/**
 * Event emitter options
 */
interface EventEmitOptions {
  local?: boolean
}
//#endregion
//#region src/main/services/event/service.d.ts
declare class EventService implements IService {
  readonly id = 'event'
  readonly deps: readonly ['ipc']
  private listeners
  private ipcService
  private isReady
  init(container: ServiceInitContainer<this>): Promise<void>
  /**
   * Subscribe to an event
   */
  on<K extends keyof AppEvents>(event: K, listener: AppEventListener<K>): EventUnsubscribe
  /**
   * Subscribe to an event once
   */
  once<K extends keyof AppEvents>(event: K, listener: AppEventListener<K>): EventUnsubscribe
  /**
   * Emit an event
   */
  emit<K extends keyof AppEvents>(
    event: K,
    ...args: AppEvents[K] extends [] ? [] : [AppEvents[K][0]]
  ): void
  emit<K extends keyof AppEvents>(
    event: K,
    options: EventEmitOptions,
    ...args: AppEvents[K] extends [] ? [] : [AppEvents[K][0]]
  ): void
  /**
   * Remove all listeners for an event
   */
  off<K extends keyof AppEvents>(event: K): void
  /**
   * Remove all listeners
   */
  removeAllListeners(): void
  /**
   * Get the number of listeners for an event
   */
  listenerCount<K extends keyof AppEvents>(event: K): number
}
//#endregion
//#region src/main/services/db/trigger.d.ts
declare class TriggerStore {
  private sqlite
  private event
  private trackedTables
  constructor(sqlite: Database.Database, event: EventService)
  init(): void
  /**
   * Register the emit_db_change function that triggers can call.
   * This bridges SQLite triggers with the JavaScript event system.
   */
  private registerEmitFunction
  /**
   * Create INSERT/UPDATE/DELETE triggers for all tracked tables.
   */
  private createTriggers
  /**
   * Create all three triggers for a specific table.
   */
  private createTriggersForTable
}
//#endregion
//#region src/main/services/db/service.d.ts
declare class DbService implements IService {
  readonly id = 'db'
  readonly deps: readonly ['event', 'ipc', 'network']
  sqlite: Database.Database
  db: BetterSQLite3Database<typeof index_d_exports>
  dbPath: string
  storageDir: string
  attachment: AttachmentStore
  thumbnail: ThumbnailStore
  helper: HelperStore
  fts: FtsStore
  trigger: TriggerStore
  init(container: ServiceInitContainer<this>): Promise<void>
  private setupIpcHandlers
  private setupAttachmentProtocol
  dispose(): Promise<void>
  execute(sqlstr: string, params: unknown[], method: 'run' | 'all' | 'values' | 'get'): any
  private toDrizzleResult
}
//#endregion
//#region src/shared/attachment.d.ts
/**
 * Crop region for image editing operations
 */
interface CropRegion {
  x: number
  y: number
  width: number
  height: number
}
//#endregion
//#region src/shared/scraper/slot.d.ts
/**
 * Universal lookup identifier for scraper operations.
 *
 * Uses name as the cross-provider identifier, with optional known IDs for precision.
 * When a provider's ID is in knownIds, it will be used directly without searching.
 * Otherwise, the handler will search by name to resolve the provider's internal ID.
 */
interface ScraperLookup {
  /** Entity name - universal identifier across providers */
  name: string
  /** Preferred locale for results */
  locale?: Locale
  /** Known external IDs (e.g., from search selection or database) */
  knownIds?: ExternalId[]
}
/** Universal scraper provider capability */
type ScraperCapability = 'search' | ScraperSlot
/** Game image slot types */
type GameImageSlot = 'covers' | 'backdrops' | 'logos' | 'icons'
/** Action taken when ensuring profile validity */
type ProfileCleanupAction = 'deleted' | 'updated' | 'unchanged'
//#endregion
//#region src/shared/scraper/game.d.ts
/** Information about a registered game scraper provider */
interface GameScraperProviderInfo {
  id: string
  name: string
  capabilities: ScraperCapability[]
}
/** A single game search result */
interface GameSearchResult {
  id: string
  name: string
  originalName?: string
  releaseDate?: PartialDate
  externalIds: ExternalId[]
}
/** Options for fetching game metadata */
interface GameScraperOptions {
  skipValidation?: boolean
}
//#endregion
//#region src/shared/scraper/person.d.ts
/** Information about a registered person scraper provider */
interface PersonScraperProviderInfo {
  id: string
  name: string
  capabilities: ScraperCapability[]
}
/** A single person search result */
interface PersonSearchResult {
  id: string
  name: string
  originalName?: string
  birthDate?: PartialDate
  deathDate?: PartialDate
  externalIds: ExternalId[]
}
/** Options for fetching person metadata */
interface PersonScraperOptions {
  skipValidation?: boolean
}
//#endregion
//#region src/shared/scraper/character.d.ts
/** Information about a registered character scraper provider */
interface CharacterScraperProviderInfo {
  id: string
  name: string
  capabilities: ScraperCapability[]
}
/** A single character search result */
interface CharacterSearchResult {
  id: string
  name: string
  originalName?: string
  birthDate?: PartialDate
  externalIds: ExternalId[]
}
/** Options for fetching character metadata */
interface CharacterScraperOptions {
  skipValidation?: boolean
}
//#endregion
//#region src/shared/scraper/company.d.ts
/** Information about a registered company scraper provider */
interface CompanyScraperProviderInfo {
  id: string
  name: string
  capabilities: ScraperCapability[]
}
/** A single company search result */
interface CompanySearchResult {
  id: string
  name: string
  originalName?: string
  foundedDate?: PartialDate
  externalIds: ExternalId[]
}
/** Options for fetching company metadata */
interface CompanyScraperOptions {
  skipValidation?: boolean
}
//#endregion
//#region src/shared/scanner.d.ts
/**
 * Represents a detected entity from directory scanning.
 * Used by all media types - the scanning layer is media-agnostic.
 */
interface EntityEntry {
  /** Full path to the entity (file or folder) */
  path: string
  /** Original filesystem name (folder name or filename with extension, if any) */
  originalName: string
  /** Original name without extension (used as extraction input) */
  originalBaseName: string
  /** Extracted entity name after applying name extraction rules */
  extractedName: string
  /** Rule id that matched during extraction (null if none) */
  matchedRuleId: string | null
}
/** A scan that was skipped because the game already exists */
interface SkippedScan {
  name: string
  path: string
  reason: 'path' | 'externalId'
  existingGameId: string
}
/**
 * Scanner progress data sent from main process to renderer.
 *
 * Each event contains the COMPLETE current state, not incremental changes.
 */
interface ScanProgressData {
  scannerId: string
  total: number
  processedCount: number
  newCount: number
  skippedCount: number
  failedCount: number
  skippedScans: SkippedScan[]
  failedScans: FailedScan[]
  status: 'scanning' | 'completed'
}
/**
 * Final scan result returned when scan completes.
 */
interface ScanCompletedData {
  scannerId: string
  scannerName: string
  mediaType: MediaType
  path: string
  total: number
  processedCount: number
  newCount: number
  skippedCount: number
  failedCount: number
  skippedScans: SkippedScan[]
  failedScans: FailedScan[]
}
/** Extraction test result */
interface ExtractionTestResult {
  originalName: string
  extractedName: string
  matchedRuleId: string | null
}
//#endregion
//#region src/shared/adder.d.ts
/**
 * Adder Service Types
 *
 * Type definitions for the Adder persistence layer.
 */
/**
 * Options for adding a game.
 */
interface AddGameOptions {
  /** Local game directory path */
  gameDirPath?: string
  /** Local game executable path */
  gameFilePath?: string
  /** Target collection ID to add the game to */
  targetCollectionId?: string
}
/**
 * Options for adding a person.
 */
interface AddPersonOptions {
  /** Target collection ID to add the person to */
  targetCollectionId?: string
}
/**
 * Options for adding a company.
 */
interface AddCompanyOptions {
  /** Target collection ID to add the company to */
  targetCollectionId?: string
}
/**
 * Options for adding a character.
 */
interface AddCharacterOptions {
  /** Target collection ID to add the character to */
  targetCollectionId?: string
}
/** Reason why an entity was not newly added. */
type ExistingReason = 'name' | 'externalId' | 'path'
/**
 * Base result type for adding entities.
 */
interface AddResult {
  /** Whether the entity was newly added */
  isNew: boolean
  /** If not new, the reason why (only present when isNew is false) */
  existingReason?: ExistingReason
}
/** Result of adding a game. */
interface AddGameResult extends AddResult {
  gameId: string
}
/** Result of adding a person. */
interface AddPersonResult extends AddResult {
  personId: string
}
/** Result of adding a company. */
interface AddCompanyResult extends AddResult {
  companyId: string
}
/** Result of adding a character. */
interface AddCharacterResult extends AddResult {
  characterId: string
}
//#endregion
//#region src/shared/metadata-updater.d.ts
type MetadataUpdateApply = 'always' | 'ifMissing'
type MetadataUpdateStrategy = 'replace' | 'merge'
interface BaseMetadataUpdateOptions {
  apply?: MetadataUpdateApply
  strategy?: MetadataUpdateStrategy
}
declare const GAME_METADATA_UPDATE_FIELDS: readonly [
  'name',
  'originalName',
  'releaseDate',
  'description',
  'relatedSites',
  'externalIds',
  'tags',
  'covers',
  'backdrops',
  'logos',
  'icons'
]
type GameMetadataUpdateField = (typeof GAME_METADATA_UPDATE_FIELDS)[number]
declare const PERSON_METADATA_UPDATE_FIELDS: readonly [
  'name',
  'originalName',
  'birthDate',
  'deathDate',
  'gender',
  'description',
  'relatedSites',
  'externalIds',
  'tags',
  'photos'
]
type PersonMetadataUpdateField = (typeof PERSON_METADATA_UPDATE_FIELDS)[number]
declare const COMPANY_METADATA_UPDATE_FIELDS: readonly [
  'name',
  'originalName',
  'foundedDate',
  'description',
  'relatedSites',
  'externalIds',
  'tags',
  'logos'
]
type CompanyMetadataUpdateField = (typeof COMPANY_METADATA_UPDATE_FIELDS)[number]
declare const CHARACTER_METADATA_UPDATE_FIELDS: readonly [
  'name',
  'originalName',
  'birthDate',
  'gender',
  'age',
  'bloodType',
  'height',
  'weight',
  'bust',
  'waist',
  'hips',
  'cup',
  'description',
  'relatedSites',
  'externalIds',
  'tags',
  'photos'
]
type CharacterMetadataUpdateField = (typeof CHARACTER_METADATA_UPDATE_FIELDS)[number]
type GameMetadataUpdateInput = Partial<Pick<GameMetadata, GameMetadataUpdateField>>
type PersonMetadataUpdateInput = Partial<Pick<PersonMetadata, PersonMetadataUpdateField>>
type CompanyMetadataUpdateInput = Partial<Pick<CompanyMetadata, CompanyMetadataUpdateField>>
type CharacterMetadataUpdateInput = Partial<Pick<CharacterMetadata, CharacterMetadataUpdateField>>
interface UpdateGameMetadataOptions extends BaseMetadataUpdateOptions {
  fields?: GameMetadataUpdateField[] | '#all'
}
interface UpdatePersonMetadataOptions extends BaseMetadataUpdateOptions {
  fields?: PersonMetadataUpdateField[] | '#all'
}
interface UpdateCompanyMetadataOptions extends BaseMetadataUpdateOptions {
  fields?: CompanyMetadataUpdateField[] | '#all'
}
interface UpdateCharacterMetadataOptions extends BaseMetadataUpdateOptions {
  fields?: CharacterMetadataUpdateField[] | '#all'
}
interface UpdateGameMetadataResult {
  gameId: string
  updatedFields: GameMetadataUpdateField[]
}
interface UpdatePersonMetadataResult {
  personId: string
  updatedFields: PersonMetadataUpdateField[]
}
interface UpdateCompanyMetadataResult {
  companyId: string
  updatedFields: CompanyMetadataUpdateField[]
}
interface UpdateCharacterMetadataResult {
  characterId: string
  updatedFields: CharacterMetadataUpdateField[]
}
//#endregion
//#region src/shared/monitor.d.ts
/**
 * Monitor service shared types
 */
/** Game running status */
interface GameRunningStatus {
  gameId: string
  isRunning: boolean
  isForeground: boolean
  processName?: string
  pid?: number
  exePath?: string
  startTime?: number
}
//#endregion
//#region src/shared/portable.d.ts
/**
 * Portable mode types
 */
/** Portable status information */
interface PortableStatus {
  isPortable: boolean
  portablePath: string
  defaultUserDataPath: string
  currentUserDataPath: string
}
/** Pending switch target */
type PortableSwitchTarget = 'portable' | 'normal'
//#endregion
//#region src/shared/plugin.d.ts
/**
 * Plugin System Shared Types
 *
 * Types shared between main and renderer processes via IPC.
 */
/**
 * Plugin category types
 */
type PluginCategory = 'scraper' | 'tool' | 'theme' | 'integration'
/**
 * Renderer plugin entry info returned via IPC
 */
interface RendererPluginEntry {
  id: string
  entry: string
  enabled: boolean
}
interface PluginRegistryEntry {
  id: string
  name: string
  version: string
  description?: string
  author?: string
  homepage?: string
  downloadUrl: string
  /** @deprecated Use kisakiCompat instead */
  minAppVersion?: string
  kisakiCompat?: string
  source: string
  iconUrl?: string
  stars?: number
  updatedAt?: string
  category?: PluginCategory
}
interface PluginUpdateInfo {
  pluginId: string
  currentVersion: string
  latestVersion: string
  downloadUrl: string
}
interface InstalledPluginInfo {
  id: string
  name: string
  version: string
  description?: string
  author?: string
  homepage?: string
  enabled: boolean
  directory: string
  category?: PluginCategory
}
//#endregion
//#region src/shared/notify.d.ts
/**
 * Unified notification type definitions
 *
 * Cross-process notification API with identical interface for main and renderer.
 */
type NotifyType = 'info' | 'success' | 'warning' | 'error' | 'loading'
type NotifyTarget = 'toast' | 'native' | 'auto'
interface NotifyOptions {
  title: string
  message?: string
  type?: NotifyType
  target?: NotifyTarget
  duration?: number
}
/**
 * Notify function interface
 *
 * Can be called directly or use shortcut methods:
 * - `notify({ title: '...', type: 'success' })` - full options
 * - `notify.success('...', 'message')` - shortcut
 * - `notify.loading('...')` - returns toastId for updating
 */
interface NotifyFunction {
  (options: NotifyOptions): void
  success(title: string, message?: string): void
  error(title: string, message?: string): void
  warning(title: string, message?: string): void
  info(title: string, message?: string): void
  loading(title: string, message?: string): string
  update(toastId: string, options: NotifyOptions): void
  dismiss(toastId?: string): void
}
//#endregion
//#region src/shared/deeplink.d.ts
/**
 * Deeplink Type Definitions
 *
 * Shared types for the kisaki:// deeplink protocol.
 * Used by both main and renderer processes.
 */
/** Deeplink action types */
type DeeplinkAction = 'launch' | 'auth' | 'navigate' | 'scan'
/** Parsed deeplink structure */
interface ParsedDeeplink {
  /** The action to perform */
  action: DeeplinkAction
  /** The resource path (everything after the action) */
  resource: string
  /** Query parameters */
  params: Record<string, string>
  /** Original raw URL */
  raw: string
}
/** Deeplink handling result */
interface DeeplinkResult {
  /** Whether the action succeeded */
  success: boolean
  /** The action that was attempted */
  action: DeeplinkAction
  /** Human-readable message */
  message?: string
  /** Additional result data */
  data?: unknown
}
/** Navigate event payload */
interface DeeplinkNavigatePayload {
  route: string
  params: Record<string, string>
}
/** Auth callback event payload */
interface DeeplinkAuthCallbackPayload {
  provider: string
  code: string
  state?: string
}
/** Auth error event payload */
interface DeeplinkAuthErrorPayload {
  provider: string
  error: string
  errorDescription?: string
}
//#endregion
//#region src/shared/bootstrap.d.ts
/**
 * Bootstrap Arguments
 *
 * Parsed early bootstrap arguments used by the main process.
 */
interface BootstrapArgs {
  /** Print help and exit */
  help: boolean
  /** Print version and exit */
  version: boolean
  /** Development plugin path from --dev-plugin CLI argument */
  devPlugin: string | undefined
}
//#endregion
//#region src/shared/ipc.d.ts
/**
 * Successful IPC result with data
 */
interface IpcSuccess<T = void> {
  success: true
  data: T
}
/**
 * Successful IPC result without data (for void operations)
 */
interface IpcSuccessVoid {
  success: true
}
/**
 * Failed IPC result with error message
 */
interface IpcError {
  success: false
  error: string
}
/**
 * Generic IPC result type
 */
type IpcResult<T = void> = T extends void ? IpcSuccessVoid | IpcError : IpcSuccess<T> | IpcError
/**
 * Alias for IpcResult<void> for better readability
 */
type IpcVoidResult = IpcResult<void>
/**
 * Extract the data type from an IpcResult
 */
type ExtractIpcData<T> = T extends IpcSuccess<infer D> ? D : never
/**
 * IPC listeners - main process receives, no response.
 *
 * This interface is exported and can be extended via declaration merging.
 * Each listener maps to a tuple of its argument types.
 */
interface IpcMainListeners {
  ping: [string]
  'event:forward': [event: keyof AppEvents, args: unknown[]]
  'scanner:scan-game': [scannerId: string]
  'scanner:scan-all-game': []
  'notify:native': [NotifyOptions]
  'notify:auto': [NotifyOptions]
  'native:set-tray-menu-height': [height: number]
  'window:set-main-window-close-action': [action: MainWindowCloseAction]
}
/**
 * IPC handlers - main process receives, returns response.
 *
 * This interface is exported and can be extended via declaration merging.
 * Each handler maps to its function signature.
 */
interface IpcMainHandlers {
  'app:get-bootstrap-args': () => IpcResult<BootstrapArgs>
  'app:quit': () => IpcVoidResult
  'debug:get-mode': () => IpcResult<boolean>
  'debug:is-inspector-active': () => IpcResult<boolean>
  'debug:get-ports': () => IpcResult<{
    main: number
    renderer: number
  }>
  'window:minimize-main-window': () => IpcVoidResult
  'window:toggle-main-window-maximize': () => IpcVoidResult
  'window:close-main-window': () => IpcVoidResult
  'db:execute': (
    sqlstr: string,
    params: unknown[],
    method: 'run' | 'all' | 'values' | 'get'
  ) => IpcResult<unknown[]>
  'db:rebuild-fts': (entityType?: 'game' | 'character' | 'person' | 'company') => IpcVoidResult
  /**
   * NOTE (typing / IPC limitation):
   * - IPC payloads must be serializable, so we cannot pass a Drizzle `table` object here.
   *   We pass `TableName` and resolve to the real table in the main process.
   * - `field` cannot be expressed as `FileColumns<TTable>` / `FilesColumns<TTable>` at this layer
   *   because `IpcMainHandlers` has no generic context to tie `table` -> `field` for TS inference.
   *   Renderer-side clients should expose precise, table-aware APIs (and they do).
   */
  'db:attachment-set-file': (
    table: TableName,
    rowId: string,
    field: string,
    input: AttachmentInput
  ) => IpcResult<string>
  'db:attachment-clear-file': (table: TableName, rowId: string, field: string) => IpcVoidResult
  'db:attachment-add-file': (
    table: TableName,
    rowId: string,
    field: string,
    input: AttachmentInput
  ) => IpcResult<string>
  'db:attachment-remove-file': (
    table: TableName,
    rowId: string,
    field: string,
    fileName: string
  ) => IpcVoidResult
  'db:attachment-list-files': (
    table: TableName,
    rowId: string,
    field: string
  ) => IpcResult<string[]>
  'db:attachment-clear-files': (table: TableName, rowId: string, field: string) => IpcVoidResult
  'db:attachment-cleanup-row': (table: TableName, rowId: string) => IpcVoidResult
  'db:attachment-get-path': (table: TableName, rowId: string, fileName: string) => IpcResult<string>
  'adder:add-game': (metadata: GameMetadata, options?: AddGameOptions) => IpcResult<AddGameResult>
  'adder:add-person': (
    metadata: PersonMetadata,
    options?: AddPersonOptions
  ) => IpcResult<AddPersonResult>
  'adder:add-company': (
    metadata: CompanyMetadata,
    options?: AddCompanyOptions
  ) => IpcResult<AddCompanyResult>
  'adder:add-character': (
    metadata: CharacterMetadata,
    options?: AddCharacterOptions
  ) => IpcResult<AddCharacterResult>
  'metadata-updater:update-game': (
    gameId: string,
    metadata: GameMetadataUpdateInput,
    options?: UpdateGameMetadataOptions
  ) => IpcResult<UpdateGameMetadataResult>
  'metadata-updater:update-person': (
    personId: string,
    metadata: PersonMetadataUpdateInput,
    options?: UpdatePersonMetadataOptions
  ) => IpcResult<UpdatePersonMetadataResult>
  'metadata-updater:update-company': (
    companyId: string,
    metadata: CompanyMetadataUpdateInput,
    options?: UpdateCompanyMetadataOptions
  ) => IpcResult<UpdateCompanyMetadataResult>
  'metadata-updater:update-character': (
    characterId: string,
    metadata: CharacterMetadataUpdateInput,
    options?: UpdateCharacterMetadataOptions
  ) => IpcResult<UpdateCharacterMetadataResult>
  'scraper:list-game-providers': () => IpcResult<GameScraperProviderInfo[]>
  'scraper:get-game-provider': (providerId: string) => IpcResult<GameScraperProviderInfo>
  'scraper:search-game': (profileId: string, query: string) => IpcResult<GameSearchResult[]>
  'scraper:get-game-metadata': (
    profileId: string,
    lookup: ScraperLookup,
    options?: GameScraperOptions
  ) => IpcResult<GameMetadata | null>
  'scraper:get-game-provider-images': (
    providerId: string,
    lookup: ScraperLookup,
    imageType: GameImageSlot
  ) => IpcResult<string[]>
  'scraper:list-person-providers': () => IpcResult<PersonScraperProviderInfo[]>
  'scraper:get-person-provider': (providerId: string) => IpcResult<PersonScraperProviderInfo>
  'scraper:search-person': (profileId: string, query: string) => IpcResult<PersonSearchResult[]>
  'scraper:get-person-metadata': (
    profileId: string,
    lookup: ScraperLookup,
    options?: PersonScraperOptions
  ) => IpcResult<PersonMetadata | null>
  'scraper:get-person-provider-images': (
    providerId: string,
    lookup: ScraperLookup,
    imageType: 'photos'
  ) => IpcResult<string[]>
  'scraper:list-company-providers': () => IpcResult<CompanyScraperProviderInfo[]>
  'scraper:get-company-provider': (providerId: string) => IpcResult<CompanyScraperProviderInfo>
  'scraper:search-company': (profileId: string, query: string) => IpcResult<CompanySearchResult[]>
  'scraper:get-company-metadata': (
    profileId: string,
    lookup: ScraperLookup,
    options?: CompanyScraperOptions
  ) => IpcResult<CompanyMetadata | null>
  'scraper:get-company-provider-images': (
    providerId: string,
    lookup: ScraperLookup,
    imageType: 'logos'
  ) => IpcResult<string[]>
  'scraper:list-character-providers': () => IpcResult<CharacterScraperProviderInfo[]>
  'scraper:get-character-provider': (providerId: string) => IpcResult<CharacterScraperProviderInfo>
  'scraper:search-character': (
    profileId: string,
    query: string
  ) => IpcResult<CharacterSearchResult[]>
  'scraper:get-character-metadata': (
    profileId: string,
    lookup: ScraperLookup,
    options?: CharacterScraperOptions
  ) => IpcResult<CharacterMetadata | null>
  'scraper:get-character-provider-images': (
    providerId: string,
    lookup: ScraperLookup,
    imageType: 'photos'
  ) => IpcResult<string[]>
  'monitor:start-game': (gameId: string) => IpcVoidResult
  'monitor:stop-game': (gameId: string) => IpcVoidResult
  'monitor:get-game-status': (gameId?: string) => IpcResult<GameRunningStatus | GameRunningStatus[]>
  'monitor:compute-effective-path': (config: {
    monitorPath: string | null
    monitorMode: 'folder' | 'file' | 'process'
    gameDirPath: string | null
    launcherMode: 'file' | 'url' | 'exec'
    launcherPath: string | null
  }) => IpcResult<string | null>
  'launcher:kill-game': (gameId: string) => IpcVoidResult
  'launcher:launch-game': (gameId: string) => IpcVoidResult
  'launcher:apply-default-config': (gameId: string, filePath: string) => IpcVoidResult
  'native:open-dialog': (options?: OpenDialogOptions) => IpcResult<OpenDialogReturnValue>
  'native:open-path': (
    input:
      | string
      | {
          path: string /** Ensure system opens a folder (never launches an .exe). */
          ensure?: 'auto' | 'folder' | 'file'
        }
  ) => IpcVoidResult
  'native:get-auto-launch': () => IpcResult<boolean>
  'native:set-auto-launch': (enabled: boolean) => IpcVoidResult
  'attachment:crop-to-temp': (
    input: AttachmentInput,
    cropRegion: CropRegion,
    options?: {
      format?: 'keep' | 'png' | 'jpeg' | 'webp'
      quality?: number
    }
  ) => IpcResult<string>
  'attachment:create-game-backup': (gameId: string, note?: string) => IpcResult<SaveBackup>
  'attachment:delete-game-backup': (gameId: string, backupAt: number) => IpcVoidResult
  'attachment:restore-game-backup': (gameId: string, backupAt: number) => IpcVoidResult
  'attachment:update-game-backup': (
    gameId: string,
    backupAt: number,
    updates: Partial<Pick<SaveBackup, 'note' | 'locked'>>
  ) => IpcVoidResult
  'attachment:open-backup-folder': (gameId: string) => IpcVoidResult
  'attachment:open-save-folder': (gameId: string) => IpcVoidResult
  'portable:get-status': () => IpcResult<PortableStatus>
  'portable:get-pending-switch': () => IpcResult<PortableSwitchTarget | null>
  'portable:switch-to-portable': () => IpcVoidResult
  'portable:switch-to-normal': () => IpcVoidResult
  'portable:cancel-pending-switch': () => IpcVoidResult
  'plugin:dev-is-continued': () => IpcResult<boolean>
  'plugin:disable': (pluginId: string) => IpcVoidResult
  'plugin:enable': (pluginId: string) => IpcVoidResult
  'plugin:is-disabled': (pluginId: string) => IpcResult<boolean>
  'plugin:install': (source: string) => IpcVoidResult
  'plugin:install-from-file': (filePath: string) => IpcVoidResult
  'plugin:uninstall': (pluginId: string) => IpcVoidResult
  'plugin:check-updates': () => IpcResult<PluginUpdateInfo[]>
  'plugin:update': (pluginId: string) => IpcVoidResult
  'plugin:get-installed': () => IpcResult<InstalledPluginInfo[]>
  'plugin:get-registries': () => IpcResult<
    Array<{
      name: string
      displayName: string
      searchable: boolean
    }>
  >
  'plugin:search': (
    registryName: string,
    query: string,
    options?: {
      page?: number
      limit?: number
    }
  ) => IpcResult<{
    entries: PluginRegistryEntry[]
    total: number
    hasMore: boolean
  }>
  'plugin:get-loaded-entries': () => IpcResult<RendererPluginEntry[]>
  'scanner:get-active-scans': () => IpcResult<ScanProgressData[]>
  'scanner:test-extraction-rules': (
    scannerPath: string,
    entityDepth: number,
    rules: NameExtractionRule[]
  ) => IpcResult<ExtractionTestResult[]>
  'deeplink:handle': (url: string) => IpcResult<DeeplinkResult>
  'deeplink:get-actions': () => IpcResult<DeeplinkAction[]>
}
/**
 * IPC events sent from main to renderer.
 *
 * This interface is exported and can be extended via declaration merging.
 * Each event maps to a tuple of its argument types.
 */
interface IpcRendererEvents {
  ready: [boolean]
  'event:forward': [event: keyof AppEvents, args: unknown[]]
  'native:main-window-maximized': []
  'native:main-window-unmaximized': []
  'monitor:game-started': [string]
  'monitor:game-stopped': [string]
  'monitor:game-foreground': [string]
  'monitor:game-background': [string]
  'scanner:scan-progress': [ScanProgressData]
  'notify:show': [
    NotifyOptions & {
      toastId?: string
    }
  ]
  'notify:loading': [
    {
      toastId: string
      title: string
      message?: string
    }
  ]
  'notify:update': [
    {
      toastId: string
    } & NotifyOptions
  ]
  'notify:dismiss': [
    {
      toastId?: string
    }
  ]
  'plugin:loaded': [pluginId: string, entry: RendererPluginEntry | null]
  'plugin:unloaded': [pluginId: string]
  'plugin:reloaded': [pluginId: string, entry: RendererPluginEntry | null]
  'plugin:dev-continued': []
  'deeplink:navigate': [DeeplinkNavigatePayload]
  'deeplink:auth-callback': [DeeplinkAuthCallbackPayload]
  'deeplink:auth-error': [DeeplinkAuthErrorPayload]
}
//#endregion
//#region src/main/services/ipc/service.d.ts
declare class IpcService implements IService {
  readonly id = 'ipc'
  readonly deps: readonly []
  private registeredListeners
  private registeredHandlers
  private pendingRendererMessages
  private hasEverHadWindow
  private readonly maxPendingRendererMessages
  private onBrowserWindowCreated?
  init(_container: ServiceInitContainer<this>): Promise<void>
  dispose(): Promise<void>
  /**
   * Register a one-way listener (no response)
   */
  on<K extends keyof IpcMainListeners>(
    channel: K,
    listener: (e: IpcMainEvent, ...args: IpcMainListeners[K]) => void | Promise<void>
  ): void
  /**
   * Register a request-response handler
   */
  handle<K extends keyof IpcMainHandlers>(
    channel: K,
    handler: (
      e: IpcMainInvokeEvent,
      ...args: Parameters<IpcMainHandlers[K]>
    ) => ReturnType<IpcMainHandlers[K]> | Promise<Awaited<ReturnType<IpcMainHandlers[K]>>>
  ): void
  /**
   * Send a message to all renderer windows
   */
  send<K extends keyof IpcRendererEvents>(channel: K, ...args: IpcRendererEvents[K]): void
  private getSendTargets
  private flushPendingRendererMessages
  /**
   * Remove a handler by channel name
   */
  removeHandler<K extends keyof IpcMainHandlers>(channel: K): void
}
//#endregion
//#region src/main/services/window/service.d.ts
declare class WindowService implements IService {
  readonly id = 'window'
  readonly deps: readonly ['ipc', 'db']
  private mainWindow
  private trayMenuWindow
  private ipcService
  private dbService
  private isQuitting
  private mainWindowCloseAction
  init(container: ServiceInitContainer<this>): Promise<void>
  private setupIpcHandlers
  private loadMainWindowCloseActionFromDb
  private setMainWindowCloseAction
  private applyMainWindowCloseAction
  dispose(): Promise<void>
  /**
   * Create the main application window
   */
  createMainWindow(): BrowserWindow
  createTrayMenuWindow(): BrowserWindow
  /**
   * Get the main window instance
   */
  getMainWindow(): BrowserWindow | null
  getTrayMenuWindow(): BrowserWindow | null
  /**
   * Get all browser windows
   */
  getAllWindows(): BrowserWindow[]
  /**
   * Check if main window exists and is not destroyed
   */
  hasMainWindow(): boolean
  /**
   * Focus the main window
   */
  focusMainWindow(): void
  /**
   * Close the main window
   */
  closeMainWindow(): void
  /**
   * Check if main window is focused
   */
  isMainWindowFocused(): boolean
}
//#endregion
//#region src/main/services/native/service.d.ts
declare class NativeService implements IService {
  readonly id = 'native'
  readonly deps: readonly ['ipc', 'window']
  private ipcService
  private windowService
  private tray
  init(container: ServiceInitContainer<this>): Promise<void>
  dispose(): Promise<void>
  private setupIpcHandlers
  getAutoLaunchEnabled(): boolean
  setAutoLaunchEnabled(enabled: boolean): void
  /**
   * Show open dialog with main window
   */
  showOpenDialog(options?: OpenDialogOptions): Promise<OpenDialogReturnValue>
  /**
   * Open a file or directory with the default system application
   */
  openPath(
    input:
      | string
      | {
          path: string
          ensure?: 'auto' | 'folder' | 'file'
        }
  ): Promise<void>
  private ensureFolderPath
}
//#endregion
//#region src/main/services/i18n/service.d.ts
declare class I18nService implements IService {
  readonly id = 'i18n'
  readonly deps: readonly ['db', 'event']
  private eventService
  private dbService
  init(container: ServiceInitContainer<this>): Promise<void>
  /**
   * Map system locale to AppLocale
   */
  private mapSystemLocale
  /**
   * Get system locale mapped to AppLocale
   */
  getSystemLocale(): AppLocale
  /**
   * Detect initial locale from settings or system (sync for better-sqlite3)
   */
  private detectInitialLocale
  /**
   * Get current locale
   */
  getLocale(): AppLocale
  /**
   * Change locale and persist to settings
   * @param locale - AppLocale to set, or null to follow system
   */
  setLocale(locale: AppLocale | null): Promise<void>
}
//#endregion
//#region src/main/services/scraper/handlers/game/provider.d.ts
/**
 * Game scraper provider interface.
 *
 * Providers fetch game metadata from external sources (VNDB, IGDB, etc.).
 * Each method corresponds to a scraper category and returns typed data.
 *
 * ID Resolution:
 * - Handler resolves ScraperLookup to provider-specific IDs
 * - Provider methods receive their internal ID (string) directly
 * - Rate limiting should be handled internally by each provider
 *
 * @example
 * ```typescript
 * const provider: GameScraperProvider = {
 *   id: 'my-provider',
 *   name: 'My Database',
 *   capabilities: ['search', 'info', 'characters'],
 *
 *   async search(query) {
 *     const results = await api.search(query)
 *     return results.map(r => ({ id: r.id, name: r.title, releaseDate: { year: 2024 } }))
 *   },
 *
 *   async getCharacters(id, locale) {
 *     const chars = await api.getCharacters(id)
 *     return chars.map(c => ({
 *       name: c.name,
 *       type: 'main',
 *       persons: c.cv ? [{ name: c.cv, type: 'voice actor' }] : undefined
 *     }))
 *   }
 * }
 * ```
 */
interface GameScraperProvider {
  /** Unique provider identifier */
  readonly id: string
  /** Display name */
  readonly name: string
  /**
   * Explicit capability declaration.
   *
   * This is the source of truth for:
   * - UI (slot/provider selection)
   * - Handler behavior (what methods can be called)
   *
   * Contract:
   * - Declared capabilities MUST match implemented methods (validated at registration)
   * - Only game slots + 'search' are allowed (validated at registration)
   */
  readonly capabilities: readonly ScraperCapability[]
  /** Search games by query string */
  search?(query: string, locale?: Locale): Promise<GameSearchResult[]>
  /** Get core info (name, description, dates, links) */
  getInfo?(id: string, locale?: Locale): Promise<GameInfo>
  /** Get tags/genres */
  getTags?(id: string, locale?: Locale): Promise<Tag[]>
  /**
   * Get characters with related persons (voice actors, etc.).
   * Characters may include persons[] following link table convention.
   */
  getCharacters?(id: string, locale?: Locale): Promise<GameCharacter[]>
  /** Get persons (staff, voice actors, etc.) */
  getPersons?(id: string, locale?: Locale): Promise<GamePerson[]>
  /** Get companies (developers, publishers) */
  getCompanies?(id: string, locale?: Locale): Promise<GameCompany[]>
  /** Get cover image URLs */
  getCovers?(id: string, locale?: Locale): Promise<string[]>
  /** Get backdrop/screenshot URLs */
  getBackdrops?(id: string, locale?: Locale): Promise<string[]>
  /** Get logo URLs */
  getLogos?(id: string, locale?: Locale): Promise<string[]>
  /** Get icon URLs */
  getIcons?(id: string, locale?: Locale): Promise<string[]>
}
//#endregion
//#region src/main/services/scraper/handlers/game/handler.d.ts
declare class GameScraperHandler {
  private db
  private i18n
  private providers
  constructor(db: BetterSQLite3Database<typeof index_d_exports>, i18n: I18nService)
  registerProvider(provider: GameScraperProvider): void
  /**
   * Unregister a provider and clean up all profiles using it.
   *
   * @returns Map of profile ID to action taken
   */
  unregisterProvider(providerId: string): Promise<Map<string, ProfileCleanupAction>>
  getProviders(): GameScraperProviderInfo[]
  getProviderInfo(providerId: string): GameScraperProviderInfo
  /**
   * Ensure a profile is valid by checking and fixing invalid references.
   *
   * - If searchProviderId is invalid -> deletes entire profile
   * - If slotConfigs reference invalid providers -> removes those references
   *
   * @returns Action taken: 'deleted', 'updated', or 'unchanged'
   */
  ensureProfileValid(profileId: string): Promise<ProfileCleanupAction>
  search(profileId: string, query: string): Promise<GameSearchResult[]>
  /**
   * Get complete game metadata using profile configuration.
   *
   * Three-phase immutable resolution:
   * 1. Resolve searchProvider, extract originalName from search result
   * 2. Resolve other providers using originalName for better matching
   * 3. Fetch all slots in parallel using resolved IDs
   */
  getMetadata(
    profileId: string,
    lookup: ScraperLookup,
    options?: GameScraperOptions
  ): Promise<GameMetadata | null>
  /**
   * Get images from a specific provider.
   *
   * @param providerId - The provider to query
   * @param lookup - Lookup info (name, locale, knownIds)
   * @param imageType - Type of images to fetch
   */
  getProviderImages(
    providerId: string,
    lookup: ScraperLookup,
    imageType: GameImageSlot
  ): Promise<string[]>
  /**
   * Load profile by ID (sync for better-sqlite3)
   */
  private loadProfile
  private getProvider
  private getLocale
  /**
   * Resolve ID for a specific provider.
   *
   * Resolution priority:
   * 1. Check knownIds for this provider's ID
   * 2. Search by name to get this provider's ID
   *
   * Returns both ID and originalName (if available from search result).
   * Does NOT modify any input parameters.
   */
  private resolveId
  private fetchAllSlots
  private fetchSlot
  private assertProviderCapabilities
}
//#endregion
//#region src/main/services/scraper/handlers/person/provider.d.ts
interface PersonScraperProvider {
  /** Unique provider identifier */
  readonly id: string
  /** Display name */
  readonly name: string
  /** Search persons by query string */
  search?(query: string, locale?: Locale): Promise<PersonSearchResult[]>
  /** Get core info (name, description, dates, links) */
  getInfo?(id: string, locale?: Locale): Promise<PersonInfo>
  /** Get tags */
  getTags?(id: string, locale?: Locale): Promise<Tag[]>
  /**
   * Get photo image URLs.
   * Used as the primary image candidate list for PersonMetadata.photos.
   */
  getPhotos?(id: string, locale?: Locale): Promise<string[]>
}
//#endregion
//#region src/main/services/scraper/handlers/person/types.d.ts
/**
 * Person image slot (DB: persons.photoFile).
 * Only `photos` maps to PersonMetadata.photos / persons.photoFile.
 */
type PersonScraperImageSlot = Extract<ScraperSlot, 'photos'>
//#endregion
//#region src/main/services/scraper/handlers/person/handler.d.ts
declare class PersonScraperHandler {
  private db
  private i18n
  private providers
  constructor(db: BetterSQLite3Database<typeof index_d_exports>, i18n: I18nService)
  registerProvider(provider: PersonScraperProvider): void
  unregisterProvider(providerId: string): Promise<Map<string, ProfileCleanupAction>>
  getProviders(): PersonScraperProviderInfo[]
  getProviderInfo(providerId: string): PersonScraperProviderInfo
  ensureProfileValid(profileId: string): Promise<ProfileCleanupAction>
  search(profileId: string, query: string): Promise<PersonSearchResult[]>
  getMetadata(
    profileId: string,
    lookup: ScraperLookup,
    options?: PersonScraperOptions
  ): Promise<PersonMetadata | null>
  getProviderImages(
    providerId: string,
    lookup: ScraperLookup,
    imageType: PersonScraperImageSlot
  ): Promise<string[]>
  private loadProfile
  private getProvider
  private getLocale
  private resolveId
  private fetchAllSlots
  private fetchSlot
  private buildCapabilities
}
//#endregion
//#region src/main/services/scraper/handlers/company/provider.d.ts
interface CompanyScraperProvider {
  /** Unique provider identifier */
  readonly id: string
  /** Display name */
  readonly name: string
  /** Search companies by query string */
  search?(query: string, locale?: Locale): Promise<CompanySearchResult[]>
  /** Get core info (name, description, dates, links) */
  getInfo?(id: string, locale?: Locale): Promise<CompanyInfo>
  /** Get tags */
  getTags?(id: string, locale?: Locale): Promise<Tag[]>
  /** Get logo image URLs */
  getLogos?(id: string, locale?: Locale): Promise<string[]>
}
//#endregion
//#region src/main/services/scraper/handlers/company/types.d.ts
/**
 * Company image slot (DB: companies.logoFile).
 * Only `logos` maps to CompanyMetadata.logos / companies.logoFile.
 */
type CompanyScraperImageSlot = Extract<ScraperSlot, 'logos'>
//#endregion
//#region src/main/services/scraper/handlers/company/handler.d.ts
declare class CompanyScraperHandler {
  private db
  private i18n
  private providers
  constructor(db: BetterSQLite3Database<typeof index_d_exports>, i18n: I18nService)
  registerProvider(provider: CompanyScraperProvider): void
  unregisterProvider(providerId: string): Promise<Map<string, ProfileCleanupAction>>
  getProviders(): CompanyScraperProviderInfo[]
  getProviderInfo(providerId: string): CompanyScraperProviderInfo
  ensureProfileValid(profileId: string): Promise<ProfileCleanupAction>
  search(profileId: string, query: string): Promise<CompanySearchResult[]>
  getMetadata(
    profileId: string,
    lookup: ScraperLookup,
    options?: CompanyScraperOptions
  ): Promise<CompanyMetadata | null>
  getProviderImages(
    providerId: string,
    lookup: ScraperLookup,
    imageType: CompanyScraperImageSlot
  ): Promise<string[]>
  private loadProfile
  private getProvider
  private getLocale
  private resolveId
  private fetchAllSlots
  private fetchSlot
  private buildCapabilities
}
//#endregion
//#region src/main/services/scraper/handlers/character/provider.d.ts
interface CharacterScraperProvider {
  /** Unique provider identifier */
  readonly id: string
  /** Display name */
  readonly name: string
  /** Search characters by query string */
  search?(query: string, locale?: Locale): Promise<CharacterSearchResult[]>
  /** Get core info (name, description, attributes, links) */
  getInfo?(id: string, locale?: Locale): Promise<CharacterInfo>
  /** Get tags */
  getTags?(id: string, locale?: Locale): Promise<Tag[]>
  /** Get persons related to character (voice actors, illustrators, etc.) */
  getPersons?(id: string, locale?: Locale): Promise<CharacterPerson[]>
  /** Get icon/photo image URLs */
  getPhotos?(id: string, locale?: Locale): Promise<string[]>
}
//#endregion
//#region src/main/services/scraper/handlers/character/types.d.ts
/**
 * Character image slot (DB: characters.photoFile).
 * Only `photos` maps to CharacterMetadata.photos / characters.photoFile.
 */
type CharacterScraperImageSlot = Extract<ScraperSlot, 'photos'>
//#endregion
//#region src/main/services/scraper/handlers/character/handler.d.ts
declare class CharacterScraperHandler {
  private db
  private i18n
  private providers
  constructor(db: BetterSQLite3Database<typeof index_d_exports>, i18n: I18nService)
  registerProvider(provider: CharacterScraperProvider): void
  unregisterProvider(providerId: string): Promise<Map<string, ProfileCleanupAction>>
  getProviders(): CharacterScraperProviderInfo[]
  getProviderInfo(providerId: string): CharacterScraperProviderInfo
  ensureProfileValid(profileId: string): Promise<ProfileCleanupAction>
  search(profileId: string, query: string): Promise<CharacterSearchResult[]>
  getMetadata(
    profileId: string,
    lookup: ScraperLookup,
    options?: CharacterScraperOptions
  ): Promise<CharacterMetadata | null>
  getProviderImages(
    providerId: string,
    lookup: ScraperLookup,
    imageType: CharacterScraperImageSlot
  ): Promise<string[]>
  private loadProfile
  private getProvider
  private getLocale
  private resolveId
  private fetchAllSlots
  private fetchSlot
  private buildCapabilities
}
//#endregion
//#region src/main/services/scraper/service.d.ts
declare class ScraperService implements IContentService {
  readonly id = 'scraper'
  readonly deps: readonly ['db', 'i18n', 'ipc', 'network']
  game: GameScraperHandler
  person: PersonScraperHandler
  company: CompanyScraperHandler
  character: CharacterScraperHandler
  private ipcService
  init(container: ServiceInitContainer<this>): Promise<void>
  private registerBuiltinProviders
  private setupIpcHandlers
  getSupportedContent(): ContentEntityType[]
  registerGameProvider(provider: GameScraperProvider): void
  unregisterGameProvider(providerId: string): Promise<void>
  registerPersonProvider(provider: PersonScraperProvider): void
  unregisterPersonProvider(providerId: string): Promise<void>
  registerCompanyProvider(provider: CompanyScraperProvider): void
  unregisterCompanyProvider(providerId: string): Promise<void>
  registerCharacterProvider(provider: CharacterScraperProvider): void
  unregisterCharacterProvider(providerId: string): Promise<void>
}
//#endregion
//#region src/main/services/adder/types.d.ts
type PendingAssetTask =
  | {
      type: 'game'
      gameId: string
      field: 'coverFile' | 'backdropFile' | 'logoFile' | 'iconFile'
      url: string
    }
  | {
      type: 'person'
      personId: string
      url: string
    }
  | {
      type: 'company'
      companyId: string
      url: string
    }
  | {
      type: 'character'
      characterId: string
      url: string
    }
interface AddGameInternalResult extends AddGameResult {
  pendingAssets: PendingAssetTask[]
}
interface AddPersonInternalResult extends AddPersonResult {
  pendingAssets: PendingAssetTask[]
}
interface AddCompanyInternalResult extends AddCompanyResult {
  pendingAssets: PendingAssetTask[]
}
interface AddCharacterInternalResult extends AddCharacterResult {
  pendingAssets: PendingAssetTask[]
}
//#endregion
//#region src/main/services/adder/handlers/character.d.ts
declare class CharacterAdderHandler {
  private db
  constructor(db: DbService)
  addCharacter(
    metadata: CharacterMetadata,
    options?: AddCharacterOptions
  ): Promise<AddCharacterResult>
  addCharacter(
    metadata: CharacterMetadata,
    options: AddCharacterOptions | undefined,
    ctx: DbContext
  ): Promise<AddCharacterInternalResult>
  addCharacterInternal(
    metadata: CharacterMetadata,
    options: AddCharacterOptions | undefined,
    tx: DbContext
  ): AddCharacterInternalResult
  private addToCollection
  private flushPendingAssets
  private toPublicResult
}
//#endregion
//#region src/main/services/adder/handlers/company.d.ts
declare class CompanyAdderHandler {
  private db
  constructor(db: DbService)
  addCompany(metadata: CompanyMetadata, options?: AddCompanyOptions): Promise<AddCompanyResult>
  addCompany(
    metadata: CompanyMetadata,
    options: AddCompanyOptions | undefined,
    ctx: DbContext
  ): Promise<AddCompanyInternalResult>
  addCompanyInternal(
    metadata: CompanyMetadata,
    options: AddCompanyOptions | undefined,
    tx: DbContext
  ): AddCompanyInternalResult
  private addToCollection
  private flushPendingAssets
  private toPublicResult
}
//#endregion
//#region src/main/services/adder/handlers/person.d.ts
declare class PersonAdderHandler {
  private db
  constructor(db: DbService)
  addPerson(metadata: PersonMetadata, options?: AddPersonOptions): Promise<AddPersonResult>
  addPerson(
    metadata: PersonMetadata,
    options: AddPersonOptions | undefined,
    ctx: DbContext
  ): Promise<AddPersonInternalResult>
  addPersonInternal(
    metadata: PersonMetadata,
    options: AddPersonOptions | undefined,
    tx: DbContext
  ): AddPersonInternalResult
  private addToCollection
  private flushPendingAssets
  private toPublicResult
}
//#endregion
//#region src/main/services/adder/handlers/game.d.ts
declare class GameAdderHandler {
  private db
  private person
  private company
  private character
  constructor(
    db: DbService,
    person: PersonAdderHandler,
    company: CompanyAdderHandler,
    character: CharacterAdderHandler
  )
  addGame(metadata: GameMetadata, options?: AddGameOptions): Promise<AddGameResult>
  addGame(
    metadata: GameMetadata,
    options: AddGameOptions | undefined,
    ctx: DbContext
  ): Promise<AddGameInternalResult>
  addGameInternal(
    metadata: GameMetadata,
    options: AddGameOptions | undefined,
    tx: DbContext
  ): AddGameInternalResult
  private insertExternalIds
  private insertTagLinks
  private insertPersonLinks
  private insertCompanyLinks
  private insertCharacterLinks
  private insertCharacterPersonLinks
  private addToCollection
  private collectGameAssets
  private flushPendingAssets
  private toPublicResult
}
//#endregion
//#region src/main/services/adder/service.d.ts
declare class AdderService implements IContentService {
  readonly id = 'adder'
  readonly deps: readonly ['db', 'ipc']
  person: PersonAdderHandler
  company: CompanyAdderHandler
  character: CharacterAdderHandler
  game: GameAdderHandler
  init(container: ServiceInitContainer<this>): Promise<void>
  private setupIpcHandlers
  getSupportedContent(): ContentEntityType[]
}
//#endregion
//#region src/main/services/scanner/types.d.ts
type FileIconSize = 'small' | 'normal' | 'large'
type PhashInputSpec = {
  kind: 'file-icon'
  iconSize: FileIconSize
}
interface PhashIndexSpec {
  mediaType: MediaType
  selectSql: string
  defaultMaxDistance: number
  input: PhashInputSpec
}
//#endregion
//#region src/main/services/scanner/phash.d.ts
interface PhashDbRecord {
  id: string
  name: string
  externalIds: ExternalId[]
  hash: bigint
}
interface PhashDbMatch {
  record: PhashDbRecord
  distance: number
  inputPhash: string
}
interface FilePhashItem {
  filePath: string
  phash: string
}
/**
 * Scanner pHash sub-module.
 *
 * This is intentionally handler-agnostic so it can be reused by other media
 * handlers, while still being owned and instantiated by ScannerService.
 */
declare class ScannerPhash {
  private dbCache
  clearDbCache(): void
  loadPhashDbRecords(selectSql: string): PhashDbRecord[]
  findBestPhashDbMatch(params: {
    inputPhashes: readonly string[]
    selectSql: string
    maxDistance?: number
  }): PhashDbMatch | null
  findBestPhashDbMatchFromFiles(params: {
    filePaths: readonly string[]
    index: PhashIndexSpec
    maxDistance?: number
    fileIconSize?: FileIconSize
  }): Promise<{
    match: PhashDbMatch | null
    computed: FilePhashItem[]
    emptyPaths: string[]
    errors: Array<{
      filePath: string
      error: unknown
    }>
  }>
  computePhashFromPngBuffer(pngBuffer: Buffer): Promise<string>
  computePhashFromFileIcon(
    filePath: string,
    options?: {
      size?: FileIconSize
    }
  ): Promise<string | null>
}
//#endregion
//#region src/main/services/scanner/utils.d.ts
interface ScanOptions {
  /** Depth at which to collect entities (0 = immediate children) */
  entityDepth: number
  /** Names to ignore (case-insensitive) */
  ignoredNames: string[]
  /** Rules for extracting entity name from folder/file name */
  nameExtractionRules: NameExtractionRule[]
}
//#endregion
//#region src/main/services/scanner/handlers/game/handler.d.ts
/**
 * Game Scanner Handler
 * Manages game scanning with layer-based entity detection
 */
declare class GameScannerHandler {
  private scanForEntities
  private phash
  private dbService
  private ipcService
  private scraperService
  private adderService
  private scheduledScanners
  private scannersInProgress
  private activeScanProgress
  private scanQueue
  private isProcessingQueue
  constructor(
    scanForEntities: (rootPath: string, options: ScanOptions) => Promise<EntityEntry[]>,
    phash: ScannerPhash,
    dbService: DbService,
    ipcService: IpcService,
    scraperService: ScraperService,
    adderService: AdderService
  )
  /**
   * Get all active scan progress states
   */
  getActiveScans(): ScanProgressData[]
  /**
   * Scan and process games for a scanner
   */
  scanScanner(scannerId: string): Promise<ScanCompletedData>
  /**
   * Process the scan queue (only one scanner at a time)
   */
  private processQueue
  /**
   * Execute the actual scan for a scanner
   */
  private executeScan
  /**
   * Process a matched game entity and add it to the library
   *
   * Flow:
   * 1. Early externalId dedup check (before network request, if we have externalIds)
   * 2. Use ScraperService to fetch complete metadata
   * 3. Call adder to persist to database
   *
   * Note: Path deduplication is already done in the main scan loop before this method is called.
   */
  private processGameEntity
  /**
   * Scan all game scanners
   */
  scanAllScanners(): Promise<Map<string, ScanCompletedData>>
  /**
   * Schedule a scanner for periodic scanning
   */
  scheduleScanner(scannerId: string): Promise<void>
  /**
   * Unschedule a scanner from periodic scanning
   */
  unscheduleScanner(scannerId: string): void
  /**
   * Schedule all scanners that have interval > 0
   */
  scheduleAllScanners(): Promise<void>
  /**
   * Unschedule all scanners
   */
  unscheduleAllScanners(): void
  /**
   * Get scheduled game scanner IDs
   */
  getScheduledScannerIds(): string[]
  /**
   * Check if a game scanner is scheduled
   */
  isScannerScheduled(scannerId: string): boolean
  /**
   * Cleanup - unschedule all scanners
   */
  cleanup(): void
}
//#endregion
//#region src/main/services/scanner/service.d.ts
declare class ScannerService implements IMediaService {
  readonly id = 'scanner'
  readonly deps: readonly ['db', 'ipc', 'scraper', 'adder']
  game: GameScannerHandler
  phash: ScannerPhash
  private dbService
  init(container: ServiceInitContainer<this>): Promise<void>
  private setupIpcHandlers
  dispose(): Promise<void>
  getSupportedMedia(): MediaType[]
}
//#endregion
//#region src/main/services/attachment/handlers/game.d.ts
declare class GameAttachmentHandler {
  private dbService
  constructor(dbService: DbService)
  createBackup(gameId: string, note?: string): Promise<SaveBackup>
  deleteBackup(gameId: string, backupAt: number): Promise<void>
  restoreBackup(gameId: string, backupAt: number): Promise<void>
  updateBackup(
    gameId: string,
    backupAt: number,
    updates: Partial<Pick<SaveBackup, 'note' | 'locked'>>
  ): Promise<void>
  openBackupFolder(gameId: string): Promise<void>
  openSaveFolder(gameId: string): Promise<void>
  tryAutoBackup(gameId: string): Promise<void>
  private cleanupExcessBackups
  private getGame
}
//#endregion
//#region src/main/services/monitor/handlers/game.d.ts
/**
 * Game monitor handler
 */
declare class GameMonitorHandler {
  private dbService
  private ipcService
  private eventService
  private gameAttachment
  private monitors
  private pollingTimer?
  private readonly POLLING_INTERVAL
  private readonly BACKGROUND_BUFFER_TIME
  constructor(
    dbService: DbService,
    ipcService: IpcService,
    eventService: EventService,
    gameAttachment: GameAttachmentHandler
  )
  /**
   * Configuration input for computing effective monitor path.
   * Used by both internal methods and IPC handler.
   */
  static computeEffectiveMonitorPath(config: {
    monitorPath: string | null
    monitorMode: 'folder' | 'file' | 'process'
    gameDirPath: string | null
    launcherMode: 'file' | 'url' | 'exec'
    launcherPath: string | null
  }): string | null
  /**
   * Start monitoring a game
   */
  startMonitoring(gameId: string): Promise<void>
  /**
   * Stop monitoring a game
   */
  stopMonitoring(gameId: string): Promise<void>
  /**
   * Get status of all monitored games
   */
  getMonitoringStatus(): GameRunningStatus[]
  /**
   * Get status of a specific game
   */
  getGameStatus(gameId: string): GameRunningStatus | null
  /**
   * Cleanup all monitors
   */
  cleanup(): Promise<void>
  /**
   * Ensure global polling timer is running
   */
  private ensurePollingRunning
  /**
   * Stop polling if no games are being monitored
   */
  private stopPollingIfEmpty
  /**
   * Poll all games for process status
   */
  private pollAllGames
  /**
   * Find a matching process for the game
   */
  private findMatchingProcess
  /**
   * Normalize path for comparison
   */
  private normalizePath
  /**
   * Handle game start
   */
  private handleGameStart
  /**
   * Handle game stop
   */
  private handleGameStop
  /**
   * Handle foreground/background switch
   */
  private handleForegroundChange
  /**
   * Save foreground running time as a new session record
   */
  private saveForegroundTime
}
//#endregion
//#region src/main/services/monitor/service.d.ts
declare class MonitorService implements IMediaService {
  readonly id = 'monitor'
  readonly deps: readonly ['db', 'ipc', 'event', 'attachment']
  game: GameMonitorHandler
  init(container: ServiceInitContainer<this>): Promise<void>
  private setupIpcHandlers
  dispose(): Promise<void>
  getSupportedMedia(): MediaType[]
}
//#endregion
//#region src/main/services/launcher/handlers/game.d.ts
declare class GameLauncherHandler {
  private dbService
  private monitorService
  private nativeService
  constructor(dbService: DbService, monitorService: MonitorService, nativeService: NativeService)
  /**
   * Launches a game
   * @param gameId - The game ID
   * @param options - Optional behavior toggles
   * @throws Error when launch fails
   */
  launchGame(
    gameId: string,
    options?: {
      cancelBehavior?: 'return' | 'throw'
    }
  ): Promise<void>
  private selectLauncherPath
  /**
   * file mode: Open file with system default application
   */
  private launchFile
  /**
   * url mode: Open URL with system default browser
   */
  private launchUrl
  /**
   * exec mode: Execute the executable file directly
   */
  private launchExec
  /**
   * Kill game process
   * @param gameId - The game ID
   * @throws Error when game is not running or kill fails
   */
  killGame(gameId: string): Promise<void>
}
//#endregion
//#region src/main/services/launcher/service.d.ts
declare class LauncherService implements IMediaService {
  readonly id = 'launcher'
  readonly deps: readonly ['db', 'ipc', 'monitor', 'event', 'native']
  private dbService
  private eventService
  game: GameLauncherHandler
  init(container: ServiceInitContainer<this>): Promise<void>
  private setupIpcHandlers
  getSupportedMedia(): MediaType[]
}
//#endregion
//#region src/main/services/attachment/service.d.ts
declare class AttachmentService implements IMediaService {
  readonly id = 'attachment'
  readonly deps: readonly ['db', 'ipc', 'network']
  game: GameAttachmentHandler
  private networkService
  private cropper
  init(container: ServiceInitContainer<this>): Promise<void>
  private setupIpcHandlers
  getSupportedMedia(): MediaType[]
}
//#endregion
//#region src/main/services/plugin/types.d.ts
/**
 * Plugin metadata definition
 */
interface PluginManifest {
  /** Unique plugin identifier (e.g. 'com.example.myplugin') */
  readonly id: string
  /** Display name */
  readonly name: string
  /** Semantic version */
  readonly version: string
  /** Description */
  readonly description?: string
  /** Author name */
  readonly author?: string
  /** Homepage URL */
  readonly homepage?: string
  /**
   * Kisaki version compatibility range (semver format)
   * @example ">=1.0.0" - Compatible with Kisaki 1.0.0 and above
   * @example ">=1.0.0 <2.0.0" - Compatible with Kisaki 1.x only
   */
  readonly kisakiCompat?: string
  /** Plugin category */
  readonly category?: PluginCategory
  /** Main process entry file (relative path, defaults to 'main.js') */
  readonly main?: string
  /** Renderer process entry file (relative path) */
  readonly renderer?: string
}
//#endregion
//#region src/main/services/plugin/registry.d.ts
interface PluginSearchOptions {
  page?: number
  limit?: number
  sortBy?: 'stars' | 'updated' | 'name'
}
interface PluginSearchResult {
  entries: PluginRegistryEntry[]
  total: number
  hasMore: boolean
}
/**
 * Registry provider metadata for UI display
 */
interface RegistryProviderInfo {
  name: string
  displayName: string
  description?: string
  /** Whether this provider supports search/browse functionality */
  searchable: boolean
}
/**
 * Plugin registry provider interface.
 * Each provider implements a specific source (GitHub, local file, etc.)
 */
interface IPluginRegistryProvider {
  /** Unique provider name (e.g., 'github', 'local') */
  readonly name: string
  /** Display name for UI (e.g., 'GitHub', '本地文件') */
  readonly displayName: string
  /** Whether this provider supports search functionality */
  readonly searchable: boolean
  /**
   * Search for plugins in this registry.
   * Only available if searchable is true.
   *
   * @param query - Search query string
   * @param options - Pagination and sorting options
   */
  search(query: string, options?: PluginSearchOptions): Promise<PluginSearchResult>
  /**
   * Resolve a plugin source string to registry entry.
   * Returns null if the source format doesn't match this provider.
   *
   * @param source - Plugin source string (e.g., 'github:owner/repo')
   */
  resolve(source: string): Promise<PluginRegistryEntry | null>
  /**
   * Get the latest version for a plugin.
   * Used for update checking.
   *
   * @param pluginId - Plugin ID to check
   * @param currentSource - Original source string used for installation
   */
  getLatestVersion(pluginId: string, currentSource: string): Promise<string | null>
  /**
   * Download plugin package to a temporary location.
   * Returns the path to the downloaded file.
   *
   * @param entry - Plugin registry entry with download URL
   */
  download(entry: PluginRegistryEntry): Promise<string>
}
/**
 * Manages multiple plugin registry providers.
 * Provides unified search and resolution across all registered providers.
 */
declare class PluginRegistryManager {
  private providers
  /**
   * Register a new registry provider
   */
  register(provider: IPluginRegistryProvider): void
  /**
   * Get a provider by name
   */
  getProvider(name: string): IPluginRegistryProvider | undefined
  /**
   * Get all registered providers
   */
  getAllProviders(): IPluginRegistryProvider[]
  /**
   * Get providers that support search functionality (for UI dropdown)
   */
  getSearchableProviders(): RegistryProviderInfo[]
  /**
   * Search for plugins in a specific registry.
   *
   * @param registryName - Name of the registry to search in
   * @param query - Search query string
   * @param options - Pagination and sorting options
   */
  search(
    registryName: string,
    query: string,
    options?: PluginSearchOptions
  ): Promise<PluginSearchResult>
  /**
   * Resolve a plugin source to registry entry.
   *
   * @param source - Plugin source string (e.g., 'github:owner/repo', '/path/to/file.zip')
   * @param registryName - Optional. If provided, only uses that specific registry.
   *                       If not provided, tries each provider until one matches.
   */
  resolve(source: string, registryName?: string): Promise<PluginRegistryEntry | null>
  /**
   * Get the latest version for a plugin from the appropriate provider
   */
  getLatestVersion(pluginId: string, source: string): Promise<string | null>
  /**
   * Download a plugin using the appropriate provider
   */
  download(entry: PluginRegistryEntry): Promise<string>
}
//#endregion
//#region src/main/services/plugin/installer.d.ts
interface PluginInstallResult {
  pluginId: string
  directory: string
}
/**
 * Plugin Installer
 *
 * Handles the complete plugin installation lifecycle:
 * 1. Resolve source to registry entry
 * 2. Download package to temp
 * 3. Extract and validate manifest
 * 4. Show trust confirmation dialog
 * 5. Install to plugins directory
 */
declare class PluginInstaller {
  private pluginsDir
  private registryManager
  private installationSources
  constructor(pluginsDir: string, registryManager: PluginRegistryManager)
  /**
   * Install a plugin from any registered source.
   *
   * @param source - Plugin source (e.g., 'github:owner/repo' or local path)
   */
  install(source: string): Promise<PluginInstallResult | null>
  /**
   * Install a plugin from a local file path.
   * Convenience method that delegates to install().
   */
  installFromFile(filePath: string): Promise<PluginInstallResult | null>
  /**
   * Uninstall a plugin by removing its directory.
   */
  uninstall(pluginId: string): Promise<void>
  /**
   * Check for available updates for all installed plugins.
   */
  checkUpdates(): Promise<PluginUpdateInfo[]>
  /**
   * Update a plugin to the latest version.
   */
  update(pluginId: string): Promise<PluginInstallResult | null>
  /**
   * Get information about all installed plugins.
   */
  getInstalledPlugins(): Promise<InstalledPluginInfo[]>
  /**
   * Extract and validate a plugin package
   */
  private extractAndValidate
  /**
   * Show trust confirmation dialog
   */
  private showTrustDialog
  /**
   * Install extracted plugin to plugins directory
   */
  private installToPluginsDir
  private replaceInPluginsDir
  /**
   * Save installation sources for update checking
   */
  private saveInstallationSources
  /**
   * Load installation sources
   */
  private loadInstallationSources
}
//#endregion
//#region src/main/services/plugin/dev-wait.d.ts
/**
 * Plugin Development Wait Gate
 *
 * In debug mode, pauses plugin activation until a debugger is attached.
 * Automatically detects debugger connection and continues.
 */
/**
 * Plugin development wait gate.
 * Manages a shared promise that blocks plugin activation in debug mode.
 * Automatically continues when a debugger is attached.
 */
declare class PluginDevWait {
  private waiting
  private continued
  private onContinue?
  /**
   * Set callback to be called when continue() is triggered.
   * Used to notify renderer process.
   */
  setOnContinue(callback: () => void): void
  /**
   * Wait for debugger to be attached.
   * Creates a shared promise that blocks until a debugger connects.
   * Multiple callers will await the same promise.
   */
  wait(context?: string): Promise<void>
  /**
   * Release the wait gate.
   * All callers awaiting wait() will be unblocked.
   */
  continue(): void
  /**
   * Check if currently waiting.
   */
  isWaiting(): boolean
  /**
   * Check if continue has been triggered.
   * Used by renderer to check state during initialization.
   */
  isContinued(): boolean
}
//#endregion
//#region src/main/services/plugin/loader.d.ts
/** Plugin module interface - plugins export activate/deactivate functions */
interface PluginModule {
  activate(): void | Promise<void>
  deactivate?(): void | Promise<void>
}
/** Internal storage for loaded main process plugins */
interface LoadedMainPlugin {
  id: string
  manifest: PluginManifest
  module: PluginModule
}
/**
 * Plugin loader for main process plugins.
 * Manages the lifecycle of plugins (load, unload, reload).
 */
declare class PluginLoader {
  private pluginsDir
  private loadedPlugins
  private pluginDirectories
  private disabledPlugins
  private devWait
  private hasDevPlugin
  constructor(
    pluginsDir: string,
    disabledPlugins: Set<string>,
    devWait: PluginDevWait,
    hasDevPlugin: boolean
  )
  /**
   * Scan plugins directory and load all plugins.
   */
  loadAllPlugins(): Promise<void>
  /**
   * Load a single plugin from a directory
   */
  loadPlugin(pluginPath: string): Promise<void>
  /**
   * Unload a plugin by ID
   */
  unloadPlugin(pluginId: string): Promise<void>
  /**
   * Reload a plugin (unload then load)
   */
  reloadPlugin(pluginId: string): Promise<void>
  /**
   * Get the plugins directory path
   */
  getPluginsDir(): string
  /**
   * Get the directory path for a specific plugin
   */
  getPluginDirectory(pluginId: string): string | undefined
  /**
   * Get all loaded plugin manifests
   */
  getPluginManifests(): PluginManifest[]
  /**
   * Get a loaded plugin by ID
   */
  getLoadedPlugin(pluginId: string): LoadedMainPlugin | undefined
  /**
   * Check if a plugin is loaded
   */
  hasPlugin(pluginId: string): boolean
  /**
   * Get renderer entry info for a plugin
   */
  getRendererEntry(pluginId: string): RendererPluginEntry | null
}
//#endregion
//#region src/main/services/plugin/service.d.ts
declare class PluginService implements IService {
  readonly id = 'plugin'
  readonly deps: readonly ['ipc', 'network']
  /** Plugin registry manager for resolving plugin sources */
  registry: PluginRegistryManager
  /** Plugin installer for downloading and installing plugins */
  installer: PluginInstaller
  /** Plugin loader for managing plugin lifecycle */
  loader: PluginLoader
  /** Plugin watcher for hot reload (dev-plugin mode only) */
  private watcher
  /** Plugin development wait gate (dev-plugin mode only) */
  readonly devWait: PluginDevWait
  /** Whether running in dev-plugin mode (--dev-plugin argument) */
  private hasDevPlugin
  private pluginsDir
  private disabledPlugins
  private disabledConfigPath
  private ipcService
  init(container: ServiceInitContainer<this>): Promise<void>
  dispose(): Promise<void>
  /**
   * Setup kisaki-plugin:// protocol handler for serving plugin files
   */
  private setupPluginProtocol
  private setupDevWaitIpc
  /**
   * Load a development plugin from path.
   * Creates @debug.{id} symlink and loads the plugin.
   */
  private loadDevPlugin
  private setupPluginManagementIpc
  private setupInstallationIpc
  private getPluginDir
  private loadDisabledState
  private saveDisabledState
  disablePlugin(pluginId: string): Promise<void>
  enablePlugin(pluginId: string): Promise<void>
  isPluginDisabled(pluginId: string): boolean
  /**
   * Scan plugins directory and load all plugins.
   * Emits plugin:loaded event for each plugin with a renderer entry.
   */
  loadAllPlugins(): Promise<void>
  /**
   * Get the plugins directory path
   */
  getPluginsDir(): string
  /**
   * Get the directory path for a specific plugin
   */
  getPluginDirectory(pluginId: string): string | undefined
  /**
   * Get all loaded plugin manifests
   */
  getPluginManifests(): PluginManifest[]
  /**
   * Get a loaded plugin by ID
   */
  getLoadedPlugin(pluginId: string): LoadedMainPlugin | undefined
  /**
   * Check if a plugin is loaded
   */
  hasPlugin(pluginId: string): boolean
  /**
   * Get renderer entry info for a plugin
   */
  getRendererEntry(pluginId: string): RendererPluginEntry | null
  /**
   * Send plugin lifecycle event to renderer
   */
  private sendPluginEvent
  /**
   * Stop the file watcher (cleanup)
   */
  stopWatcher(): Promise<void>
  /**
   * Clean up stale debug symlinks that may remain from abnormal exit
   */
  private cleanupStaleDebugLinks
}
//#endregion
//#region src/main/services/notify/service.d.ts
declare class NotifyService implements IService {
  readonly id = 'notify'
  readonly deps: readonly ['ipc', 'window']
  private ipcService
  private windowService
  private _notify
  init(container: ServiceInitContainer<this>): Promise<void>
  private setupIpcHandlers
  /**
   * Get the notify function for use in services
   */
  get notify(): NotifyFunction
  /**
   * Create the notify function with methods
   */
  private createNotify
  /**
   * Main notify entry point
   */
  private handleNotify
  private handleAuto
  private showNative
  private forwardToRenderer
  private showLoading
  private updateToast
  private dismissToast
}
//#endregion
//#region src/main/services/deeplink/types.d.ts
/**
 * Deeplink handler interface.
 * Each handler is responsible for processing a specific action type.
 */
interface DeeplinkHandler {
  /** The action this handler processes */
  readonly action: DeeplinkAction
  /**
   * Handle the deeplink
   * @param deeplink - Parsed deeplink data
   * @returns Result of the handling operation
   */
  handle(deeplink: ParsedDeeplink): Promise<DeeplinkResult>
}
//#endregion
//#region src/main/services/deeplink/router.d.ts
declare class DeeplinkRouter {
  private handlers
  /**
   * Register a handler for a specific action
   */
  register(handler: DeeplinkHandler): void
  /**
   * Unregister a handler
   */
  unregister(action: DeeplinkAction): void
  /**
   * Route a deeplink to its handler
   */
  route(deeplink: ParsedDeeplink): Promise<DeeplinkResult>
  /**
   * Get all registered action types
   */
  getRegisteredActions(): DeeplinkAction[]
  /**
   * Check if an action has a registered handler
   */
  hasHandler(action: DeeplinkAction): boolean
}
//#endregion
//#region src/main/services/deeplink/service.d.ts
declare class DeeplinkService implements IService {
  readonly id = 'deeplink'
  readonly deps: readonly ['ipc', 'window', 'launcher']
  private router
  private ipc
  private windowService
  private pendingDeeplinks
  private isReady
  init(container: ServiceInitContainer<this>): Promise<void>
  /**
   * Mark the service as ready and process any pending deeplinks.
   * Should be called after all services are initialized and window is created.
   */
  markReady(): void
  /**
   * Handle a deeplink URL
   */
  handleDeeplink(url: string): Promise<DeeplinkResult>
  /**
   * Parse a deeplink URL into its components
   */
  private parseDeeplink
  /**
   * Setup handler for second-instance event (Windows/Linux)
   */
  private setupSecondInstance
  /**
   * Setup handler for open-url event (macOS)
   */
  private setupOpenUrl
  /**
   * Focus the main window
   */
  private focusMainWindow
  /**
   * Setup IPC handlers
   */
  private setupIpc
  /**
   * Get the router for external access (e.g., registering custom handlers)
   */
  getRouter(): DeeplinkRouter
}
//#endregion
//#region src/main/services/metadata-updater/handlers/game.d.ts
declare class GameMetadataUpdaterHandler {
  private db
  constructor(db: DbService)
  updateGame(
    gameId: string,
    metadata: GameMetadataUpdateInput,
    options?: UpdateGameMetadataOptions
  ): Promise<UpdateGameMetadataResult>
  private updateGameInternal
  private preCheckExternalIdConflicts
  private replaceGameExternalIds
  private getGameTags
  private replaceGameTags
}
//#endregion
//#region src/main/services/metadata-updater/handlers/person.d.ts
declare class PersonMetadataUpdaterHandler {
  private db
  constructor(db: DbService)
  updatePerson(
    personId: string,
    metadata: PersonMetadataUpdateInput,
    options?: UpdatePersonMetadataOptions
  ): Promise<UpdatePersonMetadataResult>
  private updatePersonInternal
  private preCheckExternalIdConflicts
  private replacePersonExternalIds
  private getPersonTags
  private replacePersonTags
}
//#endregion
//#region src/main/services/metadata-updater/handlers/company.d.ts
declare class CompanyMetadataUpdaterHandler {
  private db
  constructor(db: DbService)
  updateCompany(
    companyId: string,
    metadata: CompanyMetadataUpdateInput,
    options?: UpdateCompanyMetadataOptions
  ): Promise<UpdateCompanyMetadataResult>
  private updateCompanyInternal
  private preCheckExternalIdConflicts
  private replaceCompanyExternalIds
  private getCompanyTags
  private replaceCompanyTags
}
//#endregion
//#region src/main/services/metadata-updater/handlers/character.d.ts
declare class CharacterMetadataUpdaterHandler {
  private db
  constructor(db: DbService)
  updateCharacter(
    characterId: string,
    metadata: CharacterMetadataUpdateInput,
    options?: UpdateCharacterMetadataOptions
  ): Promise<UpdateCharacterMetadataResult>
  private updateCharacterInternal
  private preCheckExternalIdConflicts
  private replaceCharacterExternalIds
  private getCharacterTags
  private replaceCharacterTags
}
//#endregion
//#region src/main/services/metadata-updater/service.d.ts
declare class MetadataUpdaterService implements IContentService {
  readonly id = 'metadata-updater'
  readonly deps: readonly ['db', 'ipc']
  game: GameMetadataUpdaterHandler
  person: PersonMetadataUpdaterHandler
  company: CompanyMetadataUpdaterHandler
  character: CharacterMetadataUpdaterHandler
  init(container: ServiceInitContainer<this>): Promise<void>
  private setupIpcHandlers
  getSupportedContent(): ContentEntityType[]
}
//#endregion
//#region src/main/container/types.d.ts
/**
 * Service initialization status
 */
type ServiceStatus = 'registered' | 'initializing' | 'ready' | 'failed' | 'disposing' | 'disposed'
/**
 * Service Registry - Centralized type mapping for all core services.
 * Used by ServiceContainer.get() for type-safe service retrieval.
 */
interface ServiceRegistry {
  db: DbService
  ipc: IpcService
  network: NetworkService
  window: WindowService
  event: EventService
  native: NativeService
  i18n: I18nService
  scraper: ScraperService
  adder: AdderService
  scanner: ScannerService
  monitor: MonitorService
  launcher: LauncherService
  attachment: AttachmentService
  plugin: PluginService
  notify: NotifyService
  deeplink: DeeplinkService
  'metadata-updater': MetadataUpdaterService
}
/**
 * All registered service names
 */
type ServiceName = keyof ServiceRegistry
/**
 * Get service type by name
 */
type ServiceType<K extends ServiceName> = ServiceRegistry[K]
/**
 * Scoped container view.
 *
 * Exposes only dependency-safe accessors (no escape-hatch overloads like get<T>(string)).
 * Used to restrict what a service can access based on its declared deps.
 */
interface ScopedContainer<Allowed extends ServiceName> {
  get<K extends Allowed>(name: K): ServiceType<K>
  tryGet<K extends Allowed>(name: K): ServiceType<K> | undefined
}
/**
 * Helper to derive the init container type from a service's declared deps.
 */
type ServiceInitContainer<
  T extends {
    deps: readonly ServiceName[]
  }
> = ScopedContainer<T['deps'][number]>
/**
 * Base interface for all services
 */
interface IService<K extends ServiceName = ServiceName> {
  /** Unique service identifier */
  readonly id: K
  /**
   * Explicit dependencies.
   * The container guarantees deps are ready before calling init().
   */
  readonly deps: readonly ServiceName[]
  /**
   * Initialize the service.
   * Called during container.initAll().
   */
  init(container: ScopedContainer<this['deps'][number]>): Promise<void>
  /**
   * Dispose the service and release resources.
   * Called in reverse registration order during shutdown.
   */
  dispose?(): Promise<void>
}
/**
 * Interface for services that support multiple media types.
 * Extend this when a service has media-specific handlers.
 */
interface IMediaService extends IService {
  /**
   * Get the media types this service currently supports.
   */
  getSupportedMedia(): MediaType[]
}
/**
 * Interface for services that operate on content entities.
 */
interface IContentService extends IService {
  /**
   * Get the content entity types this service currently supports.
   */
  getSupportedContent(): ContentEntityType[]
}
//#endregion
//#region src/main/container/container.d.ts
declare class ServiceContainer {
  private services
  private serviceStatus
  private initOrder
  /**
   * Register a service instance (no initialization).
   */
  register<T extends IService>(service: T): Promise<this>
  /**
   * Initialize all registered services in dependency order.
   */
  initAll(): Promise<void>
  /**
   * Get a service by name with automatic type inference.
   * @throws Error if service not registered or not ready
   */
  get<K extends ServiceName>(name: K): ServiceType<K>
  get<T extends IService>(name: string): T
  /**
   * Try to get a service by name.
   * Returns undefined if service not registered or not ready.
   */
  tryGet<K extends ServiceName>(name: K): ServiceType<K> | undefined
  tryGet<T extends IService>(name: string): T | undefined
  /**
   * Check if a service is registered
   */
  has(name: string): boolean
  /**
   * Get the dependency graph for all registered services.
   */
  getGraph(): Record<string, readonly string[]>
  /**
   * Get all registered service names
   */
  getServiceNames(): string[]
  /**
   * Get the status of a service or all services
   */
  getStatus<K extends ServiceName>(name: K): ServiceStatus | undefined
  getStatus(name: string): ServiceStatus | undefined
  getStatus(): Record<string, ServiceStatus>
  /**
   * Check if all services are ready
   */
  isReady(): boolean
  /**
   * Unregister and dispose a service at runtime.
   */
  unregister(name: string): Promise<void>
  /**
   * Dispose all initialized services in reverse init order.
   * Called during application shutdown.
   */
  disposeAll(): Promise<void>
  private computeInitOrder
  private findCycle
  private rollbackInit
}
//#endregion
//#region src/main/services/plugin/context.d.ts
/**
 * Global API provided to main process plugins.
 * Accessed via `kisaki.xxx` global object.
 *
 * Design philosophy: Full exposure - plugins are trusted first-class extensions.
 * They run in the same process with no sandbox, so curated APIs provide no real security.
 */
interface KisakiMainAPI {
  /** Service container - access any registered service via container.get() */
  readonly container: ServiceContainer
  /** Database schema for type-safe queries */
  readonly schema: typeof schema_d_exports
  /** Logger - plugins add their own prefix, e.g. log.info('[MyPlugin]', 'message') */
  readonly log: typeof log
  /**
   * Shared external dependencies.
   * Plugins access these via SDK entry points (e.g., @kisaki/plugin-sdk/main/electron)
   */
  readonly __deps: {
    electron: typeof electron
    drizzle: typeof drizzle_orm0
  }
}
//#endregion
export {
  type AppEventListener,
  type AppEvents,
  type EventEmitOptions,
  type EventUnsubscribe,
  type ExtractIpcData,
  type IService,
  type IpcError,
  type IpcMainHandlers,
  type IpcMainListeners,
  type IpcRendererEvents,
  type IpcResult,
  type IpcSuccess,
  type IpcSuccessVoid,
  type IpcVoidResult,
  type KisakiMainAPI,
  type PluginCategory,
  type PluginManifest,
  type ServiceContainer,
  type ServiceName,
  type ServiceRegistry,
  type ServiceStatus,
  type ServiceType
}
