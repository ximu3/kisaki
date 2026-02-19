/**
 * Plugin Loader
 *
 * Handles loading, unloading, and reloading of main process plugins.
 */

import path from 'path'
import fse from 'fs-extra'
import log from 'electron-log/main'
import { app } from 'electron'
import semver from 'semver'
import type { PluginManifest } from './types'
import { PLUGIN_SCHEME } from '@main/bootstrap/protocol'
import type { PluginDevWait } from './dev-wait'
import type { RendererPluginEntry } from '@shared/plugin'

/** Plugin module interface - plugins export activate/deactivate functions */
interface PluginModule {
  activate(): void | Promise<void>
  deactivate?(): void | Promise<void>
}

/** Internal storage for loaded main process plugins */
export interface LoadedMainPlugin {
  id: string
  manifest: PluginManifest
  module: PluginModule
}

/**
 * Plugin loader for main process plugins.
 * Manages the lifecycle of plugins (load, unload, reload).
 */
export class PluginLoader {
  private pluginsDir: string
  private loadedPlugins = new Map<string, LoadedMainPlugin>()
  private pluginDirectories = new Map<string, string>()
  private disabledPlugins: Set<string>
  private devWait: PluginDevWait
  private hasDevPlugin: boolean

  constructor(
    pluginsDir: string,
    disabledPlugins: Set<string>,
    devWait: PluginDevWait,
    hasDevPlugin: boolean
  ) {
    this.pluginsDir = pluginsDir
    this.disabledPlugins = disabledPlugins
    this.devWait = devWait
    this.hasDevPlugin = hasDevPlugin
  }

  // ===========================================================================
  // Plugin Loading
  // ===========================================================================

  /**
   * Scan plugins directory and load all plugins.
   */
  async loadAllPlugins(): Promise<void> {
    try {
      const entries = await fse.readdir(this.pluginsDir, { withFileTypes: true })

      // Sort: @debug.* directories first (dev plugins take priority over installed)
      entries.sort((a, b) => {
        const aIsDebug = a.name.startsWith('@debug.')
        const bIsDebug = b.name.startsWith('@debug.')
        if (aIsDebug && !bIsDebug) return -1
        if (!aIsDebug && bIsDebug) return 1
        return 0
      })

      for (const entry of entries) {
        if (!entry.isDirectory() && !entry.isSymbolicLink()) continue
        const pluginPath = path.join(this.pluginsDir, entry.name)
        const manifestPath = path.join(pluginPath, 'manifest.json')

        if (await fse.pathExists(manifestPath)) {
          try {
            const manifest: PluginManifest = await fse.readJson(manifestPath)
            if (this.disabledPlugins.has(manifest.id)) {
              log.debug(`[PluginLoader] Skipping disabled plugin: ${manifest.id}`)
              continue
            }
            if (this.loadedPlugins.has(manifest.id)) {
              continue
            }
            await this.loadPlugin(pluginPath)
          } catch (error) {
            log.error(`[PluginLoader] Failed to load plugin in ${entry.name}:`, error)
          }
        }
      }

      const loadedCount = this.loadedPlugins.size
      if (loadedCount > 0) {
        log.info(`[PluginLoader] Loaded ${loadedCount} plugin(s)`)
      }
    } catch (error) {
      log.error('[PluginLoader] Failed to scan plugins directory:', error)
    }
  }

