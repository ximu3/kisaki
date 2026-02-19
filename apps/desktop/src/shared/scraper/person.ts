/**
 * Person Scraper Types
 *
 * Type definitions for person scraper providers, handlers, and operations.
 * This file contains only person-specific types.
 */

import type { PartialDate } from '@shared/db'
import type { ExternalId } from '@shared/metadata'
import type { ScraperCapability } from './slot'

// =============================================================================
// Provider Info
// =============================================================================

/** Information about a registered person scraper provider */
export interface PersonScraperProviderInfo {
  id: string
  name: string
  capabilities: ScraperCapability[]
}

// =============================================================================
// Search
// =============================================================================

/** A single person search result */
export interface PersonSearchResult {
  id: string
  name: string
  originalName?: string
  birthDate?: PartialDate
  deathDate?: PartialDate
  externalIds: ExternalId[]
}

// =============================================================================
// Fetch Options
// =============================================================================

/** Options for fetching person metadata */
export interface PersonScraperOptions {
  skipValidation?: boolean
}
