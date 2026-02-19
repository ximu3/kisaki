/**
 * Kisaki Plugin SDK - Renderer Process Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 * Generated from apps/desktop/src/renderer/src/core/plugin/api.ts
 *
 * @packageDocumentation
 */

import * as drizzle_orm_sqlite_core313 from 'drizzle-orm/sqlite-core'
import { SQLiteTable } from 'drizzle-orm/sqlite-core'
import * as drizzle_orm0 from 'drizzle-orm'
import { InferInsertModel, InferSelectModel, Table } from 'drizzle-orm'
import * as vue0 from 'vue'
import {
  App,
  App as App$1,
  Component,
  ComputedRef,
  HTMLAttributes,
  InjectionKey,
  MaybeRefOrGetter,
  Ref,
  ref
} from 'vue'
import { OpenDialogOptions, OpenDialogReturnValue } from 'electron'
import * as vue_router0 from 'vue-router'
import { Router, Router as Router$1 } from 'vue-router'
import * as pinia3 from 'pinia'
import { Pinia, Pinia as Pinia$1 } from 'pinia'
import log from 'electron-log/renderer'
import * as drizzle_orm_sqlite_proxy0 from 'drizzle-orm/sqlite-proxy'
import { i18n } from 'i18next'
import * as reka_ui17 from 'reka-ui'
import {
  AlertDialogCancelProps,
  AlertDialogContentProps,
  AlertDialogDescriptionProps,
  AlertDialogProps,
  AlertDialogTitleProps,
  AlertDialogTriggerProps,
  CheckboxRootProps,
  CollapsibleContentProps,
  CollapsibleRootProps,
  CollapsibleTriggerProps,
  ContextMenuCheckboxItemProps,
  ContextMenuContentProps,
  ContextMenuGroupProps,
  ContextMenuItemProps,
  ContextMenuLabelProps,
  ContextMenuRadioGroupProps,
  ContextMenuRadioItemProps,
  ContextMenuRootProps,
  ContextMenuSeparatorProps,
  ContextMenuSubContentProps,
  ContextMenuSubProps,
  ContextMenuSubTriggerProps,
  ContextMenuTriggerProps,
  DialogContentProps,
  DialogDescriptionProps,
  DialogOverlayProps,
  DialogRootProps,
  DialogTitleProps,
  DialogTriggerProps,
  DropdownMenuCheckboxItemProps,
  DropdownMenuContentProps,
  DropdownMenuGroupProps,
  DropdownMenuItemProps,
  DropdownMenuLabelProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
  DropdownMenuRootProps,
  DropdownMenuSeparatorProps,
  DropdownMenuSubContentProps,
  DropdownMenuSubProps,
  DropdownMenuSubTriggerProps,
  DropdownMenuTriggerProps,
  HoverCardContentProps,
  HoverCardRootProps,
  HoverCardTriggerProps,
  LabelProps,
  ListboxContentProps,
  ListboxFilterProps,
  ListboxGroupProps,
  ListboxItemProps,
  ListboxRootProps,
  PopoverAnchorProps,
  PopoverContentProps,
  PopoverRootProps,
  PopoverTriggerProps,
  PrimitiveProps,
  ProgressRootProps,
  RadioGroupItemProps,
  RadioGroupRootProps,
  SelectContentProps,
  SelectGroupProps,
  SelectItemProps,
  SelectLabelProps,
  SelectRootProps,
  SelectScrollDownButtonProps,
  SelectScrollUpButtonProps,
  SelectSeparatorProps,
  SelectTriggerProps,
  SelectValueProps,
  SeparatorProps,
  SliderRootProps,
  SwitchRootProps,
  TabsContentProps,
  TabsListProps,
  TabsRootProps,
  TabsTriggerProps,
  TooltipContentProps,
  TooltipProviderProps,
  TooltipRootProps,
  TooltipTriggerProps
} from 'reka-ui'
import * as class_variance_authority_types0 from 'class-variance-authority/types'
import { VariantProps } from 'class-variance-authority'
import * as _tanstack_vue_virtual0 from '@tanstack/vue-virtual'

