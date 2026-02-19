/**
 * YMGal Provider
 *
 * Implements GameScraperProvider for YMGal.
 *
 * References:
 * - https://www.ymgal.games/developer
 */

import type { NetworkService } from '@main/services/network'
import type { GameScraperProvider } from '../../provider'
import type { GameSearchResult } from '@shared/scraper'
import type { Locale } from '@shared/locale'
import type {
  CharacterPerson,
  GameCharacter,
  GameCompany,
  GameInfo,
  GamePerson,
  Tag
} from '@shared/metadata'
import { normalizeScrapedDescription, parsePartialDate } from '../../../../utils'
import { YmgalClient } from './client'
import type {
  YmgalCharacter,
  YmgalCharacterMapping,
  YmgalCharacterRelation,
  YmgalGame,
  YmgalGameArchiveData,
  YmgalGameSearchListItem,
  YmgalOrganization,
  YmgalPerson,
  YmgalPersonMapping,
  YmgalStaff
} from './types'
import {
  buildYmgalCharacterUrl,
  buildYmgalGameUrl,
  buildYmgalOrganizationUrl,
  buildYmgalPersonUrl,
  dedupeExternalIds,
  dedupeRelatedSites,
  dedupeTags,
  dedupeUrls,
  extractExternalIdsFromSites,
  extractRelatedSitesFromWebsites,
  mapYmgalCharacterType,
  mapYmgalGender,
  mapYmgalStaffRole,
  normalizeYmgalId,
  resolveLocalizedName,
  toYmgalId
} from './format'

export class YmgalProvider implements GameScraperProvider {
  public readonly id = 'ymgal'
  public readonly name = 'YMGal'
  public readonly capabilities = [
    'search',
    'info',
    'characters',
    'persons',
    'companies',
    'covers'
  ] as const

  // Public docs do not publish exact limits. Keep this conservative.
  public readonly rateLimit = {
    requestsPerWindow: 2,
    windowMs: 1000
  }

  private readonly client: YmgalClient

  constructor(networkService: NetworkService) {
    const clientId = import.meta.env.VITE_YMGAL_API_CLIENT_ID?.trim()
    const clientSecret = import.meta.env.VITE_YMGAL_API_CLIENT_SECRET?.trim()
    this.client = new YmgalClient(networkService, clientId || undefined, clientSecret || undefined)
  }

  // ===========================================================================
  // Search
  // ===========================================================================

  public async search(query: string, locale?: Locale): Promise<GameSearchResult[]> {
    const keyword = query.trim()
    if (!keyword) return []

    const ordered: GameSearchResult[] = []
    const seen = new Set<string>()

    const push = (result: GameSearchResult | null | undefined): void => {
      if (!result || seen.has(result.id)) return
      seen.add(result.id)
      ordered.push(result)
    }

    const accurate = await this.client.searchGameAccurate(keyword, 70)
    if (accurate?.game) {
      push(this.mapGameSearchResult(accurate.game, locale))
    }

    const page = await this.client.searchGameList(keyword, 1, 20)
    for (const item of page.result ?? []) {
      push(this.mapSearchListItem(item, locale))
    }

    return ordered.slice(0, 25)
  }

  // ===========================================================================
  // Core Info
  // ===========================================================================

  public async getInfo(id: string, locale?: Locale): Promise<GameInfo> {
    const archive = await this.client.getGameArchive(normalizeYmgalId(id, 'YMGal game id'))
    const game = archive.game
    const gameId = normalizeYmgalId(toYmgalId(game.gid) || id, 'YMGal game id')

    const { name, originalName } = resolveLocalizedName(game.name, game.chineseName, locale)
    const relatedSites = this.buildGameRelatedSites(game)
    const externalIds = dedupeExternalIds([
      { source: this.id, id: gameId },
      ...extractExternalIdsFromSites(relatedSites)
    ])

    return {
      name,
      originalName,
      releaseDate: parsePartialDate(game.releaseDate),
      description: normalizeScrapedDescription(game.introduction),
      relatedSites,
      externalIds
    }
  }

  // ===========================================================================
  // Characters
  // ===========================================================================

