/**
 * Game Scraper Handler
 *
 * Profile-based game metadata scraping with multi-provider orchestration.
 *
 * Architecture:
 * - Profile configures scraping at SLOT level
 * - Handler resolves IDs per-provider using immutable lookup
 * - Handler extracts originalName from searchProvider for better cross-provider matching
 * - Results use discriminated union for type-safe merging
 *
 * ID Resolution Strategy:
 * 1. Resolve searchProvider first, extract originalName from search result
 * 2. Resolve other providers using originalName (for better matching)
 * 3. Fetch all slots in parallel using resolved IDs
 *
 * Image Picker API:
 * - Uses providerId directly (not profileId)
 * - Simple single-provider resolution
 */

import { eq } from 'drizzle-orm'
import log from 'electron-log/main'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from '@shared/db'
import {
  scraperProfiles,
  type ScraperProfile,
  GAME_SCRAPER_SLOTS,
  type GameScraperSlot
} from '@shared/db'
import { createEmptySlotConfig, normalizeSlotConfigs } from '@shared/scraper'
import type {
  GameSearchResult,
  ScraperLookup,
  GameScraperProviderInfo,
  GameScraperOptions,
  ProfileCleanupAction,
  GameImageSlot
} from '@shared/scraper'
import type { ScraperCapability } from '@shared/scraper'
import type { ExternalId, GameMetadata } from '@shared/metadata'
import type { Locale } from '@shared/locale'
import type { I18nService } from '@main/services/i18n'
import type { GameScraperProvider } from './provider'
import { mergeGameScraperMetadata } from './merge'
import type { GameScraperResult } from './types'

// =============================================================================
// Types
// =============================================================================

/** Result of ID resolution, includes originalName if available from search */
interface ResolveResult {
  id: string
  originalName?: string
}

const GAME_CAPABILITY_METHODS = [
  ['search', 'search'],
  ['info', 'getInfo'],
  ['tags', 'getTags'],
  ['characters', 'getCharacters'],
  ['persons', 'getPersons'],
  ['companies', 'getCompanies'],
  ['covers', 'getCovers'],
  ['backdrops', 'getBackdrops'],
  ['logos', 'getLogos'],
  ['icons', 'getIcons']
] as const satisfies ReadonlyArray<readonly [ScraperCapability, keyof GameScraperProvider]>

const GAME_ALLOWED_CAPABILITIES = new Set<ScraperCapability>(['search', ...GAME_SCRAPER_SLOTS])

// =============================================================================
// Handler
// =============================================================================

export class GameScraperHandler {
  private providers = new Map<string, GameScraperProvider>()

  constructor(
    private db: BetterSQLite3Database<typeof schema>,
    private i18n: I18nService
  ) {}

  // ---------------------------------------------------------------------------
  // Provider Registry
  // ---------------------------------------------------------------------------

  registerProvider(provider: GameScraperProvider): void {
    this.assertProviderCapabilities(provider)
    this.providers.set(provider.id, provider)
    log.info(`[Scraper] Registered provider: ${provider.id}`)
  }

