/**
 * Bangumi API Types
 *
 * Based on the official OpenAPI schema:
 * - https://bangumi.github.io/api/
 * - https://bangumi.github.io/api/dist.json
 * - https://github.com/bangumi/api/
 *
 * Only fields used by Kisaki scraper are modeled here.
 */

// =============================================================================
// Shared
// =============================================================================

export type BangumiSubjectType = 1 | 2 | 3 | 4 | 6
export type BangumiPersonType = 1 | 2 | 3
export type BangumiCharacterType = 1 | 2 | 3 | 4
export type BangumiBloodType = 1 | 2 | 3 | 4

export interface BangumiImages {
  large?: string
  common?: string
  medium?: string
  small?: string
  grid?: string
}

export interface BangumiPersonImages {
  large?: string
  medium?: string
  small?: string
  grid?: string
}

export interface BangumiInfoboxValue {
  k?: string
  v: string
}

export interface BangumiInfoboxItem {
  key: string
  value: string | BangumiInfoboxValue[]
}

export interface BangumiTag {
  name: string
  count: number
  total_cont?: number
}

export interface BangumiPaged<T> {
  total: number
  limit: number
  offset: number
  data: T[]
}

// =============================================================================
// Subject
// =============================================================================

export interface BangumiSubject {
  id: number
  type: BangumiSubjectType
  name: string
  name_cn: string
  summary: string
  date?: string
  platform?: string
  images?: BangumiImages | null
  infobox?: BangumiInfoboxItem[] | null
  tags?: BangumiTag[] | null
  meta_tags?: string[] | null
  nsfw?: boolean
}

export interface BangumiSubjectRelation {
  id: number
  type: BangumiSubjectType
  name: string
  name_cn: string
  relation: string
  images?: BangumiImages | null
}

// =============================================================================
// Person
// =============================================================================

export type BangumiPersonCareer =
  | 'producer'
  | 'mangaka'
  | 'artist'
  | 'seiyu'
  | 'writer'
  | 'illustrator'
  | 'actor'
  | string

export interface BangumiPerson {
  id: number
  name: string
  type: BangumiPersonType
  career: BangumiPersonCareer[]
  images?: BangumiPersonImages | null
  short_summary?: string
  locked?: boolean
}

export interface BangumiRelatedPerson {
  id: number
  name: string
  type: BangumiPersonType
  career: BangumiPersonCareer[]
  images?: BangumiPersonImages | null
  relation: string
  eps?: string
}

export interface BangumiPersonDetail {
  id: number
  name: string
  type: BangumiPersonType
  career: BangumiPersonCareer[]
  images?: BangumiPersonImages | null
  summary: string
  infobox?: BangumiInfoboxItem[] | null
  gender?: string | null
  blood_type?: BangumiBloodType | null
  birth_year?: number | null
  birth_mon?: number | null
  birth_day?: number | null
}

// =============================================================================
// Character
// =============================================================================

export interface BangumiCharacter {
  id: number
  name: string
  type: BangumiCharacterType
  summary: string
  images?: BangumiPersonImages | null
  short_summary?: string
}

export interface BangumiRelatedCharacter {
  id: number
  name: string
  summary: string
  type: BangumiCharacterType
  images?: BangumiPersonImages | null
  relation: string
  actors?: BangumiPerson[]
}

export interface BangumiCharacterDetail {
  id: number
  name: string
  type: BangumiCharacterType
  summary: string
  images?: BangumiPersonImages | null
  infobox?: BangumiInfoboxItem[] | null
  gender?: string | null
  blood_type?: BangumiBloodType | null
  birth_year?: number | null
  birth_mon?: number | null
  birth_day?: number | null
}

export interface BangumiCharacterPerson {
  id: number
  name: string
  type: BangumiCharacterType
  images?: BangumiPersonImages | null
  subject_id: number
  subject_type: BangumiSubjectType
  subject_name: string
  subject_name_cn: string
  staff?: string
}

// =============================================================================
// Search
// =============================================================================

export interface BangumiSearchSubjectPayload {
  keyword: string
  sort?: 'match' | 'heat' | 'rank' | 'score'
  filter?: {
    type?: BangumiSubjectType[]
    meta_tags?: string[]
    tag?: string[]
    air_date?: string[]
    rating?: string[]
    rating_count?: string[]
    rank?: string[]
    nsfw?: boolean
  }
}

export type BangumiImageType = 'small' | 'grid' | 'large' | 'medium' | 'common'
export type BangumiEntityImageType = 'small' | 'grid' | 'large' | 'medium'
