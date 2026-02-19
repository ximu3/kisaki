/**
 * Type Augmentation for Renderer Process
 *
 * DO NOT EDIT - This file bridges your plugin's types to the SDK.
 * Define your IPC/Event types in src/shared/ instead.
 */

import type { PluginIpcListeners, PluginIpcHandlers } from '../shared/ipc'
import type { PluginEvents } from '../shared/events'

declare module '@kisaki/plugin-sdk/renderer' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IpcMainListeners extends PluginIpcListeners {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IpcMainHandlers extends PluginIpcHandlers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AppEvents extends PluginEvents {}
}
