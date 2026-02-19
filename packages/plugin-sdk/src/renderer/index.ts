/**
 * Kisaki Plugin SDK - Renderer Process Core API
 *
 * Core APIs for renderer process plugins.
 * For specialized imports, use sub-paths:
 * - '@kisaki/plugin-sdk/renderer/tables' - Table definitions only
 * - '@kisaki/plugin-sdk/renderer/ui' - UI components
 * - '@kisaki/plugin-sdk/renderer/composables' - Vue composables
 * - '@kisaki/plugin-sdk/renderer/stores' - Pinia stores
 */

import type { KisakiRendererAPI } from '../types/renderer.plugin'

// Access global kisaki object injected by host app
const w = (typeof window !== 'undefined' ? window : globalThis) as unknown as {
  kisaki: KisakiRendererAPI
}

// =============================================================================
// Database Access
// =============================================================================

/**
 * Database access via IPC proxy - full Drizzle API
 * @example
 * const games = await db.select().from(schema.games)
 */
export const db: KisakiRendererAPI['db'] = w.kisaki.db

/**
 * Database schema for type-safe queries (full access)
 * For table definitions only, use '@kisaki/plugin-sdk/renderer/tables'
 * @example
 * import { eq } from 'drizzle-orm'
 * db.select().from(schema.games).where(eq(schema.games.id, 'xxx'))
 */
export const schema: KisakiRendererAPI['schema'] = w.kisaki.schema

// =============================================================================
// Event System
// =============================================================================

/**
 * Event manager for subscribing/emitting events
 * @example
 * events.on('game:added', ({ gameId }) => console.log(gameId))
 */
export const events: KisakiRendererAPI['events'] = w.kisaki.events

// =============================================================================
// Extension System
// =============================================================================

/**
 * Extension registry for registering UI extensions
 * @example
 * const dispose = extensions.detailTabs.game.register({
 *   id: 'my-tab',
 *   label: 'My Tab',
 *   component: MyComponent
 * })
 * // ... later in deactivate()
 * dispose()
 */
export const extensions: KisakiRendererAPI['extensions'] = w.kisaki.extensions

// =============================================================================
// Theme System
// =============================================================================

/**
 * Theme system API (register themes, switch preset, toggle light/dark)
 */
export const themes: KisakiRendererAPI['themes'] = w.kisaki.themes

// =============================================================================
// Notification API
// =============================================================================

/**
 * Notification API
 * @example
 * notify.success('Operation completed!')
 */
export const notify: KisakiRendererAPI['notify'] = w.kisaki.notify

// =============================================================================
// Vue Ecosystem
// =============================================================================

/**
 * Vue app instance (advanced usage - for app.config etc.)
 * For Vue APIs (ref, computed...), use '@kisaki/plugin-sdk/renderer/vue'
 */
export const app: KisakiRendererAPI['app'] = w.kisaki.app

/**
 * Router instance - use in activate/deactivate functions
 * For Vue components, prefer useRouter() from '@kisaki/plugin-sdk/renderer/vue-router'
 */
export const router: KisakiRendererAPI['router'] = w.kisaki.router

/**
 * Pinia instance - use in activate/deactivate functions
 * For Vue components, access stores directly from '@kisaki/plugin-sdk/renderer/stores'
 */
export const pinia: KisakiRendererAPI['pinia'] = w.kisaki.pinia

// =============================================================================
// Logging
// =============================================================================

/**
 * Logger - unified logging via electron-log
 * Logs are sent to main process and written to file
 * @example
 * log.info('[MyPlugin]', 'Plugin activated')
 * log.error('[MyPlugin]', 'Something went wrong', error)
 */
export const log: KisakiRendererAPI['log'] = w.kisaki.log

// Re-export all types for module augmentation support
export type * from '../types/renderer.plugin'
