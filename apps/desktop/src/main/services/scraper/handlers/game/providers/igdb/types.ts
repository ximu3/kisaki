/**
 * IGDB API Types
 *
 * Based on official docs and OpenAPI:
 * - https://api-docs.igdb.com/
 * - https://igdb-openapi.s-crypt.co/IGDB-OpenAPI.yaml
 *
 * Only fields used by Kisaki scraper are modeled here.
 */

export interface IgdbTokenResponse {
  access_token: string
  expires_in: number
  token_type: 'bearer'
}

export interface IgdbEntityRef {
  id: number
}

export interface IgdbImageRef extends IgdbEntityRef {
  image_id?: string
  url?: string
}

export interface IgdbNamedTypeRef extends IgdbEntityRef {
  type?: string
}

export interface IgdbNamedStatusRef extends IgdbEntityRef {
  status?: string
}

export interface IgdbSearchResult {
  id: number
  game?: number | null
  name?: string
  alternative_name?: string
}

export interface IgdbGameSearchItem {
  id: number
  name: string
  first_release_date?: number
}

export interface IgdbGame {
  id: number
  name: string
  first_release_date?: number
  summary?: string
  storyline?: string
  url?: string
  game_type?: IgdbNamedTypeRef
  game_status?: IgdbNamedStatusRef
  genres?: number[]
  themes?: number[]
  keywords?: number[]
  game_modes?: number[]
  player_perspectives?: number[]
  platforms?: number[]
  language_supports?: number[]
  release_dates?: number[]
  websites?: number[]
  external_games?: number[]
  videos?: number[]
  cover?: number
  screenshots?: number[]
  artworks?: number[]
}

export interface IgdbGenre extends IgdbEntityRef {
  name?: string
}

export interface IgdbTheme extends IgdbEntityRef {
  name?: string
}

export interface IgdbKeyword extends IgdbEntityRef {
  name?: string
}

export interface IgdbGameMode extends IgdbEntityRef {
  name?: string
}

export interface IgdbPlayerPerspective extends IgdbEntityRef {
  name?: string
}

export interface IgdbPlatform extends IgdbEntityRef {
  name?: string
}

export interface IgdbLanguageSupport extends IgdbEntityRef {
  language?: number
  language_support_type?: number
}

export interface IgdbLanguage extends IgdbEntityRef {
  name?: string
  native_name?: string
  locale?: string
}

export interface IgdbLanguageSupportType extends IgdbEntityRef {
  name?: string
}

export interface IgdbReleaseDate extends IgdbEntityRef {
  date?: number
  y?: number
  m?: number
  status?: number
}

export interface IgdbReleaseDateStatus extends IgdbEntityRef {
  name?: string
}

export interface IgdbWebsite extends IgdbEntityRef {
  type?: number
  url?: string
  trusted?: boolean
}

export interface IgdbWebsiteType extends IgdbEntityRef {
  type?: string
}

export interface IgdbExternalGame extends IgdbEntityRef {
  uid?: string
  url?: string
  external_game_source?: number
  game_release_format?: number
}

export interface IgdbExternalGameSource extends IgdbEntityRef {
  name?: string
}

export interface IgdbGameVideo extends IgdbEntityRef {
  name?: string
  video_id?: string
}

export interface IgdbCharacter extends IgdbEntityRef {
  name: string
  akas?: string[]
  description?: string
  country_name?: string
  character_gender?: number
  character_species?: number
  mug_shot?: number
  url?: string
}

export interface IgdbCharacterGender extends IgdbEntityRef {
  name?: string
}

export interface IgdbCharacterSpecies extends IgdbEntityRef {
  name?: string
}

export type IgdbCharacterMugShot = IgdbImageRef

export interface IgdbInvolvedCompany extends IgdbEntityRef {
  company?: number
  developer?: boolean
  publisher?: boolean
  porting?: boolean
  supporting?: boolean
}

export interface IgdbCompany extends IgdbEntityRef {
  name: string
  description?: string
  url?: string
  logo?: number
  websites?: number[]
}

export type IgdbCompanyLogo = IgdbImageRef

export interface IgdbCompanyWebsite extends IgdbEntityRef {
  type?: number
  url?: string
  trusted?: boolean
}

export type IgdbCover = IgdbImageRef

export type IgdbScreenshot = IgdbImageRef

export type IgdbArtwork = IgdbImageRef
