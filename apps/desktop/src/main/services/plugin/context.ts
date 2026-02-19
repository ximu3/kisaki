/**
 * Main Process Plugin Context
 *
 * Provides KisakiMainAPI type definition and global initialization.
 * Full container exposure - plugins are first-class extensions.
 */

import * as electron from 'electron'
import * as schema from '@shared/db/schema'
import * as drizzle from 'drizzle-orm'
import type { ServiceContainer } from '@main/container'
import log from 'electron-log/main'

// =============================================================================
// Kisaki Main API
// =============================================================================

/**
 * Global API provided to main process plugins.
 * Accessed via `kisaki.xxx` global object.
 *
 * Design philosophy: Full exposure - plugins are trusted first-class extensions.
 * They run in the same process with no sandbox, so curated APIs provide no real security.
 */
export interface KisakiMainAPI {
  /** Service container - access any registered service via container.get() */
  readonly container: ServiceContainer

  /** Database schema for type-safe queries */
  readonly schema: typeof schema

  /** Logger - plugins add their own prefix, e.g. log.info('[MyPlugin]', 'message') */
  readonly log: typeof log

  /**
   * Shared external dependencies.
   * Plugins access these via SDK entry points (e.g., @kisaki/plugin-sdk/main/electron)
   */
  readonly __deps: {
    electron: typeof electron
    drizzle: typeof drizzle
  }
}

// =============================================================================
// Global Initialization
// =============================================================================

/**
 * Initialize the global kisaki object for main process plugins.
 * Called once during plugin service initialization.
 */
export function initializeKisakiGlobal(container: ServiceContainer): void {
  const kisakiAPI: KisakiMainAPI = {
    container,
    schema,
    log,
    __deps: {
      electron,
      drizzle
    }
  }

  ;(globalThis as unknown as { kisaki: KisakiMainAPI }).kisaki = kisakiAPI
}
