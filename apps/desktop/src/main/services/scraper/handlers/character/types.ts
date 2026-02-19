/**
 * Character Scraper Result Types
 *
 * Discriminated union types for provider results, organized by slot.
 */

import type { ScraperSlot } from '@shared/db'
import type { CharacterInfo, CharacterPerson, Tag } from '@shared/metadata'
import type { SlotResult } from '../../types'

export type CharacterScraperInfoResult = SlotResult<'info', CharacterInfo>
export type CharacterScraperTagsResult = SlotResult<'tags', Tag[]>
export type CharacterScraperPersonsResult = SlotResult<'persons', CharacterPerson[]>
export type CharacterScraperPhotosResult = SlotResult<'photos', string[]>

export type CharacterScraperResult =
  | CharacterScraperInfoResult
  | CharacterScraperTagsResult
  | CharacterScraperPersonsResult
  | CharacterScraperPhotosResult

/**
 * Character image slot (DB: characters.photoFile).
 * Only `photos` maps to CharacterMetadata.photos / characters.photoFile.
 */
export type CharacterScraperImageSlot = Extract<ScraperSlot, 'photos'>
