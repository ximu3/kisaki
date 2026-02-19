/**
 * Scraper Service
 *
 * Lightweight service for scraper providers and profile-based metadata fetching.
 * Database CRUD is handled directly via Drizzle in both processes.
 *
 * Responsibilities:
 * - Provider registration (builtin + plugins)
 * - Profile-based scraping operations via IPC
 */

import log from 'electron-log/main'
import type { IContentService, ServiceInitContainer, ServiceName } from '@main/container'
import type { IpcService } from '@main/services/ipc'
import type { NetworkService } from '@main/services/network'
import type { ContentEntityType } from '@shared/common'
import { GameScraperHandler } from './handlers/game'
import type { GameScraperProvider } from './handlers/game'
import { PersonScraperHandler } from './handlers/person'
import type { PersonScraperProvider } from './handlers/person'
import { CompanyScraperHandler } from './handlers/company'
import type { CompanyScraperProvider } from './handlers/company'
import { CharacterScraperHandler } from './handlers/character'
import type { CharacterScraperProvider } from './handlers/character'
import { BangumiProvider } from './handlers/game/providers/bangumi'
import { IGDBProvider } from './handlers/game/providers/igdb'
import { VNDBProvider } from './handlers/game/providers/vndb'
import { YmgalProvider } from './handlers/game/providers/ymgal'

export class ScraperService implements IContentService {
  readonly id = 'scraper'
  readonly deps = ['db', 'i18n', 'ipc', 'network'] as const satisfies readonly ServiceName[]

  game!: GameScraperHandler
  person!: PersonScraperHandler
  company!: CompanyScraperHandler
  character!: CharacterScraperHandler

  private ipcService!: IpcService

  async init(container: ServiceInitContainer<this>): Promise<void> {
    const dbService = container.get('db')
    const i18n = container.get('i18n')
    this.ipcService = container.get('ipc')
    const networkService = container.get('network')

    this.game = new GameScraperHandler(dbService.db, i18n)
    this.person = new PersonScraperHandler(dbService.db, i18n)
    this.company = new CompanyScraperHandler(dbService.db, i18n)
    this.character = new CharacterScraperHandler(dbService.db, i18n)
    this.registerBuiltinProviders(networkService)
    this.setupIpcHandlers()

    log.info('[ScraperService] Initialized')
  }

  private registerBuiltinProviders(networkService: NetworkService): void {
    this.game.registerProvider(new YmgalProvider(networkService))
    this.game.registerProvider(new BangumiProvider(networkService))
    this.game.registerProvider(new IGDBProvider(networkService))
    this.game.registerProvider(new VNDBProvider(networkService))
  }

