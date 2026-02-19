/**
 * Character Scraper Types
 *
 * Type definitions for character scraper providers, handlers, and operations.
 * This file contains only character-specific types.
 */

import type { PartialDate } from '@shared/db'
import type { ExternalId } from '@shared/metadata'
import type { ScraperCapability } from './slot'

// =============================================================================
// Provider Info
// =============================================================================

/** Information about a registered character scraper provider */
export interface CharacterScraperProviderInfo {
  id: string
  name: string
  capabilities: ScraperCapability[]
}

// =============================================================================
// Search
// =============================================================================

/** A single character search result */
export interface CharacterSearchResult {
  id: string
  name: string
  originalName?: string
  birthDate?: PartialDate
  externalIds: ExternalId[]
}

// =============================================================================
// Fetch Options
// =============================================================================

/** Options for fetching character metadata */
export interface CharacterScraperOptions {
  skipValidation?: boolean
}
