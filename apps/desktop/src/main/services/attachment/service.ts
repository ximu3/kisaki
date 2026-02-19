/**
 * Attachment Service
 *
 * Handles attachment workflows (e.g. crop, save backups).
 *
 * Notes:
 * - Low-level attachment CRUD is provided by DbService.attachment (via db:* IPC).
 * - This service stays focused on workflows that require main-process capabilities.
 */

import { app } from 'electron'
import log from 'electron-log/main'
import path from 'path'
import type { IMediaService, ServiceInitContainer, ServiceName } from '@main/container'
import type { NetworkService } from '@main/services/network'
import type { MediaType } from '@shared/common'
import type { IpcService } from '@main/services/ipc'
import type { CropRegion } from '@shared/attachment'
import type { AttachmentInput } from '@shared/db/attachment'
import { GameAttachmentHandler } from './handlers/game'
import { AttachmentCropper, type CropToTempOptions } from './crop'

export class AttachmentService implements IMediaService {
  readonly id = 'attachment'
  readonly deps = ['db', 'ipc', 'network'] as const satisfies readonly ServiceName[]

  game!: GameAttachmentHandler
  private networkService!: NetworkService
  private cropper!: AttachmentCropper

  async init(container: ServiceInitContainer<this>): Promise<void> {
    const dbService = container.get('db')
    const ipcService = container.get('ipc')

    this.game = new GameAttachmentHandler(dbService)
    this.networkService = container.get('network')
    this.cropper = new AttachmentCropper({
      tempDir: path.join(app.getPath('temp'), 'kisaki', 'crop'),
      downloadBuffer: async (url) => await this.networkService.downloadBuffer(url)
    })
    this.setupIpcHandlers(ipcService)

    this.cropper.cleanupOldTempCrops(24 * 60 * 60 * 1000).catch((error) => {
      log.warn('[AttachmentService] Failed to cleanup temp crops:', error)
    })
    log.info('[AttachmentService] Initialized')
  }

  private setupIpcHandlers(ipc: IpcService): void {
    // Generic crop-to-temp (sharp)
    ipc.handle('attachment:crop-to-temp', async (_, input, cropRegion: CropRegion, options) => {
      try {
        const data = await this.cropper.cropToTemp(
          input as AttachmentInput,
          cropRegion,
          options as CropToTempOptions | undefined
        )
        return { success: true, data }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    // Save backups
    ipc.handle('attachment:create-game-backup', async (_, gameId, note?: string) => {
      try {
        const data = await this.game.createBackup(gameId, note)
        return { success: true, data }
      } catch (error) {
        log.error('[AttachmentService] attachment:create-game-backup failed:', error)
        return { success: false, error: (error as Error).message }
      }
    })

    ipc.handle('attachment:delete-game-backup', async (_, gameId, backupAt: number) => {
      try {
        await this.game.deleteBackup(gameId, backupAt)
        return { success: true }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    ipc.handle('attachment:restore-game-backup', async (_, gameId, backupAt: number) => {
      try {
        await this.game.restoreBackup(gameId, backupAt)
        return { success: true }
      } catch (error) {
        log.error('[AttachmentService] attachment:restore-game-backup failed:', error)
        return { success: false, error: (error as Error).message }
      }
    })

    ipc.handle('attachment:update-game-backup', async (_, gameId, backupAt: number, updates) => {
      try {
        await this.game.updateBackup(gameId, backupAt, updates)
        return { success: true }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    ipc.handle('attachment:open-backup-folder', async (_, gameId) => {
      try {
        await this.game.openBackupFolder(gameId)
        return { success: true }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    ipc.handle('attachment:open-save-folder', async (_, gameId) => {
      try {
        await this.game.openSaveFolder(gameId)
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
