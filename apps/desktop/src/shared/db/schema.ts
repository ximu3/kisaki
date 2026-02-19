/**
 * Database schema - Table definitions
 *
 * All table definitions are in this file to avoid circular imports.
 * Relations are defined in ./schema-relations.ts
 */

import { sqliteTable, text, unique, integer, check, index } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

import {
  baseColumns,
  relatedSites,
  status,
  saveBackups,
  gameLauncherMode,
  gameMonitorMode,
  gamePersonType,
  gameCompanyType,
  gameCharacterType,
  characterPersonType,
  bloodType,
  cupSize,
  partialDate,
  gender,
  scannerIgnoredNames,
  nameExtractionRules,
  filterState,
  dynamicCollectionConfig,
  scraperSlotConfigs,
  stringArrayJson,
  mediaType,
  contentEntityType,
  locale,
  appLocale,
  mainWindowCloseAction,
  allEntityType,
  sectionLayout,
  sectionItemSize,
  sectionOpenMode,
  sortDirection
} from './custom-types'

// =============================================================================
// Games
// =============================================================================

export const games = sqliteTable(
  'games',
  {
    ...baseColumns,
    name: text('name').notNull().default('unknown game'),
    originalName: text('original_name'),
    sortName: text('sort_name'),
    coverFile: text('cover_file'),
    backdropFile: text('backdrop_file'),
    logoFile: text('logo_file'),
    iconFile: text('icon_file'),
    score: integer('score'),
    isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
    releaseDate: partialDate('release_date'),
    description: text('description'),
    relatedSites: relatedSites('related_sites'),
    status: status('status').notNull().default('notStarted'),
    lastActiveAt: integer('last_active_at', { mode: 'timestamp_ms' }),
    totalDuration: integer('total_duration').notNull().default(0),
    savePath: text('save_path'),
    saveBackups: saveBackups('save_backups'),
    maxSaveBackups: integer('max_save_backups').notNull().default(5),
    launcherMode: gameLauncherMode('launcher_mode').notNull().default('file'),
    launcherPath: text('launcher_path'),
    monitorMode: gameMonitorMode('monitor_mode').notNull().default('folder'),
    monitorPath: text('monitor_path'),
    gameDirPath: text('game_dir_path'),
    isNsfw: integer('is_nsfw', { mode: 'boolean' }).notNull().default(false),
    descriptionInlineFiles: stringArrayJson('description_inline_files').notNull().default([])
  },
  (t) => [
    index('idx_games_status').on(t.status),
    index('idx_games_is_favorite').on(t.isFavorite),
    index('idx_games_is_nsfw').on(t.isNsfw),
    index('idx_games_last_active_at').on(t.lastActiveAt),
    index('idx_games_created_at').on(t.createdAt),
    index('idx_games_name').on(t.name),
    index('idx_games_score').on(t.score)
  ]
)

export type Game = InferSelectModel<typeof games>
export type NewGame = InferInsertModel<typeof games>

