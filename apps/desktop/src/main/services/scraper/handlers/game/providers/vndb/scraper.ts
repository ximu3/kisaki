/**
 * VNDB Provider
 *
 * Implements GameScraperProvider for VNDB Kana API.
 *
 * References:
 * - https://api.vndb.org/kana
 * - https://api.vndb.org/kana/schema
 * - https://vndb.org/d9#4
 */

import type { NetworkService } from '@main/services/network'
import type { GameScraperProvider } from '../../provider'
import type { Locale } from '@shared/locale'
import type { GameSearchResult } from '@shared/scraper'
import type {
  CharacterPerson,
  GameCharacter,
  GameCompany,
  GameInfo,
  GamePerson,
  Tag
} from '@shared/metadata'
import type { GameCompanyType } from '@shared/db'
import { normalizeScrapedDescription, parsePartialDate } from '../../../../utils'
import { VndbClient } from './client'
import {
  buildEnumLabelMap,
  buildVndbCharacterUrl,
  buildVndbProducerUrl,
  buildVndbStaffUrl,
  buildVndbVnUrl,
  dedupeExternalIds,
  dedupeRelatedSites,
  dedupeTags,
  dedupeUrls,
  extractExternalIdsFromExtlinks,
  extractRelatedSitesFromExtlinks,
  mapVndbBloodType,
  mapVndbCharacterRole,
  mapVndbCup,
  mapVndbDevStatus,
  mapVndbLength,
  mapVndbProducerType,
  mapVndbStaffRole,
  mapVndbTagCategory,
  mapVndbGender,
  mergeNotes,
  normalizeVndbId,
  resolveLocalizedVnName,
  resolveVndbEntityName,
  sanitizeVndbText,
  toFiniteNumber,
  toPartialDateFromMonthDay
} from './format'
import type {
  VndbCharacter,
  VndbProducer,
  VndbStaff,
  VndbTag,
  VndbTrait,
  VndbVnVaEntry
} from './types'

export class VNDBProvider implements GameScraperProvider {
  public readonly id = 'vndb'
  public readonly name = 'VNDB'
  public readonly capabilities = [
    'search',
    'info',
    'tags',
    'characters',
    'persons',
    'companies',
    'covers',
    'backdrops'
  ] as const

  // Official docs: 200 requests per 5 minutes.
  public readonly rateLimit = {
    requestsPerWindow: 200,
    windowMs: 300_000
  }

  private readonly client: VndbClient

  constructor(networkService: NetworkService) {
    const apiToken = import.meta.env.VITE_VNDB_API_TOKEN?.trim()
    this.client = new VndbClient(networkService, apiToken || undefined)
  }

  // ===========================================================================
  // Search
  // ===========================================================================

  public async search(query: string, locale?: Locale): Promise<GameSearchResult[]> {
    const keyword = query.trim()
    if (!keyword) return []

    const rows = await this.client.searchVn(
      keyword,
      'id,title,alttitle,released,titles{lang,title,main,official,latin}',
      25
    )
    return rows.map((vn) => {
      const { name, originalName } = resolveLocalizedVnName(vn, locale)
      return {
        id: vn.id,
        name,
        originalName,
        releaseDate: parsePartialDate(vn.released),
        externalIds: [{ source: this.id, id: vn.id }]
      }
    })
  }

  // ===========================================================================
  // Core Info
  // ===========================================================================

  public async getInfo(id: string, locale?: Locale): Promise<GameInfo> {
    const vnId = normalizeVndbId(id, 'v')
    const vn = await this.client.getVnById(
      vnId,
      'id,title,alttitle,titles{lang,title,main,official,latin},released,description,extlinks{id,name,label,url}'
    )
    if (!vn) {
      throw new Error(`VNDB visual novel not found: ${vnId}`)
    }

    const { name, originalName } = resolveLocalizedVnName(vn, locale)
    const relatedSites = dedupeRelatedSites([
      { label: 'VNDB', url: buildVndbVnUrl(vn.id) },
      ...extractRelatedSitesFromExtlinks(vn.extlinks)
    ])
    const externalIds = dedupeExternalIds([
      { source: this.id, id: vn.id },
      ...extractExternalIdsFromExtlinks(vn.extlinks)
    ])

    return {
      name,
      originalName,
      releaseDate: parsePartialDate(vn.released),
      description: normalizeScrapedDescription(sanitizeVndbText(vn.description)),
      relatedSites,
      externalIds
    }
  }

