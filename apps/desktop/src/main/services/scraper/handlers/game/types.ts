/**
 * Game Scraper Result Types
 *
 * Discriminated union types for provider results, organized by slot.
 */

import type { GameCharacter, GameCompany, GameInfo, GamePerson, Tag } from '@shared/metadata'
import type { SlotResult } from '../../types'

export type GameScraperInfoResult = SlotResult<'info', GameInfo>
export type GameScraperTagsResult = SlotResult<'tags', Tag[]>
export type GameScraperCharactersResult = SlotResult<'characters', GameCharacter[]>
export type GameScraperPersonsResult = SlotResult<'persons', GamePerson[]>
export type GameScraperCompaniesResult = SlotResult<'companies', GameCompany[]>
export type GameScraperCoversResult = SlotResult<'covers', string[]>
export type GameScraperBackdropsResult = SlotResult<'backdrops', string[]>
export type GameScraperLogosResult = SlotResult<'logos', string[]>
export type GameScraperIconsResult = SlotResult<'icons', string[]>

export type GameScraperResult =
  | GameScraperInfoResult
  | GameScraperTagsResult
  | GameScraperCharactersResult
  | GameScraperPersonsResult
  | GameScraperCompaniesResult
  | GameScraperCoversResult
  | GameScraperBackdropsResult
  | GameScraperLogosResult
  | GameScraperIconsResult

export type GameScraperImageSlot = 'covers' | 'backdrops' | 'logos' | 'icons'

export type GameScraperImageResult =
  | GameScraperCoversResult
  | GameScraperBackdropsResult
  | GameScraperLogosResult
  | GameScraperIconsResult