  public async getCharacters(id: string, locale?: Locale): Promise<GameCharacter[]> {
    const archive = await this.client.getGameArchive(normalizeYmgalId(id, 'YMGal game id'))
    const relations = archive.game.characters ?? []
    if (relations.length === 0) return []

    const characterIds = this.collectIds(relations.map((relation) => relation.cid))
    const actorIds = this.collectIds(relations.map((relation) => relation.cvId))

    const characterDetails = await this.fetchCharacterDetails(characterIds)
    const actorDetails = await this.fetchPersonDetails(actorIds)

    const output: GameCharacter[] = []

    for (const relation of relations) {
      const characterId = toYmgalId(relation.cid)
      if (!characterId) continue

      const detail = characterDetails.get(characterId)
      const mapping = this.findCharacterMapping(archive.cidMapping, characterId)
      const { name, originalName } = resolveLocalizedName(
        detail?.name || mapping?.name || characterId,
        detail?.chineseName || mapping?.chineseName,
        locale
      )

      const relatedSites = dedupeRelatedSites([
        { label: 'YMGal', url: buildYmgalCharacterUrl(characterId) }
      ])
      const externalIds = dedupeExternalIds([
        { source: this.id, id: characterId },
        ...extractExternalIdsFromSites(relatedSites)
      ])

      const photos = dedupeUrls([detail?.mainImg, mapping?.mainImg])
      const persons = this.buildCharacterPersons(relation, archive, actorDetails, locale)

      output.push({
        name,
        originalName,
        description: normalizeScrapedDescription(detail?.introduction),
        relatedSites,
        externalIds,
        photos: photos.length > 0 ? photos : undefined,
        gender: mapYmgalGender(detail?.gender),
        birthDate: parsePartialDate(detail?.birthday),
        type: mapYmgalCharacterType(relation.characterPosition ?? undefined),
        persons: persons.length > 0 ? persons : undefined
      })
    }

    return output
  }

  // ===========================================================================
  // Persons
  // ===========================================================================

  public async getPersons(id: string, locale?: Locale): Promise<GamePerson[]> {
    const archive = await this.client.getGameArchive(normalizeYmgalId(id, 'YMGal game id'))
    const game = archive.game

    const staffEntries = game.staff ?? []
    const characterEntries = game.characters ?? []

    const personIds = this.collectIds([
      ...staffEntries.map((staff) => staff.pid),
      ...characterEntries.map((character) => character.cvId)
    ])
    if (personIds.length === 0) return []

    const personDetails = await this.fetchPersonDetails(personIds)
    const persons: GamePerson[] = []

    for (const staff of staffEntries) {
      const personId = toYmgalId(staff.pid)
      if (!personId) continue

      const detail = personDetails.get(personId)
      const snapshot = this.findPersonMapping(archive.pidMapping, personId)
      persons.push(this.mapStaffPerson(personId, staff, detail, snapshot, locale))
    }

    for (const relation of characterEntries) {
      const personId = toYmgalId(relation.cvId)
      if (!personId) continue

      const detail = personDetails.get(personId)
      const snapshot = this.findPersonMapping(archive.pidMapping, personId)
      const incoming: GamePerson = {
        ...this.buildGamePersonBase(personId, detail, snapshot, locale),
        type: 'actor'
      }

      persons.push(incoming)
    }

    return persons
  }

  // ===========================================================================
  // Companies
  // ===========================================================================

