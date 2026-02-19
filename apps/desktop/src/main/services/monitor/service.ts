/**
 * Monitor Service
 *
 * Manages process monitoring for media playback/runtime tracking.
 * Provides namespace-style access to media-specific handlers.
 */

import log from 'electron-log/main'
import type { IMediaService, ServiceInitContainer, ServiceName } from '@main/container'
import type { MediaType } from '@shared/common'
import type { IpcService } from '@main/services/ipc'
import { GameMonitorHandler } from './handlers/game'

export class MonitorService implements IMediaService {
  readonly id = 'monitor'
  readonly deps = ['db', 'ipc', 'event', 'attachment'] as const satisfies readonly ServiceName[]

  game!: GameMonitorHandler

  async init(container: ServiceInitContainer<this>): Promise<void> {
    const dbService = container.get('db')
    const ipcService = container.get('ipc')
    const eventService = container.get('event')
    const attachmentService = container.get('attachment')

    // Create handler with attachment handler for auto-backup
    this.game = new GameMonitorHandler(dbService, ipcService, eventService, attachmentService.game)

    this.setupIpcHandlers(ipcService)
    log.info('[MonitorService] Initialized')
  }

  private setupIpcHandlers(ipc: IpcService): void {
    ipc.handle('monitor:start-game', async (_, gameId) => {
      try {
        await this.game.startMonitoring(gameId)
        return { success: true }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    ipc.handle('monitor:stop-game', async (_, gameId) => {
      try {
        await this.game.stopMonitoring(gameId)
        return { success: true }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    ipc.handle('monitor:get-game-status', async (_, gameId) => {
      try {
        if (gameId) {
          const status = this.game.getGameStatus(gameId)
          if (!status) {
            return { success: false, error: `No status found for game ${gameId}` }
          }
          return { success: true, data: status }
        } else {
          const data = this.game.getMonitoringStatus()
          return { success: true, data }
        }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    ipc.handle('monitor:compute-effective-path', async (_, config) => {
      try {
        const path = GameMonitorHandler.computeEffectiveMonitorPath(config)
        return { success: true, data: path }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })
  }

  async dispose(): Promise<void> {
    await this.game.cleanup()
    log.info('[MonitorService] Disposed')
  }

  getSupportedMedia(): MediaType[] {
    return ['game']
  }
}
