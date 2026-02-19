/**
 * Kisaki Plugin SDK - Renderer Process Table Definitions
 *
 * Only table definitions for database queries.
 * Use this for lightweight imports when you only need tables.
 *
 * @example
 * import { games, persons } from '@kisaki/plugin-sdk/renderer/tables'
 * const allGames = await db.select().from(games)
 */

import type { KisakiRendererAPI } from '../types/renderer.plugin'

const w = (typeof window !== 'undefined' ? window : globalThis) as unknown as {
  kisaki: KisakiRendererAPI
}
const s = w.kisaki.schema

// =============================================================================
// Core Entity Tables
// =============================================================================

export const games: KisakiRendererAPI['schema']['games'] = s.games
export const persons: KisakiRendererAPI['schema']['persons'] = s.persons
export const companies: KisakiRendererAPI['schema']['companies'] = s.companies
export const characters: KisakiRendererAPI['schema']['characters'] = s.characters

// =============================================================================
// External ID Tables
// =============================================================================

export const gameExternalIds: KisakiRendererAPI['schema']['gameExternalIds'] = s.gameExternalIds
export const personExternalIds: KisakiRendererAPI['schema']['personExternalIds'] =
  s.personExternalIds
export const companyExternalIds: KisakiRendererAPI['schema']['companyExternalIds'] =
  s.companyExternalIds
export const characterExternalIds: KisakiRendererAPI['schema']['characterExternalIds'] =
  s.characterExternalIds

// =============================================================================
// Tag Tables
// =============================================================================

export const tags: KisakiRendererAPI['schema']['tags'] = s.tags
export const gameTagLinks: KisakiRendererAPI['schema']['gameTagLinks'] = s.gameTagLinks
export const characterTagLinks: KisakiRendererAPI['schema']['characterTagLinks'] =
  s.characterTagLinks
export const personTagLinks: KisakiRendererAPI['schema']['personTagLinks'] = s.personTagLinks
export const companyTagLinks: KisakiRendererAPI['schema']['companyTagLinks'] = s.companyTagLinks

// =============================================================================
// Collection Tables
// =============================================================================

export const collections: KisakiRendererAPI['schema']['collections'] = s.collections
export const collectionGameLinks: KisakiRendererAPI['schema']['collectionGameLinks'] =
  s.collectionGameLinks
export const collectionCharacterLinks: KisakiRendererAPI['schema']['collectionCharacterLinks'] =
  s.collectionCharacterLinks
export const collectionPersonLinks: KisakiRendererAPI['schema']['collectionPersonLinks'] =
  s.collectionPersonLinks
export const collectionCompanyLinks: KisakiRendererAPI['schema']['collectionCompanyLinks'] =
  s.collectionCompanyLinks

// =============================================================================
// Game Related Tables
// =============================================================================

export const gameSessions: KisakiRendererAPI['schema']['gameSessions'] = s.gameSessions
export const gamePersonLinks: KisakiRendererAPI['schema']['gamePersonLinks'] = s.gamePersonLinks
export const gameCompanyLinks: KisakiRendererAPI['schema']['gameCompanyLinks'] = s.gameCompanyLinks
export const gameCharacterLinks: KisakiRendererAPI['schema']['gameCharacterLinks'] =
  s.gameCharacterLinks

// =============================================================================
// Character Related Tables
// =============================================================================

export const characterPersonLinks: KisakiRendererAPI['schema']['characterPersonLinks'] =
  s.characterPersonLinks

// =============================================================================
// System Tables
// =============================================================================

export const scraperProfiles: KisakiRendererAPI['schema']['scraperProfiles'] = s.scraperProfiles
export const scanners: KisakiRendererAPI['schema']['scanners'] = s.scanners
export const settings: KisakiRendererAPI['schema']['settings'] = s.settings
export const pluginData: KisakiRendererAPI['schema']['pluginData'] = s.pluginData
export const showcaseSections: KisakiRendererAPI['schema']['showcaseSections'] = s.showcaseSections
