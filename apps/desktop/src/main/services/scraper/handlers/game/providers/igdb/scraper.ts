/**
 * IGDB Provider
 *
 * Implements GameScraperProvider for IGDB.
 *
 * References:
 * - https://api-docs.igdb.com/
 * - https://igdb-openapi.s-crypt.co/IGDB-OpenAPI.yaml
 */

import type { NetworkService } from '@main/services/network'
import type { GameScraperProvider } from '../../provider'
import type { GameSearchResult } from '@shared/scraper'
import type { Locale } from '@shared/locale'
import type { GameInfo, Tag, GameCharacter, GameCompany } from '@shared/metadata'
import type { GameCompanyType } from '@shared/db'
import { normalizeScrapedDescription } from '../../../../utils'
import { IgdbClient } from './client'
import {
  clampLimit,
  dedupeStrings,
  escapeApicalypseString,
  mapIgdbGender,
  normalizeExternalSource,
  resolveIgdbImageUrl,
  toPartialDateFromUnix,
  toPartialDateFromYearMonth
} from './format'
import type {
  IgdbArtwork,
  IgdbCharacter,
  IgdbCharacterGender,
  IgdbCharacterMugShot,
  IgdbCharacterSpecies,
  IgdbCompany,
  IgdbCompanyLogo,
  IgdbCompanyWebsite,
  IgdbCover,
  IgdbExternalGame,
  IgdbExternalGameSource,
  IgdbGame,
  IgdbGameMode,
  IgdbGameSearchItem,
  IgdbGameVideo,
  IgdbGenre,
  IgdbInvolvedCompany,
  IgdbKeyword,
  IgdbLanguage,
  IgdbLanguageSupport,
  IgdbLanguageSupportType,
  IgdbPlatform,
  IgdbPlayerPerspective,
  IgdbReleaseDate,
  IgdbReleaseDateStatus,
  IgdbScreenshot,
  IgdbSearchResult,
  IgdbTheme,
  IgdbWebsite,
  IgdbWebsiteType
} from './types'

const ALLOWED_EXTERNAL_ID_SOURCES = new Set(['igdb', 'vndb', 'steam', 'bangumi', 'ymgal'])

function resolveAllowedExternalIdSource(sourceName?: string): string | undefined {
  if (!sourceName?.trim()) return undefined
  const normalized = normalizeExternalSource(sourceName)
  return ALLOWED_EXTERNAL_ID_SOURCES.has(normalized) ? normalized : undefined
}

export class IGDBProvider implements GameScraperProvider {
  public readonly id = 'igdb'
  public readonly name = 'IGDB'
  public readonly capabilities = [
    'search',
    'info',
    'tags',
    'characters',
    'companies',
    'covers',
    'backdrops'
  ] as const

  // Official docs: 4 requests/s, at most 8 open requests.
  public readonly rateLimit = {
    requestsPerWindow: 4,
    windowMs: 1000
  }

  private readonly client: IgdbClient

  constructor(networkService: NetworkService) {
    const clientId = import.meta.env.VITE_IGDB_API_CLIENT_ID?.trim()
    const clientSecret = import.meta.env.VITE_IGDB_API_CLIENT_SECRET?.trim()
    this.client = new IgdbClient(networkService, clientId || undefined, clientSecret || undefined)
  }

  // ===========================================================================
  // Search
  // ===========================================================================

