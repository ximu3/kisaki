/**
 * Renderer Plugin Loader
 *
 * Manages renderer-side plugin lifecycle through IPC events from main process.
 * Fully passive - listens for main process events to load/unload plugins.
 */

import type { IpcRendererEvent } from 'electron'
import type { RendererPluginEntry } from '@shared/plugin'
import { ipcManager } from '../ipc'

// =============================================================================
// Plugin Module Interface
// =============================================================================

/** Plugin module interface - plugins export activate/deactivate functions */
interface PluginModule {
  activate(): void | Promise<void>
  deactivate?(): void | Promise<void>
}

// =============================================================================
// Plugin Loader State
// =============================================================================

interface LoadedPlugin {
  id: string
  module: PluginModule
}

const loadedPlugins = new Map<string, LoadedPlugin>()

// Cleanup functions for IPC listeners
const cleanupFns: (() => void)[] = []

// =============================================================================
// Dev Wait State (dev-plugin mode only)
// =============================================================================

let isDevPluginMode = false
let devWaitPromise: Promise<void> | null = null
let devWaitResolve: (() => void) | null = null
let devContinued = false

/**
 * Initialize dev wait state by querying main process.
 * Handles race condition where main may have already continued before renderer initialized.
 */
async function initDevWaitState(): Promise<void> {
  const argsResult = await ipcManager.invoke('app:get-bootstrap-args')
  if (!argsResult.success || !argsResult.data.devPlugin) {
    return
  }

  isDevPluginMode = true

  // Then check if continue has already happened
  const result = await ipcManager.invoke('plugin:dev-is-continued')
  if (result.success && result.data) {
    devContinued = true
    console.log('[PluginLoader] Dev already continued (queried from main)')
  }
}

/**
 * Wait for dev continue signal in dev-plugin mode.
 * Creates a shared promise that blocks until main sends plugin:dev-continued event.
 */
async function waitForDevContinue(context?: string): Promise<void> {
  if (!isDevPluginMode) return

  // Already continued (queried from main or event received)
  if (devContinued) {
    console.log(`[PluginLoader] Dev already continued${context ? ` (${context})` : ''}`)
    return
  }

  if (devWaitPromise) {
    console.log(`[PluginLoader] Waiting for dev continue${context ? ` (${context})` : ''}`)
    await devWaitPromise
    return
  }

  devWaitPromise = new Promise((resolve) => {
    devWaitResolve = resolve
  })
  console.log(
    `[PluginLoader] Waiting for dev continue${context ? ` (${context})` : ''} - attach debugger to resume`
  )
  await devWaitPromise
}

/**
 * Release the dev wait gate.
 * Called when main process sends plugin:dev-continued event.
 */
function continueDevWait(): void {
  devContinued = true
  devWaitResolve?.()
  devWaitResolve = null
  devWaitPromise = null
  console.log('[PluginLoader] Dev wait continued')
}

// =============================================================================
// Plugin Loading
// =============================================================================

/**
 * Load a plugin from its entry URL.
 */
async function loadPlugin(id: string, entry: string): Promise<void> {
  // Dynamic import with cache busting for dev-plugin mode
  const cacheBuster = isDevPluginMode ? `?t=${Date.now()}` : ''

  const mod = await import(/* @vite-ignore */ `${entry}${cacheBuster}`)

  // Require named export pattern: export function activate() {}
  if (typeof mod.activate !== 'function') {
    throw new Error(`Plugin ${id} does not export activate function`)
  }

  const activate = mod.activate as () => void | Promise<void>
  const deactivate = mod.deactivate as (() => void | Promise<void>) | undefined

  // Wait for debugger in debug mode
  await waitForDevContinue(`renderer:${id}`)

  // Activate plugin - router/pinia are available via kisaki.router/kisaki.pinia
  await activate()

  // Store loaded plugin
  const pluginModule: PluginModule = { activate, deactivate }
  loadedPlugins.set(id, { id, module: pluginModule })

  console.log(`[PluginLoader] Loaded renderer plugin: ${id}`)
}

/**
 * Unload a specific plugin.
 * Called when plugin is disabled/uninstalled.
 */
async function unloadPlugin(pluginId: string): Promise<void> {
  const plugin = loadedPlugins.get(pluginId)
  if (!plugin) return

  // Call deactivate hook if exists
  await plugin.module.deactivate?.()

  loadedPlugins.delete(pluginId)
  console.log(`[PluginLoader] Unloaded renderer plugin: ${pluginId}`)
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Get all loaded plugin IDs
 */
export function getLoadedPlugins(): string[] {
  return [...loadedPlugins.keys()]
}

/**
 * Setup IPC event listeners for plugin lifecycle.
 * Listens to events from main process and loads/unloads plugins accordingly.
 */
export function setupPluginEventListeners(): void {
  // Listen for dev continue signal (dev-plugin mode only)
  // Always register this listener, as the mode is determined after init
  cleanupFns.push(
    ipcManager.on('plugin:dev-continued', () => {
      continueDevWait()
    })
  )

  // Listen for plugin loaded (initial load, install, or enable)
  cleanupFns.push(
    ipcManager.on(
      'plugin:loaded',
      (_e: IpcRendererEvent, _pluginId: string, entry: RendererPluginEntry | null) => {
        if (entry && !loadedPlugins.has(entry.id)) {
          loadPlugin(entry.id, entry.entry).catch((error) => {
            console.error(`[PluginLoader] Load failed for ${entry.id}:`, error)
          })
        }
      }
    )
  )

  // Listen for plugin unloaded (uninstall or disable)
  cleanupFns.push(
    ipcManager.on('plugin:unloaded', (_e: IpcRendererEvent, pluginId: string) => {
      if (loadedPlugins.has(pluginId)) {
        unloadPlugin(pluginId).catch((error) => {
          console.error(`[PluginLoader] Unload failed for ${pluginId}:`, error)
        })
      }
    })
  )

  // Listen for plugin reloaded (file watcher in debug mode)
  cleanupFns.push(
    ipcManager.on(
      'plugin:reloaded',
      (_e: IpcRendererEvent, _pluginId: string, entry: RendererPluginEntry | null) => {
        if (entry) {
          // Unload old version first, then load new version
          const reload = async () => {
            if (loadedPlugins.has(entry.id)) {
              await unloadPlugin(entry.id)
            }
            await loadPlugin(entry.id, entry.entry)
            console.log(`[PluginLoader] Hot reloaded: ${entry.id}`)
          }
          reload().catch((error) => {
            console.error(`[PluginLoader] Hot reload failed for ${entry.id}:`, error)
          })
        }
      }
    )
  )

  console.log('[PluginLoader] Event listeners setup for plugin lifecycle')
}

/**
 * Fetch initially loaded plugins from main process.
 * This handles the race condition where plugins may be loaded
 * before the renderer's event listeners are registered.
 */
export async function fetchInitialPlugins(): Promise<void> {
  // Initialize dev wait state first (query if continue already happened)
  await initDevWaitState()

  try {
    const result = await ipcManager.invoke('plugin:get-loaded-entries')
    if (result.success && result.data) {
      for (const entry of result.data) {
        if (!loadedPlugins.has(entry.id)) {
          try {
            await loadPlugin(entry.id, entry.entry)
          } catch (error) {
            console.error(`[PluginLoader] Initial load failed for ${entry.id}:`, error)
          }
        }
      }
    }
  } catch (error) {
    console.error('[PluginLoader] Failed to fetch initial plugins:', error)
  }
}
