/**
 * Event subscription composable
 *
 * Provides a Vue-friendly way to subscribe to events from the event manager.
 * The subscription is automatically cleaned up when the component unmounts.
 */

import { onMounted, onUnmounted } from 'vue'
import { eventManager } from '@renderer/core/event'
import type { AppEvents, AppEventListener } from '@shared/events'

/**
 * Subscribe to an application event
 *
 * Automatically cleans up subscription on component unmount.
 *
 * @example
 * ```ts
 * useEvent('db:updated', ({ table, id }) => {
 *   if (table === 'games' && id === gameId.value) {
 *     refetch()
 *   }
 * })
 * ```
 */
export function useEvent<K extends keyof AppEvents>(event: K, handler: AppEventListener<K>): void {
  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    unsubscribe = eventManager.on(event, handler)
  })

  onUnmounted(() => {
    unsubscribe?.()
  })
}

/**
 * Subscribe to an application event once
 *
 * Handler is automatically removed after first invocation.
 */
export function useEventOnce<K extends keyof AppEvents>(
  event: K,
  handler: AppEventListener<K>
): void {
  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    unsubscribe = eventManager.once(event, handler)
  })

  onUnmounted(() => {
    unsubscribe?.()
  })
}
