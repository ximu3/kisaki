/**
 * Cross-process event type definitions
 *
 * Defines all application events that can be emitted in either main or renderer process.
 *
 * Plugin type extension:
 * Plugins can extend AppEvents via module declaration merging:
 * @example
 * // In plugin's shared/events.ts
 * declare module '@kisaki/plugin-sdk/main' {
 *   interface AppEvents {
 *     'my-plugin:data-updated': [data: MyData]
 *   }
 * }
 * // Or for renderer:
 * declare module '@kisaki/plugin-sdk/renderer' {
 *   interface AppEvents {
 *     'my-plugin:data-updated': [data: MyData]
 *   }
 * }
 */

import type { AppLocale } from './locale'
import type { TableName } from './db/table-names'

// =============================================================================
// Application Events
// =============================================================================

/**
 * Application event definitions
 *
 * This interface is exported and can be extended via declaration merging.
 * Each event maps to a tuple of its argument types.
 */
export interface AppEvents {
  // =========================================================================
  // Database Events
  // =========================================================================

  'db:ready': [boolean]
  'db:inserted': [{ table: TableName; id: string }]
  'db:updated': [{ table: TableName; id: string }]
  'db:deleted': [{ table: TableName; id: string }]

  // =========================================================================
  // Entity Events
  // =========================================================================

  // Game events
  'game:added': [{ gameId: string; name: string }]
  'game:removed': [{ gameId: string }]
  'game:updated': [{ gameId: string; fields: string[] }]
  'game:launched': [{ gameId: string; pid?: number }]
  'game:closed': [{ gameId: string; playTime?: number }]

  // Collection events
  'collection:added': [{ collectionId: string; name: string }]
  'collection:removed': [{ collectionId: string }]
  'collection:updated': [{ collectionId: string; fields: string[] }]

  // Character events
  'character:added': [{ characterId: string; name: string }]
  'character:removed': [{ characterId: string }]
  'character:updated': [{ characterId: string; fields: string[] }]

  // Person events
  'person:added': [{ personId: string; name: string }]
  'person:removed': [{ personId: string }]
  'person:updated': [{ personId: string; fields: string[] }]

  // Company events
  'company:added': [{ companyId: string; name: string }]
  'company:removed': [{ companyId: string }]
  'company:updated': [{ companyId: string; fields: string[] }]

  // Scanner events
  'scanner:added': [{ scannerId: string; name: string }]
  'scanner:removed': [{ scannerId: string }]
  'scanner:updated': [{ scannerId: string; fields: string[] }]
  'scanner:started': [{ scannerId: string; scannerName: string }]
  'scanner:progress': [{ scannerId: string; current: number; total: number }]
  'scanner:completed': [{ scannerId: string; stats: Record<string, number> }]
  'scanner:error': [{ scannerId: string; error: string }]

  // Monitor events
  'monitor:status-changed': [{ gameId: string; isRunning: boolean; isForeground: boolean }]
  'monitor:process-started': [{ gameId: string; pid: number; processName: string }]
  'monitor:process-stopped': [{ gameId: string; exitCode?: number }]
  'monitor:foreground-changed': [{ gameId: string; isForeground: boolean }]

  // Scraper profile events
  'scraper:fetch-started': [{ profileId: string; identifier: string }]
  'scraper:fetch-completed': [{ profileId: string; identifier: string; success: boolean }]
  'scraper:fetch-error': [{ profileId: string; identifier: string; error: string }]

  // Application events
  'app:ready': []
  'app:theme-changed': [{ theme: 'light' | 'dark' | 'system' }]
  'app:locale-changed': [{ locale: AppLocale | null }]
  'app:settings-changed': [{ setting: string; value: unknown }]
  'app:portable-mode-change-pending': [{ targetMode: 'portable' | 'normal' }]
  'app:portable-mode-change-cancelled': []

  // Plugin events
  'plugin:storage-changed': [{ pluginId: string; data: Record<string, unknown> }]
}

// =============================================================================
// Event Helper Types
// =============================================================================

/**
 * Event listener function type
 */
export type AppEventListener<K extends keyof AppEvents> = (
  ...args: AppEvents[K]
) => void | Promise<void>

/**
 * Event unsubscribe function
 */
export type EventUnsubscribe = () => void

/**
 * Event emitter options
 */
export interface EventEmitOptions {
  local?: boolean
}
