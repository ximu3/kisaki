/**
 * Metadata updater service.
 */

import log from 'electron-log/main'
import type { IContentService, ServiceInitContainer, ServiceName } from '@main/container'
import type { ContentEntityType } from '@shared/common'
import type { IpcService } from '@main/services/ipc'
import {
  CharacterMetadataUpdaterHandler,
  CompanyMetadataUpdaterHandler,
  GameMetadataUpdaterHandler,
  PersonMetadataUpdaterHandler
} from './handlers'

export class MetadataUpdaterService implements IContentService {
  readonly id = 'metadata-updater'
  readonly deps = ['db', 'ipc'] as const satisfies readonly ServiceName[]

  game!: GameMetadataUpdaterHandler
  person!: PersonMetadataUpdaterHandler
  company!: CompanyMetadataUpdaterHandler
  character!: CharacterMetadataUpdaterHandler

  async init(container: ServiceInitContainer<this>): Promise<void> {
    const dbService = container.get('db')
    const ipcService = container.get('ipc')

    this.game = new GameMetadataUpdaterHandler(dbService)
    this.person = new PersonMetadataUpdaterHandler(dbService)
    this.company = new CompanyMetadataUpdaterHandler(dbService)
    this.character = new CharacterMetadataUpdaterHandler(dbService)

    this.setupIpcHandlers(ipcService)
    log.info('[MetadataUpdaterService] Initialized')
  }

  private setupIpcHandlers(ipc: IpcService): void {
    ipc.handle('metadata-updater:update-game', async (_, gameId, metadata, options) => {
      try {
        const data = await this.game.updateGame(gameId, metadata, options)
        return { success: true as const, data }
      } catch (error) {
        log.error('[MetadataUpdaterService] metadata-updater:update-game failed:', error)
        return { success: false as const, error: (error as Error).message }
      }
    })

    ipc.handle('metadata-updater:update-person', async (_, personId, metadata, options) => {
      try {
        const data = await this.person.updatePerson(personId, metadata, options)
        return { success: true as const, data }
      } catch (error) {
        log.error('[MetadataUpdaterService] metadata-updater:update-person failed:', error)
        return { success: false as const, error: (error as Error).message }
      }
    })

    ipc.handle('metadata-updater:update-company', async (_, companyId, metadata, options) => {
      try {
        const data = await this.company.updateCompany(companyId, metadata, options)
        return { success: true as const, data }
      } catch (error) {
        log.error('[MetadataUpdaterService] metadata-updater:update-company failed:', error)
        return { success: false as const, error: (error as Error).message }
      }
    })

    ipc.handle('metadata-updater:update-character', async (_, characterId, metadata, options) => {
      try {
        const data = await this.character.updateCharacter(characterId, metadata, options)
        return { success: true as const, data }
      } catch (error) {
        log.error('[MetadataUpdaterService] metadata-updater:update-character failed:', error)
        return { success: false as const, error: (error as Error).message }
      }
    })
  }

  getSupportedContent(): ContentEntityType[] {
    return ['game', 'character', 'person', 'company']
  }
}
