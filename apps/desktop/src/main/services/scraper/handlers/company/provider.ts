/**
 * Company Scraper Provider Interface
 *
 * Defines the contract for company metadata providers (builtin and plugins).
 */

import type { Locale } from '@shared/locale'
import type { CompanySearchResult } from '@shared/scraper'
import type { CompanyInfo, Tag } from '@shared/metadata'

export interface CompanyScraperProvider {
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