  public async search(query: string, _locale?: Locale): Promise<GameSearchResult[]> {
    this.ensureConfigured()

    const escaped = escapeApicalypseString(query.trim())
    if (!escaped) return []

    const [directGames, searchMatches] = await Promise.all([
      this.client.query<IgdbGameSearchItem>(
        'games',
        `fields id,name,first_release_date; search "${escaped}"; limit 25;`
      ),
      this.client.query<IgdbSearchResult>(
        'search',
        `fields game,name,alternative_name; where game != null; search "${escaped}"; limit 25;`
      )
    ])

    const map = new Map<number, IgdbGameSearchItem>()
    for (const game of directGames) {
      if (game.id > 0) map.set(game.id, game)
    }

    const fallbackIds = searchMatches.map((item) => item.game ?? 0).filter((id) => id > 0)
    const unresolvedFallbackIds = fallbackIds.filter((id) => !map.has(id))

    if (unresolvedFallbackIds.length > 0) {
      const fallbackGames = await this.client.queryByIds<IgdbGameSearchItem>(
        'games',
        unresolvedFallbackIds,
        'id,name,first_release_date'
      )
      for (const game of fallbackGames) {
        if (game.id > 0) map.set(game.id, game)
      }
    }

    return Array.from(map.values())
      .slice(0, 25)
      .map((game) => ({
        id: String(game.id),
        name: game.name,
        releaseDate: toPartialDateFromUnix(game.first_release_date),
        externalIds: [{ source: this.id, id: String(game.id) }]
      }))
  }

  // ===========================================================================
  // Core Info
  // ===========================================================================

  public async getInfo(id: string, _locale?: Locale): Promise<GameInfo> {
    this.ensureConfigured()
    const gameId = this.parseId(id)

    const game = await this.fetchGameById(
      gameId,
      'id,name,first_release_date,summary,storyline,url,game_type.type,game_status.status,websites,external_games,videos,release_dates'
    )

    if (!game) {
      throw new Error(`IGDB game not found: ${id}`)
    }

    const [websites, externalGames, videos, releaseDates] = await Promise.all([
      this.client.queryByIds<IgdbWebsite>('websites', game.websites ?? [], 'id,type,url,trusted'),
      this.client.queryByIds<IgdbExternalGame>(
        'external_games',
        game.external_games ?? [],
        'id,uid,url,external_game_source,game_release_format'
      ),
      this.client.queryByIds<IgdbGameVideo>('game_videos', game.videos ?? [], 'id,name,video_id'),
      this.client.queryByIds<IgdbReleaseDate>(
        'release_dates',
        game.release_dates ?? [],
        'id,date,y,m,status'
      )
    ])

    const [websiteTypes, externalSources] = await Promise.all([
      this.client.queryByIds<IgdbWebsiteType>(
        'website_types',
        websites.map((site) => site.type ?? 0),
        'id,type'
      ),
      this.client.queryByIds<IgdbExternalGameSource>(
        'external_game_sources',
        externalGames.map((gameRef) => gameRef.external_game_source ?? 0),
        'id,name'
      )
    ])

    const websiteTypeMap = new Map<number, string>()
    for (const item of websiteTypes) {
      if (!item.type?.trim()) continue
      websiteTypeMap.set(item.id, item.type.trim())
    }

    const externalSourceMap = new Map<number, string>()
    for (const item of externalSources) {
      if (!item.name?.trim()) continue
      externalSourceMap.set(item.id, item.name.trim())
    }

    const relatedSites: Array<{ label: string; url: string }> = []
    if (game.url?.trim()) {
      relatedSites.push({ label: 'IGDB', url: game.url })
    } else {
      relatedSites.push({ label: 'IGDB', url: `https://www.igdb.com/games/${game.id}` })
    }

    for (const website of websites) {
      if (!website.url?.trim()) continue
      relatedSites.push({
        label: websiteTypeMap.get(website.type ?? -1) ?? 'Website',
        url: website.url
      })
    }

    const externalIds = [{ source: this.id, id: String(game.id) }]
    for (const ext of externalGames) {
      const sourceName = externalSourceMap.get(ext.external_game_source ?? -1)
      const resolvedSource = resolveAllowedExternalIdSource(sourceName)
      if (ext.uid?.trim() && resolvedSource) {
        externalIds.push({
          source: resolvedSource,
          id: ext.uid.trim()
        })
      }

      if (ext.url?.trim()) {
        relatedSites.push({
          label: sourceName ?? 'External',
          url: ext.url
        })
      }
    }

    for (const video of videos) {
      if (!video.video_id?.trim()) continue
      relatedSites.push({
        label: video.name?.trim() ? `YouTube: ${video.name.trim()}` : 'YouTube',
        url: `https://www.youtube.com/watch?v=${video.video_id.trim()}`
      })
    }

    let releaseDate = toPartialDateFromUnix(game.first_release_date)
    if (!releaseDate && releaseDates.length > 0) {
      const withDate = releaseDates
        .filter((item) => Number.isFinite(item.date) && !!item.date)
        .sort((a, b) => (a.date ?? 0) - (b.date ?? 0))

      if (withDate.length > 0) {
        releaseDate = toPartialDateFromUnix(withDate[0].date)
      } else {
        const fallback = releaseDates[0]
        releaseDate = toPartialDateFromYearMonth(fallback.y, fallback.m, fallback.date)
      }
    }

    const descriptionParts = [game.storyline?.trim(), game.summary?.trim()].filter(
      (part): part is string => !!part
    )
    const description = normalizeScrapedDescription(descriptionParts.join('\n\n'))

    return {
      name: game.name,
      releaseDate,
      description,
      relatedSites: this.dedupeRelatedSites(relatedSites),
      externalIds: this.dedupeExternalIds(externalIds)
    }
  }

