/**
 * Deeplink Handler
 *
 * Handles deeplink events from the main process in the renderer.
 */

import { ipcManager } from './ipc'
import { router } from './router'
import log from 'electron-log/renderer'

/**
 * Setup deeplink event handlers.
 * Should be called during app initialization.
 */
export function setupDeeplinkHandlers(): void {
  // Handle navigation events
  ipcManager.on('deeplink:navigate', (_, { route, params }) => {
    log.info(`[Deeplink] Navigating to: ${route}`)
    router.push({ path: route, query: params })
  })

  // Handle auth callback events
  ipcManager.on('deeplink:auth-callback', (_, { provider, code, state }) => {
    log.info(`[Deeplink] Auth callback from: ${provider}`)
    // Emit a custom event that auth-related components can listen to
    window.dispatchEvent(
      new CustomEvent('kisaki:auth-callback', {
        detail: { provider, code, state }
      })
    )
  })

  // Handle auth error events
  ipcManager.on('deeplink:auth-error', (_, { provider, error, errorDescription }) => {
    log.error(`[Deeplink] Auth error from ${provider}: ${error}`)
    // Emit a custom event that auth-related components can listen to
    window.dispatchEvent(
      new CustomEvent('kisaki:auth-error', {
        detail: { provider, error, errorDescription }
      })
    )
  })

  log.info('[Deeplink] Handlers initialized')
}

/**
 * Trigger a deeplink from the renderer process.
 * Useful for testing or programmatic deeplink handling.
 */
export async function handleDeeplink(url: string): Promise<boolean> {
  const result = await ipcManager.invoke('deeplink:handle', url)
  if (result.success) {
    return result.data.success
  }
  return false
}

/**
 * Get all registered deeplink actions.
 */
export async function getDeeplinkActions(): Promise<string[]> {
  const result = await ipcManager.invoke('deeplink:get-actions')
  if (result.success) {
    return result.data
  }
  return []
}
