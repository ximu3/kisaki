/**
 * Launch Handler
 *
 * Handles kisaki://launch/* deeplinks for launching games.
 *
 * Supported URLs:
 * - kisaki://launch/game/{gameId}
 */

import log from 'electron-log/main'
import type { DeeplinkHandler, ParsedDeeplink, DeeplinkResult } from '../types'
import type { LauncherService } from '@main/services/launcher'

export class LaunchHandler implements DeeplinkHandler {
  readonly action = 'launch' as const

  constructor(private readonly launcher: LauncherService) {}

  async handle(deeplink: ParsedDeeplink): Promise<DeeplinkResult> {
    // Parse resource: game/{gameId}
    const [resourceType, resourceId] = deeplink.resource.split('/')

    if (resourceType === 'game' && resourceId) {
      return this.launchGame(resourceId)
    }

    return {
      success: false,
      action: this.action,
      message: `Unknown launch resource: ${resourceType}`
    }
  }

  private async launchGame(gameId: string): Promise<DeeplinkResult> {
    try {
      // Launch the game
      await this.launcher.game.launchGame(gameId, { cancelBehavior: 'throw' })

      log.info(`[LaunchHandler] Launched game via deeplink: ${gameId}`)

      return {
        success: true,
        action: this.action,
        message: `Launched: ${gameId}`,
        data: { gameId }
      }
    } catch (error) {
      log.error(`[LaunchHandler] Failed to launch game ${gameId}:`, error)
      return {
        success: false,
        action: this.action,
        message: (error as Error).message
      }
    }
  }
}