  // ===========================================================================
  // Tags
  // ===========================================================================

  public async getTags(id: string, _locale?: Locale): Promise<Tag[]> {
    this.ensureConfigured()
    const gameId = this.parseId(id)

    const game = await this.fetchGameById(
      gameId,
      'id,genres,themes,keywords,game_modes,player_perspectives,platforms,language_supports,release_dates,game_type.type,game_status.status'
    )
    if (!game) return []

    const [
      genres,
      themes,
      keywords,
      gameModes,
      perspectives,
      platforms,
      languageSupports,
      releaseDates
    ] = await Promise.all([
      this.client.queryByIds<IgdbGenre>('genres', game.genres ?? [], 'id,name'),
      this.client.queryByIds<IgdbTheme>('themes', game.themes ?? [], 'id,name'),
      this.client.queryByIds<IgdbKeyword>('keywords', game.keywords ?? [], 'id,name'),
      this.client.queryByIds<IgdbGameMode>('game_modes', game.game_modes ?? [], 'id,name'),
      this.client.queryByIds<IgdbPlayerPerspective>(
        'player_perspectives',
        game.player_perspectives ?? [],
        'id,name'
      ),
      this.client.queryByIds<IgdbPlatform>('platforms', game.platforms ?? [], 'id,name'),
      this.client.queryByIds<IgdbLanguageSupport>(
        'language_supports',
        game.language_supports ?? [],
        'id,language,language_support_type'
      ),
      this.client.queryByIds<IgdbReleaseDate>(
        'release_dates',
        game.release_dates ?? [],
        'id,date,y,m,status'
      )
    ])

    const [languages, languageSupportTypes, releaseStatuses] = await Promise.all([
      this.client.queryByIds<IgdbLanguage>(
        'languages',
        languageSupports.map((item) => item.language ?? 0),
        'id,name,native_name,locale'
      ),
      this.client.queryByIds<IgdbLanguageSupportType>(
        'language_support_types',
        languageSupports.map((item) => item.language_support_type ?? 0),
        'id,name'
      ),
      this.client.queryByIds<IgdbReleaseDateStatus>(
        'release_date_statuses',
        releaseDates.map((item) => item.status ?? 0),
        'id,name'
      )
    ])

    const languageMap = new Map<number, string>()
    for (const lang of languages) {
      const name = lang.name?.trim() || lang.native_name?.trim()
      if (!name) continue
      languageMap.set(lang.id, name)
    }

    const languageSupportTypeMap = new Map<number, string>()
    for (const item of languageSupportTypes) {
      const name = item.name?.trim()
      if (!name) continue
      languageSupportTypeMap.set(item.id, name)
    }

    const releaseStatusMap = new Map<number, string>()
    for (const status of releaseStatuses) {
      const name = status.name?.trim()
      if (!name) continue
      releaseStatusMap.set(status.id, name)
    }

    const tags: Tag[] = []

    if (game.game_type?.type?.trim()) {
      tags.push({ name: game.game_type.type.trim(), note: 'Game Type' })
    }
    if (game.game_status?.status?.trim()) {
      tags.push({ name: game.game_status.status.trim(), note: 'Game Status' })
    }

    for (const genre of genres) {
      if (genre.name?.trim()) tags.push({ name: genre.name.trim() })
    }

    for (const theme of themes) {
      if (theme.name?.trim()) tags.push({ name: theme.name.trim() })
    }

    for (const keyword of keywords.slice(0, 100)) {
      if (keyword.name?.trim()) tags.push({ name: keyword.name.trim() })
    }

    for (const mode of gameModes) {
      if (mode.name?.trim()) tags.push({ name: mode.name.trim(), note: 'Game Mode' })
    }

    for (const perspective of perspectives) {
      if (perspective.name?.trim()) {
        tags.push({ name: perspective.name.trim(), note: 'Player Perspective' })
      }
    }

    for (const platform of platforms) {
      if (platform.name?.trim()) tags.push({ name: platform.name.trim(), note: 'Platform' })
    }

    for (const support of languageSupports) {
      const language = languageMap.get(support.language ?? -1)
      const supportType = languageSupportTypeMap.get(support.language_support_type ?? -1)
      if (!language || !supportType) continue
      tags.push({ name: `${supportType}: ${language}`, note: 'Language Support' })
    }

    for (const releaseDate of releaseDates) {
      const statusName = releaseStatusMap.get(releaseDate.status ?? -1)
      if (!statusName) continue
      tags.push({ name: statusName, note: 'Release Status' })
    }

    return this.dedupeTags(tags)
  }

