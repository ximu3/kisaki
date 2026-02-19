/**
 * Window Service
 *
 * Manages application windows lifecycle.
 */

import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { is, platform } from '@electron-toolkit/utils'
import windowStateKeeper from 'electron-window-state'
import log from 'electron-log/main'
import type { IService, ServiceInitContainer, ServiceName } from '@main/container'
import type { DbService } from '@main/services/db'
import type { IpcService } from '@main/services/ipc'
import { settings } from '@shared/db'
import type { MainWindowCloseAction } from '@shared/db/enums'

export class WindowService implements IService {
  readonly id = 'window'
  readonly deps = ['ipc', 'db'] as const satisfies readonly ServiceName[]

  private mainWindow: BrowserWindow | null = null
  private trayMenuWindow: BrowserWindow | null = null
  private ipcService!: IpcService
  private dbService!: DbService
  private isQuitting = false
  private mainWindowCloseAction: MainWindowCloseAction = 'exit'

  async init(container: ServiceInitContainer<this>): Promise<void> {
    this.ipcService = container.get('ipc')
    this.dbService = container.get('db')
    this.mainWindowCloseAction = this.loadMainWindowCloseActionFromDb()
    this.setupIpcHandlers()

    app.on('before-quit', () => {
      this.isQuitting = true
    })

    log.info('[WindowService] Initialized')
  }

  private setupIpcHandlers(): void {
    this.ipcService.on('window:set-main-window-close-action', (_e, action) => {
      this.setMainWindowCloseAction(action)
    })

    this.ipcService.handle('window:minimize-main-window', () => {
      const mainWindow = this.getMainWindow()
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.minimize()
        return { success: true }
      }
      return { success: false, error: 'Window not available' }
    })

