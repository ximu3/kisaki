/**
 * Person Scraper Handler
 *
 * Profile-based person metadata scraping with multi-provider orchestration.
 */

import { eq } from 'drizzle-orm'
import log from 'electron-log/main'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from '@shared/db'
import {
  scraperProfiles,
  type ScraperProfile,
  PERSON_SCRAPER_SLOTS,
  type PersonScraperSlot
} from '@shared/db'
import { createEmptySlotConfig, normalizeSlotConfigs } from '@shared/scraper'
import type {
  PersonSearchResult,
  ScraperLookup,
  ScraperCapability,
  PersonScraperProviderInfo,
  PersonScraperOptions,
  ProfileCleanupAction
} from '@shared/scraper'
import type { ExternalId, PersonMetadata } from '@shared/metadata'
import type { Locale } from '@shared/locale'
import type { I18nService } from '@main/services/i18n'
import type { PersonScraperProvider } from './provider'
import { mergePersonScraperMetadata } from './merge'
import type { PersonScraperImageSlot, PersonScraperResult } from './types'

interface ResolveResult {
  id: string
  originalName?: string
}

export class PersonScraperHandler {
  private providers = new Map<string, PersonScraperProvider>()

  constructor(
    private db: BetterSQLite3Database<typeof schema>,
    private i18n: I18nService
  ) {}

  // ---------------------------------------------------------------------------
  // Provider Registry
  // ---------------------------------------------------------------------------

  registerProvider(provider: PersonScraperProvider): void {
    this.providers.set(provider.id, provider)
    log.info(`[Scraper] Registered person provider: ${provider.id}`)
  }

  async unregisterProvider(providerId: string): Promise<Map<string, ProfileCleanupAction>> {
    this.providers.delete(providerId)
    log.info(`[Scraper] Unregistered person provider: ${providerId}`)

    const allProfiles = this.db
      .select()
      .from(scraperProfiles)
      .where(eq(scraperProfiles.mediaType, 'person'))
      .all()

    const results = new Map<string, ProfileCleanupAction>()
    for (const profile of allProfiles) {
      const action = await this.ensureProfileValid(profile.id)
      if (action !== 'unchanged') {
        results.set(profile.id, action)
      }
    }

    return results
  }

  // ---------------------------------------------------------------------------
  // Provider Info
  // ---------------------------------------------------------------------------

  getProviders(): PersonScraperProviderInfo[] {
    return Array.from(this.providers.values()).map((p) => ({
      id: p.id,
      name: p.name,
      capabilities: this.buildCapabilities(p)
    }))
  }

  getProviderInfo(providerId: string): PersonScraperProviderInfo {
    const provider = this.getProvider(providerId)
    return {
      id: provider.id,
      name: provider.name,
      capabilities: this.buildCapabilities(provider)
    }
  }

  // ---------------------------------------------------------------------------
  // Public API: Profile Management
  // ---------------------------------------------------------------------------

  async ensureProfileValid(profileId: string): Promise<ProfileCleanupAction> {
    const profile = this.loadProfile(profileId)

    if (!this.providers.has(profile.searchProviderId)) {
      this.db.delete(scraperProfiles).where(eq(scraperProfiles.id, profileId)).run()
      log.info(`[Scraper] Deleted person profile '${profile.name}' (invalid searchProviderId)`)
      return 'deleted'
    }

    const cleanedConfigs = normalizeSlotConfigs('person', profile.slotConfigs)
    let hasChanges =
      Object.keys(profile.slotConfigs).some(
        (k) => !PERSON_SCRAPER_SLOTS.includes(k as PersonScraperSlot)
      ) || PERSON_SCRAPER_SLOTS.some((slot) => !(slot in profile.slotConfigs))

    for (const slot of PERSON_SCRAPER_SLOTS) {
      const config = cleanedConfigs[slot] ?? createEmptySlotConfig()
      const validProviders = config.providers.filter((p) => this.providers.has(p.providerId))

      if (validProviders.length !== config.providers.length) {
        cleanedConfigs[slot] = { ...config, providers: validProviders }
        hasChanges = true
      }
    }

    if (hasChanges) {
      this.db
        .update(scraperProfiles)
        .set({ slotConfigs: cleanedConfigs })
        .where(eq(scraperProfiles.id, profileId))
        .run()
      log.info(`[Scraper] Updated person profile '${profile.name}' (cleaned invalid providers)`)
      return 'updated'
    }

    return 'unchanged'
  }