  // ===========================================================================
  // Tags
  // ===========================================================================

  public async getTags(id: string, _locale?: Locale): Promise<Tag[]> {
    const vnId = normalizeVndbId(id, 'v')
    const vn = await this.client.getVnById(
      vnId,
      'id,devstatus,length,length_minutes,languages,platforms,olang,tags{id,rating,spoiler,lie}'
    )
    if (!vn) return []

    const schema = await this.client.getSchema()
    const languageMap = buildEnumLabelMap(schema.enums?.language)
    const platformMap = buildEnumLabelMap(schema.enums?.platform)

    const tags: Tag[] = []

    const relationTags = vn.tags ?? []
    const relationTagIds = relationTags.map((tag) => tag.id).filter(Boolean)
    const tagDetails = await this.client.getTagsByIds(relationTagIds, 'id,name,category')
    const tagMap = new Map<string, VndbTag>(tagDetails.map((tag) => [tag.id, tag]))

    for (const relation of relationTags) {
      const detail = tagMap.get(relation.id)
      const name = detail?.name?.trim() || relation.id
      if (!name) continue

      tags.push({
        name,
        note: mapVndbTagCategory(detail?.category),
        isSpoiler: typeof relation.spoiler === 'number' ? relation.spoiler > 0 : undefined,
        isNsfw: detail?.category === 'ero' || undefined
      })
    }

    const length = mapVndbLength(vn.length)
    if (length) {
      tags.push({ name: length, note: 'Length' })
    }

    if (Number.isFinite(vn.length_minutes as number) && (vn.length_minutes as number) > 0) {
      tags.push({
        name: `~${Math.floor(vn.length_minutes as number)} minutes`,
        note: 'Length Estimate'
      })
    }

    for (const platform of vn.platforms ?? []) {
      tags.push({
        name: platformMap.get(platform) || platform,
        note: 'Platform'
      })
    }

    for (const language of vn.languages ?? []) {
      tags.push({
        name: languageMap.get(language) || language,
        note: 'Language'
      })
    }

    if (vn.olang) {
      tags.push({
        name: languageMap.get(vn.olang) || vn.olang,
        note: 'Original Language'
      })
    }

    const devStatus = mapVndbDevStatus(vn.devstatus)
    if (devStatus) {
      tags.push({
        name: devStatus,
        note: 'Development Status'
      })
    }

    return dedupeTags(tags)
  }

  // ===========================================================================
  // Characters
  // ===========================================================================

  public async getCharacters(id: string, locale?: Locale): Promise<GameCharacter[]> {
    const vnId = normalizeVndbId(id, 'v')
    const [characters, vn] = await Promise.all([
      this.client.getCharactersByVn(
        vnId,
        'id,name,original,description,sex,gender,birthday,blood_type,height,weight,bust,waist,hips,cup,image{id,url},traits{id,spoiler,lie,sexual},vns{id,role,spoiler}'
      ),
      this.client.getVnById(vnId, 'id,va{note,staff{id},character{id}}')
    ])

    if (!characters.length) return []

    const vaEntries = vn?.va ?? []
    const traitIds = [
      ...new Set(characters.flatMap((character) => (character.traits ?? []).map((t) => t.id)))
    ]
    const actorStaffIds = [
      ...new Set(vaEntries.map((entry) => entry.staff?.id).filter(Boolean) as string[])
    ]

    const [traits, staffRows] = await Promise.all([
      this.client.getTraitsByIds(traitIds, 'id,name,group_name,sexual'),
      this.client.getStaffByIds(
        actorStaffIds,
        'id,name,original,description,gender,lang,aliases{name,latin,ismain},extlinks{id,name,label,url}'
      )
    ])

    const traitMap = new Map<string, VndbTrait>(traits.map((trait) => [trait.id, trait]))
    const staffMap = new Map<string, VndbStaff>(staffRows.map((staff) => [staff.id, staff]))
    const actorMap = this.buildCharacterActorMap(vaEntries, staffMap, locale)

    return characters.map((character) =>
      this.mapCharacter(vnId, character, traitMap, actorMap.get(character.id) ?? [], locale)
    )
  }