  // ===========================================================================
  // Characters
  // ===========================================================================

  public async getCharacters(id: string, _locale?: Locale): Promise<GameCharacter[]> {
    this.ensureConfigured()
    const gameId = this.parseId(id)

    const characters = await this.client.query<IgdbCharacter>(
      'characters',
      `fields id,name,akas,description,country_name,character_gender,character_species,mug_shot,url; where games = (${gameId}); limit 200;`
    )
    if (!characters.length) return []

    const [mugShots, genders, species] = await Promise.all([
      this.client.queryByIds<IgdbCharacterMugShot>(
        'character_mug_shots',
        characters.map((item) => item.mug_shot ?? 0),
        'id,image_id,url'
      ),
      this.client.queryByIds<IgdbCharacterGender>(
        'character_genders',
        characters.map((item) => item.character_gender ?? 0),
        'id,name'
      ),
      this.client.queryByIds<IgdbCharacterSpecies>(
        'character_species',
        characters.map((item) => item.character_species ?? 0),
        'id,name'
      )
    ])

    const mugShotMap = new Map<number, IgdbCharacterMugShot>(
      mugShots.map((item) => [item.id, item])
    )
    const genderMap = new Map<number, string>()
    for (const item of genders) {
      if (item.name?.trim()) genderMap.set(item.id, item.name.trim())
    }

    const speciesMap = new Map<number, string>()
    for (const item of species) {
      if (item.name?.trim()) speciesMap.set(item.id, item.name.trim())
    }

    return characters.map((character) => {
      const photo = resolveIgdbImageUrl(mugShotMap.get(character.mug_shot ?? -1), '720p')
      const speciesName = speciesMap.get(character.character_species ?? -1)

      const tags: Tag[] = []
      if (speciesName) tags.push({ name: speciesName, note: 'Species' })
      if (character.country_name?.trim()) {
        tags.push({ name: character.country_name.trim(), note: 'Country' })
      }

      return {
        name: character.name,
        originalName: character.akas?.find((aka) => aka?.trim() && aka.trim() !== character.name),
        description: normalizeScrapedDescription(character.description),
        relatedSites: this.dedupeRelatedSites([
          {
            label: 'IGDB',
            url: character.url?.trim() || `https://www.igdb.com/characters/${character.id}`
          }
        ]),
        externalIds: [{ source: this.id, id: String(character.id) }],
        photos: photo ? [photo] : undefined,
        gender: mapIgdbGender(genderMap.get(character.character_gender ?? -1)),
        tags: tags.length > 0 ? this.dedupeTags(tags) : undefined,
        type: 'main'
      }
    })
  }