  async search(profileId: string, query: string): Promise<PersonSearchResult[]> {
    const profile = this.loadProfile(profileId)
    const provider = this.providers.get(profile.searchProviderId)
    if (!provider?.search) {
      throw new Error(`Search provider '${profile.searchProviderId}' not available`)
    }
    return provider.search(query, this.getLocale(profile))
  }

  // ---------------------------------------------------------------------------
  // Public API: Metadata Scraping
  // ---------------------------------------------------------------------------

  async getMetadata(
    profileId: string,
    lookup: ScraperLookup,
    options: PersonScraperOptions = {}
  ): Promise<PersonMetadata | null> {
    let profile = this.loadProfile(profileId)

    const action = options.skipValidation ? 'unchanged' : await this.ensureProfileValid(profileId)
    if (action === 'deleted') {
      throw new Error(`Profile '${profileId}' was invalid and has been deleted`)
    }
    if (action === 'updated') {
      profile = this.loadProfile(profileId)
    }

    const locale = lookup.locale ?? this.getLocale(profile)
    const slotConfigs = normalizeSlotConfigs('person', profile.slotConfigs)
    const normalizedProfile: ScraperProfile = { ...profile, slotConfigs }

    const uniqueProviderIds = new Set<string>()
    for (const slot of PERSON_SCRAPER_SLOTS) {
      const config = slotConfigs[slot]
      for (const entry of config.providers.filter((p) => p.enabled)) {
        uniqueProviderIds.add(entry.providerId)
      }
    }

    const searchProviderId = profile.searchProviderId
    const resolvedIds = new Map<string, string>()

    const searchResult = await this.resolveId(
      searchProviderId,
      lookup.name,
      lookup.knownIds,
      locale
    )

    let searchName = lookup.name
    if (searchResult) {
      resolvedIds.set(searchProviderId, searchResult.id)
      if (searchResult.originalName) {
        searchName = searchResult.originalName
        log.info(`[Scraper] Using originalName '${searchName}' for cross-provider search (person)`)
      }
    }

    const otherProviderIds = [...uniqueProviderIds].filter((id) => id !== searchProviderId)
    const resolveResults = await Promise.all(
      otherProviderIds.map(async (providerId) => {
        const result = await this.resolveId(providerId, searchName, lookup.knownIds, locale)
        return result ? { providerId, id: result.id } : null
      })
    )
    for (const r of resolveResults) {
      if (r) resolvedIds.set(r.providerId, r.id)
    }

    const results = await this.fetchAllSlots(normalizedProfile, resolvedIds, locale)
    return mergePersonScraperMetadata(results, normalizedProfile)
  }

  async getProviderImages(
    providerId: string,
    lookup: ScraperLookup,
    imageType: PersonScraperImageSlot
  ): Promise<string[]> {
    const provider = this.providers.get(providerId)
    if (!provider) {
      log.warn(`[Scraper] Person provider '${providerId}' not available`)
      return []
    }

    const locale = lookup.locale ?? (this.i18n.getLocale() as Locale)
    const result = await this.resolveId(providerId, lookup.name, lookup.knownIds, locale)

    if (!result) {
      log.warn(`[Scraper] Could not resolve ID for '${lookup.name}' via ${providerId}`)
      return []
    }

    try {
      if (imageType !== 'photos') return []
      return (await provider.getPhotos?.(result.id, locale)) ?? []
    } catch (error) {
      log.warn(`[Scraper] ${providerId}.${imageType} failed:`, error)
      return []
    }
  }

  // ---------------------------------------------------------------------------
  // Internal: Data Loading
  // ---------------------------------------------------------------------------

