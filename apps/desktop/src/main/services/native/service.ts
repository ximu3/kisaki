/**
 * Native Service
 *
 * Handles native desktop integration IPC operations (dialogs, shell, etc.).
 */

import { app, dialog, shell, OpenDialogOptions, OpenDialogReturnValue } from 'electron'
import log from 'electron-log/main'
import { stat } from 'fs/promises'
import { dirname } from 'path'
import type { IService, ServiceInitContainer, ServiceName } from '@main/container'
import type { IpcService } from '@main/services/ipc'
import type { WindowService } from '@main/services/window'
import { NativeTray } from './tray'

export class NativeService implements IService {
  readonly id = 'native'
  readonly deps = ['ipc', 'window'] as const satisfies readonly ServiceName[]

  private ipcService!: IpcService
  private windowService!: WindowService
  private tray: NativeTray | null = null

  async init(container: ServiceInitContainer<this>): Promise<void> {
    this.ipcService = container.get('ipc')
    this.windowService = container.get('window')
    this.setupIpcHandlers()

    this.tray = new NativeTray({ ipcService: this.ipcService, windowService: this.windowService })
    this.tray.init()
    log.info('[NativeService] Initialized')
  }

  async dispose(): Promise<void> {
    try {
      this.tray?.dispose()
    } finally {
      this.tray = null
    }
    log.info('[NativeService] Disposed')
  }

  private setupIpcHandlers(): void {
    this.ipcService.handle('native:open-dialog', async (_, options) => {
      try {
        const result = await this.showOpenDialog(options)
        return { success: true, data: result }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    })

    this.ipcService.handle('native:open-path', async (_, input) => {
      try {
        await this.openPath(input)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    })

    this.ipcService.handle('native:get-auto-launch', async () => {
      try {
        return { success: true, data: this.getAutoLaunchEnabled() }
      } catch (error) {
        log.error('[NativeService] Failed to get auto launch setting:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    })

    this.ipcService.handle('native:set-auto-launch', async (_, enabled) => {
      try {
        this.setAutoLaunchEnabled(enabled)
        return { success: true }
      } catch (error) {
        log.error('[NativeService] Failed to set auto launch setting:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    })
  }

  getAutoLaunchEnabled(): boolean {
    return !!app.getLoginItemSettings().openAtLogin
  }

  setAutoLaunchEnabled(enabled: boolean): void {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      path: process.execPath,
      args: []
    })
  }

  /**
   * Show open dialog with main window
   */
  async showOpenDialog(options?: OpenDialogOptions): Promise<OpenDialogReturnValue> {
    const mainWindow = this.windowService.getMainWindow()
    if (!mainWindow) {
      throw new Error('No main window found')
    }
    return await dialog.showOpenDialog(mainWindow, options || {})
  }

  /**
   * Open a file or directory with the default system application
   */
  async openPath(
    input:
      | string
      | {
          path: string
          ensure?: 'auto' | 'folder' | 'file'
        }
  ): Promise<void> {
    const config =
      typeof input === 'string'
        ? { path: input, ensure: 'auto' as const }
        : { path: input.path, ensure: input.ensure ?? ('auto' as const) }

    let targetPath = config.path

    if (config.ensure === 'folder') {
      targetPath = await this.ensureFolderPath(targetPath)
    } else if (config.ensure === 'file') {
      // If user passed a folder but wants a file, keep as-is and let the OS handle errors.
      // (We mainly need `ensure: 'folder'` to avoid launching executables.)
    }

    try {
      const errorMessage = await shell.openPath(targetPath)
      if (errorMessage) {
        throw new Error(errorMessage)
      }
    } catch (error) {
      log.error('[NativeService] Failed to open path:', targetPath, error)
      throw error
    }
  }

  private async ensureFolderPath(path: string): Promise<string> {
    try {
      const info = await stat(path)
      if (info.isDirectory()) return path
      if (info.isFile()) return dirname(path)
      return dirname(path)
    } catch {
      const candidate = dirname(path)
      try {
        const info = await stat(candidate)
        if (info.isDirectory()) return candidate
      } catch {
        // ignore
      }
      return candidate
    }
  }
}
