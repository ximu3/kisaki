/**
 * Deeplink Service
 *
 * Handles kisaki:// protocol deeplinks for the application.
 * Supports launching games, debugging plugins, auth callbacks, navigation, and more.
 */

import { app } from 'electron'
import log from 'electron-log/main'
import type { IService, ServiceInitContainer, ServiceName } from '@main/container'
import { DeeplinkRouter } from './router'
import type { DeeplinkAction, ParsedDeeplink, DeeplinkResult } from './types'
import { DEEPLINK_SCHEME } from '@main/bootstrap/protocol'
import type { IpcService } from '@main/services/ipc'
import type { WindowService } from '@main/services/window'
import { AuthHandler } from './handlers/auth'
import { LaunchHandler } from './handlers/launch'
import { NavigateHandler } from './handlers/navigate'

export class DeeplinkService implements IService {
  readonly id = 'deeplink'
  readonly deps = ['ipc', 'window', 'launcher'] as const satisfies readonly ServiceName[]

  private router!: DeeplinkRouter
  private ipc!: IpcService
  private windowService!: WindowService
  private pendingDeeplinks: string[] = []
  private isReady = false

  async init(container: ServiceInitContainer<this>): Promise<void> {
    this.ipc = container.get('ipc')
    this.windowService = container.get('window')

    const launcher = container.get('launcher')

    this.router = new DeeplinkRouter()
    this.router.register(new LaunchHandler(launcher))
    this.router.register(new AuthHandler(this.ipc, this.windowService))
    this.router.register(new NavigateHandler(this.ipc, this.windowService))

    // Setup IPC handlers
    this.setupIpc()

    // Setup second-instance handler (Windows/Linux)
    this.setupSecondInstance()

    // Setup open-url handler (macOS)
    this.setupOpenUrl()

    log.info('[DeeplinkService] Initialized')
  }

  /**
   * Mark the service as ready and process any pending deeplinks.
   * Should be called after all services are initialized and window is created.
   */
  markReady(): void {
    this.isReady = true

    // Process any deeplinks that arrived before we were ready
    for (const url of this.pendingDeeplinks) {
      this.handleDeeplink(url).catch((error) => {
        log.error('[DeeplinkService] Error processing pending deeplink:', error)
      })
    }
    this.pendingDeeplinks = []

    log.info('[DeeplinkService] Ready, processed pending deeplinks')
  }

  /**
   * Handle a deeplink URL
   */
  async handleDeeplink(url: string): Promise<DeeplinkResult> {
    // Queue if not ready yet
    if (!this.isReady) {
      log.info(`[DeeplinkService] Queuing deeplink (not ready): ${url}`)
      this.pendingDeeplinks.push(url)
      return {
        success: true,
        action: 'launch',
        message: 'Queued for processing'
      }
    }

    try {
      const parsed = this.parseDeeplink(url)
      if (!parsed) {
        log.warn(`[DeeplinkService] Invalid deeplink format: ${url}`)
        return {
          success: false,
          action: 'launch',
          message: 'Invalid deeplink format'
        }
      }

      log.info(`[DeeplinkService] Handling: ${parsed.action}/${parsed.resource}`)
      return await this.router.route(parsed)
    } catch (error) {
      log.error('[DeeplinkService] Error handling deeplink:', error)
      return {
        success: false,
        action: 'launch',
        message: (error as Error).message
      }
    }
  }

  /**
   * Parse a deeplink URL into its components
   */
  private parseDeeplink(url: string): ParsedDeeplink | null {
    try {
      const parsed = new URL(url)

      // Verify protocol
      if (parsed.protocol !== `${DEEPLINK_SCHEME}:`) {
        return null
      }

      // kisaki://action/resource?params
      // hostname = action, pathname = /resource
      const action = parsed.hostname as DeeplinkAction
      const resource = parsed.pathname.replace(/^\//, '')
      const params: Record<string, string> = {}

      parsed.searchParams.forEach((value, key) => {
        params[key] = value
      })

      return { action, resource, params, raw: url }
    } catch {
      return null
    }
  }

  /**
   * Setup handler for second-instance event (Windows/Linux)
   */
  private setupSecondInstance(): void {
    app.on('second-instance', (_event, argv) => {
      // Find kisaki:// URL in arguments
      const deeplinkUrl = argv.find((arg) => arg.startsWith(`${DEEPLINK_SCHEME}://`))
      if (deeplinkUrl) {
        this.handleDeeplink(deeplinkUrl).catch((error) => {
          log.error('[DeeplinkService] Error handling second-instance deeplink:', error)
        })
      }

      // Focus the main window
      this.focusMainWindow()
    })
  }

  /**
   * Setup handler for open-url event (macOS)
   */
  private setupOpenUrl(): void {
    app.on('open-url', (event, url) => {
      event.preventDefault()
      this.handleDeeplink(url).catch((error) => {
        log.error('[DeeplinkService] Error handling open-url deeplink:', error)
      })
    })
  }

  /**
   * Focus the main window
   */
  private focusMainWindow(): void {
    try {
      const mainWindow = this.windowService.getMainWindow()
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    } catch (error) {
      log.error('[DeeplinkService] Error focusing main window:', error)
    }
  }

  /**
   * Setup IPC handlers
   */
  private setupIpc(): void {
    // Handle deeplink from renderer process
    this.ipc.handle('deeplink:handle', async (_, url: string) => {
      try {
        const result = await this.handleDeeplink(url)
        return { success: true as const, data: result }
      } catch (error) {
        return { success: false as const, error: (error as Error).message }
      }
    })

    // Get registered actions
    this.ipc.handle('deeplink:get-actions', () => {
      return { success: true as const, data: this.router.getRegisteredActions() }
    })
  }

  /**
   * Get the router for external access (e.g., registering custom handlers)
   */
  getRouter(): DeeplinkRouter {
    return this.router
  }
}
