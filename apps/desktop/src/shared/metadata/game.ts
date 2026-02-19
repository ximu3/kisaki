/**
 * Game Metadata Types
 *
 * Complete game metadata type that aggregates all related entity metadata.
 */

import type { PartialDate, RelatedSite } from '@shared/db'
import type { GamePersonType, GameCharacterType, GameCompanyType } from '@shared/db'
import type { ExternalId, Tag } from './common'
import type { PersonMetadata } from './person'
import type { CharacterMetadata } from './character'
import type { CompanyMetadata } from './company'

// =============================================================================
// Core Info
// =============================================================================

/**
 * Core game info.
 *
 * Basic fields returned by scraper providers for the info slot.
 */
export interface GameInfo {
  name: string
  originalName?: string
  releaseDate?: PartialDate
  description?: string
  relatedSites?: RelatedSite[]
  externalIds: ExternalId[]
}

// =============================================================================
// Game-Entity Link Types
// =============================================================================

/**
 * Person linked to a game with type.
 *
 * Extends PersonMetadata with game-specific relationship info.
 * Follows link table convention: game_person_links → GameMetadata.persons
 */
export interface GamePerson extends PersonMetadata {
  type: GamePersonType
  isSpoiler?: boolean
  note?: string
}

/**
 * Character linked to a game with type.
 *
 * Extends CharacterMetadata with game-specific relationship info.
 * CharacterMetadata.persons contains voice actors etc.
 * Follows link table convention: game_character_links → GameMetadata.characters
 */
export interface GameCharacter extends CharacterMetadata {
  type: GameCharacterType
  isSpoiler?: boolean
  note?: string
}

/**
 * Company linked to a game with type.
 *
 * Extends CompanyMetadata with game-specific relationship info.
 * Follows link table convention: game_company_links → GameMetadata.companies
 */
export interface GameCompany extends CompanyMetadata {
  type: GameCompanyType
  isSpoiler?: boolean
  note?: string
}

// =============================================================================
// Game Metadata
// =============================================================================

/**
 * Complete game metadata.
 *
 * Contains all information about a game including related entities.
 * Used as the common type for scraper output and adder input.
 */
export interface GameMetadata extends GameInfo {
  tags?: Tag[]
  persons?: GamePerson[]
  characters?: GameCharacter[]
  companies?: GameCompany[]
  covers?: string[]
  backdrops?: string[]
  logos?: string[]
  icons?: string[]
}
