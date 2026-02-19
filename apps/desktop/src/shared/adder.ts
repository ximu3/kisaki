/**
 * Adder Service Types
 *
 * Type definitions for the Adder persistence layer.
 */

// =============================================================================
// Add Options
// =============================================================================

/**
 * Options for adding a game.
 */
export interface AddGameOptions {
  /** Local game directory path */
  gameDirPath?: string
  /** Local game executable path */
  gameFilePath?: string
  /** Target collection ID to add the game to */
  targetCollectionId?: string
}

/**
 * Options for adding a person.
 */
export interface AddPersonOptions {
  /** Target collection ID to add the person to */
  targetCollectionId?: string
}

/**
 * Options for adding a company.
 */
export interface AddCompanyOptions {
  /** Target collection ID to add the company to */
  targetCollectionId?: string
}

/**
 * Options for adding a character.
 */
export interface AddCharacterOptions {
  /** Target collection ID to add the character to */
  targetCollectionId?: string
}

// =============================================================================
// Result Types
// =============================================================================

/** Reason why an entity was not newly added. */
export type ExistingReason = 'name' | 'externalId' | 'path'

/**
 * Base result type for adding entities.
 */
export interface AddResult {
  /** Whether the entity was newly added */
  isNew: boolean
  /** If not new, the reason why (only present when isNew is false) */
  existingReason?: ExistingReason
}

/** Result of adding a game. */
export interface AddGameResult extends AddResult {
  gameId: string
}

/** Result of adding a person. */
export interface AddPersonResult extends AddResult {
  personId: string
}

/** Result of adding a company. */
export interface AddCompanyResult extends AddResult {
  companyId: string
}

/** Result of adding a character. */
export interface AddCharacterResult extends AddResult {
  characterId: string
}