  private loadProfile(profileId: string): ScraperProfile {
    const rows = this.db
      .select()
      .from(scraperProfiles)
      .where(eq(scraperProfiles.id, profileId))
      .limit(1)
      .all()

    const profile = rows[0]
    if (!profile) throw new Error(`Profile not found: ${profileId}`)
    if (profile.mediaType !== 'person') {
      throw new Error(`Profile '${profileId}' is not a person scraper profile`)
    }
    return profile
  }

  private getProvider(providerId: string): PersonScraperProvider {
    const provider = this.providers.get(providerId)
    if (!provider) throw new Error(`Provider not found: ${providerId}`)
    return provider
  }

  private getLocale(profile: ScraperProfile): Locale {
    return (profile.defaultLocale ?? this.i18n.getLocale()) as Locale
  }

  // ---------------------------------------------------------------------------
  // Internal: ID Resolution
  // ---------------------------------------------------------------------------

  private async resolveId(
    providerId: string,
    name: string,
    knownIds: ExternalId[] | undefined,
    locale: Locale
  ): Promise<ResolveResult | null> {
    const known = knownIds?.find((ext) => ext.source === providerId)
    if (known) {
      return { id: known.id }
    }

    const provider = this.providers.get(providerId)
    if (!provider?.search) {
      log.warn(`[Scraper] Provider '${providerId}' does not support search`)
      return null
    }

    try {
      const results = await provider.search(name, locale)
      const first = results?.[0]

      if (first) {
        log.info(`[Scraper] Resolved '${name}' to ${first.id} via ${providerId}`)
        return { id: first.id, originalName: first.originalName }
      }

      log.warn(`[Scraper] No results for '${name}' via ${providerId}`)
      return null
    } catch (error) {
      log.warn(`[Scraper] Search failed for '${name}' via ${providerId}:`, error)
      return null
    }
  }

  // ---------------------------------------------------------------------------
  // Internal: Slot Fetching
  // ---------------------------------------------------------------------------

  private async fetchAllSlots(
    profile: ScraperProfile,
    resolvedIds: Map<string, string>,
    locale: Locale
  ): Promise<PersonScraperResult[]> {
    const tasks: Promise<PersonScraperResult | null>[] = []

    for (const slot of PERSON_SCRAPER_SLOTS) {
      const config = profile.slotConfigs[slot]
      for (const entry of config.providers.filter((p) => p.enabled)) {
        const id = resolvedIds.get(entry.providerId)
        if (id) {
          tasks.push(this.fetchSlot(entry.providerId, id, locale, slot, entry.priority))
        }
      }
    }

    const results = await Promise.all(tasks)
    return results.filter((r): r is PersonScraperResult => r !== null)
  }

  private async fetchSlot(
    providerId: string,
    id: string,
    locale: Locale,
    slot: PersonScraperSlot,
    priority: number
  ): Promise<PersonScraperResult | null> {
    const provider = this.providers.get(providerId)
    if (!provider) {
      log.warn(`[Scraper] Provider '${providerId}' not available`)
      return null
    }

    try {
      switch (slot) {
        case 'info': {
          const data = await provider.getInfo?.(id, locale)
          return data ? { slot, priority, data } : null
        }
        case 'tags': {
          const data = await provider.getTags?.(id, locale)
          return data ? { slot, priority, data } : null
        }
        case 'photos': {
          const data = await provider.getPhotos?.(id, locale)
          return data ? { slot, priority, data } : null
        }
        default:
          return null
      }
    } catch (error) {
      log.warn(`[Scraper] ${providerId}.${slot} failed:`, error)
      return null
    }
  }

  // ---------------------------------------------------------------------------
  // Internal: Utilities
  // ---------------------------------------------------------------------------

  private buildCapabilities(provider: PersonScraperProvider): ScraperCapability[] {
    const caps: ScraperCapability[] = []
    if (provider.search) caps.push('search')
    if (provider.getInfo) caps.push('info')
    if (provider.getTags) caps.push('tags')
    if (provider.getPhotos) caps.push('photos')
    return caps
  }
}
