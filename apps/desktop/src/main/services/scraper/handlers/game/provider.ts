/**
 * Game Scraper Provider Interface
 *
 * Defines the contract for game metadata providers (builtin and plugins).
 *
 * Design principles:
 * - Each method returns a single type (no complex composite returns)
 * - Characters include persons array for voice actors (follows link table convention)
 * - All methods are optional - providers implement what they support
 * - Methods receive provider-internal IDs (resolved by handler)
 * - Entity identity matching uses externalIds + originalName + name during merge
 * - Typed link arrays (persons/characters/companies + nested character.persons) are de-duplicated by (identity + type)
 */

import type { Locale } from '@shared/locale'
import type { GameSearchResult } from '@shared/scraper'
import type { GameInfo, Tag, GamePerson, GameCompany, GameCharacter } from '@shared/metadata'
import type { ScraperCapability } from '@shared/scraper'

// -----------------------------------------------------------------------------
// Provider Interface
// -----------------------------------------------------------------------------

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
export interface GameScraperProvider {
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

  // ---------------------------------------------------------------------------
  // Search
  // ---------------------------------------------------------------------------

  /** Search games by query string */
  search?(query: string, locale?: Locale): Promise<GameSearchResult[]>

  // ---------------------------------------------------------------------------
  // Core Metadata
  // ---------------------------------------------------------------------------

  /** Get core info (name, description, dates, links) */
  getInfo?(id: string, locale?: Locale): Promise<GameInfo>

  /** Get tags/genres */
  getTags?(id: string, locale?: Locale): Promise<Tag[]>

  // ---------------------------------------------------------------------------
  // Related Entities
  // ---------------------------------------------------------------------------

  /**
   * Get characters with related persons (voice actors, etc.).
   * Characters may include persons[] following link table convention.
   */
  getCharacters?(id: string, locale?: Locale): Promise<GameCharacter[]>

  /** Get persons (staff, voice actors, etc.) */
  getPersons?(id: string, locale?: Locale): Promise<GamePerson[]>

  /** Get companies (developers, publishers) */
  getCompanies?(id: string, locale?: Locale): Promise<GameCompany[]>

  // ---------------------------------------------------------------------------
  // Media Assets
  // ---------------------------------------------------------------------------

  /** Get cover image URLs */
  getCovers?(id: string, locale?: Locale): Promise<string[]>

  /** Get backdrop/screenshot URLs */
  getBackdrops?(id: string, locale?: Locale): Promise<string[]>

  /** Get logo URLs */
  getLogos?(id: string, locale?: Locale): Promise<string[]>

  /** Get icon URLs */
  getIcons?(id: string, locale?: Locale): Promise<string[]>
}