  // ===========================================================================
  // Companies
  // ===========================================================================

  public async getCompanies(id: string, _locale?: Locale): Promise<GameCompany[]> {
    this.ensureConfigured()
    const gameId = this.parseId(id)

    const involvedCompanies = await this.client.query<IgdbInvolvedCompany>(
      'involved_companies',
      `fields id,company,developer,publisher,porting,supporting; where game = ${gameId}; limit 500;`
    )
    if (!involvedCompanies.length) return []

    const companyRows = await this.client.queryByIds<IgdbCompany>(
      'companies',
      involvedCompanies.map((item) => item.company ?? 0),
      'id,name,description,url,logo,websites'
    )
    if (!companyRows.length) return []

    const [logos, companyWebsites] = await Promise.all([
      this.client.queryByIds<IgdbCompanyLogo>(
        'company_logos',
        companyRows.map((company) => company.logo ?? 0),
        'id,image_id,url'
      ),
      this.client.queryByIds<IgdbCompanyWebsite>(
        'company_websites',
        companyRows.flatMap((company) => company.websites ?? []),
        'id,type,url,trusted'
      )
    ])

    const websiteTypes = await this.client.queryByIds<IgdbWebsiteType>(
      'website_types',
      companyWebsites.map((site) => site.type ?? 0),
      'id,type'
    )

    const companyMap = new Map<number, IgdbCompany>(
      companyRows.map((company) => [company.id, company])
    )
    const logoMap = new Map<number, IgdbCompanyLogo>(logos.map((item) => [item.id, item]))
    const companyWebsiteMap = new Map<number, IgdbCompanyWebsite>(
      companyWebsites.map((item) => [item.id, item])
    )

    const websiteTypeMap = new Map<number, string>()
    for (const item of websiteTypes) {
      if (item.type?.trim()) websiteTypeMap.set(item.id, item.type.trim())
    }

    const companies: GameCompany[] = []

    for (const involved of involvedCompanies) {
      const companyId = involved.company ?? 0
      const company = companyMap.get(companyId)
      if (!company || !company.name?.trim()) continue

      const logo = resolveIgdbImageUrl(logoMap.get(company.logo ?? -1), 'logo_med')
      const relatedSites: Array<{ label: string; url: string }> = []

      if (company.url?.trim()) {
        relatedSites.push({ label: 'IGDB', url: company.url })
      } else {
        relatedSites.push({ label: 'IGDB', url: `https://www.igdb.com/companies/${company.id}` })
      }

      for (const websiteId of company.websites ?? []) {
        const site = companyWebsiteMap.get(websiteId)
        if (!site?.url?.trim()) continue
        relatedSites.push({
          label: websiteTypeMap.get(site.type ?? -1) ?? 'Website',
          url: site.url
        })
      }

      const base: Omit<GameCompany, 'type' | 'note'> = {
        name: company.name.trim(),
        description: normalizeScrapedDescription(company.description),
        relatedSites: this.dedupeRelatedSites(relatedSites),
        externalIds: [{ source: this.id, id: String(company.id) }],
        logos: logo ? [logo] : undefined
      }

      for (const relation of this.mapCompanyRelations(involved)) {
        companies.push({
          ...base,
          type: relation.type,
          note: relation.note
        })
      }
    }

    return companies
  }

  // ===========================================================================
  // Images
  // ===========================================================================