//#region rolldown:runtime
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
declare namespace index_d_exports$2 {
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
//#region src/renderer/src/utils/registry.d.ts
interface ReactiveRegistry<
  TDefinition extends {
    id: string
  }
> {
  readonly items: Ref<TDefinition[]>
  register(definition: TDefinition): () => void
  unregister(id: string): boolean
  has(id: string): boolean
  get(id: string): TDefinition | undefined
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
//#region src/renderer/src/core/ui-extensions/detail-tabs.d.ts
interface DetailTabDefinition {
  id: string
  label: string
  icon?: string
  order?: number
  component: Component
}
//#endregion
//#region src/renderer/src/core/ui-extensions/menus.d.ts
interface MenuActionDefinition<TContext> {
  id: string
  label: string
  icon?: string
  order?: number
  action: (context: TContext) => void | Promise<void>
  when?: (context: TContext) => boolean
}
interface GameMenuActionContext {
  gameId: string
}
interface GameBatchMenuActionContext {
  gameIds: string[]
}
interface CharacterMenuActionContext {
  characterId: string
}
interface PersonMenuActionContext {
  personId: string
}
interface CompanyMenuActionContext {
  companyId: string
}
interface CollectionMenuActionContext {
  collectionId: string
}
interface TagMenuActionContext {
  tagId: string
}
//#endregion
//#region src/renderer/src/core/ui-extensions/sidebar.d.ts
interface SidebarNavDefinition {
  id: string
  label: string
  icon?: string
  path: string
  order?: number
}
//#endregion
//#region src/renderer/src/core/ui-extensions/settings.d.ts
interface SettingsDialogDefinition {
  id: string
  component: Component
}
//#endregion
//#region src/renderer/src/core/ui-extensions/index.d.ts
type UiExtensions = typeof uiExtensions
declare const uiExtensions: {
  readonly detailTabs: {
    readonly game: ReactiveRegistry<DetailTabDefinition>
    readonly character: ReactiveRegistry<DetailTabDefinition>
    readonly person: ReactiveRegistry<DetailTabDefinition>
    readonly company: ReactiveRegistry<DetailTabDefinition>
    readonly collection: ReactiveRegistry<DetailTabDefinition>
  }
  readonly menus: {
    readonly game: {
      readonly single: ReactiveRegistry<MenuActionDefinition<GameMenuActionContext>>
      readonly batch: ReactiveRegistry<MenuActionDefinition<GameBatchMenuActionContext>>
    }
    readonly character: {
      readonly single: ReactiveRegistry<MenuActionDefinition<CharacterMenuActionContext>>
    }
    readonly person: {
      readonly single: ReactiveRegistry<MenuActionDefinition<PersonMenuActionContext>>
    }
    readonly company: {
      readonly single: ReactiveRegistry<MenuActionDefinition<CompanyMenuActionContext>>
    }
    readonly collection: {
      readonly single: ReactiveRegistry<MenuActionDefinition<CollectionMenuActionContext>>
    }
    readonly tag: {
      readonly single: ReactiveRegistry<MenuActionDefinition<TagMenuActionContext>>
    }
  }
  readonly sidebar: {
    readonly nav: ReactiveRegistry<SidebarNavDefinition>
  }
  readonly settings: {
    readonly plugins: {
      readonly dialogs: ReactiveRegistry<SettingsDialogDefinition>
    }
  }
}
//#endregion
//#region src/renderer/src/core/theme/types.d.ts
interface ThemeDefinition {
  id: string
  name: string
  css: string
}
//#endregion
//#region src/renderer/src/core/theme/manager.d.ts
declare class ThemeManager {
  readonly themes: ReactiveRegistry<ThemeDefinition>
  readonly activeThemeId: vue0.Ref<string, string>
  private readonly activeCss
  constructor()
  registerTheme(definition: ThemeDefinition): () => void
  unregisterTheme(themeId: string): void
  setActiveTheme(themeId: string): void
}
declare const themeManager: ThemeManager
//#endregion
//#region src/shared/attachment.d.ts
/**
 * Crop region for image editing operations
 */
interface CropRegion$1 {
  x: number
  y: number
  width: number
  height: number
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
//#region src/shared/deeplink.d.ts
/**
 * Deeplink Type Definitions
 *
 * Shared types for the kisaki:// deeplink protocol.
 * Used by both main and renderer processes.
 */
/** Deeplink action types */
type DeeplinkAction = 'launch' | 'auth' | 'navigate' | 'scan'
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
    cropRegion: CropRegion$1,
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
//#region src/renderer/src/core/db/proxy.d.ts
declare const db: drizzle_orm_sqlite_proxy0.SqliteRemoteDatabase<typeof index_d_exports$2>
//#endregion
//#region src/renderer/src/core/event.d.ts
declare class EventManager {
  private listeners
  private isReady
  /**
   * Initialize the event manager
   * Sets up IPC listeners for cross-process events
   */
  init(): void
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
   * Emit event only to local listeners (no IPC forwarding)
   */
  private emitLocal
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
declare const eventManager: EventManager
//#endregion
//#region src/renderer/src/core/notify.d.ts
declare const notify: NotifyFunction
//#endregion
//#region src/renderer/src/composables/types.d.ts
/** Union type for content entities */
type ContentEntityData = Game | Character | Person | Company
/** Entity count by type */
interface ContentEntityCounts {
  game: number
  character: number
  person: number
  company: number
}
//#endregion
//#region src/renderer/src/composables/use-async-data.d.ts
/**
 * Options for useAsyncData
 */
interface UseAsyncDataOptions {
  /** Dependencies to watch for refetch */
  watch?: MaybeRefOrGetter<unknown>[]
  /** Whether to fetch immediately (default: true) */
  immediate?: boolean
  /** Whether fetching is enabled (default: true) */
  enabled?: MaybeRefOrGetter<boolean>
}
/**
 * Return type for useAsyncData
 */
interface UseAsyncDataReturn<T> {
  /** The fetched data (undefined before first successful fetch) */
  data: Ref<T | undefined>
  /** True during initial load (no data yet) */
  isLoading: Ref<boolean>
  /** True during any fetch (including refetch) */
  isFetching: Ref<boolean>
  /** Error message if fetch failed */
  error: Ref<string | null>
  /** Fetch counter for keying components */
  fetchId: Ref<number>
  /** Manually trigger refetch */
  refetch: () => Promise<void>
}
/**
 * Async data fetching composable
 *
 * Use computed() to extract fields and provide default values.
 *
 * @example
 * ```ts
 * const { data, isLoading } = useAsyncData(
 *   () => fetchGameData(toValue(gameId)),
 *   { watch: [gameId] }
 * )
 *
 * // Use computed for derived values with defaults
 * const game = computed(() => data.value?.game ?? null)
 * const tags = computed(() => data.value?.tags ?? [])
 * ```
 */
declare function useAsyncData<T>(
  fetcher: (signal?: AbortSignal) => Promise<T>,
  options?: UseAsyncDataOptions
): UseAsyncDataReturn<T>
//#endregion
//#region src/renderer/src/composables/use-debounced-ref.d.ts
declare function useDebouncedRef<T>(source: MaybeRefOrGetter<T>, delay: number): Ref<T>
//#endregion
//#region src/renderer/src/composables/use-delayed-loading.d.ts
/**
 * Preset configurations for different scenarios
 */
declare const LOADING_PRESETS: {
  /** Local database queries (SQLite) - most common */ readonly local: {
    readonly delay: 150
    readonly minDuration: 300
  } /** Network requests - show sooner */
  readonly network: {
    readonly delay: 80
    readonly minDuration: 400
  } /** Heavy computations */
  readonly heavy: {
    readonly delay: 50
    readonly minDuration: 500
  } /** Instant display (bypass delay) */
  readonly instant: {
    readonly delay: 0
    readonly minDuration: 0
  }
}
type LoadingPreset = keyof typeof LOADING_PRESETS
interface DelayedLoadingOptions {
  /** Delay before showing loading indicator (ms). Default: 150 */
  delay?: number
  /** Minimum display duration once shown (ms). Default: 300 */
  minDuration?: number
}
interface UseDelayedLoadingReturn {
  /** Whether to show the loading indicator */
  showLoading: Readonly<ReturnType<typeof ref<boolean>>>
}
/**
 * Creates a delayed loading state that prevents flicker
 *
 * @param isLoading - Reactive loading state to watch
 * @param options - Delay and minimum duration settings, or a preset name
 *
 * @example
 * ```ts
 * // With useAsyncData
 * const { isLoading } = useAsyncData(() => fetchData())
 * const { showLoading } = useDelayedLoading(isLoading)
 *
 * // With preset
 * const { showLoading } = useDelayedLoading(isLoading, 'network')
 *
 * // With custom options
 * const { showLoading } = useDelayedLoading(isLoading, { delay: 200, minDuration: 400 })
 * ```
 */
declare function useDelayedLoading(
  isLoading: MaybeRefOrGetter<boolean>,
  options?: DelayedLoadingOptions | LoadingPreset
): UseDelayedLoadingReturn
//#endregion
//#region src/renderer/src/composables/use-event.d.ts
/**
 * Subscribe to an application event
 *
 * Automatically cleans up subscription on component unmount.
 *
 * @example
 * ```ts
 * useEvent('db:updated', ({ table, id }) => {
 *   if (table === 'games' && id === gameId.value) {
 *     refetch()
 *   }
 * })
 * ```
 */
declare function useEvent<K extends keyof AppEvents>(event: K, handler: AppEventListener<K>): void
/**
 * Subscribe to an application event once
 *
 * Handler is automatically removed after first invocation.
 */
declare function useEventOnce<K extends keyof AppEvents>(
  event: K,
  handler: AppEventListener<K>
): void
//#endregion
//#region src/renderer/src/core/i18n/setup.d.ts
/** i18next instance for renderer process */
declare const i18n$1: i18n
/**
 * Change locale and persist to settings
 * @param locale - AppLocale to set, or null to follow system
 */
declare function setLocale(locale: AppLocale | null): Promise<void>
//#endregion
//#region src/renderer/src/composables/use-i18n.d.ts
interface UseI18nReturn {
  /** Translation function */
  t: typeof i18n$1.t
  /** Current locale (reactive) */
  locale: ComputedRef<AppLocale>
  /** Change locale */
  changeLocale: typeof setLocale
}
/**
 * Composable for i18n in Vue components
 */
declare function useI18n(): UseI18nReturn
//#endregion
//#region src/renderer/src/composables/use-render-state.d.ts
/**
 * Render state for async data
 *
 * - `loading`: Show loading spinner (delay threshold exceeded)
 * - `pending`: Waiting for data but no spinner (fast load, within delay threshold)
 * - `error`: Fetch failed
 * - `not-found`: Data loaded but entity doesn't exist (data === null)
 * - `success`: Data is ready for rendering
 *
 * Note: For list queries, empty array [] is considered 'success'.
 * The component should handle empty state UI separately.
 *
 * Components should treat 'pending' as blank/skeleton state.
 */
type RenderState = 'loading' | 'pending' | 'error' | 'not-found' | 'success'
interface UseRenderStateOptions {
  /** Loading delay preset (default: 'local' for SQLite queries) */
  preset?: LoadingPreset
}
/**
 * Transform async data states into UI render state
 *
 * Handles delayed loading internally to prevent spinner flicker.
 * Use this as the standard way to determine what UI to render.
 *
 * Data state mapping:
 * - `undefined` → 'pending' or 'loading' (not fetched yet)
 * - `null` → 'not-found' (fetched but entity doesn't exist)
 * - `[]` or `{...}` → 'success' (fetched with data)
 *
 * @example
 * ```ts
 * const state = useRenderState(isLoading, error, data)
 *
 * // In template:
 * // state === 'loading' → show spinner
 * // state === 'pending' → show blank/skeleton (fast load, no spinner)
 * // state === 'error' → show error message
 * // state === 'not-found' → show not found
 * // state === 'success' → show content
 * ```
 *
 * @example
 * ```ts
 * // For network requests, use 'network' preset
 * const state = useRenderState(isLoading, error, data, { preset: 'network' })
 * ```
 */
declare function useRenderState(
  isLoading: MaybeRefOrGetter<boolean>,
  error: MaybeRefOrGetter<string | Error | null>,
  data: MaybeRefOrGetter<unknown>,
  options?: UseRenderStateOptions
): ComputedRef<RenderState>
//#endregion
//#region src/renderer/src/components/ui/markdown/types.d.ts
interface MarkdownEditorAttachmentItem {
  url: string
  alt?: string
}
type MarkdownEditorOnAttachment = () => Promise<MarkdownEditorAttachmentItem[]>
//#endregion
//#region src/renderer/src/components/ui/markdown/markdown-editor.vue.d.ts
interface Props$49 {
  placeholder?: string
  class?: string
  minHeight?: string
  maxHeight?: string
  readonly?: boolean
  autofocus?: boolean
  onAttachment?: MarkdownEditorOnAttachment
}
type __VLS_Props$82 = Props$49
declare function replaceSelection(
  text: string,
  range?: {
    from: number
    to: number
  }
): void
declare function wrapSelection(prefix: string, suffix: string): void
declare function insertBlock(block: string): void
type __VLS_ModelProps$6 = {
  modelValue: string
}
type __VLS_PublicProps$6 = __VLS_Props$82 & __VLS_ModelProps$6
declare const __VLS_export$159: vue0.DefineComponent<
  __VLS_PublicProps$6,
  {
    replaceSelection: typeof replaceSelection
    wrapSelection: typeof wrapSelection
    insertBlock: typeof insertBlock
  },
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:modelValue': (value: string) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_PublicProps$6> &
    Readonly<{
      'onUpdate:modelValue'?: ((value: string) => any) | undefined
    }>,
  {
    placeholder: string
    readonly: boolean
    maxHeight: string
    minHeight: string
    autofocus: boolean
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const _default$159: typeof __VLS_export$159
//#endregion
//#region src/renderer/src/composables/use-inline-attachments.d.ts
interface UseInlineAttachmentsOptions<TTable extends SQLiteTable> {
  table: TTable
  rowId: string | Ref<string>
  field: FilesColumns<TTable>
}
declare function useInlineAttachments<TTable extends SQLiteTable>(
  options: UseInlineAttachmentsOptions<TTable>
): {
  readonly setBaselineContent: (content: string) => void
  readonly onAttachment: () => Promise<MarkdownEditorAttachmentItem[]>
  readonly gcOnSave: (nextContent: string) => Promise<void>
  readonly gcOnCancel: () => Promise<void>
}
//#endregion
//#region src/renderer/src/composables/use-game.d.ts
interface GameContext {
  /** Game data */
  game: ComputedRef<Game | null>
  /** Game notes (from gameNotes) */
  notes: ComputedRef<GameNote[]>
  /** Game tags (from gameTagLinks) */
  tags: ComputedRef<
    (GameTagLink & {
      tag: Tag$1 | null
    })[]
  >
  /** Character links with character data */
  characters: ComputedRef<
    (GameCharacterLink & {
      character: Character | null
    })[]
  >
  /** Person links with person data */
  persons: ComputedRef<
    (GamePersonLink & {
      person: Person | null
    })[]
  >
  /** Company links with company data */
  companies: ComputedRef<
    (GameCompanyLink & {
      company: Company | null
    })[]
  >
  /** Game sessions (play history) */
  sessions: ComputedRef<GameSession[]>
  /** Initial loading state */
  isLoading: Ref<boolean>
  /** Background refetching state */
  isFetching: Ref<boolean>
  /** Error if any */
  error: Ref<string | null>
  /** Manually refetch data */
  refetch: () => Promise<void>
}
declare const GameKey: InjectionKey<GameContext>
/**
 * Provide game data context
 *
 * Call this in the parent component (page or provider component).
 *
 * @example
 * ```ts
 * // In game-detail-page.vue
 * const gameId = computed(() => route.params.gameId as string)
 * const { game, isLoading } = useGameProvider(gameId)
 * ```
 */
declare function useGameProvider(
  gameId: MaybeRefOrGetter<string>,
  spoilersRevealed?: MaybeRefOrGetter<boolean>
): GameContext
/**
 * Consume game data context
 *
 * Call this in child components to access game data.
 *
 * @example
 * ```ts
 * // In game-header.vue (child component)
 * const { game } = useGame()
 * ```
 */
declare function useGame(): GameContext
//#endregion
//#region src/renderer/src/composables/use-collection.d.ts
interface CollectionContext {
  /** Collection data */
  collection: ComputedRef<Collection | null>
  /** Entities in the collection for current entity type */
  entities: ComputedRef<ContentEntityData[]>
  /** Current entity type being viewed */
  entityType: ComputedRef<ContentEntityType>
  /** Entity counts for all types */
  entityCounts: ComputedRef<ContentEntityCounts>
  /** For dynamic collections, which entity types have config */
  configuredEntityTypes: ComputedRef<ContentEntityType[]>
  /** Change the current entity type */
  setEntityType: (type: ContentEntityType) => void
  /** Initial loading state */
  isLoading: Ref<boolean>
  /** Background refetching state */
  isFetching: ComputedRef<boolean>
  /** Error if any */
  error: ComputedRef<Error | null>
  /** Manually refetch data */
  refetch: () => Promise<void>
}
declare const CollectionKey: InjectionKey<CollectionContext>
declare function useCollectionProvider(
  collectionId: MaybeRefOrGetter<string>,
  initialEntityType?: ContentEntityType
): CollectionContext
declare function useCollection(): CollectionContext
//#endregion
//#region src/renderer/src/composables/use-person.d.ts
interface PersonContext {
  person: ComputedRef<Person | null>
  tags: ComputedRef<
    (PersonTagLink & {
      tag: Tag$1 | null
    })[]
  >
  games: ComputedRef<
    (GamePersonLink & {
      game: Game | null
    })[]
  >
  characters: ComputedRef<
    (CharacterPersonLink & {
      character: Character | null
    })[]
  >
  isLoading: Ref<boolean>
  isFetching: Ref<boolean>
  error: Ref<string | null>
  refetch: () => Promise<void>
}
declare const PersonKey: InjectionKey<PersonContext>
declare function usePersonProvider(
  personId: MaybeRefOrGetter<string>,
  spoilersRevealed?: MaybeRefOrGetter<boolean>
): PersonContext
declare function usePerson(): PersonContext
//#endregion
//#region src/renderer/src/composables/use-character.d.ts
interface CharacterContext {
  character: ComputedRef<Character | null>
  tags: ComputedRef<
    (CharacterTagLink & {
      tag: Tag$1 | null
    })[]
  >
  games: ComputedRef<
    (GameCharacterLink & {
      game: Game | null
    })[]
  >
  persons: ComputedRef<
    (CharacterPersonLink & {
      person: Person | null
    })[]
  >
  isLoading: Ref<boolean>
  isFetching: Ref<boolean>
  error: Ref<string | null>
  refetch: () => Promise<void>
}
declare const CharacterKey: InjectionKey<CharacterContext>
declare function useCharacterProvider(
  characterId: MaybeRefOrGetter<string>,
  spoilersRevealed?: MaybeRefOrGetter<boolean>
): CharacterContext
declare function useCharacter(): CharacterContext
//#endregion
//#region src/renderer/src/composables/use-company.d.ts
interface CompanyContext {
  company: ComputedRef<Company | null>
  tags: ComputedRef<
    (CompanyTagLink & {
      tag: Tag$1 | null
    })[]
  >
  games: ComputedRef<
    (GameCompanyLink & {
      game: Game | null
    })[]
  >
  isLoading: Ref<boolean>
  isFetching: Ref<boolean>
  error: Ref<string | null>
  refetch: () => Promise<void>
}
declare const CompanyKey: InjectionKey<CompanyContext>
declare function useCompanyProvider(
  companyId: MaybeRefOrGetter<string>,
  spoilersRevealed?: MaybeRefOrGetter<boolean>
): CompanyContext
declare function useCompany(): CompanyContext
//#endregion
//#region src/renderer/src/composables/use-tag.d.ts
interface TagContext {
  /** Tag data */
  tag: ComputedRef<Tag$1 | null>
  /** Entities with this tag for current entity type */
  entities: ComputedRef<ContentEntityData[]>
  /** Current entity type being viewed */
  entityType: ComputedRef<ContentEntityType>
  /** Entity counts for all types */
  entityCounts: ComputedRef<ContentEntityCounts>
  /** Change the current entity type */
  setEntityType: (type: ContentEntityType) => void
  /** Initial loading state */
  isLoading: Ref<boolean>
  /** Background refetching state */
  isFetching: ComputedRef<boolean>
  /** Error if any */
  error: ComputedRef<Error | null>
  /** Manually refetch data */
  refetch: () => Promise<void>
}
declare const TagKey: InjectionKey<TagContext>
declare function useTagProvider(
  tagId: MaybeRefOrGetter<string>,
  initialEntityType?: ContentEntityType
): TagContext
declare function useTag(): TagContext
declare namespace index_d_exports$1 {
  export {
    CharacterContext,
    CharacterKey,
    CollectionContext,
    CollectionKey,
    CompanyContext,
    CompanyKey,
    ContentEntityCounts,
    ContentEntityData,
    DelayedLoadingOptions,
    GameContext,
    GameKey,
    LOADING_PRESETS,
    LoadingPreset,
    PersonContext,
    PersonKey,
    RenderState,
    TagContext,
    TagKey,
    UseAsyncDataOptions,
    UseAsyncDataReturn,
    UseDelayedLoadingReturn,
    UseInlineAttachmentsOptions,
    UseRenderStateOptions,
    useAsyncData,
    useCharacter,
    useCharacterProvider,
    useCollection,
    useCollectionProvider,
    useCompany,
    useCompanyProvider,
    useDebouncedRef,
    useDelayedLoading,
    useEvent,
    useEventOnce,
    useGame,
    useGameProvider,
    useI18n,
    useInlineAttachments,
    usePerson,
    usePersonProvider,
    useRenderState,
    useTag,
    useTagProvider
  }
}
//#endregion
//#region src/renderer/src/stores/theme.d.ts
/**
 * Theme Store
 *
 * Persistent wrapper around the core theme manager:
 * - Persists theme preset selection
 * - Persists theme mode preference (light/dark/system)
 * - Resolves system mode to light/dark and applies via themeManager
 */
type ThemeMode = 'light' | 'dark' | 'system'
declare const useThemeStore: pinia3.StoreDefinition<
  'theme',
  Pick<
    {
      themes: vue0.Ref<ThemeDefinition[], ThemeDefinition[]>
      activeThemeId: vue0.Ref<string, string>
      mode: vue0.Ref<ThemeMode, ThemeMode>
      resolvedTheme: vue0.Ref<'light' | 'dark', 'light' | 'dark'>
      setActiveTheme: (themeId: string) => void
      setMode: (newMode: ThemeMode) => void
    },
    'mode' | 'activeThemeId' | 'themes' | 'resolvedTheme'
  >,
  Pick<
    {
      themes: vue0.Ref<ThemeDefinition[], ThemeDefinition[]>
      activeThemeId: vue0.Ref<string, string>
      mode: vue0.Ref<ThemeMode, ThemeMode>
      resolvedTheme: vue0.Ref<'light' | 'dark', 'light' | 'dark'>
      setActiveTheme: (themeId: string) => void
      setMode: (newMode: ThemeMode) => void
    },
    never
  >,
  Pick<
    {
      themes: vue0.Ref<ThemeDefinition[], ThemeDefinition[]>
      activeThemeId: vue0.Ref<string, string>
      mode: vue0.Ref<ThemeMode, ThemeMode>
      resolvedTheme: vue0.Ref<'light' | 'dark', 'light' | 'dark'>
      setActiveTheme: (themeId: string) => void
      setMode: (newMode: ThemeMode) => void
    },
    'setActiveTheme' | 'setMode'
  >
>
//#endregion
//#region src/renderer/src/stores/game-monitor.d.ts
/**
 * Game Monitor Store
 *
 * Tracks game running status synced from main process.
 * Used for showing running indicators on game cards.
 */
interface GameMonitorStatus {
  isRunning: boolean
  isForeground: boolean
  pid?: number
  startTime?: number
}
declare const useGameMonitorStore: pinia3.StoreDefinition<
  'gameMonitor',
  Pick<
    {
      statuses: vue0.Ref<
        Map<
          string,
          {
            isRunning: boolean
            isForeground: boolean
            pid?: number | undefined
            startTime?: number | undefined
          }
        > &
          Omit<Map<string, GameMonitorStatus>, keyof Map<any, any>>,
        | Map<string, GameMonitorStatus>
        | (Map<
            string,
            {
              isRunning: boolean
              isForeground: boolean
              pid?: number | undefined
              startTime?: number | undefined
            }
          > &
            Omit<Map<string, GameMonitorStatus>, keyof Map<any, any>>)
      >
      initialized: vue0.Ref<boolean, boolean>
      runningGameIds: vue0.ComputedRef<string[]>
      runningCount: vue0.ComputedRef<number>
      setGameStatus: (gameId: string, status: Partial<GameMonitorStatus>) => void
      removeGameStatus: (gameId: string) => void
      clearAllStatuses: () => void
      isGameRunning: (gameId: string) => boolean
      isGameForeground: (gameId: string) => boolean
      getGameStatus: (gameId: string) => GameMonitorStatus | undefined
      init: () => Promise<void>
    },
    'initialized' | 'statuses'
  >,
  Pick<
    {
      statuses: vue0.Ref<
        Map<
          string,
          {
            isRunning: boolean
            isForeground: boolean
            pid?: number | undefined
            startTime?: number | undefined
          }
        > &
          Omit<Map<string, GameMonitorStatus>, keyof Map<any, any>>,
        | Map<string, GameMonitorStatus>
        | (Map<
            string,
            {
              isRunning: boolean
              isForeground: boolean
              pid?: number | undefined
              startTime?: number | undefined
            }
          > &
            Omit<Map<string, GameMonitorStatus>, keyof Map<any, any>>)
      >
      initialized: vue0.Ref<boolean, boolean>
      runningGameIds: vue0.ComputedRef<string[]>
      runningCount: vue0.ComputedRef<number>
      setGameStatus: (gameId: string, status: Partial<GameMonitorStatus>) => void
      removeGameStatus: (gameId: string) => void
      clearAllStatuses: () => void
      isGameRunning: (gameId: string) => boolean
      isGameForeground: (gameId: string) => boolean
      getGameStatus: (gameId: string) => GameMonitorStatus | undefined
      init: () => Promise<void>
    },
    'runningGameIds' | 'runningCount'
  >,
  Pick<
    {
      statuses: vue0.Ref<
        Map<
          string,
          {
            isRunning: boolean
            isForeground: boolean
            pid?: number | undefined
            startTime?: number | undefined
          }
        > &
          Omit<Map<string, GameMonitorStatus>, keyof Map<any, any>>,
        | Map<string, GameMonitorStatus>
        | (Map<
            string,
            {
              isRunning: boolean
              isForeground: boolean
              pid?: number | undefined
              startTime?: number | undefined
            }
          > &
            Omit<Map<string, GameMonitorStatus>, keyof Map<any, any>>)
      >
      initialized: vue0.Ref<boolean, boolean>
      runningGameIds: vue0.ComputedRef<string[]>
      runningCount: vue0.ComputedRef<number>
      setGameStatus: (gameId: string, status: Partial<GameMonitorStatus>) => void
      removeGameStatus: (gameId: string) => void
      clearAllStatuses: () => void
      isGameRunning: (gameId: string) => boolean
      isGameForeground: (gameId: string) => boolean
      getGameStatus: (gameId: string) => GameMonitorStatus | undefined
      init: () => Promise<void>
    },
    | 'init'
    | 'setGameStatus'
    | 'removeGameStatus'
    | 'clearAllStatuses'
    | 'isGameRunning'
    | 'isGameForeground'
    | 'getGameStatus'
  >
>
//#endregion
//#region src/renderer/src/stores/scanner.d.ts
declare const useScannerStore: pinia3.StoreDefinition<
  'scanner',
  Pick<
    {
      scannerStates: vue0.Ref<
        Map<
          string,
          {
            scannerId: string
            total: number
            processedCount: number
            newCount: number
            skippedCount: number
            failedCount: number
            skippedScans: {
              name: string
              path: string
              reason: 'path' | 'externalId'
              existingGameId: string
            }[]
            failedScans: {
              name: string
              reason: string
              path: string
            }[]
            status: 'scanning' | 'completed'
          }
        > &
          Omit<Map<string, ScanProgressData>, keyof Map<any, any>>,
        | Map<string, ScanProgressData>
        | (Map<
            string,
            {
              scannerId: string
              total: number
              processedCount: number
              newCount: number
              skippedCount: number
              failedCount: number
              skippedScans: {
                name: string
                path: string
                reason: 'path' | 'externalId'
                existingGameId: string
              }[]
              failedScans: {
                name: string
                reason: string
                path: string
              }[]
              status: 'scanning' | 'completed'
            }
          > &
            Omit<Map<string, ScanProgressData>, keyof Map<any, any>>)
      >
      initialized: vue0.Ref<boolean, boolean>
      activeScanners: vue0.ComputedRef<ScanProgressData[]>
      hasActiveScans: vue0.ComputedRef<boolean>
      updateScannerState: (id: string, progress: ScanProgressData) => void
      resetScannerState: (id: string) => void
      resetAllScannerStates: () => void
      getScannerState: (id: string) => ScanProgressData | undefined
      init: () => Promise<void>
    },
    'scannerStates' | 'initialized'
  >,
  Pick<
    {
      scannerStates: vue0.Ref<
        Map<
          string,
          {
            scannerId: string
            total: number
            processedCount: number
            newCount: number
            skippedCount: number
            failedCount: number
            skippedScans: {
              name: string
              path: string
              reason: 'path' | 'externalId'
              existingGameId: string
            }[]
            failedScans: {
              name: string
              reason: string
              path: string
            }[]
            status: 'scanning' | 'completed'
          }
        > &
          Omit<Map<string, ScanProgressData>, keyof Map<any, any>>,
        | Map<string, ScanProgressData>
        | (Map<
            string,
            {
              scannerId: string
              total: number
              processedCount: number
              newCount: number
              skippedCount: number
              failedCount: number
              skippedScans: {
                name: string
                path: string
                reason: 'path' | 'externalId'
                existingGameId: string
              }[]
              failedScans: {
                name: string
                reason: string
                path: string
              }[]
              status: 'scanning' | 'completed'
            }
          > &
            Omit<Map<string, ScanProgressData>, keyof Map<any, any>>)
      >
      initialized: vue0.Ref<boolean, boolean>
      activeScanners: vue0.ComputedRef<ScanProgressData[]>
      hasActiveScans: vue0.ComputedRef<boolean>
      updateScannerState: (id: string, progress: ScanProgressData) => void
      resetScannerState: (id: string) => void
      resetAllScannerStates: () => void
      getScannerState: (id: string) => ScanProgressData | undefined
      init: () => Promise<void>
    },
    'activeScanners' | 'hasActiveScans'
  >,
  Pick<
    {
      scannerStates: vue0.Ref<
        Map<
          string,
          {
            scannerId: string
            total: number
            processedCount: number
            newCount: number
            skippedCount: number
            failedCount: number
            skippedScans: {
              name: string
              path: string
              reason: 'path' | 'externalId'
              existingGameId: string
            }[]
            failedScans: {
              name: string
              reason: string
              path: string
            }[]
            status: 'scanning' | 'completed'
          }
        > &
          Omit<Map<string, ScanProgressData>, keyof Map<any, any>>,
        | Map<string, ScanProgressData>
        | (Map<
            string,
            {
              scannerId: string
              total: number
              processedCount: number
              newCount: number
              skippedCount: number
              failedCount: number
              skippedScans: {
                name: string
                path: string
                reason: 'path' | 'externalId'
                existingGameId: string
              }[]
              failedScans: {
                name: string
                reason: string
                path: string
              }[]
              status: 'scanning' | 'completed'
            }
          > &
            Omit<Map<string, ScanProgressData>, keyof Map<any, any>>)
      >
      initialized: vue0.Ref<boolean, boolean>
      activeScanners: vue0.ComputedRef<ScanProgressData[]>
      hasActiveScans: vue0.ComputedRef<boolean>
      updateScannerState: (id: string, progress: ScanProgressData) => void
      resetScannerState: (id: string) => void
      resetAllScannerStates: () => void
      getScannerState: (id: string) => ScanProgressData | undefined
      init: () => Promise<void>
    },
    | 'updateScannerState'
    | 'resetScannerState'
    | 'resetAllScannerStates'
    | 'getScannerState'
    | 'init'
  >
>
//#endregion
//#region src/renderer/src/stores/default-from.d.ts
declare const useDefaultFromStore: pinia3.StoreDefinition<
  'defaultFrom',
  Pick<
    {
      isInitialized: Readonly<Ref<boolean, boolean>>
      getFrom: (entityType: ContentEntityType, entityId: string) => string
      init: () => Promise<void>
      refetchAllStatic: () => Promise<void>
      refetchAllDynamic: () => Promise<void>
      refetchStaticType: (entityType: ContentEntityType) => Promise<void>
      refetchDynamicType: (entityType: ContentEntityType) => Promise<void>
    },
    'isInitialized'
  >,
  Pick<
    {
      isInitialized: Readonly<Ref<boolean, boolean>>
      getFrom: (entityType: ContentEntityType, entityId: string) => string
      init: () => Promise<void>
      refetchAllStatic: () => Promise<void>
      refetchAllDynamic: () => Promise<void>
      refetchStaticType: (entityType: ContentEntityType) => Promise<void>
      refetchDynamicType: (entityType: ContentEntityType) => Promise<void>
    },
    never
  >,
  Pick<
    {
      isInitialized: Readonly<Ref<boolean, boolean>>
      getFrom: (entityType: ContentEntityType, entityId: string) => string
      init: () => Promise<void>
      refetchAllStatic: () => Promise<void>
      refetchAllDynamic: () => Promise<void>
      refetchStaticType: (entityType: ContentEntityType) => Promise<void>
      refetchDynamicType: (entityType: ContentEntityType) => Promise<void>
    },
    | 'init'
    | 'getFrom'
    | 'refetchAllStatic'
    | 'refetchAllDynamic'
    | 'refetchStaticType'
    | 'refetchDynamicType'
  >
>
//#endregion
//#region src/renderer/src/stores/preferences.d.ts
/**
 * Preferences Store
 *
 * Pinia store for user preferences with automatic persistence.
 * Uses pinia-plugin-persistedstate for localStorage sync.
 */
declare const usePreferencesStore: pinia3.StoreDefinition<
  'preferences',
  Pick<
    {
      showNsfw: vue0.Ref<boolean, boolean>
      setShowNsfw: (value: boolean) => void
      toggleShowNsfw: () => void
    },
    'showNsfw'
  >,
  Pick<
    {
      showNsfw: vue0.Ref<boolean, boolean>
      setShowNsfw: (value: boolean) => void
      toggleShowNsfw: () => void
    },
    never
  >,
  Pick<
    {
      showNsfw: vue0.Ref<boolean, boolean>
      setShowNsfw: (value: boolean) => void
      toggleShowNsfw: () => void
    },
    'setShowNsfw' | 'toggleShowNsfw'
  >
>
declare namespace index_d_exports {
  export {
    GameMonitorStatus,
    ThemeMode,
    useDefaultFromStore,
    useGameMonitorStore,
    usePreferencesStore,
    useScannerStore,
    useThemeStore
  }
}
//#endregion
//#region src/renderer/src/components/ui/alert-dialog/alert-dialog.vue.d.ts
declare var __VLS_8$61: {
  open: boolean
  close: () => void
}
type __VLS_Slots$135 = {} & {
  default?: (props: typeof __VLS_8$61) => any
}
declare const __VLS_base$135: vue0.DefineComponent<
  AlertDialogProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:open': (value: boolean) => any
  },
  string,
  vue0.PublicProps,
  Readonly<AlertDialogProps> &
    Readonly<{
      'onUpdate:open'?: ((value: boolean) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$158: __VLS_WithSlots$135<typeof __VLS_base$135, __VLS_Slots$135>
declare const _default$158: typeof __VLS_export$158
type __VLS_WithSlots$135<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/alert-dialog/alert-dialog-trigger.vue.d.ts
declare var __VLS_8$60: {}
type __VLS_Slots$134 = {} & {
  default?: (props: typeof __VLS_8$60) => any
}
declare const __VLS_base$134: vue0.DefineComponent<
  AlertDialogTriggerProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<AlertDialogTriggerProps> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$157: __VLS_WithSlots$134<typeof __VLS_base$134, __VLS_Slots$134>
declare const _default$157: typeof __VLS_export$157
type __VLS_WithSlots$134<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/alert-dialog/alert-dialog-content.vue.d.ts
type __VLS_Props$81 = AlertDialogContentProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_19: {}
type __VLS_Slots$133 = {} & {
  default?: (props: typeof __VLS_19) => any
}
declare const __VLS_base$133: vue0.DefineComponent<
  __VLS_Props$81,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    escapeKeyDown: (event: KeyboardEvent) => any
    pointerDownOutside: (event: reka_ui17.PointerDownOutsideEvent) => any
    focusOutside: (event: reka_ui17.FocusOutsideEvent) => any
    interactOutside: (event: reka_ui17.PointerDownOutsideEvent | reka_ui17.FocusOutsideEvent) => any
    openAutoFocus: (event: Event) => any
    closeAutoFocus: (event: Event) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$81> &
    Readonly<{
      onEscapeKeyDown?: ((event: KeyboardEvent) => any) | undefined
      onPointerDownOutside?: ((event: reka_ui17.PointerDownOutsideEvent) => any) | undefined
      onFocusOutside?: ((event: reka_ui17.FocusOutsideEvent) => any) | undefined
      onInteractOutside?:
        | ((event: reka_ui17.PointerDownOutsideEvent | reka_ui17.FocusOutsideEvent) => any)
        | undefined
      onOpenAutoFocus?: ((event: Event) => any) | undefined
      onCloseAutoFocus?: ((event: Event) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$156: __VLS_WithSlots$133<typeof __VLS_base$133, __VLS_Slots$133>
declare const _default$156: typeof __VLS_export$156
type __VLS_WithSlots$133<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/alert-dialog/alert-dialog-header.vue.d.ts
interface Props$48 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$49: {}
type __VLS_Slots$132 = {} & {
  default?: (props: typeof __VLS_1$49) => any
}
declare const __VLS_base$132: vue0.DefineComponent<
  Props$48,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$48> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$155: __VLS_WithSlots$132<typeof __VLS_base$132, __VLS_Slots$132>
declare const _default$155: typeof __VLS_export$155
type __VLS_WithSlots$132<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/alert-dialog/alert-dialog-title.vue.d.ts
type __VLS_Props$80 = AlertDialogTitleProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_8$59: {}
type __VLS_Slots$131 = {} & {
  default?: (props: typeof __VLS_8$59) => any
}
declare const __VLS_base$131: vue0.DefineComponent<
  __VLS_Props$80,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$80> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$154: __VLS_WithSlots$131<typeof __VLS_base$131, __VLS_Slots$131>
declare const _default$154: typeof __VLS_export$154
type __VLS_WithSlots$131<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/alert-dialog/alert-dialog-description.vue.d.ts
type __VLS_Props$79 = AlertDialogDescriptionProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_8$58: {}
type __VLS_Slots$130 = {} & {
  default?: (props: typeof __VLS_8$58) => any
}
declare const __VLS_base$130: vue0.DefineComponent<
  __VLS_Props$79,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$79> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$153: __VLS_WithSlots$130<typeof __VLS_base$130, __VLS_Slots$130>
declare const _default$153: typeof __VLS_export$153
type __VLS_WithSlots$130<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/alert-dialog/alert-dialog-footer.vue.d.ts
interface Props$47 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$48: {}
type __VLS_Slots$129 = {} & {
  default?: (props: typeof __VLS_1$48) => any
}
declare const __VLS_base$129: vue0.DefineComponent<
  Props$47,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$47> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$152: __VLS_WithSlots$129<typeof __VLS_base$129, __VLS_Slots$129>
declare const _default$152: typeof __VLS_export$152
type __VLS_WithSlots$129<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/alert-dialog/alert-dialog-action.vue.d.ts
type __VLS_Props$78 = {
  class?: HTMLAttributes['class']
  disabled?: boolean
}
declare var __VLS_8$57: {}
type __VLS_Slots$128 = {} & {
  default?: (props: typeof __VLS_8$57) => any
}
declare const __VLS_base$128: vue0.DefineComponent<
  __VLS_Props$78,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$78> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$151: __VLS_WithSlots$128<typeof __VLS_base$128, __VLS_Slots$128>
declare const _default$151: typeof __VLS_export$151
type __VLS_WithSlots$128<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/alert-dialog/alert-dialog-cancel.vue.d.ts
type __VLS_Props$77 = AlertDialogCancelProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_8$56: {}
type __VLS_Slots$127 = {} & {
  default?: (props: typeof __VLS_8$56) => any
}
declare const __VLS_base$127: vue0.DefineComponent<
  __VLS_Props$77,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$77> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$150: __VLS_WithSlots$127<typeof __VLS_base$127, __VLS_Slots$127>
declare const _default$150: typeof __VLS_export$150
type __VLS_WithSlots$127<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/button-group/button-group.vue.d.ts
type __VLS_Props$76 = {
  class?: HTMLAttributes['class']
  orientation?: ButtonGroupVariants['orientation']
}
declare var __VLS_1$47: {}
type __VLS_Slots$126 = {} & {
  default?: (props: typeof __VLS_1$47) => any
}
declare const __VLS_base$126: vue0.DefineComponent<
  __VLS_Props$76,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$76> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$149: __VLS_WithSlots$126<typeof __VLS_base$126, __VLS_Slots$126>
declare const _default$149: typeof __VLS_export$149
type __VLS_WithSlots$126<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/button-group/button-group-separator.vue.d.ts
type __VLS_Props$75 = SeparatorProps & {
  class?: HTMLAttributes['class']
}
declare const __VLS_export$148: vue0.DefineComponent<
  __VLS_Props$75,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$75> & Readonly<{}>,
  {
    orientation: 'horizontal' | 'vertical'
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const _default$148: typeof __VLS_export$148
//#endregion
//#region src/renderer/src/components/ui/button-group/button-group-text.vue.d.ts
interface Props$46 extends PrimitiveProps {
  class?: HTMLAttributes['class']
}
declare var __VLS_8$55: {}
type __VLS_Slots$125 = {} & {
  default?: (props: typeof __VLS_8$55) => any
}
declare const __VLS_base$125: vue0.DefineComponent<
  Props$46,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$46> & Readonly<{}>,
  {
    as: reka_ui17.AsTag | vue0.Component
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$147: __VLS_WithSlots$125<typeof __VLS_base$125, __VLS_Slots$125>
declare const _default$147: typeof __VLS_export$147
type __VLS_WithSlots$125<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/button-group/index.d.ts
declare const buttonGroupVariants: (
  props?:
    | ({
        orientation?: 'horizontal' | 'vertical' | null | undefined
      } & class_variance_authority_types0.ClassProp)
    | undefined
) => string
type ButtonGroupVariants = VariantProps<typeof buttonGroupVariants>
//#endregion
//#region src/renderer/src/components/ui/card/card.vue.d.ts
interface Props$45 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$46: {}
type __VLS_Slots$124 = {} & {
  default?: (props: typeof __VLS_1$46) => any
}
declare const __VLS_base$124: vue0.DefineComponent<
  Props$45,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$45> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$146: __VLS_WithSlots$124<typeof __VLS_base$124, __VLS_Slots$124>
declare const _default$146: typeof __VLS_export$146
type __VLS_WithSlots$124<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/card/card-header.vue.d.ts
interface Props$44 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$45: {}
type __VLS_Slots$123 = {} & {
  default?: (props: typeof __VLS_1$45) => any
}
declare const __VLS_base$123: vue0.DefineComponent<
  Props$44,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$44> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$145: __VLS_WithSlots$123<typeof __VLS_base$123, __VLS_Slots$123>
declare const _default$145: typeof __VLS_export$145
type __VLS_WithSlots$123<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/card/card-title.vue.d.ts
interface Props$43 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$44: {}
type __VLS_Slots$122 = {} & {
  default?: (props: typeof __VLS_1$44) => any
}
declare const __VLS_base$122: vue0.DefineComponent<
  Props$43,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$43> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$144: __VLS_WithSlots$122<typeof __VLS_base$122, __VLS_Slots$122>
declare const _default$144: typeof __VLS_export$144
type __VLS_WithSlots$122<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/card/card-description.vue.d.ts
interface Props$42 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$43: {}
type __VLS_Slots$121 = {} & {
  default?: (props: typeof __VLS_1$43) => any
}
declare const __VLS_base$121: vue0.DefineComponent<
  Props$42,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$42> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$143: __VLS_WithSlots$121<typeof __VLS_base$121, __VLS_Slots$121>
declare const _default$143: typeof __VLS_export$143
type __VLS_WithSlots$121<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/card/card-content.vue.d.ts
interface Props$41 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$42: {}
type __VLS_Slots$120 = {} & {
  default?: (props: typeof __VLS_1$42) => any
}
declare const __VLS_base$120: vue0.DefineComponent<
  Props$41,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$41> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$142: __VLS_WithSlots$120<typeof __VLS_base$120, __VLS_Slots$120>
declare const _default$142: typeof __VLS_export$142
type __VLS_WithSlots$120<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/card/card-footer.vue.d.ts
interface Props$40 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$41: {}
type __VLS_Slots$119 = {} & {
  default?: (props: typeof __VLS_1$41) => any
}
declare const __VLS_base$119: vue0.DefineComponent<
  Props$40,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$40> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$141: __VLS_WithSlots$119<typeof __VLS_base$119, __VLS_Slots$119>
declare const _default$141: typeof __VLS_export$141
type __VLS_WithSlots$119<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/card/card-action.vue.d.ts
interface Props$39 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$40: {}
type __VLS_Slots$118 = {} & {
  default?: (props: typeof __VLS_1$40) => any
}
declare const __VLS_base$118: vue0.DefineComponent<
  Props$39,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$39> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$140: __VLS_WithSlots$118<typeof __VLS_base$118, __VLS_Slots$118>
declare const _default$140: typeof __VLS_export$140
type __VLS_WithSlots$118<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/collapsible/collapsible.vue.d.ts
declare var __VLS_8$54: {
  open: boolean
}
type __VLS_Slots$117 = {} & {
  default?: (props: typeof __VLS_8$54) => any
}
declare const __VLS_base$117: vue0.DefineComponent<
  CollapsibleRootProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:open': (value: boolean) => any
  },
  string,
  vue0.PublicProps,
  Readonly<CollapsibleRootProps> &
    Readonly<{
      'onUpdate:open'?: ((value: boolean) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$139: __VLS_WithSlots$117<typeof __VLS_base$117, __VLS_Slots$117>
declare const _default$139: typeof __VLS_export$139
type __VLS_WithSlots$117<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/collapsible/collapsible-trigger.vue.d.ts
declare var __VLS_8$53: {}
type __VLS_Slots$116 = {} & {
  default?: (props: typeof __VLS_8$53) => any
}
declare const __VLS_base$116: vue0.DefineComponent<
  CollapsibleTriggerProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<CollapsibleTriggerProps> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$138: __VLS_WithSlots$116<typeof __VLS_base$116, __VLS_Slots$116>
declare const _default$138: typeof __VLS_export$138
type __VLS_WithSlots$116<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/collapsible/collapsible-content.vue.d.ts
type __VLS_Props$74 = CollapsibleContentProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_8$52: {}
type __VLS_Slots$115 = {} & {
  default?: (props: typeof __VLS_8$52) => any
}
declare const __VLS_base$115: vue0.DefineComponent<
  __VLS_Props$74,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$74> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$137: __VLS_WithSlots$115<typeof __VLS_base$115, __VLS_Slots$115>
declare const _default$137: typeof __VLS_export$137
type __VLS_WithSlots$115<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/collapsible/collapsible-group-variants.d.ts
declare const collapsibleGroupVariants: (
  props?:
    | ({
        variant?: 'default' | 'sidebar' | null | undefined
      } & class_variance_authority_types0.ClassProp)
    | undefined
) => string
declare const collapsibleGroupTriggerVariants: (
  props?:
    | ({
        variant?: 'default' | 'sidebar' | null | undefined
      } & class_variance_authority_types0.ClassProp)
    | undefined
) => string
declare const collapsibleGroupToggleVariants: (
  props?:
    | ({
        variant?: 'default' | 'sidebar' | null | undefined
      } & class_variance_authority_types0.ClassProp)
    | undefined
) => string
declare const collapsibleGroupContentVariants: (
  props?:
    | ({
        variant?: 'default' | 'sidebar' | null | undefined
      } & class_variance_authority_types0.ClassProp)
    | undefined
) => string
//#endregion
//#region src/renderer/src/components/ui/collapsible/collapsible-group-types.d.ts
type CollapsibleGroupVariants = VariantProps<typeof collapsibleGroupVariants>
type CollapsibleGroupTriggerVariants = VariantProps<typeof collapsibleGroupTriggerVariants>
type CollapsibleGroupToggleVariants = VariantProps<typeof collapsibleGroupToggleVariants>
type CollapsibleGroupContentVariants = VariantProps<typeof collapsibleGroupContentVariants>
interface CollapsibleGroupProps {
  variant?: CollapsibleGroupVariants['variant']
  class?: HTMLAttributes['class']
}
interface CollapsibleGroupTriggerProps {
  variant?: CollapsibleGroupTriggerVariants['variant']
  collapsed?: boolean
  class?: HTMLAttributes['class']
}
interface CollapsibleGroupToggleProps {
  variant?: CollapsibleGroupToggleVariants['variant']
  collapsed?: boolean
  class?: HTMLAttributes['class']
}
interface CollapsibleGroupContentProps {
  variant?: CollapsibleGroupContentVariants['variant']
  collapsed?: boolean
  class?: HTMLAttributes['class']
}
//#endregion
//#region src/renderer/src/components/ui/collapsible/collapsible-group.vue.d.ts
declare var __VLS_1$39: {}
type __VLS_Slots$114 = {} & {
  default?: (props: typeof __VLS_1$39) => any
}
declare const __VLS_base$114: vue0.DefineComponent<
  CollapsibleGroupProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<CollapsibleGroupProps> & Readonly<{}>,
  {
    variant: 'default' | 'sidebar' | null
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$136: __VLS_WithSlots$114<typeof __VLS_base$114, __VLS_Slots$114>
declare const _default$136: typeof __VLS_export$136
type __VLS_WithSlots$114<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/collapsible/collapsible-group-trigger.vue.d.ts
declare var __VLS_1$38: {}
type __VLS_Slots$113 = {} & {
  default?: (props: typeof __VLS_1$38) => any
}
declare const __VLS_base$113: vue0.DefineComponent<
  CollapsibleGroupTriggerProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<CollapsibleGroupTriggerProps> & Readonly<{}>,
  {
    variant: 'default' | 'sidebar' | null
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$135: __VLS_WithSlots$113<typeof __VLS_base$113, __VLS_Slots$113>
declare const _default$135: typeof __VLS_export$135
type __VLS_WithSlots$113<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/collapsible/collapsible-group-toggle.vue.d.ts
declare const __VLS_export$134: vue0.DefineComponent<
  CollapsibleGroupToggleProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    click: (event: MouseEvent) => any
  },
  string,
  vue0.PublicProps,
  Readonly<CollapsibleGroupToggleProps> &
    Readonly<{
      onClick?: ((event: MouseEvent) => any) | undefined
    }>,
  {
    variant: 'default' | 'sidebar' | null
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const _default$134: typeof __VLS_export$134
//#endregion
//#region src/renderer/src/components/ui/collapsible/collapsible-group-label.vue.d.ts
interface Props$38 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$37: {}
type __VLS_Slots$112 = {} & {
  default?: (props: typeof __VLS_1$37) => any
}
declare const __VLS_base$112: vue0.DefineComponent<
  Props$38,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$38> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$133: __VLS_WithSlots$112<typeof __VLS_base$112, __VLS_Slots$112>
declare const _default$133: typeof __VLS_export$133
type __VLS_WithSlots$112<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/collapsible/collapsible-group-count.vue.d.ts
interface Props$37 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$36: {}
type __VLS_Slots$111 = {} & {
  default?: (props: typeof __VLS_1$36) => any
}
declare const __VLS_base$111: vue0.DefineComponent<
  Props$37,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$37> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$132: __VLS_WithSlots$111<typeof __VLS_base$111, __VLS_Slots$111>
declare const _default$132: typeof __VLS_export$132
type __VLS_WithSlots$111<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/collapsible/collapsible-group-content.vue.d.ts
declare var __VLS_1$35: {}
type __VLS_Slots$110 = {} & {
  default?: (props: typeof __VLS_1$35) => any
}
declare const __VLS_base$110: vue0.DefineComponent<
  CollapsibleGroupContentProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<CollapsibleGroupContentProps> & Readonly<{}>,
  {
    variant: 'default' | 'sidebar' | null
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$131: __VLS_WithSlots$110<typeof __VLS_base$110, __VLS_Slots$110>
declare const _default$131: typeof __VLS_export$131
type __VLS_WithSlots$110<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/command/command.vue.d.ts
type __VLS_Props$73 = ListboxRootProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_8$51: {}
type __VLS_Slots$109 = {} & {
  default?: (props: typeof __VLS_8$51) => any
}
declare const __VLS_base$109: vue0.DefineComponent<
  __VLS_Props$73,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:modelValue': (value: reka_ui17.AcceptableValue) => any
    highlight: (
      payload:
        | {
            ref: HTMLElement
            value: reka_ui17.AcceptableValue
          }
        | undefined
    ) => any
    entryFocus: (event: CustomEvent<any>) => any
    leave: (event: Event) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$73> &
    Readonly<{
      'onUpdate:modelValue'?: ((value: reka_ui17.AcceptableValue) => any) | undefined
      onHighlight?:
        | ((
            payload:
              | {
                  ref: HTMLElement
                  value: reka_ui17.AcceptableValue
                }
              | undefined
          ) => any)
        | undefined
      onEntryFocus?: ((event: CustomEvent<any>) => any) | undefined
      onLeave?: ((event: Event) => any) | undefined
    }>,
  {
    modelValue: reka_ui17.AcceptableValue | reka_ui17.AcceptableValue[]
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$130: __VLS_WithSlots$109<typeof __VLS_base$109, __VLS_Slots$109>
declare const _default$130: typeof __VLS_export$130
type __VLS_WithSlots$109<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/command/command-dialog.vue.d.ts
type __VLS_Props$72 = DialogRootProps & {
  title?: string
  description?: string
}
declare var __VLS_38: {
  open: boolean
  close: () => void
}
type __VLS_Slots$108 = {} & {
  default?: (props: typeof __VLS_38) => any
}
declare const __VLS_base$108: vue0.DefineComponent<
  __VLS_Props$72,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:open': (value: boolean) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$72> &
    Readonly<{
      'onUpdate:open'?: ((value: boolean) => any) | undefined
    }>,
  {
    description: string
    title: string
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$129: __VLS_WithSlots$108<typeof __VLS_base$108, __VLS_Slots$108>
declare const _default$129: typeof __VLS_export$129
type __VLS_WithSlots$108<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/command/command-empty.vue.d.ts
type __VLS_Props$71 = PrimitiveProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_8$50: {}
type __VLS_Slots$107 = {} & {
  default?: (props: typeof __VLS_8$50) => any
}
declare const __VLS_base$107: vue0.DefineComponent<
  __VLS_Props$71,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$71> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$128: __VLS_WithSlots$107<typeof __VLS_base$107, __VLS_Slots$107>
declare const _default$128: typeof __VLS_export$128
type __VLS_WithSlots$107<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/command/command-group.vue.d.ts
type __VLS_Props$70 = ListboxGroupProps & {
  class?: HTMLAttributes['class']
  heading?: string
}
declare var __VLS_14$14: {}
type __VLS_Slots$106 = {} & {
  default?: (props: typeof __VLS_14$14) => any
}
declare const __VLS_base$106: vue0.DefineComponent<
  __VLS_Props$70,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$70> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$127: __VLS_WithSlots$106<typeof __VLS_base$106, __VLS_Slots$106>
declare const _default$127: typeof __VLS_export$127
type __VLS_WithSlots$106<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/command/command-input.vue.d.ts
type __VLS_Props$69 = ListboxFilterProps & {
  class?: HTMLAttributes['class']
}
declare const __VLS_export$126: vue0.DefineComponent<
  __VLS_Props$69,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$69> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const _default$126: typeof __VLS_export$126
//#endregion
//#region src/renderer/src/components/ui/command/command-item.vue.d.ts
type __VLS_Props$68 = ListboxItemProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_11: {}
type __VLS_Slots$105 = {} & {
  default?: (props: typeof __VLS_11) => any
}
declare const __VLS_base$105: vue0.DefineComponent<
  __VLS_Props$68,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    select: (event: reka_ui17.ListboxItemSelectEvent<reka_ui17.AcceptableValue>) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$68> &
    Readonly<{
      onSelect?:
        | ((event: reka_ui17.ListboxItemSelectEvent<reka_ui17.AcceptableValue>) => any)
        | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$125: __VLS_WithSlots$105<typeof __VLS_base$105, __VLS_Slots$105>
declare const _default$125: typeof __VLS_export$125
type __VLS_WithSlots$105<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/command/command-list.vue.d.ts
type __VLS_Props$67 = ListboxContentProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_8$49: {}
type __VLS_Slots$104 = {} & {
  default?: (props: typeof __VLS_8$49) => any
}
declare const __VLS_base$104: vue0.DefineComponent<
  __VLS_Props$67,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$67> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$124: __VLS_WithSlots$104<typeof __VLS_base$104, __VLS_Slots$104>
declare const _default$124: typeof __VLS_export$124
type __VLS_WithSlots$104<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/command/command-separator.vue.d.ts
type __VLS_Props$66 = SeparatorProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_8$48: {}
type __VLS_Slots$103 = {} & {
  default?: (props: typeof __VLS_8$48) => any
}
declare const __VLS_base$103: vue0.DefineComponent<
  __VLS_Props$66,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$66> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$123: __VLS_WithSlots$103<typeof __VLS_base$103, __VLS_Slots$103>
declare const _default$123: typeof __VLS_export$123
type __VLS_WithSlots$103<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/command/command-shortcut.vue.d.ts
type __VLS_Props$65 = {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$34: {}
type __VLS_Slots$102 = {} & {
  default?: (props: typeof __VLS_1$34) => any
}
declare const __VLS_base$102: vue0.DefineComponent<
  __VLS_Props$65,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$65> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$122: __VLS_WithSlots$102<typeof __VLS_base$102, __VLS_Slots$102>
declare const _default$122: typeof __VLS_export$122
type __VLS_WithSlots$102<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/command/index.d.ts
declare const useCommand: <
    T extends
      | {
          allItems: Ref<Map<string, string>>
          allGroups: Ref<Map<string, Set<string>>>
          filterState: {
            search: string
            filtered: {
              count: number
              items: Map<string, number>
              groups: Set<string>
            }
          }
        }
      | null
      | undefined = {
      allItems: Ref<Map<string, string>>
      allGroups: Ref<Map<string, Set<string>>>
      filterState: {
        search: string
        filtered: {
          count: number
          items: Map<string, number>
          groups: Set<string>
        }
      }
    }
  >(
    fallback?: T | undefined
  ) => T extends null
    ? {
        allItems: Ref<Map<string, string>>
        allGroups: Ref<Map<string, Set<string>>>
        filterState: {
          search: string
          filtered: {
            count: number
            items: Map<string, number>
            groups: Set<string>
          }
        }
      } | null
    : {
        allItems: Ref<Map<string, string>>
        allGroups: Ref<Map<string, Set<string>>>
        filterState: {
          search: string
          filtered: {
            count: number
            items: Map<string, number>
            groups: Set<string>
          }
        }
      },
  provideCommandContext: (contextValue: {
    allItems: Ref<Map<string, string>>
    allGroups: Ref<Map<string, Set<string>>>
    filterState: {
      search: string
      filtered: {
        count: number
        items: Map<string, number>
        groups: Set<string>
      }
    }
  }) => {
    allItems: Ref<Map<string, string>>
    allGroups: Ref<Map<string, Set<string>>>
    filterState: {
      search: string
      filtered: {
        count: number
        items: Map<string, number>
        groups: Set<string>
      }
    }
  }
declare const useCommandGroup: <
    T extends
      | {
          id?: string
        }
      | null
      | undefined = {
      id?: string
    }
  >(
    fallback?: T | undefined
  ) => T extends null
    ? {
        id?: string
      } | null
    : {
        id?: string
      },
  provideCommandGroupContext: (contextValue: { id?: string }) => {
    id?: string
  }
//#endregion
//#region src/renderer/src/components/ui/context-menu/context-menu.vue.d.ts
declare var __VLS_8$47: {}
type __VLS_Slots$101 = {} & {
  default?: (props: typeof __VLS_8$47) => any
}
declare const __VLS_base$101: vue0.DefineComponent<
  ContextMenuRootProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:open': (payload: boolean) => any
  },
  string,
  vue0.PublicProps,
  Readonly<ContextMenuRootProps> &
    Readonly<{
      'onUpdate:open'?: ((payload: boolean) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$121: __VLS_WithSlots$101<typeof __VLS_base$101, __VLS_Slots$101>
declare const _default$121: typeof __VLS_export$121
type __VLS_WithSlots$101<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/context-menu/context-menu-trigger.vue.d.ts
declare var __VLS_8$46: {}
type __VLS_Slots$100 = {} & {
  default?: (props: typeof __VLS_8$46) => any
}
declare const __VLS_base$100: vue0.DefineComponent<
  ContextMenuTriggerProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<ContextMenuTriggerProps> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$120: __VLS_WithSlots$100<typeof __VLS_base$100, __VLS_Slots$100>
declare const _default$120: typeof __VLS_export$120
type __VLS_WithSlots$100<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/context-menu/context-menu-content.vue.d.ts
type __VLS_Props$64 = ContextMenuContentProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_14$13: {}
type __VLS_Slots$99 = {} & {
  default?: (props: typeof __VLS_14$13) => any
}
declare const __VLS_base$99: vue0.DefineComponent<
  __VLS_Props$64,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    escapeKeyDown: (event: KeyboardEvent) => any
    pointerDownOutside: (event: reka_ui17.PointerDownOutsideEvent) => any
    focusOutside: (event: reka_ui17.FocusOutsideEvent) => any
    interactOutside: (event: reka_ui17.PointerDownOutsideEvent | reka_ui17.FocusOutsideEvent) => any
    closeAutoFocus: (event: Event) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$64> &
    Readonly<{
      onEscapeKeyDown?: ((event: KeyboardEvent) => any) | undefined
      onPointerDownOutside?: ((event: reka_ui17.PointerDownOutsideEvent) => any) | undefined
      onFocusOutside?: ((event: reka_ui17.FocusOutsideEvent) => any) | undefined
      onInteractOutside?:
        | ((event: reka_ui17.PointerDownOutsideEvent | reka_ui17.FocusOutsideEvent) => any)
        | undefined
      onCloseAutoFocus?: ((event: Event) => any) | undefined
    }>,
  {
    collisionPadding: number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$119: __VLS_WithSlots$99<typeof __VLS_base$99, __VLS_Slots$99>
declare const _default$119: typeof __VLS_export$119
type __VLS_WithSlots$99<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/context-menu/context-menu-item.vue.d.ts
type __VLS_Props$63 = ContextMenuItemProps & {
  class?: HTMLAttributes['class']
  inset?: boolean
  variant?: 'default' | 'destructive'
}
declare var __VLS_8$45: {}
type __VLS_Slots$98 = {} & {
  default?: (props: typeof __VLS_8$45) => any
}
declare const __VLS_base$98: vue0.DefineComponent<
  __VLS_Props$63,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    select: (event: Event) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$63> &
    Readonly<{
      onSelect?: ((event: Event) => any) | undefined
    }>,
  {
    variant: 'default' | 'destructive'
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$118: __VLS_WithSlots$98<typeof __VLS_base$98, __VLS_Slots$98>
declare const _default$118: typeof __VLS_export$118
type __VLS_WithSlots$98<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/context-menu/context-menu-separator.vue.d.ts
type __VLS_Props$62 = ContextMenuSeparatorProps & {
  class?: HTMLAttributes['class']
}
declare const __VLS_export$117: vue0.DefineComponent<
  __VLS_Props$62,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$62> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const _default$117: typeof __VLS_export$117
//#endregion
//#region src/renderer/src/components/ui/context-menu/context-menu-label.vue.d.ts
type __VLS_Props$61 = ContextMenuLabelProps & {
  class?: HTMLAttributes['class']
  inset?: boolean
}
declare var __VLS_8$44: {}
type __VLS_Slots$97 = {} & {
  default?: (props: typeof __VLS_8$44) => any
}
declare const __VLS_base$97: vue0.DefineComponent<
  __VLS_Props$61,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$61> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$116: __VLS_WithSlots$97<typeof __VLS_base$97, __VLS_Slots$97>
declare const _default$116: typeof __VLS_export$116
type __VLS_WithSlots$97<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/context-menu/context-menu-group.vue.d.ts
declare var __VLS_8$43: {}
type __VLS_Slots$96 = {} & {
  default?: (props: typeof __VLS_8$43) => any
}
declare const __VLS_base$96: vue0.DefineComponent<
  ContextMenuGroupProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<ContextMenuGroupProps> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$115: __VLS_WithSlots$96<typeof __VLS_base$96, __VLS_Slots$96>
declare const _default$115: typeof __VLS_export$115
type __VLS_WithSlots$96<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/context-menu/context-menu-sub.vue.d.ts
declare var __VLS_8$42: {}
type __VLS_Slots$95 = {} & {
  default?: (props: typeof __VLS_8$42) => any
}
declare const __VLS_base$95: vue0.DefineComponent<
  ContextMenuSubProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:open': (payload: boolean) => any
  },
  string,
  vue0.PublicProps,
  Readonly<ContextMenuSubProps> &
    Readonly<{
      'onUpdate:open'?: ((payload: boolean) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$114: __VLS_WithSlots$95<typeof __VLS_base$95, __VLS_Slots$95>
declare const _default$114: typeof __VLS_export$114
type __VLS_WithSlots$95<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/context-menu/context-menu-sub-trigger.vue.d.ts
type __VLS_Props$60 = ContextMenuSubTriggerProps & {
  class?: HTMLAttributes['class']
  inset?: boolean
}
declare var __VLS_8$41: {}
type __VLS_Slots$94 = {} & {
  default?: (props: typeof __VLS_8$41) => any
}
declare const __VLS_base$94: vue0.DefineComponent<
  __VLS_Props$60,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$60> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$113: __VLS_WithSlots$94<typeof __VLS_base$94, __VLS_Slots$94>
declare const _default$113: typeof __VLS_export$113
type __VLS_WithSlots$94<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/context-menu/context-menu-sub-content.vue.d.ts
type __VLS_Props$59 = ContextMenuSubContentProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_14$12: {}
type __VLS_Slots$93 = {} & {
  default?: (props: typeof __VLS_14$12) => any
}
declare const __VLS_base$93: vue0.DefineComponent<
  __VLS_Props$59,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    entryFocus: (event: Event) => any
    escapeKeyDown: (event: KeyboardEvent) => any
    pointerDownOutside: (event: reka_ui17.PointerDownOutsideEvent) => any
    focusOutside: (event: reka_ui17.FocusOutsideEvent) => any
    interactOutside: (event: reka_ui17.PointerDownOutsideEvent | reka_ui17.FocusOutsideEvent) => any
    openAutoFocus: (event: Event) => any
    closeAutoFocus: (event: Event) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$59> &
    Readonly<{
      onEntryFocus?: ((event: Event) => any) | undefined
      onEscapeKeyDown?: ((event: KeyboardEvent) => any) | undefined
      onPointerDownOutside?: ((event: reka_ui17.PointerDownOutsideEvent) => any) | undefined
      onFocusOutside?: ((event: reka_ui17.FocusOutsideEvent) => any) | undefined
      onInteractOutside?:
        | ((event: reka_ui17.PointerDownOutsideEvent | reka_ui17.FocusOutsideEvent) => any)
        | undefined
      onOpenAutoFocus?: ((event: Event) => any) | undefined
      onCloseAutoFocus?: ((event: Event) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$112: __VLS_WithSlots$93<typeof __VLS_base$93, __VLS_Slots$93>
declare const _default$112: typeof __VLS_export$112
type __VLS_WithSlots$93<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/context-menu/context-menu-checkbox-item.vue.d.ts
type __VLS_Props$58 = ContextMenuCheckboxItemProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_14$11: {}, __VLS_21$3: {}
type __VLS_Slots$92 = {} & {
  'indicator-icon'?: (props: typeof __VLS_14$11) => any
} & {
  default?: (props: typeof __VLS_21$3) => any
}
declare const __VLS_base$92: vue0.DefineComponent<
  __VLS_Props$58,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    select: (event: Event) => any
    'update:modelValue': (payload: boolean) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$58> &
    Readonly<{
      onSelect?: ((event: Event) => any) | undefined
      'onUpdate:modelValue'?: ((payload: boolean) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$111: __VLS_WithSlots$92<typeof __VLS_base$92, __VLS_Slots$92>
declare const _default$111: typeof __VLS_export$111
type __VLS_WithSlots$92<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/context-menu/context-menu-radio-group.vue.d.ts
declare var __VLS_8$40: {}
type __VLS_Slots$91 = {} & {
  default?: (props: typeof __VLS_8$40) => any
}
declare const __VLS_base$91: vue0.DefineComponent<
  ContextMenuRadioGroupProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:modelValue': (payload: string) => any
  },
  string,
  vue0.PublicProps,
  Readonly<ContextMenuRadioGroupProps> &
    Readonly<{
      'onUpdate:modelValue'?: ((payload: string) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$110: __VLS_WithSlots$91<typeof __VLS_base$91, __VLS_Slots$91>
declare const _default$110: typeof __VLS_export$110
type __VLS_WithSlots$91<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/context-menu/context-menu-radio-item.vue.d.ts
type __VLS_Props$57 = ContextMenuRadioItemProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_14$10: {}, __VLS_21$2: {}
type __VLS_Slots$90 = {} & {
  'indicator-icon'?: (props: typeof __VLS_14$10) => any
} & {
  default?: (props: typeof __VLS_21$2) => any
}
declare const __VLS_base$90: vue0.DefineComponent<
  __VLS_Props$57,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    select: (event: Event) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$57> &
    Readonly<{
      onSelect?: ((event: Event) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$109: __VLS_WithSlots$90<typeof __VLS_base$90, __VLS_Slots$90>
declare const _default$109: typeof __VLS_export$109
type __VLS_WithSlots$90<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/context-menu/context-menu-shortcut.vue.d.ts
interface Props$36 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$33: {}
type __VLS_Slots$89 = {} & {
  default?: (props: typeof __VLS_1$33) => any
}
declare const __VLS_base$89: vue0.DefineComponent<
  Props$36,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$36> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$108: __VLS_WithSlots$89<typeof __VLS_base$89, __VLS_Slots$89>
declare const _default$108: typeof __VLS_export$108
type __VLS_WithSlots$89<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/dialog/dialog.vue.d.ts
declare var __VLS_8$39: {
  open: boolean
  close: () => void
}
type __VLS_Slots$88 = {} & {
  default?: (props: typeof __VLS_8$39) => any
}
declare const __VLS_base$88: vue0.DefineComponent<
  DialogRootProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:open': (value: boolean) => any
  },
  string,
  vue0.PublicProps,
  Readonly<DialogRootProps> &
    Readonly<{
      'onUpdate:open'?: ((value: boolean) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$107: __VLS_WithSlots$88<typeof __VLS_base$88, __VLS_Slots$88>
declare const _default$107: typeof __VLS_export$107
type __VLS_WithSlots$88<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/dialog/dialog-trigger.vue.d.ts
declare var __VLS_8$38: {}
type __VLS_Slots$87 = {} & {
  default?: (props: typeof __VLS_8$38) => any
}
declare const __VLS_base$87: vue0.DefineComponent<
  DialogTriggerProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<DialogTriggerProps> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$106: __VLS_WithSlots$87<typeof __VLS_base$87, __VLS_Slots$87>
declare const _default$106: typeof __VLS_export$106
type __VLS_WithSlots$87<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/dialog/dialog-content.vue.d.ts
type __VLS_Props$56 = DialogContentProps & {
  class?: HTMLAttributes['class']
  showCloseButton?: boolean
}
declare var __VLS_22: {}
type __VLS_Slots$86 = {} & {
  default?: (props: typeof __VLS_22) => any
}
declare const __VLS_base$86: vue0.DefineComponent<
  __VLS_Props$56,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    escapeKeyDown: (event: KeyboardEvent) => any
    pointerDownOutside: (event: reka_ui17.PointerDownOutsideEvent) => any
    focusOutside: (event: reka_ui17.FocusOutsideEvent) => any
    interactOutside: (event: reka_ui17.PointerDownOutsideEvent | reka_ui17.FocusOutsideEvent) => any
    openAutoFocus: (event: Event) => any
    closeAutoFocus: (event: Event) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$56> &
    Readonly<{
      onEscapeKeyDown?: ((event: KeyboardEvent) => any) | undefined
      onPointerDownOutside?: ((event: reka_ui17.PointerDownOutsideEvent) => any) | undefined
      onFocusOutside?: ((event: reka_ui17.FocusOutsideEvent) => any) | undefined
      onInteractOutside?:
        | ((event: reka_ui17.PointerDownOutsideEvent | reka_ui17.FocusOutsideEvent) => any)
        | undefined
      onOpenAutoFocus?: ((event: Event) => any) | undefined
      onCloseAutoFocus?: ((event: Event) => any) | undefined
    }>,
  {
    showCloseButton: boolean
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$105: __VLS_WithSlots$86<typeof __VLS_base$86, __VLS_Slots$86>
declare const _default$105: typeof __VLS_export$105
type __VLS_WithSlots$86<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/dialog/dialog-overlay.vue.d.ts
type __VLS_Props$55 = DialogOverlayProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_8$37: {}
type __VLS_Slots$85 = {} & {
  default?: (props: typeof __VLS_8$37) => any
}
declare const __VLS_base$85: vue0.DefineComponent<
  __VLS_Props$55,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$55> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$104: __VLS_WithSlots$85<typeof __VLS_base$85, __VLS_Slots$85>
declare const _default$104: typeof __VLS_export$104
type __VLS_WithSlots$85<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/dialog/dialog-header.vue.d.ts
type __VLS_Props$54 = {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$32: {}
type __VLS_Slots$84 = {} & {
  default?: (props: typeof __VLS_1$32) => any
}
declare const __VLS_base$84: vue0.DefineComponent<
  __VLS_Props$54,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$54> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$103: __VLS_WithSlots$84<typeof __VLS_base$84, __VLS_Slots$84>
declare const _default$103: typeof __VLS_export$103
type __VLS_WithSlots$84<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/dialog/dialog-title.vue.d.ts
type __VLS_Props$53 = DialogTitleProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_8$36: {}
type __VLS_Slots$83 = {} & {
  default?: (props: typeof __VLS_8$36) => any
}
declare const __VLS_base$83: vue0.DefineComponent<
  __VLS_Props$53,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$53> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$102: __VLS_WithSlots$83<typeof __VLS_base$83, __VLS_Slots$83>
declare const _default$102: typeof __VLS_export$102
type __VLS_WithSlots$83<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/dialog/dialog-description.vue.d.ts
type __VLS_Props$52 = DialogDescriptionProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_8$35: {}
type __VLS_Slots$82 = {} & {
  default?: (props: typeof __VLS_8$35) => any
}
declare const __VLS_base$82: vue0.DefineComponent<
  __VLS_Props$52,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$52> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$101: __VLS_WithSlots$82<typeof __VLS_base$82, __VLS_Slots$82>
declare const _default$101: typeof __VLS_export$101
type __VLS_WithSlots$82<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/dialog/dialog-body.vue.d.ts
type __VLS_Props$51 = {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$31: {}
type __VLS_Slots$81 = {} & {
  default?: (props: typeof __VLS_1$31) => any
}
declare const __VLS_base$81: vue0.DefineComponent<
  __VLS_Props$51,
  {
    readonly $el: HTMLElement | undefined
  },
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$51> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$100: __VLS_WithSlots$81<typeof __VLS_base$81, __VLS_Slots$81>
declare const _default$100: typeof __VLS_export$100
type __VLS_WithSlots$81<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/dialog/dialog-footer.vue.d.ts
type __VLS_Props$50 = {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$30: {}
type __VLS_Slots$80 = {} & {
  default?: (props: typeof __VLS_1$30) => any
}
declare const __VLS_base$80: vue0.DefineComponent<
  __VLS_Props$50,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$50> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$99: __VLS_WithSlots$80<typeof __VLS_base$80, __VLS_Slots$80>
declare const _default$99: typeof __VLS_export$99
type __VLS_WithSlots$80<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/dropdown-menu/dropdown-menu.vue.d.ts
declare var __VLS_8$34: {
  open: boolean
}
type __VLS_Slots$79 = {} & {
  default?: (props: typeof __VLS_8$34) => any
}
declare const __VLS_base$79: vue0.DefineComponent<
  DropdownMenuRootProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:open': (payload: boolean) => any
  },
  string,
  vue0.PublicProps,
  Readonly<DropdownMenuRootProps> &
    Readonly<{
      'onUpdate:open'?: ((payload: boolean) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$98: __VLS_WithSlots$79<typeof __VLS_base$79, __VLS_Slots$79>
declare const _default$98: typeof __VLS_export$98
type __VLS_WithSlots$79<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/dropdown-menu/dropdown-menu-trigger.vue.d.ts
declare var __VLS_8$33: {}
type __VLS_Slots$78 = {} & {
  default?: (props: typeof __VLS_8$33) => any
}
declare const __VLS_base$78: vue0.DefineComponent<
  DropdownMenuTriggerProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<DropdownMenuTriggerProps> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$97: __VLS_WithSlots$78<typeof __VLS_base$78, __VLS_Slots$78>
declare const _default$97: typeof __VLS_export$97
type __VLS_WithSlots$78<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/dropdown-menu/dropdown-menu-content.vue.d.ts
type __VLS_Props$49 = DropdownMenuContentProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_14$9: {}
type __VLS_Slots$77 = {} & {
  default?: (props: typeof __VLS_14$9) => any
}
declare const __VLS_base$77: vue0.DefineComponent<
  __VLS_Props$49,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    escapeKeyDown: (event: KeyboardEvent) => any
    pointerDownOutside: (event: reka_ui17.PointerDownOutsideEvent) => any
    focusOutside: (event: reka_ui17.FocusOutsideEvent) => any
    interactOutside: (event: reka_ui17.PointerDownOutsideEvent | reka_ui17.FocusOutsideEvent) => any
    closeAutoFocus: (event: Event) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$49> &
    Readonly<{
      onEscapeKeyDown?: ((event: KeyboardEvent) => any) | undefined
      onPointerDownOutside?: ((event: reka_ui17.PointerDownOutsideEvent) => any) | undefined
      onFocusOutside?: ((event: reka_ui17.FocusOutsideEvent) => any) | undefined
      onInteractOutside?:
        | ((event: reka_ui17.PointerDownOutsideEvent | reka_ui17.FocusOutsideEvent) => any)
        | undefined
      onCloseAutoFocus?: ((event: Event) => any) | undefined
    }>,
  {
    sideOffset: number
    collisionPadding: number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$96: __VLS_WithSlots$77<typeof __VLS_base$77, __VLS_Slots$77>
declare const _default$96: typeof __VLS_export$96
type __VLS_WithSlots$77<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/dropdown-menu/dropdown-menu-item.vue.d.ts
type __VLS_Props$48 = DropdownMenuItemProps & {
  class?: HTMLAttributes['class']
  inset?: boolean
  variant?: 'default' | 'destructive'
}
declare var __VLS_8$32: {}
type __VLS_Slots$76 = {} & {
  default?: (props: typeof __VLS_8$32) => any
}
declare const __VLS_base$76: vue0.DefineComponent<
  __VLS_Props$48,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$48> & Readonly<{}>,
  {
    variant: 'default' | 'destructive'
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$95: __VLS_WithSlots$76<typeof __VLS_base$76, __VLS_Slots$76>
declare const _default$95: typeof __VLS_export$95
type __VLS_WithSlots$76<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/dropdown-menu/dropdown-menu-checkbox-item.vue.d.ts
type __VLS_Props$47 = DropdownMenuCheckboxItemProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_14$8: {}, __VLS_21$1: {}
type __VLS_Slots$75 = {} & {
  'indicator-icon'?: (props: typeof __VLS_14$8) => any
} & {
  default?: (props: typeof __VLS_21$1) => any
}
declare const __VLS_base$75: vue0.DefineComponent<
  __VLS_Props$47,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    select: (event: Event) => any
    'update:modelValue': (payload: boolean) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$47> &
    Readonly<{
      onSelect?: ((event: Event) => any) | undefined
      'onUpdate:modelValue'?: ((payload: boolean) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$94: __VLS_WithSlots$75<typeof __VLS_base$75, __VLS_Slots$75>
declare const _default$94: typeof __VLS_export$94
type __VLS_WithSlots$75<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/dropdown-menu/dropdown-menu-radio-group.vue.d.ts
declare var __VLS_8$31: {}
type __VLS_Slots$74 = {} & {
  default?: (props: typeof __VLS_8$31) => any
}
declare const __VLS_base$74: vue0.DefineComponent<
  DropdownMenuRadioGroupProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:modelValue': (payload: string) => any
  },
  string,
  vue0.PublicProps,
  Readonly<DropdownMenuRadioGroupProps> &
    Readonly<{
      'onUpdate:modelValue'?: ((payload: string) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$93: __VLS_WithSlots$74<typeof __VLS_base$74, __VLS_Slots$74>
declare const _default$93: typeof __VLS_export$93
type __VLS_WithSlots$74<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/dropdown-menu/dropdown-menu-radio-item.vue.d.ts
type __VLS_Props$46 = DropdownMenuRadioItemProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_14$7: {}, __VLS_21: {}
type __VLS_Slots$73 = {} & {
  'indicator-icon'?: (props: typeof __VLS_14$7) => any
} & {
  default?: (props: typeof __VLS_21) => any
}
declare const __VLS_base$73: vue0.DefineComponent<
  __VLS_Props$46,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    select: (event: Event) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$46> &
    Readonly<{
      onSelect?: ((event: Event) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$92: __VLS_WithSlots$73<typeof __VLS_base$73, __VLS_Slots$73>
declare const _default$92: typeof __VLS_export$92
type __VLS_WithSlots$73<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/dropdown-menu/dropdown-menu-label.vue.d.ts
type __VLS_Props$45 = DropdownMenuLabelProps & {
  class?: HTMLAttributes['class']
  inset?: boolean
}
declare var __VLS_8$30: {}
type __VLS_Slots$72 = {} & {
  default?: (props: typeof __VLS_8$30) => any
}
declare const __VLS_base$72: vue0.DefineComponent<
  __VLS_Props$45,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$45> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$91: __VLS_WithSlots$72<typeof __VLS_base$72, __VLS_Slots$72>
declare const _default$91: typeof __VLS_export$91
type __VLS_WithSlots$72<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/dropdown-menu/dropdown-menu-separator.vue.d.ts
type __VLS_Props$44 = DropdownMenuSeparatorProps & {
  class?: HTMLAttributes['class']
}
declare const __VLS_export$90: vue0.DefineComponent<
  __VLS_Props$44,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$44> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const _default$90: typeof __VLS_export$90
//#endregion
//#region src/renderer/src/components/ui/dropdown-menu/dropdown-menu-shortcut.vue.d.ts
type __VLS_Props$43 = {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$29: {}
type __VLS_Slots$71 = {} & {
  default?: (props: typeof __VLS_1$29) => any
}
declare const __VLS_base$71: vue0.DefineComponent<
  __VLS_Props$43,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$43> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$89: __VLS_WithSlots$71<typeof __VLS_base$71, __VLS_Slots$71>
declare const _default$89: typeof __VLS_export$89
type __VLS_WithSlots$71<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/dropdown-menu/dropdown-menu-group.vue.d.ts
declare var __VLS_8$29: {}
type __VLS_Slots$70 = {} & {
  default?: (props: typeof __VLS_8$29) => any
}
declare const __VLS_base$70: vue0.DefineComponent<
  DropdownMenuGroupProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<DropdownMenuGroupProps> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$88: __VLS_WithSlots$70<typeof __VLS_base$70, __VLS_Slots$70>
declare const _default$88: typeof __VLS_export$88
type __VLS_WithSlots$70<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/dropdown-menu/dropdown-menu-sub.vue.d.ts
declare var __VLS_8$28: {}
type __VLS_Slots$69 = {} & {
  default?: (props: typeof __VLS_8$28) => any
}
declare const __VLS_base$69: vue0.DefineComponent<
  DropdownMenuSubProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:open': (payload: boolean) => any
  },
  string,
  vue0.PublicProps,
  Readonly<DropdownMenuSubProps> &
    Readonly<{
      'onUpdate:open'?: ((payload: boolean) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$87: __VLS_WithSlots$69<typeof __VLS_base$69, __VLS_Slots$69>
declare const _default$87: typeof __VLS_export$87
type __VLS_WithSlots$69<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/dropdown-menu/dropdown-menu-sub-trigger.vue.d.ts
type __VLS_Props$42 = DropdownMenuSubTriggerProps & {
  class?: HTMLAttributes['class']
  inset?: boolean
}
declare var __VLS_8$27: {}
type __VLS_Slots$68 = {} & {
  default?: (props: typeof __VLS_8$27) => any
}
declare const __VLS_base$68: vue0.DefineComponent<
  __VLS_Props$42,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$42> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$86: __VLS_WithSlots$68<typeof __VLS_base$68, __VLS_Slots$68>
declare const _default$86: typeof __VLS_export$86
type __VLS_WithSlots$68<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/dropdown-menu/dropdown-menu-sub-content.vue.d.ts
type __VLS_Props$41 = DropdownMenuSubContentProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_8$26: {}
type __VLS_Slots$67 = {} & {
  default?: (props: typeof __VLS_8$26) => any
}
declare const __VLS_base$67: vue0.DefineComponent<
  __VLS_Props$41,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    entryFocus: (event: Event) => any
    escapeKeyDown: (event: KeyboardEvent) => any
    pointerDownOutside: (event: reka_ui17.PointerDownOutsideEvent) => any
    focusOutside: (event: reka_ui17.FocusOutsideEvent) => any
    interactOutside: (event: reka_ui17.PointerDownOutsideEvent | reka_ui17.FocusOutsideEvent) => any
    openAutoFocus: (event: Event) => any
    closeAutoFocus: (event: Event) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$41> &
    Readonly<{
      onEntryFocus?: ((event: Event) => any) | undefined
      onEscapeKeyDown?: ((event: KeyboardEvent) => any) | undefined
      onPointerDownOutside?: ((event: reka_ui17.PointerDownOutsideEvent) => any) | undefined
      onFocusOutside?: ((event: reka_ui17.FocusOutsideEvent) => any) | undefined
      onInteractOutside?:
        | ((event: reka_ui17.PointerDownOutsideEvent | reka_ui17.FocusOutsideEvent) => any)
        | undefined
      onOpenAutoFocus?: ((event: Event) => any) | undefined
      onCloseAutoFocus?: ((event: Event) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$85: __VLS_WithSlots$67<typeof __VLS_base$67, __VLS_Slots$67>
declare const _default$85: typeof __VLS_export$85
type __VLS_WithSlots$67<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/empty/empty.vue.d.ts
interface Props$35 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$28: {}
type __VLS_Slots$66 = {} & {
  default?: (props: typeof __VLS_1$28) => any
}
declare const __VLS_base$66: vue0.DefineComponent<
  Props$35,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$35> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$84: __VLS_WithSlots$66<typeof __VLS_base$66, __VLS_Slots$66>
declare const _default$84: typeof __VLS_export$84
type __VLS_WithSlots$66<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/empty/empty-header.vue.d.ts
interface Props$34 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$27: {}
type __VLS_Slots$65 = {} & {
  default?: (props: typeof __VLS_1$27) => any
}
declare const __VLS_base$65: vue0.DefineComponent<
  Props$34,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$34> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$83: __VLS_WithSlots$65<typeof __VLS_base$65, __VLS_Slots$65>
declare const _default$83: typeof __VLS_export$83
type __VLS_WithSlots$65<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/empty/empty-media.vue.d.ts
declare const emptyMediaVariants: (
  props?:
    | ({
        variant?: 'icon' | 'default' | null | undefined
      } & class_variance_authority_types0.ClassProp)
    | undefined
) => string
type MediaVariants = VariantProps<typeof emptyMediaVariants>
interface Props$33 {
  variant?: MediaVariants['variant']
  class?: HTMLAttributes['class']
}
declare var __VLS_1$26: {}
type __VLS_Slots$64 = {} & {
  default?: (props: typeof __VLS_1$26) => any
}
declare const __VLS_base$64: vue0.DefineComponent<
  Props$33,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$33> & Readonly<{}>,
  {
    variant: 'icon' | 'default' | null
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$82: __VLS_WithSlots$64<typeof __VLS_base$64, __VLS_Slots$64>
declare const _default$82: typeof __VLS_export$82
type __VLS_WithSlots$64<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/empty/empty-title.vue.d.ts
interface Props$32 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$25: {}
type __VLS_Slots$63 = {} & {
  default?: (props: typeof __VLS_1$25) => any
}
declare const __VLS_base$63: vue0.DefineComponent<
  Props$32,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$32> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$81: __VLS_WithSlots$63<typeof __VLS_base$63, __VLS_Slots$63>
declare const _default$81: typeof __VLS_export$81
type __VLS_WithSlots$63<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/empty/empty-description.vue.d.ts
interface Props$31 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$24: {}
type __VLS_Slots$62 = {} & {
  default?: (props: typeof __VLS_1$24) => any
}
declare const __VLS_base$62: vue0.DefineComponent<
  Props$31,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$31> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$80: __VLS_WithSlots$62<typeof __VLS_base$62, __VLS_Slots$62>
declare const _default$80: typeof __VLS_export$80
type __VLS_WithSlots$62<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/empty/empty-content.vue.d.ts
interface Props$30 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$23: {}
type __VLS_Slots$61 = {} & {
  default?: (props: typeof __VLS_1$23) => any
}
declare const __VLS_base$61: vue0.DefineComponent<
  Props$30,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$30> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$79: __VLS_WithSlots$61<typeof __VLS_base$61, __VLS_Slots$61>
declare const _default$79: typeof __VLS_export$79
type __VLS_WithSlots$61<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/field/field.vue.d.ts
declare const fieldVariants: (
  props?:
    | ({
        orientation?: 'horizontal' | 'vertical' | 'responsive' | null | undefined
      } & class_variance_authority_types0.ClassProp)
    | undefined
) => string
type FieldVariants = VariantProps<typeof fieldVariants>
interface Props$29 {
  orientation?: FieldVariants['orientation']
  class?: HTMLAttributes['class']
}
declare var __VLS_1$22: {}
type __VLS_Slots$60 = {} & {
  default?: (props: typeof __VLS_1$22) => any
}
declare const __VLS_base$60: vue0.DefineComponent<
  Props$29,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$29> & Readonly<{}>,
  {
    orientation: 'horizontal' | 'vertical' | 'responsive' | null
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$78: __VLS_WithSlots$60<typeof __VLS_base$60, __VLS_Slots$60>
declare const _default$78: typeof __VLS_export$78
type __VLS_WithSlots$60<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/field/field-group.vue.d.ts
interface Props$28 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$21: {}
type __VLS_Slots$59 = {} & {
  default?: (props: typeof __VLS_1$21) => any
}
declare const __VLS_base$59: vue0.DefineComponent<
  Props$28,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$28> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$77: __VLS_WithSlots$59<typeof __VLS_base$59, __VLS_Slots$59>
declare const _default$77: typeof __VLS_export$77
type __VLS_WithSlots$59<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/field/field-content.vue.d.ts
interface Props$27 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$20: {}
type __VLS_Slots$58 = {} & {
  default?: (props: typeof __VLS_1$20) => any
}
declare const __VLS_base$58: vue0.DefineComponent<
  Props$27,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$27> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$76: __VLS_WithSlots$58<typeof __VLS_base$58, __VLS_Slots$58>
declare const _default$76: typeof __VLS_export$76
type __VLS_WithSlots$58<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/field/field-label.vue.d.ts
interface Props$26 {
  for?: string
  class?: HTMLAttributes['class']
}
declare var __VLS_8$25: {}
type __VLS_Slots$57 = {} & {
  default?: (props: typeof __VLS_8$25) => any
}
declare const __VLS_base$57: vue0.DefineComponent<
  Props$26,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$26> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$75: __VLS_WithSlots$57<typeof __VLS_base$57, __VLS_Slots$57>
declare const _default$75: typeof __VLS_export$75
type __VLS_WithSlots$57<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/field/field-description.vue.d.ts
interface Props$25 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$19: {}
type __VLS_Slots$56 = {} & {
  default?: (props: typeof __VLS_1$19) => any
}
declare const __VLS_base$56: vue0.DefineComponent<
  Props$25,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$25> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$74: __VLS_WithSlots$56<typeof __VLS_base$56, __VLS_Slots$56>
declare const _default$74: typeof __VLS_export$74
type __VLS_WithSlots$56<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/field/field-set.vue.d.ts
interface Props$24 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$18: {}
type __VLS_Slots$55 = {} & {
  default?: (props: typeof __VLS_1$18) => any
}
declare const __VLS_base$55: vue0.DefineComponent<
  Props$24,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$24> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$73: __VLS_WithSlots$55<typeof __VLS_base$55, __VLS_Slots$55>
declare const _default$73: typeof __VLS_export$73
type __VLS_WithSlots$55<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/field/field-legend.vue.d.ts
interface Props$23 {
  variant?: 'legend' | 'label'
  class?: HTMLAttributes['class']
}
declare var __VLS_1$17: {}
type __VLS_Slots$54 = {} & {
  default?: (props: typeof __VLS_1$17) => any
}
declare const __VLS_base$54: vue0.DefineComponent<
  Props$23,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$23> & Readonly<{}>,
  {
    variant: 'legend' | 'label'
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$72: __VLS_WithSlots$54<typeof __VLS_base$54, __VLS_Slots$54>
declare const _default$72: typeof __VLS_export$72
type __VLS_WithSlots$54<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/field/field-title.vue.d.ts
interface Props$22 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$16: {}
type __VLS_Slots$53 = {} & {
  default?: (props: typeof __VLS_1$16) => any
}
declare const __VLS_base$53: vue0.DefineComponent<
  Props$22,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$22> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$71: __VLS_WithSlots$53<typeof __VLS_base$53, __VLS_Slots$53>
declare const _default$71: typeof __VLS_export$71
type __VLS_WithSlots$53<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/field/field-separator.vue.d.ts
interface Props$21 {
  class?: HTMLAttributes['class']
}
declare var __VLS_6$1: {}
type __VLS_Slots$52 = {} & {
  default?: (props: typeof __VLS_6$1) => any
}
declare const __VLS_base$52: vue0.DefineComponent<
  Props$21,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$21> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$70: __VLS_WithSlots$52<typeof __VLS_base$52, __VLS_Slots$52>
declare const _default$70: typeof __VLS_export$70
type __VLS_WithSlots$52<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/field/field-error.vue.d.ts
interface ErrorItem {
  message?: string
}
interface Props$20 {
  errors?: Array<ErrorItem | undefined>
  class?: HTMLAttributes['class']
}
declare var __VLS_1$15: {}
type __VLS_Slots$51 = {} & {
  default?: (props: typeof __VLS_1$15) => any
}
declare const __VLS_base$51: vue0.DefineComponent<
  Props$20,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$20> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$69: __VLS_WithSlots$51<typeof __VLS_base$51, __VLS_Slots$51>
declare const _default$69: typeof __VLS_export$69
type __VLS_WithSlots$51<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/hover-card/hover-card.vue.d.ts
declare var __VLS_8$24: {
  open: boolean
}
type __VLS_Slots$50 = {} & {
  default?: (props: typeof __VLS_8$24) => any
}
declare const __VLS_base$50: vue0.DefineComponent<
  HoverCardRootProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:open': (value: boolean) => any
  },
  string,
  vue0.PublicProps,
  Readonly<HoverCardRootProps> &
    Readonly<{
      'onUpdate:open'?: ((value: boolean) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$68: __VLS_WithSlots$50<typeof __VLS_base$50, __VLS_Slots$50>
declare const _default$68: typeof __VLS_export$68
type __VLS_WithSlots$50<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/hover-card/hover-card-trigger.vue.d.ts
declare var __VLS_8$23: {}
type __VLS_Slots$49 = {} & {
  default?: (props: typeof __VLS_8$23) => any
}
declare const __VLS_base$49: vue0.DefineComponent<
  HoverCardTriggerProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<HoverCardTriggerProps> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$67: __VLS_WithSlots$49<typeof __VLS_base$49, __VLS_Slots$49>
declare const _default$67: typeof __VLS_export$67
type __VLS_WithSlots$49<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/hover-card/hover-card-content.vue.d.ts
type __VLS_Props$40 = HoverCardContentProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_14$6: {}
type __VLS_Slots$48 = {} & {
  default?: (props: typeof __VLS_14$6) => any
}
declare const __VLS_base$48: vue0.DefineComponent<
  __VLS_Props$40,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$40> & Readonly<{}>,
  {
    sideOffset: number
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$66: __VLS_WithSlots$48<typeof __VLS_base$48, __VLS_Slots$48>
declare const _default$66: typeof __VLS_export$66
type __VLS_WithSlots$48<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/input-group/input-group.vue.d.ts
interface Props$19 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$14: {}
type __VLS_Slots$47 = {} & {
  default?: (props: typeof __VLS_1$14) => any
}
declare const __VLS_base$47: vue0.DefineComponent<
  Props$19,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$19> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$65: __VLS_WithSlots$47<typeof __VLS_base$47, __VLS_Slots$47>
declare const _default$65: typeof __VLS_export$65
type __VLS_WithSlots$47<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/input-group/input-group-addon.vue.d.ts
declare const inputGroupAddonVariants: (
  props?:
    | ({
        align?: 'inline-start' | 'inline-end' | 'block-start' | 'block-end' | null | undefined
      } & class_variance_authority_types0.ClassProp)
    | undefined
) => string
type AddonVariants = VariantProps<typeof inputGroupAddonVariants>
interface Props$18 {
  align?: AddonVariants['align']
  class?: HTMLAttributes['class']
}
declare var __VLS_1$13: {}
type __VLS_Slots$46 = {} & {
  default?: (props: typeof __VLS_1$13) => any
}
declare const __VLS_base$46: vue0.DefineComponent<
  Props$18,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$18> & Readonly<{}>,
  {
    align: 'inline-start' | 'inline-end' | 'block-start' | 'block-end' | null
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$64: __VLS_WithSlots$46<typeof __VLS_base$46, __VLS_Slots$46>
declare const _default$64: typeof __VLS_export$64
type __VLS_WithSlots$46<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/input-group/input-group-button.vue.d.ts
declare const inputGroupButtonVariants: (
  props?:
    | ({
        size?: 'xs' | 'sm' | 'icon-xs' | 'icon-sm' | null | undefined
      } & class_variance_authority_types0.ClassProp)
    | undefined
) => string
type ButtonSizeVariants = VariantProps<typeof inputGroupButtonVariants>
interface Props$17 {
  size?: ButtonSizeVariants['size']
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  class?: HTMLAttributes['class']
}
declare var __VLS_8$22: {}
type __VLS_Slots$45 = {} & {
  default?: (props: typeof __VLS_8$22) => any
}
declare const __VLS_base$45: vue0.DefineComponent<
  Props$17,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$17> & Readonly<{}>,
  {
    size: 'xs' | 'sm' | 'icon-xs' | 'icon-sm' | null
    type: 'button' | 'submit' | 'reset'
    variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$63: __VLS_WithSlots$45<typeof __VLS_base$45, __VLS_Slots$45>
declare const _default$63: typeof __VLS_export$63
type __VLS_WithSlots$45<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/input-group/input-group-text.vue.d.ts
interface Props$16 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$12: {}
type __VLS_Slots$44 = {} & {
  default?: (props: typeof __VLS_1$12) => any
}
declare const __VLS_base$44: vue0.DefineComponent<
  Props$16,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$16> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$62: __VLS_WithSlots$44<typeof __VLS_base$44, __VLS_Slots$44>
declare const _default$62: typeof __VLS_export$62
type __VLS_WithSlots$44<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/input-group/input-group-input.vue.d.ts
interface Props$15 {
  type?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  class?: HTMLAttributes['class']
}
type __VLS_Props$39 = Props$15
type __VLS_ModelProps$5 = {
  modelValue?: string | number
}
type __VLS_PublicProps$5 = __VLS_Props$39 & __VLS_ModelProps$5
declare const __VLS_export$61: vue0.DefineComponent<
  __VLS_PublicProps$5,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:modelValue': (value: string | number | undefined) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_PublicProps$5> &
    Readonly<{
      'onUpdate:modelValue'?: ((value: string | number | undefined) => any) | undefined
    }>,
  {
    type: string
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const _default$61: typeof __VLS_export$61
//#endregion
//#region src/renderer/src/components/ui/input-group/input-group-textarea.vue.d.ts
interface Props$14 {
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  class?: HTMLAttributes['class']
}
type __VLS_Props$38 = Props$14
type __VLS_ModelProps$4 = {
  modelValue?: string
}
type __VLS_PublicProps$4 = __VLS_Props$38 & __VLS_ModelProps$4
declare const __VLS_export$60: vue0.DefineComponent<
  __VLS_PublicProps$4,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:modelValue': (value: string | undefined) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_PublicProps$4> &
    Readonly<{
      'onUpdate:modelValue'?: ((value: string | undefined) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const _default$60: typeof __VLS_export$60
//#endregion
//#region src/renderer/src/components/ui/popover/popover.vue.d.ts
declare var __VLS_8$21: {
  open: boolean
  close: () => void
}
type __VLS_Slots$43 = {} & {
  default?: (props: typeof __VLS_8$21) => any
}
declare const __VLS_base$43: vue0.DefineComponent<
  PopoverRootProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:open': (value: boolean) => any
  },
  string,
  vue0.PublicProps,
  Readonly<PopoverRootProps> &
    Readonly<{
      'onUpdate:open'?: ((value: boolean) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$59: __VLS_WithSlots$43<typeof __VLS_base$43, __VLS_Slots$43>
declare const _default$59: typeof __VLS_export$59
type __VLS_WithSlots$43<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/popover/popover-trigger.vue.d.ts
declare var __VLS_8$20: {}
type __VLS_Slots$42 = {} & {
  default?: (props: typeof __VLS_8$20) => any
}
declare const __VLS_base$42: vue0.DefineComponent<
  PopoverTriggerProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<PopoverTriggerProps> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$58: __VLS_WithSlots$42<typeof __VLS_base$42, __VLS_Slots$42>
declare const _default$58: typeof __VLS_export$58
type __VLS_WithSlots$42<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/popover/popover-content.vue.d.ts
type __VLS_Props$37 = PopoverContentProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_16: {}
type __VLS_Slots$41 = {} & {
  default?: (props: typeof __VLS_16) => any
}
declare const __VLS_base$41: vue0.DefineComponent<
  __VLS_Props$37,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    escapeKeyDown: (event: KeyboardEvent) => any
    pointerDownOutside: (event: reka_ui17.PointerDownOutsideEvent) => any
    focusOutside: (event: reka_ui17.FocusOutsideEvent) => any
    interactOutside: (event: reka_ui17.PointerDownOutsideEvent | reka_ui17.FocusOutsideEvent) => any
    openAutoFocus: (event: Event) => any
    closeAutoFocus: (event: Event) => any
    afterLeave: () => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$37> &
    Readonly<{
      onEscapeKeyDown?: ((event: KeyboardEvent) => any) | undefined
      onPointerDownOutside?: ((event: reka_ui17.PointerDownOutsideEvent) => any) | undefined
      onFocusOutside?: ((event: reka_ui17.FocusOutsideEvent) => any) | undefined
      onInteractOutside?:
        | ((event: reka_ui17.PointerDownOutsideEvent | reka_ui17.FocusOutsideEvent) => any)
        | undefined
      onOpenAutoFocus?: ((event: Event) => any) | undefined
      onCloseAutoFocus?: ((event: Event) => any) | undefined
      onAfterLeave?: (() => any) | undefined
    }>,
  {
    sideOffset: number
    align: 'center' | 'start' | 'end'
    collisionPadding: number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$57: __VLS_WithSlots$41<typeof __VLS_base$41, __VLS_Slots$41>
declare const _default$57: typeof __VLS_export$57
type __VLS_WithSlots$41<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/popover/popover-anchor.vue.d.ts
declare var __VLS_8$19: {}
type __VLS_Slots$40 = {} & {
  default?: (props: typeof __VLS_8$19) => any
}
declare const __VLS_base$40: vue0.DefineComponent<
  PopoverAnchorProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<PopoverAnchorProps> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$56: __VLS_WithSlots$40<typeof __VLS_base$40, __VLS_Slots$40>
declare const _default$56: typeof __VLS_export$56
type __VLS_WithSlots$40<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/radio-group/radio-group.vue.d.ts
type __VLS_Props$36 = RadioGroupRootProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_8$18: {
  modelValue: reka_ui17.AcceptableValue | undefined
}
type __VLS_Slots$39 = {} & {
  default?: (props: typeof __VLS_8$18) => any
}
declare const __VLS_base$39: vue0.DefineComponent<
  __VLS_Props$36,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:modelValue': (payload: string) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$36> &
    Readonly<{
      'onUpdate:modelValue'?: ((payload: string) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$55: __VLS_WithSlots$39<typeof __VLS_base$39, __VLS_Slots$39>
declare const _default$55: typeof __VLS_export$55
type __VLS_WithSlots$39<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/radio-group/radio-group-item.vue.d.ts
type __VLS_Props$35 = RadioGroupItemProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_14$5: {}
type __VLS_Slots$38 = {} & {
  default?: (props: typeof __VLS_14$5) => any
}
declare const __VLS_base$38: vue0.DefineComponent<
  __VLS_Props$35,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$35> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$54: __VLS_WithSlots$38<typeof __VLS_base$38, __VLS_Slots$38>
declare const _default$54: typeof __VLS_export$54
type __VLS_WithSlots$38<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/resizable/resizable-layout.vue.d.ts
interface Props$13 {
  leftWidth: number
  defaultWidth?: number
  minLeftWidth?: number
  maxLeftWidth?: number
  class?: HTMLAttributes['class']
}
declare var __VLS_1$11: {}
type __VLS_Slots$37 = {} & {
  default?: (props: typeof __VLS_1$11) => any
}
declare const __VLS_base$37: vue0.DefineComponent<
  Props$13,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:leftWidth': (width: number) => any
  },
  string,
  vue0.PublicProps,
  Readonly<Props$13> &
    Readonly<{
      'onUpdate:leftWidth'?: ((width: number) => any) | undefined
    }>,
  {
    defaultWidth: number
    minLeftWidth: number
    maxLeftWidth: number
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$53: __VLS_WithSlots$37<typeof __VLS_base$37, __VLS_Slots$37>
declare const _default$53: typeof __VLS_export$53
type __VLS_WithSlots$37<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/resizable/resizable-panel.vue.d.ts
interface Props$12 {
  position: 'left' | 'right'
  class?: HTMLAttributes['class']
}
declare var __VLS_1$10: {}
type __VLS_Slots$36 = {} & {
  default?: (props: typeof __VLS_1$10) => any
}
declare const __VLS_base$36: vue0.DefineComponent<
  Props$12,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$12> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$52: __VLS_WithSlots$36<typeof __VLS_base$36, __VLS_Slots$36>
declare const _default$52: typeof __VLS_export$52
type __VLS_WithSlots$36<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/resizable/resizable-handle.vue.d.ts
interface Props$11 {
  class?: HTMLAttributes['class']
}
declare const __VLS_export$51: vue0.DefineComponent<
  Props$11,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$11> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const _default$51: typeof __VLS_export$51
//#endregion
//#region src/renderer/src/components/ui/resizable/use-resizable.d.ts
interface ResizableContext {
  leftWidth: number
  rightWidth: number
  containerWidth: number
  handleSize: number
  isResizing: boolean
  startResize: (e: MouseEvent) => void
  resetToDefault: () => void
}
/**
 * Inject resizable context from parent ResizableLayout
 * Used internally by ResizablePanel and ResizableHandle
 */
declare function useResizable(): ResizableContext
//#endregion
//#region src/renderer/src/components/ui/segmented-control/segmented-control.vue.d.ts
interface Props$10 {
  defaultValue?: string
  class?: HTMLAttributes['class']
}
type __VLS_Props$34 = Props$10
type __VLS_ModelProps$3 = {
  modelValue?: string
}
type __VLS_PublicProps$3 = __VLS_Props$34 & __VLS_ModelProps$3
declare var __VLS_14$4: {}
type __VLS_Slots$35 = {} & {
  default?: (props: typeof __VLS_14$4) => any
}
declare const __VLS_base$35: vue0.DefineComponent<
  __VLS_PublicProps$3,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:modelValue': (value: string | undefined) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_PublicProps$3> &
    Readonly<{
      'onUpdate:modelValue'?: ((value: string | undefined) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$50: __VLS_WithSlots$35<typeof __VLS_base$35, __VLS_Slots$35>
declare const _default$50: typeof __VLS_export$50
type __VLS_WithSlots$35<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/segmented-control/segmented-control-item.vue.d.ts
interface Props$9 {
  value: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}
declare var __VLS_8$17: {}
type __VLS_Slots$34 = {} & {
  default?: (props: typeof __VLS_8$17) => any
}
declare const __VLS_base$34: vue0.DefineComponent<
  Props$9,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$9> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$49: __VLS_WithSlots$34<typeof __VLS_base$34, __VLS_Slots$34>
declare const _default$49: typeof __VLS_export$49
type __VLS_WithSlots$34<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/select/select.vue.d.ts
type __VLS_Props$33 = SelectRootProps
declare var __VLS_8$16: {
  modelValue:
    | string
    | number
    | bigint
    | Record<string, any>
    | (string | number | bigint | Record<string, any> | null)[]
    | null
    | undefined
  open: boolean
}
type __VLS_Slots$33 = {} & {
  default?: (props: typeof __VLS_8$16) => any
}
declare const __VLS_base$33: vue0.DefineComponent<
  __VLS_Props$33,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:open': (value: boolean) => any
    'update:modelValue': (value: reka_ui17.AcceptableValue) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$33> &
    Readonly<{
      'onUpdate:open'?: ((value: boolean) => any) | undefined
      'onUpdate:modelValue'?: ((value: reka_ui17.AcceptableValue) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$48: __VLS_WithSlots$33<typeof __VLS_base$33, __VLS_Slots$33>
declare const _default$48: typeof __VLS_export$48
type __VLS_WithSlots$33<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/select/select-trigger.vue.d.ts
type __VLS_Props$32 = SelectTriggerProps & {
  class?: HTMLAttributes['class']
  size?: 'sm' | 'default'
}
declare var __VLS_8$15: {}
type __VLS_Slots$32 = {} & {
  default?: (props: typeof __VLS_8$15) => any
}
declare const __VLS_base$32: vue0.DefineComponent<
  __VLS_Props$32,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$32> & Readonly<{}>,
  {
    size: 'sm' | 'default'
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$47: __VLS_WithSlots$32<typeof __VLS_base$32, __VLS_Slots$32>
declare const _default$47: typeof __VLS_export$47
type __VLS_WithSlots$32<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/select/select-value.vue.d.ts
declare var __VLS_8$14: {}
type __VLS_Slots$31 = {} & {
  default?: (props: typeof __VLS_8$14) => any
}
declare const __VLS_base$31: vue0.DefineComponent<
  SelectValueProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<SelectValueProps> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$46: __VLS_WithSlots$31<typeof __VLS_base$31, __VLS_Slots$31>
declare const _default$46: typeof __VLS_export$46
type __VLS_WithSlots$31<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/select/select-content.vue.d.ts
type __VLS_Props$31 = SelectContentProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_25: {}
type __VLS_Slots$30 = {} & {
  default?: (props: typeof __VLS_25) => any
}
declare const __VLS_base$30: vue0.DefineComponent<
  __VLS_Props$31,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    escapeKeyDown: (event: KeyboardEvent) => any
    pointerDownOutside: (event: reka_ui17.PointerDownOutsideEvent) => any
    closeAutoFocus: (event: Event) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$31> &
    Readonly<{
      onEscapeKeyDown?: ((event: KeyboardEvent) => any) | undefined
      onPointerDownOutside?: ((event: reka_ui17.PointerDownOutsideEvent) => any) | undefined
      onCloseAutoFocus?: ((event: Event) => any) | undefined
    }>,
  {
    sideOffset: number
    collisionPadding: number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>
    position: 'item-aligned' | 'popper'
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$45: __VLS_WithSlots$30<typeof __VLS_base$30, __VLS_Slots$30>
declare const _default$45: typeof __VLS_export$45
type __VLS_WithSlots$30<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/select/select-item.vue.d.ts
type __VLS_Props$30 = SelectItemProps & {
  class?: HTMLAttributes['class']
  description?: string
}
declare var __VLS_14$3: {}, __VLS_27: {}
type __VLS_Slots$29 = {} & {
  'indicator-icon'?: (props: typeof __VLS_14$3) => any
} & {
  default?: (props: typeof __VLS_27) => any
}
declare const __VLS_base$29: vue0.DefineComponent<
  __VLS_Props$30,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$30> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$44: __VLS_WithSlots$29<typeof __VLS_base$29, __VLS_Slots$29>
declare const _default$44: typeof __VLS_export$44
type __VLS_WithSlots$29<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/select/select-group.vue.d.ts
declare var __VLS_8$13: {}
type __VLS_Slots$28 = {} & {
  default?: (props: typeof __VLS_8$13) => any
}
declare const __VLS_base$28: vue0.DefineComponent<
  SelectGroupProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<SelectGroupProps> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$43: __VLS_WithSlots$28<typeof __VLS_base$28, __VLS_Slots$28>
declare const _default$43: typeof __VLS_export$43
type __VLS_WithSlots$28<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/select/select-label.vue.d.ts
type __VLS_Props$29 = SelectLabelProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_8$12: {}
type __VLS_Slots$27 = {} & {
  default?: (props: typeof __VLS_8$12) => any
}
declare const __VLS_base$27: vue0.DefineComponent<
  __VLS_Props$29,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$29> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$42: __VLS_WithSlots$27<typeof __VLS_base$27, __VLS_Slots$27>
declare const _default$42: typeof __VLS_export$42
type __VLS_WithSlots$27<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/select/select-separator.vue.d.ts
type __VLS_Props$28 = SelectSeparatorProps & {
  class?: HTMLAttributes['class']
}
declare const __VLS_export$41: vue0.DefineComponent<
  __VLS_Props$28,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$28> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const _default$41: typeof __VLS_export$41
//#endregion
//#region src/renderer/src/components/ui/select/select-scroll-up-button.vue.d.ts
type __VLS_Props$27 = SelectScrollUpButtonProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_8$11: {}
type __VLS_Slots$26 = {} & {
  default?: (props: typeof __VLS_8$11) => any
}
declare const __VLS_base$26: vue0.DefineComponent<
  __VLS_Props$27,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$27> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$40: __VLS_WithSlots$26<typeof __VLS_base$26, __VLS_Slots$26>
declare const _default$40: typeof __VLS_export$40
type __VLS_WithSlots$26<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/select/select-scroll-down-button.vue.d.ts
type __VLS_Props$26 = SelectScrollDownButtonProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_8$10: {}
type __VLS_Slots$25 = {} & {
  default?: (props: typeof __VLS_8$10) => any
}
declare const __VLS_base$25: vue0.DefineComponent<
  __VLS_Props$26,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$26> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$39: __VLS_WithSlots$25<typeof __VLS_base$25, __VLS_Slots$25>
declare const _default$39: typeof __VLS_export$39
type __VLS_WithSlots$25<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/slider/slider.vue.d.ts
type __VLS_Props$25 = SliderRootProps & {
  class?: HTMLAttributes['class']
}
declare const __VLS_export$38: vue0.DefineComponent<
  __VLS_Props$25,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:modelValue': (payload: number[] | undefined) => any
    valueCommit: (payload: number[]) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$25> &
    Readonly<{
      'onUpdate:modelValue'?: ((payload: number[] | undefined) => any) | undefined
      onValueCommit?: ((payload: number[]) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const _default$38: typeof __VLS_export$38
//#endregion
//#region src/renderer/src/components/ui/table/table.vue.d.ts
type __VLS_Props$24 = {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$9: {}
type __VLS_Slots$24 = {} & {
  default?: (props: typeof __VLS_1$9) => any
}
declare const __VLS_base$24: vue0.DefineComponent<
  __VLS_Props$24,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$24> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$37: __VLS_WithSlots$24<typeof __VLS_base$24, __VLS_Slots$24>
declare const _default$37: typeof __VLS_export$37
type __VLS_WithSlots$24<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/table/table-header.vue.d.ts
type __VLS_Props$23 = {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$8: {}
type __VLS_Slots$23 = {} & {
  default?: (props: typeof __VLS_1$8) => any
}
declare const __VLS_base$23: vue0.DefineComponent<
  __VLS_Props$23,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$23> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$36: __VLS_WithSlots$23<typeof __VLS_base$23, __VLS_Slots$23>
declare const _default$36: typeof __VLS_export$36
type __VLS_WithSlots$23<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/table/table-body.vue.d.ts
type __VLS_Props$22 = {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$7: {}
type __VLS_Slots$22 = {} & {
  default?: (props: typeof __VLS_1$7) => any
}
declare const __VLS_base$22: vue0.DefineComponent<
  __VLS_Props$22,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$22> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$35: __VLS_WithSlots$22<typeof __VLS_base$22, __VLS_Slots$22>
declare const _default$35: typeof __VLS_export$35
type __VLS_WithSlots$22<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/table/table-footer.vue.d.ts
type __VLS_Props$21 = {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$6: {}
type __VLS_Slots$21 = {} & {
  default?: (props: typeof __VLS_1$6) => any
}
declare const __VLS_base$21: vue0.DefineComponent<
  __VLS_Props$21,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$21> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$34: __VLS_WithSlots$21<typeof __VLS_base$21, __VLS_Slots$21>
declare const _default$34: typeof __VLS_export$34
type __VLS_WithSlots$21<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/table/table-row.vue.d.ts
type __VLS_Props$20 = {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$5: {}
type __VLS_Slots$20 = {} & {
  default?: (props: typeof __VLS_1$5) => any
}
declare const __VLS_base$20: vue0.DefineComponent<
  __VLS_Props$20,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$20> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$33: __VLS_WithSlots$20<typeof __VLS_base$20, __VLS_Slots$20>
declare const _default$33: typeof __VLS_export$33
type __VLS_WithSlots$20<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/table/table-head.vue.d.ts
type __VLS_Props$19 = {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$4: {}
type __VLS_Slots$19 = {} & {
  default?: (props: typeof __VLS_1$4) => any
}
declare const __VLS_base$19: vue0.DefineComponent<
  __VLS_Props$19,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$19> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$32: __VLS_WithSlots$19<typeof __VLS_base$19, __VLS_Slots$19>
declare const _default$32: typeof __VLS_export$32
type __VLS_WithSlots$19<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/table/table-cell.vue.d.ts
type __VLS_Props$18 = {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$3: {}
type __VLS_Slots$18 = {} & {
  default?: (props: typeof __VLS_1$3) => any
}
declare const __VLS_base$18: vue0.DefineComponent<
  __VLS_Props$18,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$18> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$31: __VLS_WithSlots$18<typeof __VLS_base$18, __VLS_Slots$18>
declare const _default$31: typeof __VLS_export$31
type __VLS_WithSlots$18<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/table/table-caption.vue.d.ts
type __VLS_Props$17 = {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$2: {}
type __VLS_Slots$17 = {} & {
  default?: (props: typeof __VLS_1$2) => any
}
declare const __VLS_base$17: vue0.DefineComponent<
  __VLS_Props$17,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$17> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$30: __VLS_WithSlots$17<typeof __VLS_base$17, __VLS_Slots$17>
declare const _default$30: typeof __VLS_export$30
type __VLS_WithSlots$17<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/tabs/tabs.vue.d.ts
type __VLS_Props$16 = TabsRootProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_8$9: {
  modelValue: string | number | undefined
}
type __VLS_Slots$16 = {} & {
  default?: (props: typeof __VLS_8$9) => any
}
declare const __VLS_base$16: vue0.DefineComponent<
  __VLS_Props$16,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:modelValue': (payload: string | number) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$16> &
    Readonly<{
      'onUpdate:modelValue'?: ((payload: string | number) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$29: __VLS_WithSlots$16<typeof __VLS_base$16, __VLS_Slots$16>
declare const _default$29: typeof __VLS_export$29
type __VLS_WithSlots$16<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/tabs/tabs-list.vue.d.ts
type __VLS_Props$15 = TabsListProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_8$8: {}
type __VLS_Slots$15 = {} & {
  default?: (props: typeof __VLS_8$8) => any
}
declare const __VLS_base$15: vue0.DefineComponent<
  __VLS_Props$15,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$15> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$28: __VLS_WithSlots$15<typeof __VLS_base$15, __VLS_Slots$15>
declare const _default$28: typeof __VLS_export$28
type __VLS_WithSlots$15<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/tabs/tabs-trigger.vue.d.ts
type __VLS_Props$14 = TabsTriggerProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_8$7: {}
type __VLS_Slots$14 = {} & {
  default?: (props: typeof __VLS_8$7) => any
}
declare const __VLS_base$14: vue0.DefineComponent<
  __VLS_Props$14,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$14> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$27: __VLS_WithSlots$14<typeof __VLS_base$14, __VLS_Slots$14>
declare const _default$27: typeof __VLS_export$27
type __VLS_WithSlots$14<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/tabs/tabs-content.vue.d.ts
type __VLS_Props$13 = TabsContentProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_8$6: {}
type __VLS_Slots$13 = {} & {
  default?: (props: typeof __VLS_8$6) => any
}
declare const __VLS_base$13: vue0.DefineComponent<
  __VLS_Props$13,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$13> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$26: __VLS_WithSlots$13<typeof __VLS_base$13, __VLS_Slots$13>
declare const _default$26: typeof __VLS_export$26
type __VLS_WithSlots$13<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/tooltip/tooltip.vue.d.ts
declare var __VLS_8$5: {
  open: boolean
}
type __VLS_Slots$12 = {} & {
  default?: (props: typeof __VLS_8$5) => any
}
declare const __VLS_base$12: vue0.DefineComponent<
  TooltipRootProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:open': (value: boolean) => any
  },
  string,
  vue0.PublicProps,
  Readonly<TooltipRootProps> &
    Readonly<{
      'onUpdate:open'?: ((value: boolean) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$25: __VLS_WithSlots$12<typeof __VLS_base$12, __VLS_Slots$12>
declare const _default$25: typeof __VLS_export$25
type __VLS_WithSlots$12<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/tooltip/tooltip-trigger.vue.d.ts
declare var __VLS_8$4: {}
type __VLS_Slots$11 = {} & {
  default?: (props: typeof __VLS_8$4) => any
}
declare const __VLS_base$11: vue0.DefineComponent<
  TooltipTriggerProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<TooltipTriggerProps> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$24: __VLS_WithSlots$11<typeof __VLS_base$11, __VLS_Slots$11>
declare const _default$24: typeof __VLS_export$24
type __VLS_WithSlots$11<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/tooltip/tooltip-content.vue.d.ts
type __VLS_Props$12 = TooltipContentProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_14$2: {}
type __VLS_Slots$10 = {} & {
  default?: (props: typeof __VLS_14$2) => any
}
declare const __VLS_base$10: vue0.DefineComponent<
  __VLS_Props$12,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    escapeKeyDown: (event: KeyboardEvent) => any
    pointerDownOutside: (event: Event) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$12> &
    Readonly<{
      onEscapeKeyDown?: ((event: KeyboardEvent) => any) | undefined
      onPointerDownOutside?: ((event: Event) => any) | undefined
    }>,
  {
    sideOffset: number
    collisionPadding: number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$23: __VLS_WithSlots$10<typeof __VLS_base$10, __VLS_Slots$10>
declare const _default$23: typeof __VLS_export$23
type __VLS_WithSlots$10<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/tooltip/tooltip-provider.vue.d.ts
declare var __VLS_8$3: {}
type __VLS_Slots$9 = {} & {
  default?: (props: typeof __VLS_8$3) => any
}
declare const __VLS_base$9: vue0.DefineComponent<
  TooltipProviderProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<TooltipProviderProps> & Readonly<{}>,
  {
    delayDuration: number
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$22: __VLS_WithSlots$9<typeof __VLS_base$9, __VLS_Slots$9>
declare const _default$22: typeof __VLS_export$22
type __VLS_WithSlots$9<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/badge/variants.d.ts
/**
 * Desktop-style Badge
 * - Compact sizing
 * - Muted colors
 * - Small border-radius
 */
declare const badgeVariants: (
  props?:
    | ({
        variant?:
          | 'default'
          | 'destructive'
          | 'outline'
          | 'secondary'
          | 'success'
          | 'warning'
          | null
          | undefined
      } & class_variance_authority_types0.ClassProp)
    | undefined
) => string
type BadgeVariants = VariantProps<typeof badgeVariants>
//#endregion
//#region src/renderer/src/components/ui/badge/badge.vue.d.ts
type __VLS_Props$11 = PrimitiveProps & {
  variant?: BadgeVariants['variant']
  class?: HTMLAttributes['class']
}
declare var __VLS_8$2: {}
type __VLS_Slots$8 = {} & {
  default?: (props: typeof __VLS_8$2) => any
}
declare const __VLS_base$8: vue0.DefineComponent<
  __VLS_Props$11,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$11> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$21: __VLS_WithSlots$8<typeof __VLS_base$8, __VLS_Slots$8>
declare const _default$21: typeof __VLS_export$21
type __VLS_WithSlots$8<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/button/variants.d.ts
/**
 * Desktop-style Button
 * - Flat design with subtle borders
 * - Compact sizing for information density
 * - Minimal animations for professional feel
 */
declare const buttonVariants: (
  props?:
    | ({
        variant?:
          | 'default'
          | 'text'
          | 'link'
          | 'destructive'
          | 'ghost'
          | 'outline'
          | 'secondary'
          | null
          | undefined
        size?:
          | 'icon'
          | 'default'
          | 'xs'
          | 'sm'
          | 'lg'
          | 'icon-xs'
          | 'icon-sm'
          | 'icon-lg'
          | null
          | undefined
      } & class_variance_authority_types0.ClassProp)
    | undefined
) => string
type ButtonVariants = VariantProps<typeof buttonVariants>
//#endregion
//#region src/renderer/src/components/ui/button/types.d.ts
interface ButtonProps extends PrimitiveProps {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
}
//#endregion
//#region src/renderer/src/components/ui/button/button.vue.d.ts
declare var __VLS_8$1: {}
type __VLS_Slots$7 = {} & {
  default?: (props: typeof __VLS_8$1) => any
}
declare const __VLS_base$7: vue0.DefineComponent<
  ButtonProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<ButtonProps> & Readonly<{}>,
  {
    as: reka_ui17.AsTag | vue0.Component
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$20: __VLS_WithSlots$7<typeof __VLS_base$7, __VLS_Slots$7>
declare const _default$20: typeof __VLS_export$20
type __VLS_WithSlots$7<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/checkbox/checkbox.vue.d.ts
type __VLS_Props$10 = CheckboxRootProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_14$1: {
  modelValue: reka_ui17.CheckboxCheckedState
  state: reka_ui17.CheckboxCheckedState
}
type __VLS_Slots$6 = {} & {
  default?: (props: typeof __VLS_14$1) => any
}
declare const __VLS_base$6: vue0.DefineComponent<
  __VLS_Props$10,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:modelValue': (value: boolean | 'indeterminate') => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$10> &
    Readonly<{
      'onUpdate:modelValue'?: ((value: boolean | 'indeterminate') => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$19: __VLS_WithSlots$6<typeof __VLS_base$6, __VLS_Slots$6>
declare const _default$19: typeof __VLS_export$19
type __VLS_WithSlots$6<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/delete-confirm-dialog/delete-confirm-dialog.vue.d.ts
interface Props$8 {
  entityLabel: string
  entityName?: string
  /**
   * Mode of the dialog:
   * - 'delete': Permanent deletion from database (default)
   * - 'remove': Removal from form/list (not permanent)
   */
  mode?: 'delete' | 'remove'
  /**
   * Whether the dialog is loading data.
   * When true, shows a spinner instead of content.
   */
  loading?: boolean
}
type __VLS_Props$9 = Props$8
type __VLS_ModelProps$2 = {
  open: boolean
}
type __VLS_PublicProps$2 = __VLS_Props$9 & __VLS_ModelProps$2
declare var __VLS_37: {}
type __VLS_Slots$5 = {} & {
  default?: (props: typeof __VLS_37) => any
}
declare const __VLS_base$5: vue0.DefineComponent<
  __VLS_PublicProps$2,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:open': (value: boolean) => any
    confirm: () => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_PublicProps$2> &
    Readonly<{
      'onUpdate:open'?: ((value: boolean) => any) | undefined
      onConfirm?: (() => any) | undefined
    }>,
  {
    mode: 'delete' | 'remove'
    loading: boolean
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$18: __VLS_WithSlots$5<typeof __VLS_base$5, __VLS_Slots$5>
declare const _default$18: typeof __VLS_export$18
type __VLS_WithSlots$5<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/form/form.vue.d.ts
interface Props$7 {
  class?: HTMLAttributes['class']
}
declare var __VLS_1$1: {}
type __VLS_Slots$4 = {} & {
  default?: (props: typeof __VLS_1$1) => any
}
declare const __VLS_base$4: vue0.DefineComponent<
  Props$7,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    submit: () => any
  },
  string,
  vue0.PublicProps,
  Readonly<Props$7> &
    Readonly<{
      onSubmit?: (() => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$17: __VLS_WithSlots$4<typeof __VLS_base$4, __VLS_Slots$4>
declare const _default$17: typeof __VLS_export$17
type __VLS_WithSlots$4<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/hover-scale-image/hover-scale-image.vue.d.ts
interface Props$6 {
  class?: HTMLAttributes['class']
  scaleInitial?: number
  scaleHover?: number
}
declare var __VLS_1: {}
type __VLS_Slots$3 = {} & {
  default?: (props: typeof __VLS_1) => any
}
declare const __VLS_base$3: vue0.DefineComponent<
  Props$6,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$6> & Readonly<{}>,
  {
    scaleInitial: number
    scaleHover: number
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$16: __VLS_WithSlots$3<typeof __VLS_base$3, __VLS_Slots$3>
declare const _default$16: typeof __VLS_export$16
type __VLS_WithSlots$3<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/icon/icon.vue.d.ts
type __VLS_Props$8 = {
  icon: string
  class?: string
}
declare const __VLS_export$15: vue0.DefineComponent<
  __VLS_Props$8,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$8> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const _default$15: typeof __VLS_export$15
//#endregion
//#region src/renderer/src/components/ui/image-cropper-dialog/types.d.ts
interface CropRegion {
  x: number
  y: number
  width: number
  height: number
}
interface NormalizedCropRegion {
  /** Left position in [0..1] */
  x: number
  /** Top position in [0..1] */
  y: number
  /** Width in [0..1] */
  width: number
  /** Height in [0..1] */
  height: number
}
interface CropConfirmPayload {
  /** Crop rect normalized to the rendered image bounds (0..1). */
  normalized: NormalizedCropRegion
  /** Crop rect in pixels relative to the original image (naturalWidth/naturalHeight). */
  pixels: CropRegion
  natural: {
    width: number
    height: number
  }
}
//#endregion
//#region src/renderer/src/components/ui/image-cropper-dialog/image-cropper-dialog.vue.d.ts
interface Props$5 {
  /** Image source URL */
  src: string
  /** Dialog title */
  title?: string
  /** Aspect ratio to enforce (e.g. 3/4, 16/9). Undefined = free crop */
  aspectRatio?: number
  /** Whether to show aspect ratio lock toggle. Only effective when aspectRatio is set */
  allowFreeAspect?: boolean
  /** Display label for the aspect ratio (e.g. "3:4", "16:9") */
  aspectLabel?: string
  /** Loading state for confirm button */
  loading?: boolean
}
type __VLS_Props$7 = Props$5
type __VLS_ModelProps$1 = {
  open: boolean
}
type __VLS_PublicProps$1 = __VLS_Props$7 & __VLS_ModelProps$1
declare const __VLS_export$14: vue0.DefineComponent<
  __VLS_PublicProps$1,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:open': (value: boolean) => any
    confirm: (payload: CropConfirmPayload) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_PublicProps$1> &
    Readonly<{
      'onUpdate:open'?: ((value: boolean) => any) | undefined
      onConfirm?: ((payload: CropConfirmPayload) => any) | undefined
    }>,
  {
    title: string
    allowFreeAspect: boolean
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const _default$14: typeof __VLS_export$14
//#endregion
//#region src/renderer/src/components/ui/input/input.vue.d.ts
type __VLS_Props$6 = {
  defaultValue?: string | number
  modelValue?: string | number
  type?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  class?: HTMLAttributes['class']
}
declare const __VLS_export$13: vue0.DefineComponent<
  __VLS_Props$6,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {} & {
    'update:modelValue': (payload: string | number) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$6> &
    Readonly<{
      'onUpdate:modelValue'?: ((payload: string | number) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const _default$13: typeof __VLS_export$13
//#endregion
//#region src/renderer/src/components/ui/label/label.vue.d.ts
type __VLS_Props$5 = LabelProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_8: {}
type __VLS_Slots$2 = {} & {
  default?: (props: typeof __VLS_8) => any
}
declare const __VLS_base$2: vue0.DefineComponent<
  __VLS_Props$5,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$5> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$12: __VLS_WithSlots$2<typeof __VLS_base$2, __VLS_Slots$2>
declare const _default$12: typeof __VLS_export$12
type __VLS_WithSlots$2<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/locale-select/locale-select.vue.d.ts
interface Props$4 {
  placeholder?: string
  allowEmpty?: boolean
  class?: HTMLAttributes['class']
  triggerClass?: HTMLAttributes['class']
  size?: 'default' | 'sm'
}
type __VLS_Props$4 = Props$4
type __VLS_ModelProps = {
  modelValue?: Locale | null
}
type __VLS_PublicProps = __VLS_Props$4 & __VLS_ModelProps
declare const __VLS_export$11: vue0.DefineComponent<
  __VLS_PublicProps,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:modelValue': (value: Locale | null) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_PublicProps> &
    Readonly<{
      'onUpdate:modelValue'?: ((value: Locale | null) => any) | undefined
    }>,
  {
    size: 'default' | 'sm'
    placeholder: string
    allowEmpty: boolean
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const _default$11: typeof __VLS_export$11
//#endregion
//#region src/renderer/src/components/ui/progress/progress.vue.d.ts
type __VLS_Props$3 = ProgressRootProps & {
  class?: HTMLAttributes['class']
}
declare const __VLS_export$10: vue0.DefineComponent<
  __VLS_Props$3,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$3> & Readonly<{}>,
  {
    modelValue: number | null
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const _default$10: typeof __VLS_export$10
//#endregion
//#region src/renderer/src/components/ui/section-header/section-header.vue.d.ts
interface Props$3 {
  title: string
  icon?: Component
  editable?: boolean
  class?: HTMLAttributes['class']
}
declare var __VLS_6: {}
type __VLS_Slots$1 = {} & {
  actions?: (props: typeof __VLS_6) => any
}
declare const __VLS_base$1: vue0.DefineComponent<
  Props$3,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    edit: () => any
  },
  string,
  vue0.PublicProps,
  Readonly<Props$3> &
    Readonly<{
      onEdit?: (() => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$9: __VLS_WithSlots$1<typeof __VLS_base$1, __VLS_Slots$1>
declare const _default$9: typeof __VLS_export$9
type __VLS_WithSlots$1<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/separator/separator.vue.d.ts
type __VLS_Props$2 = SeparatorProps & {
  class?: HTMLAttributes['class']
}
declare const __VLS_export$8: vue0.DefineComponent<
  __VLS_Props$2,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$2> & Readonly<{}>,
  {
    orientation: 'horizontal' | 'vertical'
    decorative: boolean
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const _default$8: typeof __VLS_export$8
//#endregion
//#region src/renderer/src/components/ui/spinner/spinner.vue.d.ts
interface Props$2 {
  class?: HTMLAttributes['class']
}
declare const __VLS_export$7: vue0.DefineComponent<
  Props$2,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$2> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const _default$7: typeof __VLS_export$7
//#endregion
//#region src/renderer/src/components/ui/switch/switch.vue.d.ts
type __VLS_Props$1 = SwitchRootProps & {
  class?: HTMLAttributes['class']
}
declare var __VLS_14: {
  modelValue: boolean
}
type __VLS_Slots = {} & {
  thumb?: (props: typeof __VLS_14) => any
}
declare const __VLS_base: vue0.DefineComponent<
  __VLS_Props$1,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:modelValue': (payload: boolean) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props$1> &
    Readonly<{
      'onUpdate:modelValue'?: ((payload: boolean) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const __VLS_export$6: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>
declare const _default$6: typeof __VLS_export$6
type __VLS_WithSlots<T, S> = T & {
  new (): {
    $slots: S
  }
}
//#endregion
//#region src/renderer/src/components/ui/textarea/textarea.vue.d.ts
type __VLS_Props = {
  class?: HTMLAttributes['class']
  defaultValue?: string | number
  modelValue?: string | number
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  rows?: number
}
declare const __VLS_export$5: vue0.DefineComponent<
  __VLS_Props,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:modelValue': (payload: string | number) => any
  },
  string,
  vue0.PublicProps,
  Readonly<__VLS_Props> &
    Readonly<{
      'onUpdate:modelValue'?: ((payload: string | number) => any) | undefined
    }>,
  {},
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const _default$5: typeof __VLS_export$5
//#endregion
//#region src/renderer/src/components/ui/toaster/toaster.vue.d.ts
interface Props$1 {
  expand?: boolean
  closeButton?: boolean
  position?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top-center'
    | 'bottom-center'
  swipeDirections?: Array<'top' | 'right' | 'bottom' | 'left'>
}
declare const __VLS_export$4: vue0.DefineComponent<
  Props$1,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {},
  string,
  vue0.PublicProps,
  Readonly<Props$1> & Readonly<{}>,
  {
    position:
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right'
      | 'top-center'
      | 'bottom-center'
    expand: boolean
    closeButton: boolean
    swipeDirections: Array<'top' | 'right' | 'bottom' | 'left'>
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const _default$4: typeof __VLS_export$4
//#endregion
//#region src/renderer/src/components/ui/virtual/virtual-grid.vue.d.ts
declare const __VLS_export$3: <T>(
  __VLS_props: NonNullable<Awaited<typeof __VLS_setup>>['props'],
  __VLS_ctx?: __VLS_PrettifyLocal$2<
    Pick<NonNullable<Awaited<typeof __VLS_setup>>, 'attrs' | 'emit' | 'slots'>
  >,
  __VLS_exposed?: NonNullable<Awaited<typeof __VLS_setup>>['expose'],
  __VLS_setup?: Promise<{
    props: vue0.PublicProps &
      __VLS_PrettifyLocal$2<{
        /** Items to render */ items: T[] /** Custom key extractor, defaults to index */
        getKey?: (
          item: T,
          index: number
        ) => string | number /** External scroll parent element (for parent container scrolling) */
        scrollParent?: HTMLElement | null /** Container/grid class - defaults to responsive auto-fill grid */
        class?: HTMLAttributes['class'] /** Overscan row count for virtualizer */
        overscan?: number
      }> &
      (typeof globalThis extends {
        __VLS_PROPS_FALLBACK: infer P
      }
        ? P
        : {})
    expose: (
      exposed: vue0.ShallowUnwrapRef<{
        scrollToIndex: (
          index: number,
          options?: {
            align?: 'start' | 'center' | 'end'
          }
        ) => void
        virtualizer: vue0.Ref<
          _tanstack_vue_virtual0.Virtualizer<HTMLElement, Element>,
          _tanstack_vue_virtual0.Virtualizer<HTMLElement, Element>
        >
        columnCount: vue0.Ref<number, number>
        measuredRowHeight: vue0.Ref<number, number>
      }>
    ) => void
    attrs: any
    slots: {
      /** Item slot - receives item and index */ item: (props: {
        item: T
        index: number
      }) => void /** Empty state slot */
      empty?: () => void
    }
    emit: {}
  }>
) => vue0.VNode & {
  __ctx?: Awaited<typeof __VLS_setup>
}
declare const _default$3: typeof __VLS_export$3
type __VLS_PrettifyLocal$2<T> = (T extends any
  ? { [K in keyof T]: T[K] }
  : { [K in keyof T as K]: T[K] }) & {}
//#endregion
//#region src/renderer/src/components/ui/virtual/virtual-horizontal-scroll.vue.d.ts
declare const __VLS_export$2: <T>(
  __VLS_props: NonNullable<Awaited<typeof __VLS_setup>>['props'],
  __VLS_ctx?: __VLS_PrettifyLocal$1<
    Pick<NonNullable<Awaited<typeof __VLS_setup>>, 'attrs' | 'emit' | 'slots'>
  >,
  __VLS_exposed?: NonNullable<Awaited<typeof __VLS_setup>>['expose'],
  __VLS_setup?: Promise<{
    props: vue0.PublicProps &
      __VLS_PrettifyLocal$1<
        {
          /** Items to render */ items: T[] /** Custom key extractor, defaults to index */
          getKey?: (item: T, index: number) => string | number /** External scroll parent element */
          scrollParent?: HTMLElement | null /** Container class - defaults to flex with gap */
          class?: HTMLAttributes['class'] /** Overscan count for virtualizer */
          overscan?: number
        } & {
          onScrollStateChange?:
            | ((args_0: { canScrollLeft: boolean; canScrollRight: boolean }) => any)
            | undefined
        }
      > &
      (typeof globalThis extends {
        __VLS_PROPS_FALLBACK: infer P
      }
        ? P
        : {})
    expose: (
      exposed: vue0.ShallowUnwrapRef<{
        scrollLeft: () => void
        scrollRight: () => void
        scrollToIndex: (
          index: number,
          options?: {
            align?: 'start' | 'center' | 'end'
          }
        ) => void
        canScrollLeft: vue0.Ref<boolean, boolean>
        canScrollRight: vue0.Ref<boolean, boolean>
        virtualizer: vue0.Ref<
          _tanstack_vue_virtual0.Virtualizer<HTMLElement, Element>,
          _tanstack_vue_virtual0.Virtualizer<HTMLElement, Element>
        >
        measuredItemWidth: vue0.Ref<number, number>
        measuredItemHeight: vue0.Ref<number, number>
      }>
    ) => void
    attrs: any
    slots: {
      /** Item slot - receives item and index */ item: (props: {
        item: T
        index: number
      }) => void /** Empty state slot */
      empty?: () => void
    }
    emit: (
      evt: 'scrollStateChange',
      args_0: {
        canScrollLeft: boolean
        canScrollRight: boolean
      }
    ) => void
  }>
) => vue0.VNode & {
  __ctx?: Awaited<typeof __VLS_setup>
}
declare const _default$2: typeof __VLS_export$2
type __VLS_PrettifyLocal$1<T> = (T extends any
  ? { [K in keyof T]: T[K] }
  : { [K in keyof T as K]: T[K] }) & {}
//#endregion
//#region src/renderer/src/components/ui/virtual/virtual-list.vue.d.ts
declare const __VLS_export$1: <T>(
  __VLS_props: NonNullable<Awaited<typeof __VLS_setup>>['props'],
  __VLS_ctx?: __VLS_PrettifyLocal<
    Pick<NonNullable<Awaited<typeof __VLS_setup>>, 'attrs' | 'emit' | 'slots'>
  >,
  __VLS_exposed?: NonNullable<Awaited<typeof __VLS_setup>>['expose'],
  __VLS_setup?: Promise<{
    props: vue0.PublicProps &
      __VLS_PrettifyLocal<{
        /** Items to render */ items: T[] /** Custom key extractor, defaults to index */
        getKey?: (
          item: T,
          index: number
        ) => string | number /** External scroll parent element (for parent container scrolling) */
        scrollParent?: HTMLElement | null /** Container class - defaults to flex column with small gap */
        class?: HTMLAttributes['class'] /** Overscan count for virtualizer */
        overscan?: number
      }> &
      (typeof globalThis extends {
        __VLS_PROPS_FALLBACK: infer P
      }
        ? P
        : {})
    expose: (
      exposed: vue0.ShallowUnwrapRef<{
        scrollToIndex: (
          index: number,
          options?: {
            align?: 'start' | 'center' | 'end'
          }
        ) => void
        virtualizer: vue0.Ref<
          _tanstack_vue_virtual0.Virtualizer<HTMLElement, Element>,
          _tanstack_vue_virtual0.Virtualizer<HTMLElement, Element>
        >
        measuredItemHeight: vue0.Ref<number, number>
        measuredGap: vue0.Ref<number, number>
      }>
    ) => void
    attrs: any
    slots: {
      /** Item slot - receives item and index */ item: (props: {
        item: T
        index: number
      }) => void /** Empty state slot */
      empty?: () => void
    }
    emit: {}
  }>
) => vue0.VNode & {
  __ctx?: Awaited<typeof __VLS_setup>
}
declare const _default$1: typeof __VLS_export$1
type __VLS_PrettifyLocal<T> = (T extends any
  ? { [K in keyof T]: T[K] }
  : { [K in keyof T as K]: T[K] }) & {}
//#endregion
//#region src/renderer/src/components/ui/virtualized-combobox/types.d.ts
interface VirtualizedComboboxEntity {
  /** Unique identifier */
  id: string
  /** Primary display name */
  name: string
  /** Secondary text (e.g., original name) */
  subText?: string
  /** Image URL for avatar display */
  imageUrl?: string | null
}
//#endregion
//#region src/renderer/src/components/ui/virtualized-combobox/virtualized-combobox.vue.d.ts
interface Props {
  /** Entity list to select from */
  entities: VirtualizedComboboxEntity[]
  /** Currently selected entity IDs */
  selectedIds: string[]
  /** Search placeholder text */
  placeholder?: string
  /** Text shown when nothing is selected */
  emptyText?: string
  /** Enable multiple selection */
  multiple?: boolean
  /** Custom class name for the trigger button */
  class?: HTMLAttributes['class']
  /** Disable the combobox */
  disabled?: boolean
  /** Popover max height in pixels */
  maxHeight?: number
  /** Allow creating new items */
  allowCreate?: boolean
}
declare const __VLS_export: vue0.DefineComponent<
  Props,
  {},
  {},
  {},
  {},
  vue0.ComponentOptionsMixin,
  vue0.ComponentOptionsMixin,
  {
    'update:selectedIds': (ids: string[]) => any
    create: (value: string) => any
  },
  string,
  vue0.PublicProps,
  Readonly<Props> &
    Readonly<{
      'onUpdate:selectedIds'?: ((ids: string[]) => any) | undefined
      onCreate?: ((value: string) => any) | undefined
    }>,
  {
    multiple: boolean
    disabled: boolean
    placeholder: string
    emptyText: string
    maxHeight: number
    allowCreate: boolean
  },
  {},
  {},
  {},
  string,
  vue0.ComponentProvideOptions,
  false,
  {},
  any
>
declare const _default: typeof __VLS_export
declare namespace ui_d_exports {
  export {
    _default$158 as AlertDialog,
    _default$151 as AlertDialogAction,
    _default$150 as AlertDialogCancel,
    _default$156 as AlertDialogContent,
    _default$153 as AlertDialogDescription,
    _default$152 as AlertDialogFooter,
    _default$155 as AlertDialogHeader,
    _default$154 as AlertDialogTitle,
    _default$157 as AlertDialogTrigger,
    _default$21 as Badge,
    _default$20 as Button,
    _default$149 as ButtonGroup,
    _default$148 as ButtonGroupSeparator,
    _default$147 as ButtonGroupText,
    _default$146 as Card,
    _default$140 as CardAction,
    _default$142 as CardContent,
    _default$143 as CardDescription,
    _default$141 as CardFooter,
    _default$145 as CardHeader,
    _default$144 as CardTitle,
    _default$19 as Checkbox,
    _default$139 as Collapsible,
    _default$137 as CollapsibleContent,
    _default$136 as CollapsibleGroup,
    _default$131 as CollapsibleGroupContent,
    _default$132 as CollapsibleGroupCount,
    _default$133 as CollapsibleGroupLabel,
    _default$134 as CollapsibleGroupToggle,
    _default$135 as CollapsibleGroupTrigger,
    _default$138 as CollapsibleTrigger,
    _default$130 as Command,
    _default$129 as CommandDialog,
    _default$128 as CommandEmpty,
    _default$127 as CommandGroup,
    _default$126 as CommandInput,
    _default$125 as CommandItem,
    _default$124 as CommandList,
    _default$123 as CommandSeparator,
    _default$122 as CommandShortcut,
    _default$121 as ContextMenu,
    _default$111 as ContextMenuCheckboxItem,
    _default$119 as ContextMenuContent,
    _default$115 as ContextMenuGroup,
    _default$118 as ContextMenuItem,
    _default$116 as ContextMenuLabel,
    _default$110 as ContextMenuRadioGroup,
    _default$109 as ContextMenuRadioItem,
    _default$117 as ContextMenuSeparator,
    _default$108 as ContextMenuShortcut,
    _default$114 as ContextMenuSub,
    _default$112 as ContextMenuSubContent,
    _default$113 as ContextMenuSubTrigger,
    _default$120 as ContextMenuTrigger,
    _default$18 as DeleteConfirmDialog,
    _default$107 as Dialog,
    _default$100 as DialogBody,
    _default$105 as DialogContent,
    _default$101 as DialogDescription,
    _default$99 as DialogFooter,
    _default$103 as DialogHeader,
    _default$104 as DialogOverlay,
    _default$102 as DialogTitle,
    _default$106 as DialogTrigger,
    _default$98 as DropdownMenu,
    _default$94 as DropdownMenuCheckboxItem,
    _default$96 as DropdownMenuContent,
    _default$88 as DropdownMenuGroup,
    _default$95 as DropdownMenuItem,
    _default$91 as DropdownMenuLabel,
    _default$93 as DropdownMenuRadioGroup,
    _default$92 as DropdownMenuRadioItem,
    _default$90 as DropdownMenuSeparator,
    _default$89 as DropdownMenuShortcut,
    _default$87 as DropdownMenuSub,
    _default$85 as DropdownMenuSubContent,
    _default$86 as DropdownMenuSubTrigger,
    _default$97 as DropdownMenuTrigger,
    _default$84 as Empty,
    _default$79 as EmptyContent,
    _default$80 as EmptyDescription,
    _default$83 as EmptyHeader,
    _default$82 as EmptyMedia,
    _default$81 as EmptyTitle,
    _default$78 as Field,
    _default$76 as FieldContent,
    _default$74 as FieldDescription,
    _default$69 as FieldError,
    _default$77 as FieldGroup,
    _default$75 as FieldLabel,
    _default$72 as FieldLegend,
    _default$70 as FieldSeparator,
    _default$73 as FieldSet,
    _default$71 as FieldTitle,
    _default$17 as Form,
    _default$68 as HoverCard,
    _default$66 as HoverCardContent,
    _default$67 as HoverCardTrigger,
    _default$16 as HoverScaleImage,
    _default$15 as Icon,
    _default$14 as ImageCropperDialog,
    _default$13 as Input,
    _default$65 as InputGroup,
    _default$64 as InputGroupAddon,
    _default$63 as InputGroupButton,
    _default$61 as InputGroupInput,
    _default$62 as InputGroupText,
    _default$60 as InputGroupTextarea,
    _default$12 as Label,
    _default$11 as LocaleSelect,
    _default$159 as MarkdownEditor,
    _default$59 as Popover,
    _default$56 as PopoverAnchor,
    _default$57 as PopoverContent,
    _default$58 as PopoverTrigger,
    _default$10 as Progress,
    _default$55 as RadioGroup,
    _default$54 as RadioGroupItem,
    _default$51 as ResizableHandle,
    _default$53 as ResizableLayout,
    _default$52 as ResizablePanel,
    _default$9 as SectionHeader,
    _default$50 as SegmentedControl,
    _default$49 as SegmentedControlItem,
    _default$48 as Select,
    _default$45 as SelectContent,
    _default$43 as SelectGroup,
    _default$44 as SelectItem,
    _default$42 as SelectLabel,
    _default$39 as SelectScrollDownButton,
    _default$40 as SelectScrollUpButton,
    _default$41 as SelectSeparator,
    _default$47 as SelectTrigger,
    _default$46 as SelectValue,
    _default$8 as Separator,
    _default$38 as Slider,
    _default$7 as Spinner,
    _default$6 as Switch,
    _default$37 as Table,
    _default$35 as TableBody,
    _default$30 as TableCaption,
    _default$31 as TableCell,
    _default$34 as TableFooter,
    _default$32 as TableHead,
    _default$36 as TableHeader,
    _default$33 as TableRow,
    _default$29 as Tabs,
    _default$26 as TabsContent,
    _default$28 as TabsList,
    _default$27 as TabsTrigger,
    _default$5 as Textarea,
    _default$4 as Toaster,
    _default$25 as Tooltip,
    _default$23 as TooltipContent,
    _default$22 as TooltipProvider,
    _default$24 as TooltipTrigger,
    _default$3 as VirtualGrid,
    _default$2 as VirtualHorizontalScroll,
    _default$1 as VirtualList,
    _default as VirtualizedCombobox,
    buttonGroupVariants,
    collapsibleGroupContentVariants,
    collapsibleGroupToggleVariants,
    collapsibleGroupTriggerVariants,
    collapsibleGroupVariants,
    provideCommandContext,
    provideCommandGroupContext,
    useCommand,
    useCommandGroup,
    useResizable
  }
}
//#endregion
//#region src/renderer/src/core/plugin/context.d.ts
/**
 * Global API provided to renderer process plugins.
 * Accessed via `kisaki.xxx` global object.
 *
 * Design philosophy: Full exposure - plugins are trusted first-class extensions.
 */
interface KisakiRendererAPI {
  /** Vue app instance (for advanced usage like app.config) */
  readonly app: App$1
  /** Router instance - use in activate/deactivate, components use useRouter() */
  readonly router: Router$1
  /** Pinia instance - use in activate/deactivate, components use stores directly */
  readonly pinia: Pinia$1
  /** Database access (via IPC proxy) - full Drizzle API */
  readonly db: typeof db
  /** Schema for type-safe queries */
  readonly schema: typeof index_d_exports$2
  /** Event manager for subscribing/emitting events */
  readonly events: typeof eventManager
  /** UI extension registry - register and query UI extensions */
  readonly extensions: typeof uiExtensions
  /** Theme system - register themes + control active theme/mode */
  readonly themes: typeof themeManager
  /** Notification API */
  readonly notify: typeof notify
  /** Core composables */
  readonly composables: typeof index_d_exports$1
  /** Core stores */
  readonly stores: typeof index_d_exports
  /** UI components */
  readonly ui: typeof ui_d_exports
  /** Logger - unified logging via electron-log */
  readonly log: typeof log
  /**
   * Shared external dependencies.
   * Plugins access these via SDK entry points (e.g., @kisaki/plugin-sdk/renderer/vue)
   */
  readonly __deps: {
    vue: typeof vue0
    'vue-router': typeof vue_router0
    pinia: typeof pinia3
    drizzle: typeof drizzle_orm0
  }
}
//#endregion
export {
  type App,
  type AppEventListener,
  type AppEvents,
  type CharacterMenuActionContext,
  type CollectionMenuActionContext,
  type CompanyMenuActionContext,
  type DetailTabDefinition,
  type EventEmitOptions,
  type EventUnsubscribe,
  type ExtractIpcData,
  type GameBatchMenuActionContext,
  type GameMenuActionContext,
  type IpcError,
  type IpcMainHandlers,
  type IpcMainListeners,
  type IpcRendererEvents,
  type IpcResult,
  type IpcSuccess,
  type IpcSuccessVoid,
  type IpcVoidResult,
  type KisakiRendererAPI,
  type MenuActionDefinition,
  type NotifyFunction,
  type NotifyOptions,
  type NotifyType,
  type PersonMenuActionContext,
  type Pinia,
  type ReactiveRegistry,
  type Router,
  type SettingsDialogDefinition,
  type SidebarNavDefinition,
  type TagMenuActionContext,
  type ThemeDefinition,
  type UiExtensions
}
