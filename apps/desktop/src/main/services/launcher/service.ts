/**
 * Launcher Service
 *
 * Handles launching media content (games, videos, etc.).
 * Provides namespace-style access to media-specific handlers.
 */

import log from 'electron-log/main'
import type { IMediaService, ServiceInitContainer, ServiceName } from '@main/container'
import type { MediaType } from '@shared/common'
import type { DbService } from '@main/services/db'
import type { EventService } from '@main/services/event'
import { GameLauncherHandler } from './handlers/game'
import { applyDefaultLaunchConfig } from './presets/defaults'
import type { IpcService } from '@main/services/ipc'

export class LauncherService implements IMediaService {
  readonly id = 'launcher'
  readonly deps = [
    'db',
    'ipc',
    'monitor',
    'event',
    'native'
  ] as const satisfies readonly ServiceName[]

  private dbService!: DbService
  private eventService!: EventService
  game!: GameLauncherHandler

  async init(container: ServiceInitContainer<this>): Promise<void> {
    this.dbService = container.get('db')
    this.eventService = container.get('event')
    const monitorService = container.get('monitor')
    const ipcService = container.get('ipc')
    const nativeService = container.get('native')

    this.game = new GameLauncherHandler(this.dbService, monitorService, nativeService)
    this.setupIpcHandlers(ipcService)
    log.info('[LauncherService] Initialized')
  }

  private setupIpcHandlers(ipc: IpcService): void {
    ipc.handle('launcher:launch-game', async (_, gameId) => {
      try {
        await this.game.launchGame(gameId)
        return { success: true }
      } catch (error) {
        log.error('[LauncherService] launcher:launch-game failed:', error)
        return { success: false, error: (error as Error).message }
      }
    })

    ipc.handle('launcher:kill-game', async (_, gameId) => {
      try {
        await this.game.killGame(gameId)
        return { success: true }
      } catch (error) {
        log.error('[LauncherService] launcher:kill-game failed:', error)
        return { success: false, error: (error as Error).message }
      }
    })

    ipc.handle('launcher:apply-default-config', async (_, gameId, filePath) => {
      try {
        await applyDefaultLaunchConfig(this.dbService, this.eventService, gameId, filePath)
        return { success: true }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })
  }

  getSupportedMedia(): MediaType[] {
    return ['game']
  }
}