  /**
   * Unregister a provider and clean up all profiles using it.
   *
   * @returns Map of profile ID to action taken
   */
  async unregisterProvider(providerId: string): Promise<Map<string, ProfileCleanupAction>> {
    this.providers.delete(providerId)
    log.info(`[Scraper] Unregistered provider: ${providerId}`)

    // Get all game profiles (sync for better-sqlite3)
    const allProfiles = this.db
      .select()
      .from(scraperProfiles)
      .where(eq(scraperProfiles.mediaType, 'game'))
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

  getProviders(): GameScraperProviderInfo[] {
    return Array.from(this.providers.values()).map((p) => ({
      id: p.id,
      name: p.name,
      capabilities: [...p.capabilities]
    }))
  }

  getProviderInfo(providerId: string): GameScraperProviderInfo {
    const provider = this.getProvider(providerId)
    return {
      id: provider.id,
      name: provider.name,
      capabilities: [...provider.capabilities]
    }
  }

  // ---------------------------------------------------------------------------
  // Public API: Profile Management
  // ---------------------------------------------------------------------------

  /**
   * Ensure a profile is valid by checking and fixing invalid references.
   *
   * - If searchProviderId is invalid -> deletes entire profile
   * - If slotConfigs reference invalid providers -> removes those references
   *
   * @returns Action taken: 'deleted', 'updated', or 'unchanged'
   */
  async ensureProfileValid(profileId: string): Promise<ProfileCleanupAction> {
    const profile = this.loadProfile(profileId)

    // Check searchProviderId - if invalid, delete entire profile
    const searchProvider = this.providers.get(profile.searchProviderId)
    if (!searchProvider || !searchProvider.capabilities.includes('search')) {
      this.db.delete(scraperProfiles).where(eq(scraperProfiles.id, profileId)).run()
      log.info(
        `[Scraper] Deleted profile '${profile.name}' (invalid searchProviderId or missing 'search' capability)`
      )
      return 'deleted'
    }

    const cleanedConfigs = normalizeSlotConfigs('game', profile.slotConfigs)
    let hasChanges =
      Object.keys(profile.slotConfigs).some(
        (k) => !GAME_SCRAPER_SLOTS.includes(k as GameScraperSlot)
      ) || GAME_SCRAPER_SLOTS.some((slot) => !(slot in profile.slotConfigs))

    for (const slot of GAME_SCRAPER_SLOTS) {
      const config = cleanedConfigs[slot] ?? createEmptySlotConfig()
      const validProviders = config.providers.filter((p) => {
        const provider = this.providers.get(p.providerId)
        return !!provider && provider.capabilities.includes(slot)
      })

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
      log.info(`[Scraper] Updated profile '${profile.name}' (cleaned invalid providers)`)
      return 'updated'
    }

    return 'unchanged'
  }

  async search(profileId: string, query: string): Promise<GameSearchResult[]> {
    const profile = this.loadProfile(profileId)
    const provider = this.providers.get(profile.searchProviderId)
    if (!provider || !provider.capabilities.includes('search')) {
      throw new Error(`Search provider '${profile.searchProviderId}' not available`)
    }
    return provider.search!(query, this.getLocale(profile))
  }

  // ---------------------------------------------------------------------------
  // Public API: Metadata Scraping
  // ---------------------------------------------------------------------------

  /**
   * Get complete game metadata using profile configuration.
   *
   * Three-phase immutable resolution:
   * 1. Resolve searchProvider, extract originalName from search result
   * 2. Resolve other providers using originalName for better matching
   * 3. Fetch all slots in parallel using resolved IDs
   */
  async getMetadata(
    profileId: string,
    lookup: ScraperLookup,
    options: GameScraperOptions = {}
  ): Promise<GameMetadata | null> {
    let profile = this.loadProfile(profileId)

    const action = options.skipValidation ? 'unchanged' : await this.ensureProfileValid(profileId)
    if (action === 'deleted') {
      throw new Error(`Profile '${profileId}' was invalid and has been deleted`)
    }
    if (action === 'updated') {
      profile = this.loadProfile(profileId)
    }

    const locale = lookup.locale ?? this.getLocale(profile)
    const slotConfigs = normalizeSlotConfigs('game', profile.slotConfigs)
    const normalizedProfile: ScraperProfile = { ...profile, slotConfigs }

    // Collect all unique provider IDs from slots
    const uniqueProviderIds = new Set<string>()
    for (const slot of GAME_SCRAPER_SLOTS) {
      const config = slotConfigs[slot]
      for (const entry of config.providers.filter((p) => p.enabled)) {
        uniqueProviderIds.add(entry.providerId)
      }
    }

    // ========== Phase 1: Resolve searchProvider, get originalName ==========
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
      // Use originalName for better cross-provider matching
      if (searchResult.originalName) {
        searchName = searchResult.originalName
        log.info(`[Scraper] Using originalName '${searchName}' for cross-provider search`)
      }
    }

    // ========== Phase 2: Resolve other providers IN PARALLEL ==========
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

    // ========== Phase 3: Fetch all slots in parallel ==========
    const results = await this.fetchAllSlots(normalizedProfile, resolvedIds, locale)

    return mergeGameScraperMetadata(results, normalizedProfile)
  }

