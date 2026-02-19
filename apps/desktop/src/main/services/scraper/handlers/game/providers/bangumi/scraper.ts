/**
 * Bangumi Provider
 *
 * Implements GameScraperProvider for Bangumi.
 *
 * References:
 * - https://bangumi.github.io/api/
 * - https://bangumi.github.io/api/dist.json
 * - https://github.com/bangumi/api/
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
import { BangumiClient } from './client'
import type {
  BangumiCharacterDetail,
  BangumiCharacterPerson,
  BangumiPersonDetail,
  BangumiRelatedCharacter,
  BangumiRelatedPerson
} from './types'
import {
  BANGUMI_SUBJECT_TYPE_GAME,
  buildBangumiCharacterUrl,
  buildBangumiPersonUrl,
  buildBangumiSubjectUrl,
  composeBangumiRoleNote,
  dedupeExternalIds,
  dedupeRelatedSites,
  dedupeTags,
  dedupeUrls,
  extractCharacterMeasurementsFromInfobox,
  extractExternalIdsFromSites,
  extractImageUrls,
  extractRelatedSitesFromInfobox,
  mapBangumiBloodType,
  mapBangumiCareersToTags,
  mapBangumiCharacterRelation,
  mapBangumiCompanyRole,
  mapBangumiGender,
  mapBangumiPersonRole,
  parseBangumiId,
  resolveLocalizedEntityName,
  resolveLocalizedSubjectName,
  toPartialDateFromParts
} from './format'

export class BangumiProvider implements GameScraperProvider {
  public readonly id = 'bangumi'
  public readonly name = 'Bangumi'
  public readonly capabilities = [
    'search',
    'info',
    'tags',
    'characters',
    'persons',
    'companies',
    'covers',
    'backdrops',
    'icons'
  ] as const

  // No published global rate limit in docs. Keep conservative.
  public readonly rateLimit = {
    requestsPerWindow: 4,
    windowMs: 1000
  }

  private readonly client: BangumiClient

  constructor(networkService: NetworkService) {
    const accessToken = import.meta.env.VITE_BANGUMI_API_ACCESS_TOKEN?.trim()
    this.client = new BangumiClient(networkService, accessToken || undefined)
  }

  // ===========================================================================
  // Search
  // ===========================================================================

  public async search(query: string, locale?: Locale): Promise<GameSearchResult[]> {
    const keyword = query.trim()
    if (!keyword) return []

    const response = await this.client.searchSubjects(
      {
        keyword,
        sort: 'match',
        filter: {
          type: [BANGUMI_SUBJECT_TYPE_GAME]
        }
      },
      25,
      0
    )

    return (response.data ?? [])
      .filter((subject) => subject.type === BANGUMI_SUBJECT_TYPE_GAME)
      .map((subject) => {
        const { name, originalName } = resolveLocalizedSubjectName(
          subject.name,
          subject.name_cn,
          locale
        )
        return {
          id: String(subject.id),
          name,
          originalName,
          releaseDate: parsePartialDate(subject.date),
          externalIds: [{ source: this.id, id: String(subject.id) }]
        }
      })
  }

  // ===========================================================================
  // Core Info
  // ===========================================================================

  public async getInfo(id: string, locale?: Locale): Promise<GameInfo> {
    const subjectId = parseBangumiId(id)
    const subject = await this.client.getSubjectById(subjectId)

    if (subject.type !== BANGUMI_SUBJECT_TYPE_GAME) {
      throw new Error(`Bangumi subject is not a game: ${subject.id}`)
    }

    const { name, originalName } = resolveLocalizedSubjectName(
      subject.name,
      subject.name_cn,
      locale
    )

    const relatedSites = dedupeRelatedSites([
      { label: 'Bangumi', url: buildBangumiSubjectUrl(subject.id) },
      ...extractRelatedSitesFromInfobox(subject.infobox)
    ])

    const externalIds = dedupeExternalIds([
      { source: this.id, id: String(subject.id) },
      ...extractExternalIdsFromSites(relatedSites)
    ])

    return {
      name,
      originalName,
      releaseDate: parsePartialDate(subject.date),
      description: normalizeScrapedDescription(subject.summary),
      relatedSites,
      externalIds
    }
  }

  // ===========================================================================
  // Tags
  // ===========================================================================

  public async getTags(id: string, _locale?: Locale): Promise<Tag[]> {
    const subjectId = parseBangumiId(id)
    const subject = await this.client.getSubjectById(subjectId)

    if (subject.type !== BANGUMI_SUBJECT_TYPE_GAME) {
      return []
    }

    const tags: Tag[] = []

    if (subject.platform?.trim()) {
      tags.push({ name: subject.platform.trim(), note: 'Platform' })
    }

    for (const metaTag of subject.meta_tags ?? []) {
      const value = metaTag?.trim()
      if (!value) continue
      tags.push({ name: value })
    }

    for (const tag of subject.tags ?? []) {
      const value = tag.name?.trim()
      if (!value) continue
      tags.push({ name: value })
    }

    return dedupeTags(tags)
  }

  // ===========================================================================
  // Characters
  // ===========================================================================

  public async getCharacters(id: string, locale?: Locale): Promise<GameCharacter[]> {
    const subjectId = parseBangumiId(id)
    const relatedCharacters = await this.client.getSubjectCharacters(subjectId)
    if (!relatedCharacters.length) return []

    const detailIds = relatedCharacters.map((item) => item.id)
    const [detailMap, characterPersonMap] = await Promise.all([
      this.fetchCharacterDetails(detailIds),
      this.fetchCharacterPersons(detailIds)
    ])

    return relatedCharacters.map((character) =>
      this.mapCharacter(
        subjectId,
        character,
        detailMap.get(character.id),
        characterPersonMap.get(character.id),
        locale
      )
    )
  }

  private async fetchCharacterDetails(ids: number[]): Promise<Map<number, BangumiCharacterDetail>> {
    const results = await this.runWithConcurrency(ids, async (characterId) => {
      try {
        const detail = await this.client.getCharacterById(characterId)
        if (extractImageUrls(detail.images).length === 0) {
          const fallbackImage = await this.client.getCharacterImageUrl(characterId, 'large')
          if (fallbackImage) {
            detail.images = { ...(detail.images ?? {}), large: fallbackImage }
          }
        }
        return [characterId, detail] as const
      } catch {
        return null
      }
    })

    return new Map(
      results.filter(
        (result): result is readonly [number, BangumiCharacterDetail] => result !== null
      )
    )
  }

  private async fetchCharacterPersons(
    ids: number[]
  ): Promise<Map<number, BangumiCharacterPerson[]>> {
    const results = await this.runWithConcurrency(ids, async (characterId) => {
      try {
        return [characterId, await this.client.getCharacterPersons(characterId)] as const
      } catch {
        return null
      }
    })

    return new Map(
      results.filter(
        (result): result is readonly [number, BangumiCharacterPerson[]] => result !== null
      )
    )
  }

  private mapCharacter(
    subjectId: number,
    relatedCharacter: BangumiRelatedCharacter,
    detail: BangumiCharacterDetail | undefined,
    characterPersons: BangumiCharacterPerson[] | undefined,
    locale?: Locale
  ): GameCharacter {
    const { name, originalName } = resolveLocalizedEntityName(
      detail?.name || relatedCharacter.name,
      detail?.infobox,
      locale
    )

    const characterTypeTag = this.mapCharacterTypeTag(detail?.type ?? relatedCharacter.type)
    const tags: Tag[] = []
    if (characterTypeTag) {
      tags.push({ name: characterTypeTag, note: 'Character Type' })
    }

    const measurements = extractCharacterMeasurementsFromInfobox(detail?.infobox)
    const persons = this.buildCharacterPersons(subjectId, relatedCharacter, characterPersons)
    const photos = dedupeUrls(extractImageUrls(detail?.images || relatedCharacter.images))

    return {
      name,
      originalName,
      description: normalizeScrapedDescription(detail?.summary || relatedCharacter.summary),
      relatedSites: [{ label: 'Bangumi', url: buildBangumiCharacterUrl(relatedCharacter.id) }],
      externalIds: [{ source: this.id, id: String(relatedCharacter.id) }],
      photos: photos.length > 0 ? photos : undefined,
      gender: mapBangumiGender(detail?.gender),
      birthDate: toPartialDateFromParts(detail?.birth_year, detail?.birth_mon, detail?.birth_day),
      bloodType: mapBangumiBloodType(detail?.blood_type),
      height: measurements.height,
      weight: measurements.weight,
      bust: measurements.bust,
      waist: measurements.waist,
      hips: measurements.hips,
      tags: tags.length > 0 ? dedupeTags(tags) : undefined,
      type: mapBangumiCharacterRelation(relatedCharacter.relation),
      persons: persons.length > 0 ? persons : undefined
    }
  }

  private buildCharacterPersons(
    subjectId: number,
    relatedCharacter: BangumiRelatedCharacter,
    characterPersons: BangumiCharacterPerson[] | undefined
  ): CharacterPerson[] {
    const persons: CharacterPerson[] = []

    for (const actor of relatedCharacter.actors ?? []) {
      persons.push({
        name: actor.name,
        originalName: actor.name,
        description: normalizeScrapedDescription(actor.short_summary),
        relatedSites: [{ label: 'Bangumi', url: buildBangumiPersonUrl(actor.id) }],
        externalIds: [{ source: this.id, id: String(actor.id) }],
        photos: dedupeUrls(extractImageUrls(actor.images)),
        tags: mapBangumiCareersToTags(actor.career),
        type: 'actor'
      })
    }

    for (const personRef of characterPersons ?? []) {
      if (
        personRef.subject_id !== subjectId ||
        personRef.subject_type !== BANGUMI_SUBJECT_TYPE_GAME
      ) {
        continue
      }

      persons.push({
        name: personRef.name,
        originalName: personRef.name,
        relatedSites: [{ label: 'Bangumi', url: buildBangumiPersonUrl(personRef.id) }],
        externalIds: [{ source: this.id, id: String(personRef.id) }],
        photos: dedupeUrls(extractImageUrls(personRef.images)),
        type: 'actor',
        note: personRef.staff?.trim() || undefined
      })
    }

    return persons
  }

  private mapCharacterTypeTag(characterType: number): string | undefined {
    switch (characterType) {
      case 2:
        return 'Mechanic'
      case 3:
        return 'Ship'
      case 4:
        return 'Organization'
      default:
        return undefined
    }
  }

  // ===========================================================================
  // Persons
  // ===========================================================================

  public async getPersons(id: string, locale?: Locale): Promise<GamePerson[]> {
    const subjectId = parseBangumiId(id)
    const relatedPersons = (await this.client.getSubjectPersons(subjectId)).filter(
      (person) => person.type === 1
    )
    if (!relatedPersons.length) return []

    const uniqueIds = [...new Set(relatedPersons.map((person) => person.id))]
    const detailMap = await this.fetchPersonDetails(uniqueIds)

    const persons: GamePerson[] = []

    for (const relatedPerson of relatedPersons) {
      const detail = detailMap.get(relatedPerson.id)
      persons.push(this.mapGamePerson(relatedPerson, detail, locale))
    }

    return persons
  }

  private async fetchPersonDetails(ids: number[]): Promise<Map<number, BangumiPersonDetail>> {
    const results = await this.runWithConcurrency(ids, async (personId) => {
      try {
        const detail = await this.client.getPersonById(personId)
        if (extractImageUrls(detail.images).length === 0) {
          const fallbackImage = await this.client.getPersonImageUrl(personId, 'large')
          if (fallbackImage) {
            detail.images = { ...(detail.images ?? {}), large: fallbackImage }
          }
        }
        return [personId, detail] as const
      } catch {
        return null
      }
    })

    return new Map(
      results.filter((result): result is readonly [number, BangumiPersonDetail] => result !== null)
    )
  }

  private mapGamePerson(
    relatedPerson: BangumiRelatedPerson,
    detail: BangumiPersonDetail | undefined,
    locale?: Locale
  ): GamePerson {
    const { name, originalName } = resolveLocalizedEntityName(
      detail?.name || relatedPerson.name,
      detail?.infobox,
      locale
    )

    const relatedSites = dedupeRelatedSites([
      { label: 'Bangumi', url: buildBangumiPersonUrl(relatedPerson.id) },
      ...extractRelatedSitesFromInfobox(detail?.infobox)
    ])

    const externalIds = dedupeExternalIds([
      { source: this.id, id: String(relatedPerson.id) },
      ...extractExternalIdsFromSites(relatedSites)
    ])

    const photos = dedupeUrls(extractImageUrls(detail?.images || relatedPerson.images))
    const careers = detail?.career ?? relatedPerson.career

    const tags = mapBangumiCareersToTags(careers)
    const type = mapBangumiPersonRole(relatedPerson.relation, careers)

    return {
      name,
      originalName,
      description: normalizeScrapedDescription(detail?.summary),
      relatedSites,
      externalIds,
      photos: photos.length > 0 ? photos : undefined,
      tags: tags.length > 0 ? tags : undefined,
      gender: mapBangumiGender(detail?.gender),
      birthDate: toPartialDateFromParts(detail?.birth_year, detail?.birth_mon, detail?.birth_day),
      type,
      note: composeBangumiRoleNote(relatedPerson.relation, relatedPerson.eps)
    }
  }

  // ===========================================================================
  // Companies
  // ===========================================================================

  public async getCompanies(id: string, locale?: Locale): Promise<GameCompany[]> {
    const subjectId = parseBangumiId(id)
    const relatedCompanies = (await this.client.getSubjectPersons(subjectId)).filter(
      (person) => person.type === 2 || person.type === 3
    )
    if (!relatedCompanies.length) return []

    const uniqueIds = [...new Set(relatedCompanies.map((person) => person.id))]
    const detailMap = await this.fetchPersonDetails(uniqueIds)

    const companies: GameCompany[] = []

    for (const relatedCompany of relatedCompanies) {
      const detail = detailMap.get(relatedCompany.id)
      companies.push(this.mapGameCompany(relatedCompany, detail, locale))
    }

    return companies
  }

  private mapGameCompany(
    relatedCompany: BangumiRelatedPerson,
    detail: BangumiPersonDetail | undefined,
    locale?: Locale
  ): GameCompany {
    const { name, originalName } = resolveLocalizedEntityName(
      detail?.name || relatedCompany.name,
      detail?.infobox,
      locale
    )

    const relatedSites = dedupeRelatedSites([
      { label: 'Bangumi', url: buildBangumiPersonUrl(relatedCompany.id) },
      ...extractRelatedSitesFromInfobox(detail?.infobox)
    ])

    const externalIds = dedupeExternalIds([
      { source: this.id, id: String(relatedCompany.id) },
      ...extractExternalIdsFromSites(relatedSites)
    ])

    const logos = dedupeUrls(extractImageUrls(detail?.images || relatedCompany.images))
    const tags = mapBangumiCareersToTags(detail?.career ?? relatedCompany.career)

    return {
      name,
      originalName,
      description: normalizeScrapedDescription(detail?.summary),
      relatedSites,
      externalIds,
      logos: logos.length > 0 ? logos : undefined,
      tags: tags.length > 0 ? tags : undefined,
      type: mapBangumiCompanyRole(relatedCompany.relation),
      note: composeBangumiRoleNote(relatedCompany.relation, relatedCompany.eps)
    }
  }

  // ===========================================================================
  // Images
  // ===========================================================================

  public async getCovers(id: string, _locale?: Locale): Promise<string[]> {
    const subjectId = parseBangumiId(id)
    const [subject, large, common] = await Promise.all([
      this.client.getSubjectById(subjectId),
      this.client.getSubjectImageUrl(subjectId, 'large').catch(() => undefined),
      this.client.getSubjectImageUrl(subjectId, 'common').catch(() => undefined)
    ])

    return dedupeUrls([...extractImageUrls(subject.images), large, common]).slice(0, 10)
  }

  public async getBackdrops(id: string, _locale?: Locale): Promise<string[]> {
    const subjectId = parseBangumiId(id)
    const [subject, relations] = await Promise.all([
      this.client.getSubjectById(subjectId),
      this.client.getSubjectRelations(subjectId).catch(() => [])
    ])

    const relatedImages = dedupeUrls(
      relations.flatMap((relation) => extractImageUrls(relation.images))
    )
    if (relatedImages.length > 0) {
      return relatedImages.slice(0, 20)
    }

    // Fallback to the subject image set when there is no relation image.
    return dedupeUrls(extractImageUrls(subject.images)).slice(0, 10)
  }

  public async getIcons(id: string, _locale?: Locale): Promise<string[]> {
    const subjectId = parseBangumiId(id)
    const [subject, small, grid] = await Promise.all([
      this.client.getSubjectById(subjectId),
      this.client.getSubjectImageUrl(subjectId, 'small').catch(() => undefined),
      this.client.getSubjectImageUrl(subjectId, 'grid').catch(() => undefined)
    ])

    return dedupeUrls([subject.images?.small, subject.images?.grid, small, grid]).slice(0, 10)
  }

  // ===========================================================================
  // Helpers
  // ===========================================================================

  private async runWithConcurrency<T, R>(
    items: T[],
    worker: (item: T) => Promise<R>
  ): Promise<R[]> {
    if (items.length === 0) return []
    return Promise.all(items.map((item) => worker(item)))
  }
}
