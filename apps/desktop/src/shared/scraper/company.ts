/**
 * Company Scraper Types
 *
 * Type definitions for company scraper providers, handlers, and operations.
 * This file contains only company-specific types.
 */

import type { PartialDate } from '@shared/db'
import type { ExternalId } from '@shared/metadata'
import type { ScraperCapability } from './slot'

// =============================================================================
// Provider Info
// =============================================================================

/** Information about a registered company scraper provider */
export interface CompanyScraperProviderInfo {
  id: string
  name: string
  capabilities: ScraperCapability[]
}

// =============================================================================
// Search
// =============================================================================

/** A single company search result */
export interface CompanySearchResult {
  id: string
  name: string
  originalName?: string
  foundedDate?: PartialDate
  externalIds: ExternalId[]
}

// =============================================================================
// Fetch Options
// =============================================================================

/** Options for fetching company metadata */
export interface CompanyScraperOptions {
  skipValidation?: boolean
}
