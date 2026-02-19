/**
 * Character Metadata Types
 *
 * Base type definitions for character metadata.
 */

import type { PartialDate, RelatedSite } from '@shared/db'
import type { Gender, BloodType, CharacterPersonType, CupSize } from '@shared/db'
import type { ExternalId, Tag } from './common'
import type { PersonMetadata } from './person'

// =============================================================================
// Core Info
// =============================================================================

/**
 * Core character info.
 *
 * Minimal character information with required name and optional fields.
 */
export interface CharacterInfo {
  name: string
  originalName?: string
  birthDate?: PartialDate
  gender?: Gender
  age?: number
  bloodType?: BloodType
  height?: number
  weight?: number
  bust?: number
  waist?: number
  hips?: number
  cup?: CupSize
  description?: string
  relatedSites?: RelatedSite[]
  externalIds: ExternalId[]
}

/**
 * Person linked to a character with type.
 *
 * Used for voice actors, illustrators, character designers, etc.
 * Follows link table convention: character_person_links → CharacterMetadata.persons
 */
export interface CharacterPerson extends PersonMetadata {
  type: CharacterPersonType
  isSpoiler?: boolean
  note?: string
}

/**
 * Character metadata.
 *
 * Base metadata for a character entity.
 * All fields optional except name for flexibility in different contexts.
 */
export interface CharacterMetadata extends CharacterInfo {
  tags?: Tag[]
  persons?: CharacterPerson[]
  photos?: string[]
}