  /**
   * Load a single plugin from a directory
   */
  async loadPlugin(pluginPath: string): Promise<void> {
    const manifestPath = path.join(pluginPath, 'manifest.json')

    // Check manifest exists
    if (!(await fse.pathExists(manifestPath))) {
      throw new Error(`No manifest.json found in ${pluginPath}`)
    }

    // Read and validate manifest
    const manifest: PluginManifest = await fse.readJson(manifestPath)

    if (!manifest.id || !manifest.name || !manifest.version) {
      throw new Error(`Invalid manifest in ${pluginPath}: missing required fields`)
    }

    // Check if already loaded
    if (this.loadedPlugins.has(manifest.id)) {
      log.warn(`[PluginLoader] Plugin ${manifest.id} already loaded, skipping`)
      return
    }

    // Validate kisakiCompat (version compatibility)
    if (manifest.kisakiCompat) {
      const appVersion = app.getVersion()
      if (!semver.satisfies(appVersion, manifest.kisakiCompat)) {
        throw new Error(
          `Plugin ${manifest.id} requires Kisaki ${manifest.kisakiCompat}, current: ${appVersion}`
        )
      }
    }

    // Load plugin entry file (use manifest.main or default to 'main.js')
    const entryFile = manifest.main ?? 'main.js'
    const entryPath = path.join(pluginPath, entryFile)
    if (!(await fse.pathExists(entryPath))) {
      throw new Error(`Entry file '${entryFile}' not found in ${pluginPath}`)
    }

    // Use dynamic import for async loading with cache busting for hot reload
    const cacheBuster = `?t=${Date.now()}`
    const pluginModule = await import(`file://${entryPath}${cacheBuster}`)

    // Require named export pattern: export function activate() {}
    if (typeof pluginModule.activate !== 'function') {
      throw new Error(`Plugin ${manifest.id} does not export activate function`)
    }

    const activate = pluginModule.activate as () => void | Promise<void>
    const deactivate = pluginModule.deactivate as (() => void | Promise<void>) | undefined

    // Wait for debugger in dev-plugin mode
    if (this.hasDevPlugin) {
      await this.devWait.wait(`main:${manifest.id}`)
    }

    // Activate plugin (uses global kisaki object)
    await activate()

    // Store loaded plugin
    const mainModule: PluginModule = { activate, deactivate }
    this.loadedPlugins.set(manifest.id, { id: manifest.id, manifest, module: mainModule })
    this.pluginDirectories.set(manifest.id, pluginPath)
    log.info(`[PluginLoader] Loaded plugin: ${manifest.id}`)
  }

  /**
   * Unload a plugin by ID
   */
  async unloadPlugin(pluginId: string): Promise<void> {
    const loaded = this.loadedPlugins.get(pluginId)
    if (!loaded) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    // Call deactivate hook
    if (loaded.module.deactivate) {
      await loaded.module.deactivate()
    }

    // Note: UI registrations are cleaned up in renderer process via IPC event

    this.loadedPlugins.delete(pluginId)
    this.pluginDirectories.delete(pluginId)
    log.info(`[PluginLoader] Unloaded plugin: ${pluginId}`)
  }

  /**
   * Reload a plugin (unload then load)
   */
  async reloadPlugin(pluginId: string): Promise<void> {
    if (!this.loadedPlugins.has(pluginId)) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    const pluginPath = this.pluginDirectories.get(pluginId)
    if (!pluginPath) {
      throw new Error(`Plugin ${pluginId} directory not found`)
    }

    await this.unloadPlugin(pluginId)
    await this.loadPlugin(pluginPath)
  }

  // ===========================================================================
  // Getters
  // ===========================================================================

  /**
   * Get the plugins directory path
   */
  getPluginsDir(): string {
    return this.pluginsDir
  }

  /**
   * Get the directory path for a specific plugin
   */
  getPluginDirectory(pluginId: string): string | undefined {
    return this.pluginDirectories.get(pluginId)
  }

  /**
   * Get all loaded plugin manifests
   */
  getPluginManifests(): PluginManifest[] {
    return [...this.loadedPlugins.values()].map((p) => p.manifest)
  }

  /**
   * Get a loaded plugin by ID
   */
  getLoadedPlugin(pluginId: string): LoadedMainPlugin | undefined {
    return this.loadedPlugins.get(pluginId)
  }

  /**
   * Check if a plugin is loaded
   */
  hasPlugin(pluginId: string): boolean {
    return this.loadedPlugins.has(pluginId)
  }

  /**
   * Get renderer entry info for a plugin
   */
  getRendererEntry(pluginId: string): RendererPluginEntry | null {
    const pluginPath = this.pluginDirectories.get(pluginId)
    if (!pluginPath) return null

    try {
      const manifestPath = path.join(pluginPath, 'manifest.json')
      const manifest = fse.readJsonSync(manifestPath) as { renderer?: string }
      if (!manifest.renderer) return null

      // URL format: kisaki-plugin://plugin-id/path/to/renderer.mjs
      // The protocol handler uses pluginId to resolve the actual directory
      const rendererPath = manifest.renderer.replace(/\\/g, '/')
      return {
        id: pluginId,
        entry: `${PLUGIN_SCHEME}://${pluginId}/${rendererPath}`,
        enabled: !this.disabledPlugins.has(pluginId)
      }
    } catch {
      return null
    }
  }
}
