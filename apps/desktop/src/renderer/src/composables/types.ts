/**
 * Shared types for composables
 */

import type { Game, Character, Person, Company } from '@shared/db'

/** Union type for content entities */
export type ContentEntityData = Game | Character | Person | Company

/** Entity count by type */
export interface ContentEntityCounts {
  game: number
  character: number
  person: number
  company: number
}
