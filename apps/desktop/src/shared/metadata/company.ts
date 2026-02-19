/**
 * Company Metadata Types
 *
 * Base type definitions for company metadata.
 */

import type { PartialDate, RelatedSite } from '@shared/db'
import type { ExternalId, Tag } from './common'

// =============================================================================
// Core Info
// =============================================================================

/**
 * Core company info.
 *
 * Minimal company information with required name and optional fields.
 */
export interface CompanyInfo {
  name: string
  originalName?: string
  foundedDate?: PartialDate
  description?: string
  relatedSites?: RelatedSite[]
  externalIds: ExternalId[]
}

/**
 * Company metadata.
 *
 * Base metadata for a company entity (developers, publishers, etc.).
 * All fields optional except name for flexibility in different contexts.
 */
export interface CompanyMetadata extends CompanyInfo {
  tags?: Tag[]
  logos?: string[]
}
