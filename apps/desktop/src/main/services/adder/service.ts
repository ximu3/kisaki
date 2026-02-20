/**
 * Adder Service
 *
 * Handles adding content entities to the library.
 */

import log from 'electron-log/main'
import type { IContentService, ServiceInitContainer, ServiceName } from '@main/container'
import type { ContentEntityType } from '@shared/common'
import type { IpcService } from '@main/services/ipc'
import {
  CharacterAdderHandler,
  CompanyAdderHandler,
  GameAdderHandler,
  PersonAdderHandler
} from './handlers'

export class AdderService implements IContentService {
  readonly id = 'adder'
  readonly deps = ['db', 'ipc'] as const satisfies readonly ServiceName[]

  person!: PersonAdderHandler
  company!: CompanyAdderHandler
  character!: CharacterAdderHandler
  game!: GameAdderHandler

  async init(container: ServiceInitContainer<this>): Promise<void> {
    const dbService = container.get('db')
    const ipcService = container.get('ipc')

    this.person = new PersonAdderHandler(dbService)
    this.company = new CompanyAdderHandler(dbService)
    this.character = new CharacterAdderHandler(dbService)
    this.game = new GameAdderHandler(dbService, this.person, this.company, this.character)

    this.setupIpcHandlers(ipcService)
    log.info('[AdderService] Initialized')
  }

  private setupIpcHandlers(ipc: IpcService): void {
    ipc.handle('adder:add-game', async (_, metadata, options) => {
      try {
        const data = await this.game.addGame(metadata, options)
        return { success: true as const, data }
      } catch (error) {
        log.error('[AdderService] adder:add-game failed:', error)
        return { success: false as const, error: (error as Error).message }
      }
    })

    ipc.handle('adder:add-person', async (_, metadata, options) => {
      try {
        const data = await this.person.addPerson(metadata, options)
        return { success: true as const, data }
      } catch (error) {
        log.error('[AdderService] adder:add-person failed:', error)
        return { success: false as const, error: (error as Error).message }
      }
    })

    ipc.handle('adder:add-company', async (_, metadata, options) => {
      try {
        const data = await this.company.addCompany(metadata, options)
        return { success: true as const, data }
      } catch (error) {
        log.error('[AdderService] adder:add-company failed:', error)
        return { success: false as const, error: (error as Error).message }
      }
    })

    ipc.handle('adder:add-character', async (_, metadata, options) => {
      try {
        const data = await this.character.addCharacter(metadata, options)
        return { success: true as const, data }
      } catch (error) {
        log.error('[AdderService] adder:add-character failed:', error)
        return { success: false as const, error: (error as Error).message }
      }
    })
  }

  getSupportedContent(): ContentEntityType[] {
    return ['game', 'character', 'person', 'company']
  }
}
