/**
 * Deeplink Router
 *
 * Routes deeplink requests to appropriate handlers based on action type.
 */

import type { DeeplinkAction, ParsedDeeplink, DeeplinkResult, DeeplinkHandler } from './types'

export class DeeplinkRouter {
  private handlers = new Map<DeeplinkAction, DeeplinkHandler>()

  /**
   * Register a handler for a specific action
   */
  register(handler: DeeplinkHandler): void {
    this.handlers.set(handler.action, handler)
  }

  /**
   * Unregister a handler
   */
  unregister(action: DeeplinkAction): void {
    this.handlers.delete(action)
  }

  /**
   * Route a deeplink to its handler
   */
  async route(deeplink: ParsedDeeplink): Promise<DeeplinkResult> {
    const handler = this.handlers.get(deeplink.action)

    if (!handler) {
      return {
        success: false,
        action: deeplink.action,
        message: `Unknown action: ${deeplink.action}`
      }
    }

    return handler.handle(deeplink)
  }

  /**
   * Get all registered action types
   */
  getRegisteredActions(): DeeplinkAction[] {
    return Array.from(this.handlers.keys())
  }

  /**
   * Check if an action has a registered handler
   */
  hasHandler(action: DeeplinkAction): boolean {
    return this.handlers.has(action)
  }
}
