/**
 * VNDB Kana API Types
 *
 * Based on the official docs:
 * - https://api.vndb.org/kana
 * - https://api.vndb.org/kana/schema
 * - https://vndb.org/d9#4
 *
 * Only fields used by Kisaki scraper are modeled here.
 */

// =============================================================================
// Query Wrapper
// =============================================================================

export interface VndbQueryRequest {
  filters?: unknown
  fields?: string
  sort?: string
  reverse?: boolean
  results?: number
  page?: number
  user?: string
  compact_filters?: boolean
  normalized_filters?: boolean
}

export interface VndbQueryResponse<T> {
  results: T[]
  more: boolean
  count?: number
  compact_filters?: string
  normalized_filters?: unknown
}

export interface VndbErrorResponse {
  id: string
  message: string
}

// =============================================================================
// Common Objects
// =============================================================================

export interface VndbExtlink {
  id?: string | number | null
  name?: string | null
  label?: string | null
  url?: string | null
}

export interface VndbImage {
  id?: string | null
  url?: string | null
  thumbnail?: string | null
  dims?: [number, number] | null
  sexual?: number | null
  violence?: number | null
  votecount?: number | null
}

export interface VndbTitle {
  lang?: string | null
  latin?: string | null
  title?: string | null
  main?: boolean | null
  official?: boolean | null
}

export type VndbScalar = string | number | null
export type VndbGenderField = VndbScalar | [VndbScalar, VndbScalar] | VndbScalar[]

// =============================================================================
// /vn
// =============================================================================

export interface VndbVnTagRelation {
  id: string
  rating?: number | null
  spoiler?: number | null
  lie?: boolean | null
}

export interface VndbVnStaffEntry {
  id: string
  role?: string | null
  note?: string | null
  eid?: number | null
}

export interface VndbVnVaEntry {
  note?: string | null
  staff?: {
    id: string
  } | null
  character?: {
    id: string
  } | null
}

export interface VndbVn {
  id: string
  title: string
  alttitle?: string | null
  titles?: VndbTitle[] | null
  released?: string | null
  description?: string | null
  devstatus?: VndbScalar
  length?: number | null
  length_minutes?: number | null
  languages?: string[] | null
  platforms?: string[] | null
  olang?: string | null
  image?: VndbImage | null
  screenshots?: VndbImage[] | null
  extlinks?: VndbExtlink[] | null
  tags?: VndbVnTagRelation[] | null
  staff?: VndbVnStaffEntry[] | null
  va?: VndbVnVaEntry[] | null
  developers?: Array<{
    id: string
  }> | null
}

// =============================================================================
// /tag
// =============================================================================

export interface VndbTag {
  id: string
  name?: string | null
  category?: string | null
}

// =============================================================================
// /trait
// =============================================================================

export interface VndbTrait {
  id: string
  name?: string | null
  group_name?: string | null
  sexual?: number | null
}

// =============================================================================
// /character
// =============================================================================

export interface VndbCharacterTraitRelation {
  id: string
  spoiler?: number | null
  lie?: boolean | null
  sexual?: number | null
}

export interface VndbCharacterVnRelation {
  id: string
  role?: string | null
  spoiler?: number | null
}

export interface VndbCharacter {
  id: string
  name: string
  original?: string | null
  description?: string | null
  sex?: VndbGenderField
  gender?: VndbGenderField
  birthday?: [number | null, number | null] | null
  blood_type?: string | null
  height?: number | null
  weight?: number | null
  bust?: number | null
  waist?: number | null
  hips?: number | null
  cup?: string | null
  image?: VndbImage | null
  traits?: VndbCharacterTraitRelation[] | null
  vns?: VndbCharacterVnRelation[] | null
}

// =============================================================================
// /staff
// =============================================================================

export interface VndbStaffAlias {
  name?: string | null
  latin?: string | null
  ismain?: boolean | null
}

export interface VndbStaff {
  id: string
  name?: string | null
  original?: string | null
  description?: string | null
  gender?: VndbGenderField
  lang?: string | null
  aliases?: VndbStaffAlias[] | null
  extlinks?: VndbExtlink[] | null
}

// =============================================================================
// /producer
// =============================================================================

export interface VndbProducer {
  id: string
  name?: string | null
  original?: string | null
  description?: string | null
  type?: 'co' | 'in' | 'ng' | string | null
  lang?: string | null
  extlinks?: VndbExtlink[] | null
}

// =============================================================================
// /release
// =============================================================================

export interface VndbReleaseProducer {
  id: string
  developer?: boolean | null
  publisher?: boolean | null
}

export interface VndbRelease {
  id: string
  producers?: VndbReleaseProducer[] | null
}

// =============================================================================
// /schema
// =============================================================================

export interface VndbSchemaEnumEntry {
  id: string
  label: string
}

export interface VndbKanaSchema {
  enums?: {
    language?: VndbSchemaEnumEntry[]
    platform?: VndbSchemaEnumEntry[]
    staff_role?: VndbSchemaEnumEntry[]
  }
}
