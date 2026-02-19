/**
 * Game Scraper Types
 *
 * Type definitions for game scraper providers, handlers, and operations.
 * This file contains only game-specific types.
 */

import type { PartialDate } from '@shared/db'
import type { ExternalId } from '@shared/metadata'
import type { ScraperCapability } from './slot'

// =============================================================================
// Provider Info
// =============================================================================

/** Information about a registered game scraper provider */
export interface GameScraperProviderInfo {
  id: string
  name: string
  capabilities: ScraperCapability[]
}

// =============================================================================
// Search
// =============================================================================

/** A single game search result */
export interface GameSearchResult {
  id: string
  name: string
  originalName?: string
  releaseDate?: PartialDate
  externalIds: ExternalId[]
}

// =============================================================================
// Fetch Options
// =============================================================================

/** Options for fetching game metadata */
export interface GameScraperOptions {
  skipValidation?: boolean
}
