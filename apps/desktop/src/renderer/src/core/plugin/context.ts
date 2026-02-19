/**
 * Renderer Plugin Context
 *
 * Provides KisakiRendererAPI type definition and global initialization.
 * Full exposure - plugins are first-class extensions.
 */

import type { App } from 'vue'
import type { Router } from 'vue-router'
import type { Pinia } from 'pinia'
import * as vue from 'vue'
import * as vueRouter from 'vue-router'
import * as piniaModule from 'pinia'
import * as drizzle from 'drizzle-orm'
import log from 'electron-log/renderer'

import { db } from '../db'
import { eventManager } from '../event'
import { notify } from '../notify'
import { themeManager } from '../theme'
import { uiExtensions } from '../ui-extensions'
import * as schema from '@shared/db'
import * as composables from '@renderer/composables'
import * as stores from '@renderer/stores'
import * as ui from './ui'

// =============================================================================
// Kisaki Renderer API
// =============================================================================

/**
 * Global API provided to renderer process plugins.
 * Accessed via `kisaki.xxx` global object.
 *
 * Design philosophy: Full exposure - plugins are trusted first-class extensions.
 */
export interface KisakiRendererAPI {
  /** Vue app instance (for advanced usage like app.config) */
  readonly app: App

  /** Router instance - use in activate/deactivate, components use useRouter() */
  readonly router: Router

  /** Pinia instance - use in activate/deactivate, components use stores directly */
  readonly pinia: Pinia

  /** Database access (via IPC proxy) - full Drizzle API */
  readonly db: typeof db

  /** Schema for type-safe queries */
  readonly schema: typeof schema

  /** Event manager for subscribing/emitting events */
  readonly events: typeof eventManager

  /** UI extension registry - register and query UI extensions */
  readonly extensions: typeof uiExtensions

  /** Theme system - register themes + control active theme/mode */
  readonly themes: typeof themeManager

  /** Notification API */
  readonly notify: typeof notify

  /** Core composables */
  readonly composables: typeof composables

  /** Core stores */
  readonly stores: typeof stores

  /** UI components */
  readonly ui: typeof ui

  /** Logger - unified logging via electron-log */
  readonly log: typeof log

  /**
   * Shared external dependencies.
   * Plugins access these via SDK entry points (e.g., @kisaki/plugin-sdk/renderer/vue)
   */
  readonly __deps: {
    vue: typeof import('vue')
    'vue-router': typeof import('vue-router')
    pinia: typeof import('pinia')
    drizzle: typeof import('drizzle-orm')
  }
}

// =============================================================================
// Global Initialization
// =============================================================================

interface InitOptions {
  app: App
  router: Router
  pinia: Pinia
}

/**
 * Initialize the global kisaki object for renderer process plugins.
 * Called once during app initialization, before plugins are loaded.
 */
export function initializeKisakiGlobal({ app, router, pinia }: InitOptions): void {
  const kisakiAPI: KisakiRendererAPI = {
    app,
    router,
    pinia,
    db,
    schema,
    events: eventManager,
    extensions: uiExtensions,
    themes: themeManager,
    notify,
    composables,
    stores,
    ui,
    log,
    __deps: {
      vue,
      'vue-router': vueRouter,
      pinia: piniaModule,
      drizzle
    }
  }

  // Set on window and globalThis
  ;(window as unknown as { kisaki: KisakiRendererAPI }).kisaki = kisakiAPI
  ;(globalThis as unknown as { kisaki: KisakiRendererAPI }).kisaki = kisakiAPI
}
