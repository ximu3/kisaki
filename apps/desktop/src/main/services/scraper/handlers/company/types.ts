/**
 * Company Scraper Result Types
 *
 * Discriminated union types for provider results, organized by slot.
 */

import type { ScraperSlot } from '@shared/db'
import type { CompanyInfo, Tag } from '@shared/metadata'
import type { SlotResult } from '../../types'

export type CompanyScraperInfoResult = SlotResult<'info', CompanyInfo>
export type CompanyScraperTagsResult = SlotResult<'tags', Tag[]>
export type CompanyScraperLogosResult = SlotResult<'logos', string[]>

export type CompanyScraperResult =
  | CompanyScraperInfoResult
  | CompanyScraperTagsResult
  | CompanyScraperLogosResult

/**
 * Company image slot (DB: companies.logoFile).
 * Only `logos` maps to CompanyMetadata.logos / companies.logoFile.
 */
export type CompanyScraperImageSlot = Extract<ScraperSlot, 'logos'>
