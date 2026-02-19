/**
 * Kisaki Plugin SDK - Renderer Process API Types
 *
 * This file defines all types exposed to renderer process plugins.
 * Only exports types - no runtime values.
 *
 * Runtime values are accessed via the global `window.kisaki` object,
 * which is typed by KisakiRendererAPI.
 */

// =============================================================================
// Extension System Types
// =============================================================================

export type {
  UiExtensions,
  DetailTabDefinition,
  MenuActionDefinition,
  GameMenuActionContext,
  GameBatchMenuActionContext,
  CharacterMenuActionContext,
  PersonMenuActionContext,
  CompanyMenuActionContext,
  CollectionMenuActionContext,
  TagMenuActionContext,
  SidebarNavDefinition,
  SettingsDialogDefinition,
  ReactiveRegistry
} from '../ui-extensions'

// =============================================================================
// Theme System Types
// =============================================================================

export type { ThemeDefinition } from '../theme'

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
// Notify Types
// =============================================================================

export type { NotifyOptions, NotifyType, NotifyFunction } from '@shared/notify'

// =============================================================================
// Vue Ecosystem Types
// =============================================================================

export type { App } from 'vue'
export type { Router } from 'vue-router'
export type { Pinia } from 'pinia'

// =============================================================================
// Renderer API Interface (re-export from context.ts - single source of truth)
// =============================================================================

export type { KisakiRendererAPI } from './context'