  /**
   * Get images from a specific provider.
   *
   * @param providerId - The provider to query
   * @param lookup - Lookup info (name, locale, knownIds)
   * @param imageType - Type of images to fetch
   */
  async getProviderImages(
    providerId: string,
    lookup: ScraperLookup,
    imageType: GameImageSlot
  ): Promise<string[]> {
    const provider = this.providers.get(providerId)
    if (!provider) {
      log.warn(`[Scraper] Provider '${providerId}' not available`)
      return []
    }

    if (!provider.capabilities.includes(imageType)) {
      log.warn(`[Scraper] Provider '${providerId}' does not support image slot '${imageType}'`)
      return []
    }

    const locale = lookup.locale ?? (this.i18n.getLocale() as Locale)
    const result = await this.resolveId(providerId, lookup.name, lookup.knownIds, locale)

    if (!result) {
      log.warn(`[Scraper] Could not resolve ID for '${lookup.name}' via ${providerId}`)
      return []
    }

    try {
      switch (imageType) {
        case 'covers':
          return (await provider.getCovers!(result.id, locale)) ?? []
        case 'backdrops':
          return (await provider.getBackdrops!(result.id, locale)) ?? []
        case 'logos':
          return (await provider.getLogos!(result.id, locale)) ?? []
        case 'icons':
          return (await provider.getIcons!(result.id, locale)) ?? []
      }
    } catch (error) {
      log.warn(`[Scraper] ${providerId}.${imageType} failed:`, error)
      return []
    }
  }

  // ---------------------------------------------------------------------------
  // Internal: Data Loading
  // ---------------------------------------------------------------------------

  /**
   * Load profile by ID (sync for better-sqlite3)
   */
  private loadProfile(profileId: string): ScraperProfile {
    const rows = this.db
      .select()
      .from(scraperProfiles)
      .where(eq(scraperProfiles.id, profileId))
      .limit(1)
      .all()

    const profile = rows[0]
    if (!profile) throw new Error(`Profile not found: ${profileId}`)
    if (profile.mediaType !== 'game') {
      throw new Error(`Profile '${profileId}' is not a game scraper profile`)
    }
    return profile
  }

  private getProvider(providerId: string): GameScraperProvider {
    const provider = this.providers.get(providerId)
    if (!provider) throw new Error(`Provider not found: ${providerId}`)
    return provider
  }

  private getLocale(profile: ScraperProfile): Locale {
    return (profile.defaultLocale ?? this.i18n.getLocale()) as Locale
  }

  // ---------------------------------------------------------------------------
  // Internal: ID Resolution (Pure, No Side Effects)
  // ---------------------------------------------------------------------------

