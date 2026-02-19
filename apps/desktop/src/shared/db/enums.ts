/**
 * Database enum types
 *
 * Pure type definitions for database enum columns.
 * These are the type definitions only - the Drizzle customType implementations
 * are in ./custom-types.ts
 */

/** Game/media completion status */
export type Status = 'notStarted' | 'inProgress' | 'partial' | 'completed' | 'multiple' | 'shelved'

/** Game launcher mode */
export type GameLauncherMode = 'file' | 'url' | 'exec'

/** Game process monitor mode */
export type GameMonitorMode = 'file' | 'folder' | 'process'

/** Person gender */
export type Gender = 'male' | 'female' | 'other'

/** Game-Person relationship type */
export type GamePersonType =
  | 'director'
  | 'scenario'
  | 'illustration'
  | 'music'
  | 'programmer'
  | 'actor'
  | 'other'

/** Game-Character relationship type */
export type GameCharacterType = 'main' | 'supporting' | 'cameo' | 'other'

/** Game-Company relationship type */
export type GameCompanyType = 'developer' | 'publisher' | 'distributor' | 'other'

/** Character-Person relationship type */
export type CharacterPersonType = 'actor' | 'illustration' | 'designer' | 'other'

/** Blood type */
export type BloodType = 'a' | 'b' | 'ab' | 'o'

/** Cup size (for female characters) */
export type CupSize = 'aaa' | 'aa' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k'

/** Main window close button behavior */
export type MainWindowCloseAction = 'exit' | 'tray'