  private setupIpcHandlers(): void {
    const ipc = this.ipcService

    // =========================================================================
    // Provider Info
    // =========================================================================

    ipc.handle('scraper:list-game-providers', async () => {
      try {
        return { success: true as const, data: this.game.getProviders() }
      } catch (error) {
        return { success: false as const, error: (error as Error).message }
      }
    })

    ipc.handle('scraper:get-game-provider', async (_, providerId) => {
      try {
        return { success: true as const, data: this.game.getProviderInfo(providerId) }
      } catch (error) {
        return { success: false as const, error: (error as Error).message }
      }
    })

    ipc.handle('scraper:list-person-providers', async () => {
      try {
        return { success: true as const, data: this.person.getProviders() }
      } catch (error) {
        return { success: false as const, error: (error as Error).message }
      }
    })

    ipc.handle('scraper:get-person-provider', async (_, providerId) => {
      try {
        return { success: true as const, data: this.person.getProviderInfo(providerId) }
      } catch (error) {
        return { success: false as const, error: (error as Error).message }
      }
    })

    ipc.handle('scraper:list-company-providers', async () => {
      try {
        return { success: true as const, data: this.company.getProviders() }
      } catch (error) {
        return { success: false as const, error: (error as Error).message }
      }
    })

    ipc.handle('scraper:get-company-provider', async (_, providerId) => {
      try {
        return { success: true as const, data: this.company.getProviderInfo(providerId) }
      } catch (error) {
        return { success: false as const, error: (error as Error).message }
      }
    })

    ipc.handle('scraper:list-character-providers', async () => {
      try {
        return { success: true as const, data: this.character.getProviders() }
      } catch (error) {
        return { success: false as const, error: (error as Error).message }
      }
    })

    ipc.handle('scraper:get-character-provider', async (_, providerId) => {
      try {
        return { success: true as const, data: this.character.getProviderInfo(providerId) }
      } catch (error) {
        return { success: false as const, error: (error as Error).message }
      }
    })

    // =========================================================================
    // Profile-Based Game Operations
    // =========================================================================

    ipc.handle('scraper:search-game', async (_, profileId, query) => {
      try {
        return { success: true as const, data: await this.game.search(profileId, query) }
      } catch (error) {
        return { success: false as const, error: (error as Error).message }
      }
    })

    ipc.handle('scraper:get-game-metadata', async (_, profileId, id, options) => {
      try {
        return {
          success: true as const,
          data: await this.game.getMetadata(profileId, id, options)
        }
      } catch (error) {
        return { success: false as const, error: (error as Error).message }
      }
    })

    ipc.handle('scraper:get-game-provider-images', async (_, providerId, lookup, imageType) => {
      try {
        return {
          success: true as const,
          data: await this.game.getProviderImages(providerId, lookup, imageType)
        }
      } catch (error) {
        return { success: false as const, error: (error as Error).message }
      }
    })

    // =========================================================================
    // Profile-Based Metadata Entity Operations
    // =========================================================================

    ipc.handle('scraper:search-person', async (_, profileId, query) => {
      try {
        return { success: true as const, data: await this.person.search(profileId, query) }
      } catch (error) {
        return { success: false as const, error: (error as Error).message }
      }
    })

    ipc.handle('scraper:get-person-metadata', async (_, profileId, lookup, options) => {
      try {
        return {
          success: true as const,
          data: await this.person.getMetadata(profileId, lookup, options)
        }
      } catch (error) {
        return { success: false as const, error: (error as Error).message }
      }
    })

    ipc.handle('scraper:get-person-provider-images', async (_, providerId, lookup, imageType) => {
      try {
        return {
          success: true as const,
          data: await this.person.getProviderImages(providerId, lookup, imageType)
        }
      } catch (error) {
        return { success: false as const, error: (error as Error).message }
      }
    })

    ipc.handle('scraper:search-company', async (_, profileId, query) => {
      try {
        return { success: true as const, data: await this.company.search(profileId, query) }
      } catch (error) {
        return { success: false as const, error: (error as Error).message }
      }
    })

    ipc.handle('scraper:get-company-metadata', async (_, profileId, lookup, options) => {
      try {
        return {
          success: true as const,
          data: await this.company.getMetadata(profileId, lookup, options)
        }
      } catch (error) {
        return { success: false as const, error: (error as Error).message }
      }
    })

    ipc.handle('scraper:get-company-provider-images', async (_, providerId, lookup, imageType) => {
      try {
        return {
          success: true as const,
          data: await this.company.getProviderImages(providerId, lookup, imageType)
        }
      } catch (error) {
        return { success: false as const, error: (error as Error).message }
      }
    })

    ipc.handle('scraper:search-character', async (_, profileId, query) => {
      try {
        return { success: true as const, data: await this.character.search(profileId, query) }
      } catch (error) {
        return { success: false as const, error: (error as Error).message }
      }
    })

    ipc.handle('scraper:get-character-metadata', async (_, profileId, lookup, options) => {
      try {
        return {
          success: true as const,
          data: await this.character.getMetadata(profileId, lookup, options)
        }
      } catch (error) {
        return { success: false as const, error: (error as Error).message }
      }
    })

    ipc.handle(
      'scraper:get-character-provider-images',
      async (_, providerId, lookup, imageType) => {
        try {
          return {
            success: true as const,
            data: await this.character.getProviderImages(providerId, lookup, imageType)
          }
        } catch (error) {
          return { success: false as const, error: (error as Error).message }
        }
      }
    )
  }

  getSupportedContent(): ContentEntityType[] {
    return ['game', 'character', 'person', 'company']
  }

  // ===========================================================================
  // Provider Management (for plugin system)
  // ===========================================================================

  registerGameProvider(provider: GameScraperProvider): void {
    this.game.registerProvider(provider)
  }

  async unregisterGameProvider(providerId: string): Promise<void> {
    // SQLite triggers will automatically emit db:deleted/db:updated events
    await this.game.unregisterProvider(providerId)
  }

  registerPersonProvider(provider: PersonScraperProvider): void {
    this.person.registerProvider(provider)
  }

  async unregisterPersonProvider(providerId: string): Promise<void> {
    await this.person.unregisterProvider(providerId)
  }

  registerCompanyProvider(provider: CompanyScraperProvider): void {
    this.company.registerProvider(provider)
  }

  async unregisterCompanyProvider(providerId: string): Promise<void> {
    await this.company.unregisterProvider(providerId)
  }

  registerCharacterProvider(provider: CharacterScraperProvider): void {
    this.character.registerProvider(provider)
  }

  async unregisterCharacterProvider(providerId: string): Promise<void> {
    await this.character.unregisterProvider(providerId)
  }
}
