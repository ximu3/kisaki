/**
 * Kisaki Plugin SDK - Main Process Core API
 *
 * Core APIs for main process plugins.
 * For table definitions only, use '@kisaki/plugin-sdk/main/tables'.
 */

import type { KisakiMainAPI } from '../types/main.plugin'

// Access global kisaki object injected by host app
const g = globalThis as unknown as { kisaki: KisakiMainAPI }

/**
 * Service container - access any registered service
 * @example
 * const ipc = container.get('ipc')
 * const db = container.get('db')
 */
export const container: KisakiMainAPI['container'] = g.kisaki.container

/**
 * Database schema for type-safe queries (full access)
 * For table definitions only, use '@kisaki/plugin-sdk/main/tables'
 * @example
 * import { schema } from '@kisaki/plugin-sdk/main'
 * const games = schema.games
 */
export const schema: KisakiMainAPI['schema'] = g.kisaki.schema

/**
 * Logger instance
 * @example
 * log.info('[MyPlugin]', 'Plugin activated')
 */
export const log: KisakiMainAPI['log'] = g.kisaki.log

// Re-export all types for module augmentation support
export type * from '../types/main.plugin'
