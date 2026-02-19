/**
 * Auth Handler
 *
 * Handles kisaki://auth/* deeplinks for OAuth callbacks.
 *
 * Supported URLs:
 * - kisaki://auth/callback?provider={provider}&code={code}&state={state}
 * - kisaki://auth/callback?provider={provider}&error={error}&error_description={desc}
 */

import log from 'electron-log/main'
import type { DeeplinkHandler, ParsedDeeplink, DeeplinkResult } from '../types'
import type { IpcService } from '@main/services/ipc'
import type { WindowService } from '@main/services/window'

export class AuthHandler implements DeeplinkHandler {
  readonly action = 'auth' as const

  constructor(
    private readonly ipc: IpcService,
    private readonly windowService: WindowService
  ) {}

  async handle(deeplink: ParsedDeeplink): Promise<DeeplinkResult> {
    // Parse resource type
    const resourceType = deeplink.resource.split('/')[0]

    if (resourceType === 'callback') {
      return this.handleCallback(deeplink.params)
    }

    return {
      success: false,
      action: this.action,
      message: `Unknown auth resource: ${resourceType}`
    }
  }

  private async handleCallback(params: Record<string, string>): Promise<DeeplinkResult> {
    const { provider, code, state, error, error_description } = params

    if (!provider) {
      return {
        success: false,
        action: this.action,
        message: 'Provider is required'
      }
    }

    // Handle error callback
    if (error) {
      log.warn(`[AuthHandler] Auth error from ${provider}: ${error}`)

      // Send error event to renderer
      this.ipc.send('deeplink:auth-error', {
        provider,
        error,
        errorDescription: error_description
      })

      // Focus window to show error
      this.focusMainWindow()

      return {
        success: false,
        action: this.action,
        message: error_description || error,
        data: { provider, error }
      }
    }

    // Validate code
    if (!code) {
      return {
        success: false,
        action: this.action,
        message: 'Authorization code is required'
      }
    }

    log.info(`[AuthHandler] Auth callback received from ${provider}`)

    // Send callback event to renderer for processing
    this.ipc.send('deeplink:auth-callback', { provider, code, state })

    // Focus window
    this.focusMainWindow()

    return {
      success: true,
      action: this.action,
      message: `Auth callback received from ${provider}`,
      data: { provider, hasCode: true, state }
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
      log.error('[AuthHandler] Error focusing main window:', error)
    }
  }
}
