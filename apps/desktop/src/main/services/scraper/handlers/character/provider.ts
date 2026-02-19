/**
 * Character Scraper Provider Interface
 *
 * Defines the contract for character metadata providers (builtin and plugins).
 *
 * Notes:
 * - For character entities, providers should return photo candidates via `getPhotos`.
 */

import type { Locale } from '@shared/locale'
import type { CharacterSearchResult } from '@shared/scraper'
import type { CharacterInfo, Tag, CharacterPerson } from '@shared/metadata'

export interface CharacterScraperProvider {
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