  /**
   * Resolve ID for a specific provider.
   *
   * Resolution priority:
   * 1. Check knownIds for this provider's ID
   * 2. Search by name to get this provider's ID
   *
   * Returns both ID and originalName (if available from search result).
   * Does NOT modify any input parameters.
   */
  private async resolveId(
    providerId: string,
    name: string,
    knownIds: ExternalId[] | undefined,
    locale: Locale
  ): Promise<ResolveResult | null> {
    // Check knownIds for this provider
    const known = knownIds?.find((ext) => ext.source === providerId)
    if (known) {
      return { id: known.id }
    }

    // Search by name
    const provider = this.providers.get(providerId)
    if (!provider || !provider.capabilities.includes('search')) {
      log.warn(`[Scraper] Provider '${providerId}' does not support search`)
      return null
    }

    try {
      const results = await provider.search!(name, locale)
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
  ): Promise<GameScraperResult[]> {
    const tasks: Promise<GameScraperResult | null>[] = []

    for (const slot of GAME_SCRAPER_SLOTS) {
      const config = profile.slotConfigs[slot]
      for (const entry of config.providers.filter((p) => p.enabled)) {
        const id = resolvedIds.get(entry.providerId)
        if (id) {
          tasks.push(this.fetchSlot(entry.providerId, id, locale, slot, entry.priority))
        }
      }
    }

    const results = await Promise.all(tasks)
    return results.filter((r): r is GameScraperResult => r !== null)
  }

  private async fetchSlot(
    providerId: string,
    id: string,
    locale: Locale,
    slot: GameScraperSlot,
    priority: number
  ): Promise<GameScraperResult | null> {
    const provider = this.providers.get(providerId)
    if (!provider) {
      log.warn(`[Scraper] Provider '${providerId}' not available`)
      return null
    }

    if (!provider.capabilities.includes(slot)) {
      log.warn(`[Scraper] Provider '${providerId}' does not support slot '${slot}'`)
      return null
    }

    try {
      switch (slot) {
        case 'info': {
          const data = await provider.getInfo!(id, locale)
          return data ? { slot, priority, data } : null
        }
        case 'tags': {
          const data = await provider.getTags!(id, locale)
          return data ? { slot, priority, data } : null
        }
        case 'characters': {
          const data = await provider.getCharacters!(id, locale)
          return data ? { slot, priority, data } : null
        }
        case 'persons': {
          const data = await provider.getPersons!(id, locale)
          return data ? { slot, priority, data } : null
        }
        case 'companies': {
          const data = await provider.getCompanies!(id, locale)
          return data ? { slot, priority, data } : null
        }
        case 'covers': {
          const data = await provider.getCovers!(id, locale)
          return data ? { slot, priority, data } : null
        }
        case 'backdrops': {
          const data = await provider.getBackdrops!(id, locale)
          return data ? { slot, priority, data } : null
        }
        case 'logos': {
          const data = await provider.getLogos!(id, locale)
          return data ? { slot, priority, data } : null
        }
        case 'icons': {
          const data = await provider.getIcons!(id, locale)
          return data ? { slot, priority, data } : null
        }
      }
    } catch (error) {
      log.warn(`[Scraper] ${providerId}.${slot} failed:`, error)
      return null
    }
  }

  private assertProviderCapabilities(provider: GameScraperProvider): void {
    if (typeof provider.id !== 'string' || !provider.id.trim()) {
      throw new Error(`[Scraper] Provider id is required`)
    }
    if (typeof provider.name !== 'string' || !provider.name.trim()) {
      throw new Error(`[Scraper] Provider name is required (${provider.id})`)
    }
    if (!Array.isArray(provider.capabilities)) {
      throw new Error(`[Scraper] Provider '${provider.id}' capabilities must be an array`)
    }

    const declared = new Set<ScraperCapability>()
    for (const cap of provider.capabilities) {
      if (!GAME_ALLOWED_CAPABILITIES.has(cap)) {
        throw new Error(`[Scraper] Provider '${provider.id}' declares invalid capability: ${cap}`)
      }
      if (declared.has(cap)) {
        throw new Error(`[Scraper] Provider '${provider.id}' declares duplicate capability: ${cap}`)
      }
      declared.add(cap)
    }

    for (const [cap, method] of GAME_CAPABILITY_METHODS) {
      const fn = (provider as unknown as Record<string, unknown>)[method as string]
      const hasMethod = typeof fn === 'function'
      const hasCapability = declared.has(cap)

      if (hasCapability && !hasMethod) {
        throw new Error(
          `[Scraper] Provider '${provider.id}' declares '${cap}' but does not implement '${String(method)}'`
        )
      }

      if (hasMethod && !hasCapability) {
        throw new Error(
          `[Scraper] Provider '${provider.id}' implements '${String(method)}' but does not declare '${cap}'`
        )
      }
    }
  }
}
