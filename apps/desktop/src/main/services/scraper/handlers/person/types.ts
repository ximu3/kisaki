/**
 * Person Scraper Result Types
 *
 * Discriminated union types for provider results, organized by slot.
 */

import type { ScraperSlot } from '@shared/db'
import type { PersonInfo, Tag } from '@shared/metadata'
import type { SlotResult } from '../../types'

export type PersonScraperInfoResult = SlotResult<'info', PersonInfo>
export type PersonScraperTagsResult = SlotResult<'tags', Tag[]>
export type PersonScraperPhotosResult = SlotResult<'photos', string[]>

export type PersonScraperResult =
  | PersonScraperInfoResult
  | PersonScraperTagsResult
  | PersonScraperPhotosResult

/**
 * Person image slot (DB: persons.photoFile).
 * Only `photos` maps to PersonMetadata.photos / persons.photoFile.
 */
export type PersonScraperImageSlot = Extract<ScraperSlot, 'photos'>
