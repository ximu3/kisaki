/**
 * IPC subscription composable
 *
 * Provides a Vue-friendly way to subscribe to IPC events from the main process.
 * The subscription is automatically cleaned up when the component unmounts.
 */

import { onMounted, onUnmounted } from 'vue'
import { ipcManager } from '@renderer/core/ipc'
import type { IpcRendererEvents } from '@shared/ipc'

/**
 * Subscribe to an IPC event from main process
 *
 * Automatically cleans up subscription on component unmount.
 *
 * @example
 * ```ts
 * useIpc('native:main-window-maximized', () => {
 *   isMaximized.value = true
 * })
 * ```
 */
export function useIpc<K extends keyof IpcRendererEvents>(
  channel: K,
  handler: (e: Electron.IpcRendererEvent, ...args: IpcRendererEvents[K]) => void
): void {
  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    unsubscribe = ipcManager.on(channel, handler)
  })

  onUnmounted(() => {
    unsubscribe?.()
  })
}

/**
 * Subscribe to an IPC event from main process once
 *
 * Handler is automatically removed after first invocation.
 */
export function useIpcOnce<K extends keyof IpcRendererEvents>(
  channel: K,
  handler: (e: Electron.IpcRendererEvent, ...args: IpcRendererEvents[K]) => void | Promise<void>
): void {
  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    unsubscribe = ipcManager.once(channel, handler)
  })

  onUnmounted(() => {
    unsubscribe?.()
  })
}