  public async getCovers(id: string, _locale?: Locale): Promise<string[]> {
    this.ensureConfigured()
    const gameId = this.parseId(id)

    const covers = await this.client.query<IgdbCover>(
      'covers',
      `fields id,image_id,url; where game = ${gameId}; limit 20;`
    )

    const coverUrls = dedupeStrings(
      covers
        .map((cover) => resolveIgdbImageUrl(cover, 'cover_big'))
        .filter((url): url is string => !!url)
    )

    if (coverUrls.length > 0) {
      return coverUrls.slice(0, 10)
    }

    // Fallback to game.cover relation when direct query has no result.
    const game = await this.fetchGameById(gameId, 'id,cover')
    if (!game?.cover) return []

    const fallbackCovers = await this.client.queryByIds<IgdbCover>(
      'covers',
      [game.cover],
      'id,image_id,url'
    )

    return dedupeStrings(
      fallbackCovers
        .map((cover) => resolveIgdbImageUrl(cover, 'cover_big'))
        .filter((url): url is string => !!url)
    ).slice(0, 10)
  }

  public async getBackdrops(id: string, _locale?: Locale): Promise<string[]> {
    this.ensureConfigured()
    const gameId = this.parseId(id)

    const [screenshots, artworks] = await Promise.all([
      this.client.query<IgdbScreenshot>(
        'screenshots',
        `fields id,image_id,url; where game = ${gameId}; limit ${clampLimit(50)};`
      ),
      this.client.query<IgdbArtwork>(
        'artworks',
        `fields id,image_id,url; where game = ${gameId}; limit ${clampLimit(50)};`
      )
    ])

    return dedupeStrings(
      [...screenshots, ...artworks]
        .map((image) => resolveIgdbImageUrl(image, 'screenshot_huge'))
        .filter((url): url is string => !!url)
    ).slice(0, 20)
  }

  // ===========================================================================
  // Helpers
  // ===========================================================================

  private ensureConfigured(): void {
    if (!this.client.isConfigured()) {
      throw new Error(
        'IGDB provider is not configured. Set VITE_IGDB_API_CLIENT_ID and VITE_IGDB_API_CLIENT_SECRET in apps/desktop/.env.'
      )
    }
  }

  private parseId(id: string): number {
    const value = Number.parseInt(id, 10)
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`Invalid IGDB game id: ${id}`)
    }
    return value
  }

  private async fetchGameById(gameId: number, fields: string): Promise<IgdbGame | null> {
    const rows = await this.client.query<IgdbGame>(
      'games',
      `fields ${fields}; where id = ${gameId}; limit 1;`
    )
    return rows[0] ?? null
  }

  private dedupeRelatedSites(
    sites: Array<{ label: string; url: string }>
  ): Array<{ label: string; url: string }> {
    const map = new Map<string, { label: string; url: string }>()
    for (const site of sites) {
      if (!site.url?.trim()) continue
      const key = site.url.trim()
      if (!map.has(key)) {
        map.set(key, {
          label: site.label?.trim() || 'Website',
          url: key
        })
      }
    }
    return Array.from(map.values())
  }

  private dedupeExternalIds(
    ids: Array<{ source: string; id: string }>
  ): Array<{ source: string; id: string }> {
    const seen = new Set<string>()
    return ids.filter((item) => {
      const source = item.source.trim()
      const extId = item.id.trim()
      if (!source || !extId) return false
      const key = `${source}:${extId}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  private dedupeTags(tags: Tag[]): Tag[] {
    const seen = new Set<string>()
    const output: Tag[] = []

    for (const tag of tags) {
      const name = tag.name?.trim()
      if (!name) continue
      const note = tag.note?.trim() || ''
      const key = `${name.toLowerCase()}::${note.toLowerCase()}`
      if (seen.has(key)) continue
      seen.add(key)
      output.push({
        ...tag,
        name,
        note: note || undefined
      })
    }

    return output
  }

  private mapCompanyRelations(
    involved: IgdbInvolvedCompany
  ): Array<{ type: GameCompanyType; note?: string }> {
    const relations: Array<{ type: GameCompanyType; note?: string }> = []

    if (involved.developer) relations.push({ type: 'developer' })
    if (involved.publisher) relations.push({ type: 'publisher' })
    if (involved.porting) relations.push({ type: 'distributor', note: 'Porting' })
    if (involved.supporting) relations.push({ type: 'other', note: 'Supporting' })

    if (relations.length === 0) {
      relations.push({ type: 'other' })
    }

    return relations
  }
}
