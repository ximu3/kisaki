/**
 * Scraper Presets
 *
 * Universal preset type definitions and preset registry.
 * Presets are code-only configurations that can be used to quickly create profiles.
 */

import type { ContentEntityType } from '@shared/common'
import type { Locale } from '@shared/locale'
import type { ScraperSlotConfigs } from '@shared/db'
import { createSlotConfig, createEmptySlotConfig } from '@shared/scraper'

// =============================================================================
// Preset Types
// =============================================================================

/** Scraper preset definition (code-only, never stored in DB) */
export interface ScraperPreset {
  id: string
  name: string
  description: string
  mediaType: ContentEntityType
  defaultLocale?: Locale
  searchProviderId: string
  slotConfigs: ScraperSlotConfigs
}

// =============================================================================
// Preset IDs
// =============================================================================

export const PRESET_IDS = {
  // Game presets
  VISUAL_NOVEL_CN: 'visual-novel-cn'
} as const

export type PresetId = (typeof PRESET_IDS)[keyof typeof PRESET_IDS]

// =============================================================================
// Game Presets
// =============================================================================

/** Visual Novel preset using VNDB as the sole data source */
const VISUAL_NOVEL_CN: ScraperPreset = {
  id: PRESET_IDS.VISUAL_NOVEL_CN,
  name: '视觉小说',
  description: '适合获取视觉小说的中文元数据',
  mediaType: 'game',
  defaultLocale: 'zh-Hans',
  searchProviderId: 'vndb',
  slotConfigs: {
    info: createSlotConfig(['ymgal', 'vndb'], 'merge'),
    tags: createSlotConfig(['vndb'], 'merge'),
    characters: createSlotConfig(['ymgal', 'vndb', 'bangumi'], 'merge'),
    persons: createSlotConfig(['ymgal', 'vndb', 'bangumi'], 'first'),
    companies: createSlotConfig(['ymgal', 'vndb', 'bangumi'], 'first'),
    covers: createSlotConfig(['vndb', 'ymgal', 'bangumi'], 'first'),
    backdrops: createSlotConfig(['vndb'], 'first'),
    logos: createEmptySlotConfig(),
    icons: createEmptySlotConfig()
  }
}

const VIDEO_GAME: ScraperPreset = {
  id: 'video-game',
  name: 'Video Game',
  description: 'A general-purpose preset for video games',
  mediaType: 'game',
  defaultLocale: 'en',
  searchProviderId: 'igdb',
  slotConfigs: {
    info: createSlotConfig(['igdb'], 'merge'),
    tags: createSlotConfig(['igdb'], 'merge'),
    characters: createSlotConfig(['igdb'], 'merge'),
    persons: createSlotConfig(['igdb'], 'first'),
    companies: createSlotConfig(['igdb'], 'first'),
    covers: createSlotConfig(['igdb'], 'first'),
    backdrops: createSlotConfig(['igdb'], 'first'),
    logos: createEmptySlotConfig(),
    icons: createEmptySlotConfig()
  }
}

// =============================================================================
// Preset Registry
// =============================================================================

/** All scraper presets */
export const SCRAPER_PRESETS: ScraperPreset[] = [VISUAL_NOVEL_CN, VIDEO_GAME]

/** Get a preset by ID */
export function getPresetById(presetId: string): ScraperPreset | undefined {
  return SCRAPER_PRESETS.find((p) => p.id === presetId)
}

/** Get presets by media type */
export function getPresetsByMediaType(mediaType: ContentEntityType): ScraperPreset[] {
  return SCRAPER_PRESETS.filter((p) => p.mediaType === mediaType)
}