  // ===========================================================================
  // Persons
  // ===========================================================================

  public async getPersons(id: string, locale?: Locale): Promise<GamePerson[]> {
    const vnId = normalizeVndbId(id, 'v')
    const vn = await this.client.getVnById(vnId, 'id,staff{id,role,note},va{note,staff{id}}')
    if (!vn) return []

    const staffLinks = vn.staff ?? []
    const vaLinks = vn.va ?? []
    const staffIds = [
      ...new Set([
        ...staffLinks.map((entry) => entry.id),
        ...(vaLinks.map((entry) => entry.staff?.id).filter(Boolean) as string[])
      ])
    ]

    if (staffIds.length === 0) return []

    const [schema, staffRows] = await Promise.all([
      this.client.getSchema(),
      this.client.getStaffByIds(
        staffIds,
        'id,name,original,description,gender,lang,aliases{name,latin,ismain},extlinks{id,name,label,url}'
      )
    ])

    const staffMap = new Map<string, VndbStaff>(staffRows.map((staff) => [staff.id, staff]))
    const roleMap = buildEnumLabelMap(schema.enums?.staff_role)
    const persons: GamePerson[] = []

    for (const link of staffLinks) {
      const staffId = link.id
      const type = mapVndbStaffRole(link.role)
      const roleLabel = link.role ? roleMap.get(link.role) || link.role : undefined
      const roleNote = sanitizeVndbText(link.note)
      const note = mergeNotes(roleLabel, roleNote)

      const incoming: GamePerson = {
        ...this.buildStaffPersonBase(staffId, staffMap.get(staffId), locale),
        type,
        note
      }
      persons.push(incoming)
    }

    for (const link of vaLinks) {
      const staffId = link.staff?.id
      if (!staffId) continue

      const incoming: GamePerson = {
        ...this.buildStaffPersonBase(staffId, staffMap.get(staffId), locale),
        type: 'actor',
        note: sanitizeVndbText(link.note)
      }
      persons.push(incoming)
    }

    return persons
  }

  // ===========================================================================
  // Companies
  // ===========================================================================

  public async getCompanies(id: string, locale?: Locale): Promise<GameCompany[]> {
    const vnId = normalizeVndbId(id, 'v')
    const [vn, releases, schema] = await Promise.all([
      this.client.getVnById(vnId, 'id,developers{id}'),
      this.client.getReleasesByVn(vnId, 'id,producers{id,developer,publisher}'),
      this.client.getSchema()
    ])

    if (!vn) return []

    const languageMap = buildEnumLabelMap(schema.enums?.language)
    const relationMap = new Map<string, Set<GameCompanyType>>()

    for (const developer of vn.developers ?? []) {
      this.addCompanyRelation(relationMap, developer.id, 'developer')
    }

    for (const release of releases) {
      for (const producer of release.producers ?? []) {
        let hasKnownRole = false
        if (producer.developer) {
          hasKnownRole = true
          this.addCompanyRelation(relationMap, producer.id, 'developer')
        }
        if (producer.publisher) {
          hasKnownRole = true
          this.addCompanyRelation(relationMap, producer.id, 'publisher')
        }
        if (!hasKnownRole) {
          this.addCompanyRelation(relationMap, producer.id, 'other')
        }
      }
    }

    const producerIds = Array.from(relationMap.keys())
    if (producerIds.length === 0) return []

    const producers = await this.client.getProducersByIds(
      producerIds,
      'id,name,original,description,type,lang,extlinks{id,name,label,url}'
    )
    const producerMap = new Map<string, VndbProducer>(
      producers.map((producer) => [producer.id, producer])
    )

    const companies: GameCompany[] = []

    for (const producerId of producerIds) {
      const producer = producerMap.get(producerId)
      const base = this.buildCompanyBase(producerId, producer, languageMap, locale)

      for (const type of relationMap.get(producerId) ?? []) {
        companies.push({
          ...base,
          type
        })
      }
    }

    return companies
  }

