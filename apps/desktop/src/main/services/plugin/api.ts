/**
 * Kisaki Plugin SDK - Main Process API Types
 *
 * This file defines all types exposed to main process plugins.
 * Only exports types - no runtime values.
 *
 * Runtime values are accessed via the global `kisaki` object,
 * which is typed by KisakiMainAPI.
 */

// =============================================================================
// Service Container Types
// =============================================================================

export type { ServiceContainer } from '../../container'
export type {
  IService,
  ServiceStatus,
  ServiceRegistry,
  ServiceName,
  ServiceType
} from '../../container/types'

// =============================================================================
// Plugin System Types
// =============================================================================

export type { PluginManifest } from './types'
export type { PluginCategory } from '@shared/plugin'

// =============================================================================
// IPC Types (for declaration merging)
// =============================================================================

export type {
  IpcResult,
  IpcVoidResult,
  IpcSuccess,
  IpcSuccessVoid,
  IpcError,
  ExtractIpcData,
  IpcMainListeners,
  IpcMainHandlers,
  IpcRendererEvents
} from '@shared/ipc'

// =============================================================================
// Event System Types (for declaration merging)
// =============================================================================

export type {
  AppEvents,
  AppEventListener,
  EventUnsubscribe,
  EventEmitOptions
} from '@shared/events'

// =============================================================================
// Main API Interface (re-export from context.ts - single source of truth)
// =============================================================================

export type { KisakiMainAPI } from './context'
