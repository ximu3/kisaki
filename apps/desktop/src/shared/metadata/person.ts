/**
 * Person Metadata Types
 *
 * Base type definitions for person metadata.
 */

import type { PartialDate, RelatedSite } from '@shared/db'
import type { Gender } from '@shared/db'
import type { ExternalId, Tag } from './common'

// =============================================================================
// Core Info
// =============================================================================

/**
 * Core person info.
 *
 * Minimal person information with required name and optional fields.
 */
export interface PersonInfo {
  name: string
  originalName?: string
  birthDate?: PartialDate
  deathDate?: PartialDate
  gender?: Gender
  description?: string
  relatedSites?: RelatedSite[]
  externalIds: ExternalId[]
}

/**
 * Person metadata.
 *
 * Base metadata for a person entity (voice actors, staff, etc.).
 * All fields optional except name for flexibility in different contexts.
 */
export interface PersonMetadata extends PersonInfo {
  tags?: Tag[]
  photos?: string[]
}