  // ===========================================================================
  // Images
  // ===========================================================================

  public async getCovers(id: string, _locale?: Locale): Promise<string[]> {
    const vnId = normalizeVndbId(id, 'v')
    const vn = await this.client.getVnById(vnId, 'id,image{id,url,thumbnail}')
    if (!vn?.image) return []

    return dedupeUrls([vn.image.url, vn.image.thumbnail]).slice(0, 10)
  }

  public async getBackdrops(id: string, _locale?: Locale): Promise<string[]> {
    const vnId = normalizeVndbId(id, 'v')
    const vn = await this.client.getVnById(vnId, 'id,screenshots{id,url,thumbnail}')
    if (!vn?.screenshots?.length) return []

    return dedupeUrls(
      vn.screenshots.flatMap((screenshot) => [screenshot.url, screenshot.thumbnail])
    ).slice(0, 20)
  }

  // ===========================================================================
  // Helpers
  // ===========================================================================

  private mapCharacter(
    vnId: string,
    character: VndbCharacter,
    traitMap: Map<string, VndbTrait>,
    actors: CharacterPerson[],
    locale?: Locale
  ): GameCharacter {
    const { name, originalName } = resolveVndbEntityName(character.name, character.original, locale)
    const role = character.vns?.find((item) => item.id === vnId)?.role

    const tags: Tag[] = []
    for (const relation of character.traits ?? []) {
      const detail = traitMap.get(relation.id)
      const tagName = detail?.name?.trim() || relation.id
      if (!tagName) continue

      tags.push({
        name: tagName,
        note: detail?.group_name?.trim() || undefined,
        isSpoiler: typeof relation.spoiler === 'number' ? relation.spoiler > 0 : undefined,
        isNsfw:
          ((typeof relation.sexual === 'number' ? relation.sexual : detail?.sexual) || 0) > 0 ||
          undefined
      })
    }

    const photos = dedupeUrls([character.image?.url])

    return {
      name,
      originalName,
      description: normalizeScrapedDescription(sanitizeVndbText(character.description)),
      relatedSites: [{ label: 'VNDB', url: buildVndbCharacterUrl(character.id) }],
      externalIds: [{ source: this.id, id: character.id }],
      photos: photos.length > 0 ? photos : undefined,
      gender: mapVndbGender(character.sex ?? character.gender),
      birthDate: toPartialDateFromMonthDay(character.birthday),
      bloodType: mapVndbBloodType(character.blood_type),
      height: toFiniteNumber(character.height),
      weight: toFiniteNumber(character.weight),
      bust: toFiniteNumber(character.bust),
      waist: toFiniteNumber(character.waist),
      hips: toFiniteNumber(character.hips),
      cup: mapVndbCup(character.cup),
      tags: tags.length > 0 ? dedupeTags(tags) : undefined,
      type: mapVndbCharacterRole(role),
      persons: actors.length > 0 ? actors : undefined
    }
  }

