/**
 * Demo Plugin - Shared IPC Type Definitions
 *
 * Define your plugin's IPC types here. For simple data operations like
 * settings, use direct db access in renderer instead of IPC.
 */

import type { IpcVoidResult } from '@kisaki/plugin-sdk/main'

/**
 * Plugin IPC handlers (request-response from renderer to main)
 */
export interface PluginIpcHandlers {
  /** Example: Ping the main process */
  'demo-plugin:ping': () => IpcVoidResult
}

/**
 * Plugin IPC listeners (one-way messages from renderer to main)
 */
export interface PluginIpcListeners {
  /** Example: Log a message from renderer */
  'demo-plugin:log': [message: string]
}
