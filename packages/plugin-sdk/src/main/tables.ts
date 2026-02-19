/**
 * Kisaki Plugin SDK - Main Process Table Definitions
 *
 * Only table definitions for database queries.
 * Use this for lightweight imports when you only need tables.
 *
 * @example
 * import { games, persons } from '@kisaki/plugin-sdk/main/tables'
 * const allGames = await db.select().from(games)
 */

import type { KisakiMainAPI } from '../types/main.plugin'

const g = globalThis as unknown as { kisaki: KisakiMainAPI }
const s = g.kisaki.schema

// =============================================================================
// Core Entity Tables
// =============================================================================

export const games: KisakiMainAPI['schema']['games'] = s.games
export const persons: KisakiMainAPI['schema']['persons'] = s.persons
export const companies: KisakiMainAPI['schema']['companies'] = s.companies
export const characters: KisakiMainAPI['schema']['characters'] = s.characters

// =============================================================================
// External ID Tables
// =============================================================================

export const gameExternalIds: KisakiMainAPI['schema']['gameExternalIds'] = s.gameExternalIds
export const personExternalIds: KisakiMainAPI['schema']['personExternalIds'] = s.personExternalIds
export const companyExternalIds: KisakiMainAPI['schema']['companyExternalIds'] =
  s.companyExternalIds
export const characterExternalIds: KisakiMainAPI['schema']['characterExternalIds'] =
  s.characterExternalIds

// =============================================================================
// Tag Tables
// =============================================================================

export const tags: KisakiMainAPI['schema']['tags'] = s.tags
export const gameTagLinks: KisakiMainAPI['schema']['gameTagLinks'] = s.gameTagLinks
export const characterTagLinks: KisakiMainAPI['schema']['characterTagLinks'] = s.characterTagLinks
export const personTagLinks: KisakiMainAPI['schema']['personTagLinks'] = s.personTagLinks
export const companyTagLinks: KisakiMainAPI['schema']['companyTagLinks'] = s.companyTagLinks

// =============================================================================
// Collection Tables
// =============================================================================

export const collections: KisakiMainAPI['schema']['collections'] = s.collections
export const collectionGameLinks: KisakiMainAPI['schema']['collectionGameLinks'] =
  s.collectionGameLinks
export const collectionCharacterLinks: KisakiMainAPI['schema']['collectionCharacterLinks'] =
  s.collectionCharacterLinks
export const collectionPersonLinks: KisakiMainAPI['schema']['collectionPersonLinks'] =
  s.collectionPersonLinks
export const collectionCompanyLinks: KisakiMainAPI['schema']['collectionCompanyLinks'] =
  s.collectionCompanyLinks

// =============================================================================
// Game Related Tables
// =============================================================================

export const gameSessions: KisakiMainAPI['schema']['gameSessions'] = s.gameSessions
export const gamePersonLinks: KisakiMainAPI['schema']['gamePersonLinks'] = s.gamePersonLinks
export const gameCompanyLinks: KisakiMainAPI['schema']['gameCompanyLinks'] = s.gameCompanyLinks
export const gameCharacterLinks: KisakiMainAPI['schema']['gameCharacterLinks'] =
  s.gameCharacterLinks

// =============================================================================
// Character Related Tables
// =============================================================================

export const characterPersonLinks: KisakiMainAPI['schema']['characterPersonLinks'] =
  s.characterPersonLinks

// =============================================================================
// System Tables
// =============================================================================

export const scraperProfiles: KisakiMainAPI['schema']['scraperProfiles'] = s.scraperProfiles
export const scanners: KisakiMainAPI['schema']['scanners'] = s.scanners
export const settings: KisakiMainAPI['schema']['settings'] = s.settings
export const pluginData: KisakiMainAPI['schema']['pluginData'] = s.pluginData
export const showcaseSections: KisakiMainAPI['schema']['showcaseSections'] = s.showcaseSections