  private buildCharacterActorMap(
    entries: VndbVnVaEntry[],
    staffMap: Map<string, VndbStaff>,
    locale?: Locale
  ): Map<string, CharacterPerson[]> {
    const actorMap = new Map<string, CharacterPerson[]>()

    for (const entry of entries) {
      const characterId = entry.character?.id
      const staffId = entry.staff?.id
      if (!characterId || !staffId) continue

      const detail = staffMap.get(staffId)
      const actor = this.buildCharacterPerson(staffId, detail, sanitizeVndbText(entry.note), locale)
      if (!actorMap.has(characterId)) {
        actorMap.set(characterId, [])
      }
      actorMap.get(characterId)!.push(actor)
    }
    return actorMap
  }

  private buildCharacterPerson(
    staffId: string,
    staff: VndbStaff | undefined,
    note?: string,
    locale?: Locale
  ): CharacterPerson {
    const { name, originalName } = resolveVndbEntityName(
      staff?.name || staffId,
      staff?.original,
      locale
    )
    const relatedSites = dedupeRelatedSites([
      { label: 'VNDB', url: buildVndbStaffUrl(staffId) },
      ...extractRelatedSitesFromExtlinks(staff?.extlinks)
    ])
    const externalIds = dedupeExternalIds([
      { source: this.id, id: staffId },
      ...extractExternalIdsFromExtlinks(staff?.extlinks)
    ])

    return {
      name,
      originalName,
      description: normalizeScrapedDescription(sanitizeVndbText(staff?.description)),
      relatedSites,
      externalIds,
      gender: mapVndbGender(staff?.gender),
      type: 'actor',
      note
    }
  }

  private buildStaffPersonBase(
    staffId: string,
    staff: VndbStaff | undefined,
    locale?: Locale
  ): Omit<GamePerson, 'type' | 'note'> {
    const { name, originalName } = resolveVndbEntityName(
      staff?.name || staffId,
      staff?.original,
      locale
    )
    const relatedSites = dedupeRelatedSites([
      { label: 'VNDB', url: buildVndbStaffUrl(staffId) },
      ...extractRelatedSitesFromExtlinks(staff?.extlinks)
    ])
    const externalIds = dedupeExternalIds([
      { source: this.id, id: staffId },
      ...extractExternalIdsFromExtlinks(staff?.extlinks)
    ])

    return {
      name,
      originalName,
      description: normalizeScrapedDescription(sanitizeVndbText(staff?.description)),
      relatedSites,
      externalIds,
      gender: mapVndbGender(staff?.gender)
    }
  }

  private addCompanyRelation(
    relationMap: Map<string, Set<GameCompanyType>>,
    producerId: string,
    relation: GameCompanyType
  ): void {
    if (!producerId) return
    if (!relationMap.has(producerId)) {
      relationMap.set(producerId, new Set<GameCompanyType>())
    }
    relationMap.get(producerId)!.add(relation)
  }

  private buildCompanyBase(
    producerId: string,
    producer: VndbProducer | undefined,
    languageMap: Map<string, string>,
    locale?: Locale
  ): Omit<GameCompany, 'type'> {
    const { name, originalName } = resolveVndbEntityName(
      producer?.name || producerId,
      producer?.original,
      locale
    )
    const relatedSites = dedupeRelatedSites([
      { label: 'VNDB', url: buildVndbProducerUrl(producerId) },
      ...extractRelatedSitesFromExtlinks(producer?.extlinks)
    ])
    const externalIds = dedupeExternalIds([
      { source: this.id, id: producerId },
      ...extractExternalIdsFromExtlinks(producer?.extlinks)
    ])

    const tags: Tag[] = []
    const producerType = mapVndbProducerType(producer?.type)
    if (producerType) {
      tags.push({ name: producerType, note: 'Producer Type' })
    }

    if (producer?.lang) {
      tags.push({
        name: languageMap.get(producer.lang) || producer.lang,
        note: 'Primary Language'
      })
    }

    return {
      name,
      originalName,
      description: normalizeScrapedDescription(sanitizeVndbText(producer?.description)),
      relatedSites,
      externalIds,
      tags: tags.length > 0 ? dedupeTags(tags) : undefined
    }
  }
}
