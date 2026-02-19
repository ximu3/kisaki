/**
 * Person Scraper Provider Interface
 *
 * Defines the contract for person metadata providers (builtin and plugins).
 *
 * Notes:
 * - Slot/capability names match PersonMetadata fields where applicable
 * - For person entities, providers should return photo candidates via `getPhotos`
 */

import type { Locale } from '@shared/locale'
import type { PersonSearchResult } from '@shared/scraper'
import type { PersonInfo, Tag } from '@shared/metadata'

export interface PersonScraperProvider {
  /** Unique provider identifier */
  readonly id: string

  /** Display name */
  readonly name: string

  // ---------------------------------------------------------------------------
  // Search
  // ---------------------------------------------------------------------------

  /** Search persons by query string */
  search?(query: string, locale?: Locale): Promise<PersonSearchResult[]>

  // ---------------------------------------------------------------------------
  // Core Metadata
  // ---------------------------------------------------------------------------

  /** Get core info (name, description, dates, links) */
  getInfo?(id: string, locale?: Locale): Promise<PersonInfo>

  /** Get tags */
  getTags?(id: string, locale?: Locale): Promise<Tag[]>

  // ---------------------------------------------------------------------------
  // Media Assets
  // ---------------------------------------------------------------------------

  /**
   * Get photo image URLs.
   * Used as the primary image candidate list for PersonMetadata.photos.
   */
  getPhotos?(id: string, locale?: Locale): Promise<string[]>
}