    this.ipcService.handle('window:toggle-main-window-maximize', () => {
      const mainWindow = this.getMainWindow()
      if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize()
        } else {
          mainWindow.maximize()
        }
        return { success: true }
      }
      return { success: false, error: 'Window not available' }
    })

    this.ipcService.handle('window:close-main-window', () => {
      const mainWindow = this.getMainWindow()
      if (!mainWindow || mainWindow.isDestroyed()) {
        return { success: false, error: 'Window not available' }
      }

      this.applyMainWindowCloseAction(this.mainWindowCloseAction)
      return { success: true }
    })
  }

  private loadMainWindowCloseActionFromDb(): MainWindowCloseAction {
    try {
      const row = this.dbService.db
        .select({ action: settings.mainWindowCloseAction })
        .from(settings)
        .get()

      return row?.action ?? 'exit'
    } catch (error) {
      log.warn(
        '[WindowService] Failed to read mainWindowCloseAction from settings, fallback to exit:',
        error
      )
      return 'exit'
    }
  }

  private setMainWindowCloseAction(action: MainWindowCloseAction): void {
    if (action !== 'exit' && action !== 'tray') {
      log.warn('[WindowService] Ignored invalid main window close action:', action)
      return
    }

    if (this.mainWindowCloseAction === action) return
    this.mainWindowCloseAction = action
    log.info('[WindowService] Updated main window close action:', action)
  }

  private applyMainWindowCloseAction(action: MainWindowCloseAction, event?: Electron.Event): void {
    const mainWindow = this.getMainWindow()
    if (!mainWindow || mainWindow.isDestroyed()) return

    if (this.isQuitting) return

    if (action === 'tray') {
      event?.preventDefault()
      mainWindow.hide()
      return
    }

    // action === 'exit'
    event?.preventDefault()
    setImmediate(() => app.quit())
  }

  async dispose(): Promise<void> {
    this.isQuitting = true

    if (this.trayMenuWindow && !this.trayMenuWindow.isDestroyed()) {
      try {
        this.trayMenuWindow.destroy()
      } catch {
        // ignore
      }
    }
    this.trayMenuWindow = null

    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      try {
        this.mainWindow.destroy()
      } catch {
        // ignore
      }
    }
    this.mainWindow = null
    log.info('[WindowService] Disposed')
  }

  /**
   * Create the main application window
   */
  createMainWindow(): BrowserWindow {
    // Load the previous state with fallback to defaults
    const mainWindowState = windowStateKeeper({
      defaultWidth: 1400,
      defaultHeight: 850,
      maximize: false,
      fullScreen: false
    })

    const icon = platform.isLinux ? join(__dirname, '../../resources/icon.png') : undefined

    // Create the browser window
    this.mainWindow = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      show: false,
      frame: false,
      autoHideMenuBar: true,
      ...(platform.isLinux ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        webSecurity: false
      }
    })

    // Let electron-window-state manage this window
    mainWindowState.manage(this.mainWindow)

    this.mainWindow.on('close', (event) => {
      this.applyMainWindowCloseAction(this.mainWindowCloseAction, event)
    })

    this.mainWindow.on('ready-to-show', () => {
      this.mainWindow?.show()
    })

    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    // Setup window event listeners
    this.mainWindow.on('maximize', () => {
      this.ipcService.send('native:main-window-maximized')
    })

    this.mainWindow.on('unmaximize', () => {
      this.ipcService.send('native:main-window-unmaximized')
    })

    // Clear reference when window is closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })

    // HMR for renderer base on electron-vite cli
    // Load the remote URL for development or the local html file for production
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      const base = process.env['ELECTRON_RENDERER_URL']
      const mainUrl = new URL('main.html', base.endsWith('/') ? base : `${base}/`).toString()
      this.mainWindow.loadURL(mainUrl)
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/main.html'))
    }

    log.info('[WindowService] Main window created')
    return this.mainWindow
  }

  createTrayMenuWindow(): BrowserWindow {
    if (this.trayMenuWindow && !this.trayMenuWindow.isDestroyed()) {
      this.trayMenuWindow.destroy()
      this.trayMenuWindow = null
    }

    this.trayMenuWindow = new BrowserWindow({
      width: 180,
      // https://github.com/electron/electron/issues/32171
      height: 39,
      show: false,
      frame: false,
      resizable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      autoHideMenuBar: true,
      transparent: false,

      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        webSecurity: false
      }
    })

    this.trayMenuWindow.on('blur', () => {
      if (!this.trayMenuWindow?.isDestroyed()) this.trayMenuWindow?.hide()
    })

    this.trayMenuWindow.on('closed', () => {
      this.trayMenuWindow = null
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      const base = process.env['ELECTRON_RENDERER_URL']
      const trayMenuUrl = new URL(
        'tray-menu.html',
        base.endsWith('/') ? base : `${base}/`
      ).toString()
      this.trayMenuWindow.loadURL(trayMenuUrl).catch((error) => {
        log.error('[WindowService] Failed to load tray menu window URL:', error)
      })
    } else {
      this.trayMenuWindow.loadFile(join(__dirname, '../renderer/tray-menu.html')).catch((error) => {
        log.error('[WindowService] Failed to load tray menu window file:', error)
      })
    }

    log.info('[WindowService] Tray menu window created')
    return this.trayMenuWindow
  }

  /**
   * Get the main window instance
   */
  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  getTrayMenuWindow(): BrowserWindow | null {
    return this.trayMenuWindow
  }

  /**
   * Get all browser windows
   */
  getAllWindows(): BrowserWindow[] {
    return BrowserWindow.getAllWindows()
  }

  /**
   * Check if main window exists and is not destroyed
   */
  hasMainWindow(): boolean {
    return this.mainWindow !== null && !this.mainWindow.isDestroyed()
  }

  /**
   * Focus the main window
   */
  focusMainWindow(): void {
    if (this.hasMainWindow()) {
      if (this.mainWindow!.isMinimized()) {
        this.mainWindow!.restore()
      }
      if (!this.mainWindow!.isVisible()) {
        this.mainWindow!.show()
      }
      this.mainWindow!.focus()
    }
  }

  /**
   * Close the main window
   */
  closeMainWindow(): void {
    if (this.hasMainWindow()) {
      this.mainWindow!.close()
    }
  }

  /**
   * Check if main window is focused
   */
  isMainWindowFocused(): boolean {
    return this.mainWindow !== null && !this.mainWindow.isDestroyed() && this.mainWindow.isFocused()
  }
}
