/**
 * Deeplink Service Types
 *
 * Internal types for the deeplink service implementation.
 */

import type { DeeplinkAction, ParsedDeeplink, DeeplinkResult } from '@shared/deeplink'

// Re-export shared types for convenience
export type { DeeplinkAction, ParsedDeeplink, DeeplinkResult } from '@shared/deeplink'

/**
 * Deeplink handler interface.
 * Each handler is responsible for processing a specific action type.
 */
export interface DeeplinkHandler {
  /** The action this handler processes */
  readonly action: DeeplinkAction

  /**
   * Handle the deeplink
   * @param deeplink - Parsed deeplink data
   * @returns Result of the handling operation
   */
  handle(deeplink: ParsedDeeplink): Promise<DeeplinkResult>
}