  public async getCompanies(id: string, locale?: Locale): Promise<GameCompany[]> {
    const archive = await this.client.getGameArchive(normalizeYmgalId(id, 'YMGal game id'))
    const developerId = toYmgalId(archive.game.developerId)
    if (!developerId) return []

    let organization: YmgalOrganization | undefined
    try {
      organization = await this.client.getOrganizationArchive(developerId)
    } catch {
      organization = undefined
    }

    const relatedGames = await this.client.getOrganizationGames(developerId).catch(() => [])
    const { name, originalName } = resolveLocalizedName(
      organization?.name || developerId,
      organization?.chineseName,
      locale
    )

    const relatedSites = dedupeRelatedSites([
      { label: 'YMGal', url: buildYmgalOrganizationUrl(developerId) },
      ...extractRelatedSitesFromWebsites(organization?.website)
    ])
    const externalIds = dedupeExternalIds([
      { source: this.id, id: developerId },
      ...extractExternalIdsFromSites(relatedSites)
    ])
    const logos = dedupeUrls([organization?.mainImg])

    const tags: Tag[] = []
    if (organization?.country?.trim()) {
      tags.push({ name: organization.country.trim(), note: 'Country' })
    }

    return [
      {
        name,
        originalName,
        description: normalizeScrapedDescription(organization?.introduction),
        relatedSites,
        externalIds,
        logos: logos.length > 0 ? logos : undefined,
        tags: tags.length > 0 ? dedupeTags(tags) : undefined,
        type: 'developer',
        note: relatedGames.length > 0 ? `Known games in YMGal: ${relatedGames.length}` : undefined
      }
    ]
  }

  // ===========================================================================
  // Images
  // ===========================================================================

  public async getCovers(id: string, _locale?: Locale): Promise<string[]> {
    const archive = await this.client.getGameArchive(normalizeYmgalId(id, 'YMGal game id'))
    return dedupeUrls([archive.game.mainImg]).slice(0, 10)
  }

  // ===========================================================================
  // Helpers
  // ===========================================================================

  private mapGameSearchResult(game: YmgalGame, locale?: Locale): GameSearchResult {
    const rawGameId = toYmgalId(game.gid)
    if (!rawGameId) {
      throw new Error(`Invalid YMGal game id: ${game.gid}`)
    }
    const gameId = normalizeYmgalId(rawGameId, 'YMGal game id')
    const { name, originalName } = resolveLocalizedName(game.name, game.chineseName, locale)

    return {
      id: gameId,
      name,
      originalName,
      releaseDate: parsePartialDate(game.releaseDate),
      externalIds: [{ source: this.id, id: gameId }]
    }
  }

  private mapSearchListItem(
    item: YmgalGameSearchListItem,
    locale?: Locale
  ): GameSearchResult | null {
    const itemId = toYmgalId(item.id) || toYmgalId(item.gid)
    const name = item.name?.trim()

    if (!itemId || !name) {
      return null
    }

    const { name: localizedName, originalName } = resolveLocalizedName(
      name,
      item.chineseName,
      locale
    )
    return {
      id: itemId,
      name: localizedName,
      originalName,
      releaseDate: parsePartialDate(item.releaseDate),
      externalIds: [{ source: this.id, id: itemId }]
    }
  }

  private buildGameRelatedSites(game: YmgalGame): Array<{ label: string; url: string }> {
    const sites: Array<{ label: string; url: string }> = []

    const rawGameId = toYmgalId(game.gid)
    if (rawGameId) {
      sites.push({ label: 'YMGal', url: buildYmgalGameUrl(rawGameId) })
    }

    sites.push(...extractRelatedSitesFromWebsites(game.website))

    return dedupeRelatedSites(sites)
  }

  private buildCharacterPersons(
    relation: YmgalCharacterRelation,
    archive: YmgalGameArchiveData,
    actorDetails: Map<string, YmgalPerson>,
    locale?: Locale
  ): CharacterPerson[] {
    const actorId = toYmgalId(relation.cvId)
    if (!actorId) return []

    const detail = actorDetails.get(actorId)
    const mapping = this.findPersonMapping(archive.pidMapping, actorId)
    const { name, originalName } = resolveLocalizedName(
      detail?.name || mapping?.name || actorId,
      detail?.chineseName || mapping?.chineseName,
      locale
    )

    const relatedSites = dedupeRelatedSites([
      { label: 'YMGal', url: buildYmgalPersonUrl(actorId) },
      ...extractRelatedSitesFromWebsites(detail?.website)
    ])
    const externalIds = dedupeExternalIds([
      { source: this.id, id: actorId },
      ...extractExternalIdsFromSites(relatedSites)
    ])
    const photos = dedupeUrls([detail?.mainImg, mapping?.mainImg])

    return [
      {
        name,
        originalName,
        description: normalizeScrapedDescription(detail?.introduction),
        relatedSites,
        externalIds,
        photos: photos.length > 0 ? photos : undefined,
        gender: mapYmgalGender(detail?.gender),
        birthDate: parsePartialDate(detail?.birthday),
        type: 'actor'
      }
    ]
  }