export const gameNotes = sqliteTable(
  'game_notes',
  {
    ...baseColumns,
    gameId: text('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    name: text('name').notNull(),
    content: text('content'),
    contentInlineFiles: stringArrayJson('content_inline_files').notNull().default([]),
    coverFile: text('cover_file'),
    orderInGame: integer('order_in_game').notNull().default(0)
  },
  (t) => [
    unique('unique_game_notes_game_id_name').on(t.gameId, t.name),
    index('idx_game_notes_game_id').on(t.gameId),
    index('idx_game_notes_game_id_order').on(t.gameId, t.orderInGame)
  ]
)

export type GameNote = InferSelectModel<typeof gameNotes>
export type NewGameNote = InferInsertModel<typeof gameNotes>

// =============================================================================
// Persons
// =============================================================================

export const persons = sqliteTable(
  'persons',
  {
    ...baseColumns,
    name: text('name').notNull().default('unknown person'),
    originalName: text('original_name'),
    sortName: text('sort_name'),
    photoFile: text('photo_file'),
    score: integer('score'),
    isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
    isNsfw: integer('is_nsfw', { mode: 'boolean' }).notNull().default(false),
    birthDate: partialDate('birth_date'),
    deathDate: partialDate('death_date'),
    gender: gender('gender'),
    description: text('description'),
    relatedSites: relatedSites('related_sites')
  },
  (t) => [
    index('idx_persons_is_favorite').on(t.isFavorite),
    index('idx_persons_is_nsfw').on(t.isNsfw),
    index('idx_persons_gender').on(t.gender),
    index('idx_persons_created_at').on(t.createdAt),
    index('idx_persons_name').on(t.name),
    index('idx_persons_score').on(t.score)
  ]
)

export type Person = InferSelectModel<typeof persons>
export type NewPerson = InferInsertModel<typeof persons>

// =============================================================================
// Companies
// =============================================================================

export const companies = sqliteTable(
  'companies',
  {
    ...baseColumns,
    name: text('name').notNull().default('unknown company'),
    originalName: text('original_name'),
    sortName: text('sort_name'),
    foundedDate: partialDate('founded_date'),
    logoFile: text('logo_file'),
    score: integer('score'),
    isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
    isNsfw: integer('is_nsfw', { mode: 'boolean' }).notNull().default(false),
    relatedSites: relatedSites('related_sites'),
    description: text('description')
  },
  (t) => [
    index('idx_companies_is_favorite').on(t.isFavorite),
    index('idx_companies_is_nsfw').on(t.isNsfw),
    index('idx_companies_created_at').on(t.createdAt),
    index('idx_companies_name').on(t.name),
    index('idx_companies_score').on(t.score)
  ]
)

export type Company = InferSelectModel<typeof companies>
export type NewCompany = InferInsertModel<typeof companies>

// =============================================================================
// Characters
// =============================================================================

export const characters = sqliteTable(
  'characters',
  {
    ...baseColumns,
    name: text('name').notNull().default('unknown character'),
    originalName: text('original_name'),
    sortName: text('sort_name'),
    photoFile: text('photo_file'),
    birthDate: partialDate('birth_date'),
    gender: gender('gender'),
    bloodType: bloodType('blood_type'),
    height: integer('height'),
    weight: integer('weight'),
    bust: integer('bust'),
    waist: integer('waist'),
    hips: integer('hips'),
    cup: cupSize('cup'),

    age: integer('age'),
    score: integer('score'),
    isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
    isNsfw: integer('is_nsfw', { mode: 'boolean' }).notNull().default(false),
    description: text('description'),
    relatedSites: relatedSites('related_sites')
  },
  (t) => [
    index('idx_characters_is_favorite').on(t.isFavorite),
    index('idx_characters_is_nsfw').on(t.isNsfw),
    index('idx_characters_gender').on(t.gender),
    index('idx_characters_created_at').on(t.createdAt),
    index('idx_characters_name').on(t.name),
    index('idx_characters_score').on(t.score),
    index('idx_characters_age').on(t.age)
  ]
)

export type Character = InferSelectModel<typeof characters>
export type NewCharacter = InferInsertModel<typeof characters>

// =============================================================================
// External IDs (for entity deduplication)
// =============================================================================

export const gameExternalIds = sqliteTable(
  'game_external_ids',
  {
    ...baseColumns,
    gameId: text('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    source: text('source').notNull(),
    externalId: text('external_id').notNull(),
    orderInGame: integer('order_in_game').notNull().default(0)
  },
  (t) => [
    unique().on(t.gameId, t.source, t.externalId),
    unique('unique_game_external_id').on(t.source, t.externalId),
    index('idx_game_external_ids_lookup').on(t.source, t.externalId)
  ]
)

export const personExternalIds = sqliteTable(
  'person_external_ids',
  {
    ...baseColumns,
    personId: text('person_id')
      .notNull()
      .references(() => persons.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    source: text('source').notNull(),
    externalId: text('external_id').notNull(),
    orderInPerson: integer('order_in_person').notNull().default(0)
  },
  (t) => [
    unique().on(t.personId, t.source, t.externalId),
    unique('unique_person_external_id').on(t.source, t.externalId),
    index('idx_person_external_ids_lookup').on(t.source, t.externalId)
  ]
)

export const companyExternalIds = sqliteTable(
  'company_external_ids',
  {
    ...baseColumns,
    companyId: text('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    source: text('source').notNull(),
    externalId: text('external_id').notNull(),
    orderInCompany: integer('order_in_company').notNull().default(0)
  },
  (t) => [
    unique().on(t.companyId, t.source, t.externalId),
    unique('unique_company_external_id').on(t.source, t.externalId),
    index('idx_company_external_ids_lookup').on(t.source, t.externalId)
  ]
)

export const characterExternalIds = sqliteTable(
  'character_external_ids',
  {
    ...baseColumns,
    characterId: text('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    source: text('source').notNull(),
    externalId: text('external_id').notNull(),
    orderInCharacter: integer('order_in_character').notNull().default(0)
  },
  (t) => [
    unique().on(t.characterId, t.source, t.externalId),
    unique('unique_character_external_id').on(t.source, t.externalId),
    index('idx_character_external_ids_lookup').on(t.source, t.externalId)
  ]
)

export type GameExternalId = InferSelectModel<typeof gameExternalIds>
export type NewGameExternalId = InferInsertModel<typeof gameExternalIds>
export type PersonExternalId = InferSelectModel<typeof personExternalIds>
export type NewPersonExternalId = InferInsertModel<typeof personExternalIds>
export type CompanyExternalId = InferSelectModel<typeof companyExternalIds>
export type NewCompanyExternalId = InferInsertModel<typeof companyExternalIds>
export type CharacterExternalId = InferSelectModel<typeof characterExternalIds>
export type NewCharacterExternalId = InferInsertModel<typeof characterExternalIds>

// =============================================================================
// Tags
// =============================================================================

export const tags = sqliteTable(
  'tags',
  {
    ...baseColumns,
    name: text('name').notNull().unique(),
    description: text('description'),
    isNsfw: integer('is_nsfw', { mode: 'boolean' }).notNull().default(false)
  },
  (t) => [index('idx_tags_name').on(t.name), index('idx_tags_is_nsfw').on(t.isNsfw)]
)

export const gameTagLinks = sqliteTable(
  'game_tag_links',
  {
    ...baseColumns,
    gameId: text('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    isSpoiler: integer('is_spoiler', { mode: 'boolean' }).notNull().default(false),
    note: text('note'),
    orderInGame: integer('order_in_game').notNull().default(0),
    orderInTag: integer('order_in_tag').notNull().default(0)
  },
  (t) => [
    unique().on(t.gameId, t.tagId),
    index('idx_game_tag_links_game_id').on(t.gameId),
    index('idx_game_tag_links_tag_id').on(t.tagId)
  ]
)

export const characterTagLinks = sqliteTable(
  'character_tag_links',
  {
    ...baseColumns,
    characterId: text('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    isSpoiler: integer('is_spoiler', { mode: 'boolean' }).notNull().default(false),
    note: text('note'),
    orderInCharacter: integer('order_in_character').notNull().default(0),
    orderInTag: integer('order_in_tag').notNull().default(0)
  },
  (t) => [
    unique().on(t.characterId, t.tagId),
    index('idx_character_tag_links_character_id').on(t.characterId),
    index('idx_character_tag_links_tag_id').on(t.tagId)
  ]
)

export const personTagLinks = sqliteTable(
  'person_tag_links',
  {
    ...baseColumns,
    personId: text('person_id')
      .notNull()
      .references(() => persons.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    isSpoiler: integer('is_spoiler', { mode: 'boolean' }).notNull().default(false),
    note: text('note'),
    orderInPerson: integer('order_in_person').notNull().default(0),
    orderInTag: integer('order_in_tag').notNull().default(0)
  },
  (t) => [
    unique().on(t.personId, t.tagId),
    index('idx_person_tag_links_person_id').on(t.personId),
    index('idx_person_tag_links_tag_id').on(t.tagId)
  ]
)

export const companyTagLinks = sqliteTable(
  'company_tag_links',
  {
    ...baseColumns,
    companyId: text('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    isSpoiler: integer('is_spoiler', { mode: 'boolean' }).notNull().default(false),
    note: text('note'),
    orderInCompany: integer('order_in_company').notNull().default(0),
    orderInTag: integer('order_in_tag').notNull().default(0)
  },
  (t) => [
    unique().on(t.companyId, t.tagId),
    index('idx_company_tag_links_company_id').on(t.companyId),
    index('idx_company_tag_links_tag_id').on(t.tagId)
  ]
)

export type Tag = InferSelectModel<typeof tags>
export type NewTag = InferInsertModel<typeof tags>
export type GameTagLink = InferSelectModel<typeof gameTagLinks>
export type NewGameTagLink = InferInsertModel<typeof gameTagLinks>
export type CharacterTagLink = InferSelectModel<typeof characterTagLinks>
export type NewCharacterTagLink = InferInsertModel<typeof characterTagLinks>
export type PersonTagLink = InferSelectModel<typeof personTagLinks>
export type NewPersonTagLink = InferInsertModel<typeof personTagLinks>
export type CompanyTagLink = InferSelectModel<typeof companyTagLinks>
export type NewCompanyTagLink = InferInsertModel<typeof companyTagLinks>

// =============================================================================
// Collections
// =============================================================================

export const collections = sqliteTable(
  'collections',
  {
    ...baseColumns,
    name: text('name').notNull().default('unknown collection'),
    description: text('description'),
    coverFile: text('cover_file'),
    isNsfw: integer('is_nsfw', { mode: 'boolean' }).notNull().default(false),
    order: integer('order').notNull().default(0),
    // Dynamic collection support
    isDynamic: integer('is_dynamic', { mode: 'boolean' }).notNull().default(false),
    dynamicConfig: dynamicCollectionConfig('dynamic_config')
  },
  (t) => [
    index('idx_collections_order').on(t.order),
    index('idx_collections_name').on(t.name),
    index('idx_collections_is_dynamic').on(t.isDynamic)
  ]
)

export type Collection = InferSelectModel<typeof collections>
export type NewCollection = InferInsertModel<typeof collections>

// =============================================================================
// Game Sessions
// =============================================================================

export const gameSessions = sqliteTable(
  'game_sessions',
  {
    ...baseColumns,
    gameId: text('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    startedAt: integer('started_at', { mode: 'timestamp_ms' }).notNull(),
    endedAt: integer('ended_at', { mode: 'timestamp_ms' }).notNull()
  },
  (t) => [
    index('idx_game_sessions_game_id').on(t.gameId),
    index('idx_game_sessions_started_at').on(t.startedAt)
  ]
)

export type GameSession = InferSelectModel<typeof gameSessions>
export type NewGameSession = InferInsertModel<typeof gameSessions>

// =============================================================================
// Scraper Profiles
// =============================================================================

export const scraperProfiles = sqliteTable(
  'scraper_profiles',
  {
    ...baseColumns,
    name: text('name').notNull(),
    description: text('description'),
    mediaType: contentEntityType('media_type').notNull().default('game'),
    /** Which preset this config was created from (for display purposes only) */
    sourcePresetId: text('source_preset_id'),
    /** Default locale for all providers in this config */
    defaultLocale: locale('default_locale'),
    /** Provider to use for search operations */
    searchProviderId: text('search_provider_id').notNull(),
    /** Slot configurations (JSON Record) */
    slotConfigs: scraperSlotConfigs('slot_configs').notNull(),
    /** Display order in UI */
    order: integer('order').notNull().default(0)
  },
  (t) => [
    index('idx_scraper_profiles_media_type').on(t.mediaType),
    index('idx_scraper_profiles_order').on(t.order)
  ]
)

export type ScraperProfile = InferSelectModel<typeof scraperProfiles>
export type NewScraperProfile = InferInsertModel<typeof scraperProfiles>

// =============================================================================
// Scanners
// =============================================================================

export const scanners = sqliteTable(
  'scanners',
  {
    ...baseColumns,
    name: text('name').notNull().default('unknown scanner'),
    path: text('path').notNull(),
    type: mediaType('type').notNull(),
    /** Reference to scraper profile for metadata fetching */
    scraperProfileId: text('scraper_profile_id')
      .notNull()
      .references(() => scraperProfiles.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    targetCollectionId: text('target_collection_id').references(() => collections.id, {
      onDelete: 'set null',
      onUpdate: 'cascade'
    }),
    scanIntervalMinutes: integer('scan_interval_minutes').notNull().default(0),
    entityDepth: integer('entity_depth').notNull().default(0),
    nameExtractionRules: nameExtractionRules('name_extraction_rules').notNull().default([])
  },
  (t) => [
    index('idx_scanners_type').on(t.type),
    index('idx_scanners_scraper_profile_id').on(t.scraperProfileId)
  ]
)

export type Scanner = InferSelectModel<typeof scanners>
export type NewScanner = InferInsertModel<typeof scanners>

// =============================================================================
// Settings
// =============================================================================

export const settings = sqliteTable(
  'settings',
  {
    id: integer('id').primaryKey().default(0),
    locale: appLocale('locale'),
    mainWindowCloseAction: mainWindowCloseAction('main_window_close_action')
      .notNull()
      .default('exit'),
    scannerIgnoredNames: scannerIgnoredNames('scanner_ignored_names').notNull().default([]),
    scannerUsePhash: integer('scanner_use_phash', { mode: 'boolean' }).notNull().default(false),
    scannerStartAtOpen: integer('scanner_start_at_open', { mode: 'boolean' })
      .notNull()
      .default(false)
  },
  (t) => [check('single_row_check', sql`${t.id} = 0`)]
)

export type Settings = InferSelectModel<typeof settings>
export type NewSettings = InferInsertModel<typeof settings>

// =============================================================================
// Plugin Data (key-value storage for plugins)
// =============================================================================

export const pluginData = sqliteTable(
  'plugin_data',
  {
    ...baseColumns,
    pluginId: text('plugin_id').notNull(),
    key: text('key').notNull(),
    value: text('value', { mode: 'json' })
  },
  (t) => [
    unique('unique_plugin_data').on(t.pluginId, t.key),
    index('idx_plugin_data_plugin_id').on(t.pluginId)
  ]
)

export type PluginData = InferSelectModel<typeof pluginData>
export type NewPluginData = InferInsertModel<typeof pluginData>

// =============================================================================
// Showcase Sections
// =============================================================================

export const showcaseSections = sqliteTable(
  'showcase_sections',
  {
    ...baseColumns,
    name: text('name').notNull(),
    entityType: allEntityType('entity_type').notNull().default('game'),
    order: integer('order').notNull().default(0),
    isVisible: integer('is_visible', { mode: 'boolean' }).notNull().default(true),
    layout: sectionLayout('layout').notNull().default('horizontal'),
    itemSize: sectionItemSize('item_size').notNull().default('md'),
    openMode: sectionOpenMode('open_mode').notNull().default('page'),
    limit: integer('limit'),
    filter: filterState('filter').notNull().default({}),
    sortField: text('sort_field').notNull().default('name'),
    sortDirection: sortDirection('sort_direction').notNull().default('asc')
  },
  (t) => [index('idx_showcase_sections_order').on(t.order)]
)

export type ShowcaseSection = InferSelectModel<typeof showcaseSections>
export type NewShowcaseSection = InferInsertModel<typeof showcaseSections>

/** Form state type for showcase section editing (ShowcaseSection without timestamps, plus isNew flag) */
export type ShowcaseSectionFormItem = Omit<ShowcaseSection, 'createdAt' | 'updatedAt'> & {
  isNew?: boolean
}

// =============================================================================
// Link Tables (Junction Tables)
// =============================================================================

export const gamePersonLinks = sqliteTable(
  'game_person_links',
  {
    ...baseColumns,
    gameId: text('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    personId: text('person_id')
      .notNull()
      .references(() => persons.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    isSpoiler: integer('is_spoiler', { mode: 'boolean' }).notNull().default(false),
    type: gamePersonType('type').notNull().default('other'),
    note: text('note'),
    orderInGame: integer('order_in_game').notNull().default(0),
    orderInPerson: integer('order_in_person').notNull().default(0)
  },
  (t) => [
    unique().on(t.gameId, t.personId, t.type),
    index('idx_game_person_links_game_id').on(t.gameId),
    index('idx_game_person_links_person_id').on(t.personId)
  ]
)

export const gameCompanyLinks = sqliteTable(
  'game_company_links',
  {
    ...baseColumns,
    gameId: text('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    companyId: text('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    isSpoiler: integer('is_spoiler', { mode: 'boolean' }).notNull().default(false),
    type: gameCompanyType('type').notNull().default('other'),
    note: text('note'),
    orderInGame: integer('order_in_game').notNull().default(0),
    orderInCompany: integer('order_in_company').notNull().default(0)
  },
  (t) => [
    unique().on(t.gameId, t.companyId, t.type),
    index('idx_game_company_links_game_id').on(t.gameId),
    index('idx_game_company_links_company_id').on(t.companyId)
  ]
)

export const gameCharacterLinks = sqliteTable(
  'game_character_links',
  {
    ...baseColumns,
    gameId: text('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    characterId: text('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    isSpoiler: integer('is_spoiler', { mode: 'boolean' }).notNull().default(false),
    type: gameCharacterType('type').notNull().default('other'),
    note: text('note'),
    orderInGame: integer('order_in_game').notNull().default(0),
    orderInCharacter: integer('order_in_character').notNull().default(0)
  },
  (t) => [
    unique().on(t.gameId, t.characterId, t.type),
    index('idx_game_character_links_game_id').on(t.gameId),
    index('idx_game_character_links_character_id').on(t.characterId)
  ]
)

export const collectionGameLinks = sqliteTable(
  'collection_game_links',
  {
    ...baseColumns,
    collectionId: text('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    gameId: text('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    note: text('note'),
    orderInCollection: integer('order_in_collection').notNull().default(0)
  },
  (t) => [
    unique().on(t.collectionId, t.gameId),
    index('idx_collection_game_links_collection_id').on(t.collectionId),
    index('idx_collection_game_links_game_id').on(t.gameId)
  ]
)

export const collectionCharacterLinks = sqliteTable(
  'collection_character_links',
  {
    ...baseColumns,
    collectionId: text('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    characterId: text('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    note: text('note'),
    orderInCollection: integer('order_in_collection').notNull().default(0)
  },
  (t) => [
    unique().on(t.collectionId, t.characterId),
    index('idx_collection_character_links_collection_id').on(t.collectionId),
    index('idx_collection_character_links_character_id').on(t.characterId)
  ]
)

export const collectionPersonLinks = sqliteTable(
  'collection_person_links',
  {
    ...baseColumns,
    collectionId: text('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    personId: text('person_id')
      .notNull()
      .references(() => persons.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    note: text('note'),
    orderInCollection: integer('order_in_collection').notNull().default(0)
  },
  (t) => [
    unique().on(t.collectionId, t.personId),
    index('idx_collection_person_links_collection_id').on(t.collectionId),
    index('idx_collection_person_links_person_id').on(t.personId)
  ]
)

export const collectionCompanyLinks = sqliteTable(
  'collection_company_links',
  {
    ...baseColumns,
    collectionId: text('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    companyId: text('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    note: text('note'),
    orderInCollection: integer('order_in_collection').notNull().default(0)
  },
  (t) => [
    unique().on(t.collectionId, t.companyId),
    index('idx_collection_company_links_collection_id').on(t.collectionId),
    index('idx_collection_company_links_company_id').on(t.companyId)
  ]
)

export const characterPersonLinks = sqliteTable(
  'character_person_links',
  {
    ...baseColumns,
    characterId: text('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    personId: text('person_id')
      .notNull()
      .references(() => persons.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    isSpoiler: integer('is_spoiler', { mode: 'boolean' }).notNull().default(false),
    type: characterPersonType('type').notNull().default('other'),
    note: text('note'),
    orderInCharacter: integer('order_in_character').notNull().default(0),
    orderInPerson: integer('order_in_person').notNull().default(0)
  },
  (t) => [
    unique('unique_character_person').on(t.characterId, t.personId, t.type),
    index('idx_character_person_links_character_id').on(t.characterId),
    index('idx_character_person_links_person_id').on(t.personId)
  ]
)

export type GamePersonLink = InferSelectModel<typeof gamePersonLinks>
export type NewGamePersonLink = InferInsertModel<typeof gamePersonLinks>
export type GameCompanyLink = InferSelectModel<typeof gameCompanyLinks>
export type NewGameCompanyLink = InferInsertModel<typeof gameCompanyLinks>
export type GameCharacterLink = InferSelectModel<typeof gameCharacterLinks>
export type NewGameCharacterLink = InferInsertModel<typeof gameCharacterLinks>
export type CollectionGameLink = InferSelectModel<typeof collectionGameLinks>
export type NewCollectionGameLink = InferInsertModel<typeof collectionGameLinks>
export type CollectionCharacterLink = InferSelectModel<typeof collectionCharacterLinks>
export type NewCollectionCharacterLink = InferInsertModel<typeof collectionCharacterLinks>
export type CollectionPersonLink = InferSelectModel<typeof collectionPersonLinks>
export type NewCollectionPersonLink = InferInsertModel<typeof collectionPersonLinks>
export type CollectionCompanyLink = InferSelectModel<typeof collectionCompanyLinks>
export type NewCollectionCompanyLink = InferInsertModel<typeof collectionCompanyLinks>
export type CharacterPersonLink = InferSelectModel<typeof characterPersonLinks>
export type NewCharacterPersonLink = InferInsertModel<typeof characterPersonLinks>
