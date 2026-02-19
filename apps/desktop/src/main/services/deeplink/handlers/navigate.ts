/**
 * Navigate Handler
 *
 * Handles kisaki://navigate/* deeplinks for in-app navigation.
 *
 * Supported URLs:
 * - kisaki://navigate/library
 * - kisaki://navigate/library/game/{gameId}
 * - kisaki://navigate/library/character/{characterId}
 * - kisaki://navigate/library/person/{personId}
 * - kisaki://navigate/library/company/{companyId}
 * - kisaki://navigate/library/collection/{collectionId}
 * - kisaki://navigate/scanner
 * - kisaki://navigate/plugin
 */

import log from 'electron-log/main'
import type { DeeplinkHandler, ParsedDeeplink, DeeplinkResult } from '../types'
import type { IpcService } from '@main/services/ipc'
import type { WindowService } from '@main/services/window'

export class NavigateHandler implements DeeplinkHandler {
  readonly action = 'navigate' as const

  constructor(
    private readonly ipc: IpcService,
    private readonly windowService: WindowService
  ) {}

  async handle(deeplink: ParsedDeeplink): Promise<DeeplinkResult> {
    // Build route from resource path
    const route = '/' + deeplink.resource

    try {
      // Send navigation event to renderer
      this.ipc.send('deeplink:navigate', {
        route,
        params: deeplink.params
      })

      // Focus window
      this.focusMainWindow()

      log.info(`[NavigateHandler] Navigate to: ${route}`)

      return {
        success: true,
        action: this.action,
        message: `Navigating to: ${route}`,
        data: { route, params: deeplink.params }
      }
    } catch (error) {
      log.error('[NavigateHandler] Navigation failed:', error)
      return {
        success: false,
        action: this.action,
        message: (error as Error).message
      }
    }
  }

  private focusMainWindow(): void {
    try {
      const mainWindow = this.windowService.getMainWindow()
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    } catch (error) {
      log.error('[NavigateHandler] Error focusing main window:', error)
    }
  }
}