  private mapStaffPerson(
    personId: string,
    staff: YmgalStaff,
    detail: YmgalPerson | undefined,
    snapshot: YmgalPersonMapping | undefined,
    locale?: Locale
  ): GamePerson {
    const base = this.buildGamePersonBase(personId, detail, snapshot, locale)
    const role = this.resolveStaffRoleName(staff)
    const note = staff.empDesc?.trim() || staff.desc?.trim() || undefined

    return {
      ...base,
      type: mapYmgalStaffRole(role),
      note
    }
  }

  private buildGamePersonBase(
    personId: string,
    detail: YmgalPerson | undefined,
    snapshot: YmgalPersonMapping | undefined,
    locale?: Locale
  ): Omit<GamePerson, 'type' | 'note'> {
    const { name, originalName } = resolveLocalizedName(
      detail?.name || snapshot?.name || personId,
      detail?.chineseName || snapshot?.chineseName,
      locale
    )

    const relatedSites = dedupeRelatedSites([
      { label: 'YMGal', url: buildYmgalPersonUrl(personId) },
      ...extractRelatedSitesFromWebsites(detail?.website)
    ])
    const externalIds = dedupeExternalIds([
      { source: this.id, id: personId },
      ...extractExternalIdsFromSites(relatedSites)
    ])
    const photos = dedupeUrls([detail?.mainImg, snapshot?.mainImg])

    const tags: Tag[] = []
    if (detail?.country?.trim()) {
      tags.push({ name: detail.country.trim(), note: 'Country' })
    }

    return {
      name,
      originalName,
      description: normalizeScrapedDescription(detail?.introduction),
      relatedSites,
      externalIds,
      photos: photos.length > 0 ? photos : undefined,
      gender: mapYmgalGender(detail?.gender),
      birthDate: parsePartialDate(detail?.birthday),
      tags: tags.length > 0 ? dedupeTags(tags) : undefined
    }
  }

  private resolveStaffRoleName(staff: YmgalStaff): string | undefined {
    const role = staff.jobName?.trim() || staff.job_name?.trim()
    if (role) return role

    const fallback = staff.empName?.trim() || staff.emp_name?.trim()
    return fallback || undefined
  }

  private collectIds(values: unknown[]): string[] {
    const ids = new Set<string>()
    for (const value of values) {
      const id = toYmgalId(value)
      if (id) ids.add(id)
    }
    return Array.from(ids)
  }

  private findCharacterMapping(
    mapping: Record<string, YmgalCharacterMapping> | null | undefined,
    characterId: string
  ): YmgalCharacterMapping | undefined {
    if (!mapping) return undefined
    if (mapping[characterId]) return mapping[characterId]

    return Object.values(mapping).find((item) => toYmgalId(item.cid) === characterId)
  }

  private findPersonMapping(
    mapping: Record<string, YmgalPersonMapping> | null | undefined,
    personId: string
  ): YmgalPersonMapping | undefined {
    if (!mapping) return undefined
    if (mapping[personId]) return mapping[personId]

    return Object.values(mapping).find((item) => toYmgalId(item.pid) === personId)
  }

  private async fetchCharacterDetails(ids: string[]): Promise<Map<string, YmgalCharacter>> {
    const map = new Map<string, YmgalCharacter>()
    for (const characterId of ids) {
      try {
        const detail = await this.client.getCharacterArchive(characterId)
        map.set(characterId, detail)
      } catch {
        continue
      }
    }
    return map
  }

  private async fetchPersonDetails(ids: string[]): Promise<Map<string, YmgalPerson>> {
    const map = new Map<string, YmgalPerson>()
    for (const personId of ids) {
      try {
        const detail = await this.client.getPersonArchive(personId)
        map.set(personId, detail)
      } catch {
        continue
      }
    }
    return map
  }
}
