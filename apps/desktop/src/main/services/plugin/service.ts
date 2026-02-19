/**
 * Plugin Service
 *
 * Unified entry point for the plugin system.
 * Provides plugin loading, UI extensions, storage, and logging.
 *
 * Submodules:
 * - loader: Plugin loading, unloading, reloading
 * - watcher: File watching for hot reload
 * - registry: Plugin source resolution
 * - installer: Plugin installation and updates
 */

import { app, net, protocol } from 'electron'
import path from 'path'
import { pathToFileURL } from 'url'
import fse from 'fs-extra'
import log from 'electron-log/main'
import type { IService, ServiceContainer, ServiceInitContainer, ServiceName } from '@main/container'
import type { IpcService } from '@main/services/ipc'
import type { PluginManifest } from './types'
import { PLUGIN_SCHEME } from '@main/bootstrap/protocol'
import { getBootstrapArgs } from '@main/bootstrap/args'
import type { RendererPluginEntry } from '@shared/plugin'

import { PluginRegistryManager } from './registry'
import { PluginInstaller } from './installer'
import { GitHubRegistryProvider, LocalFileRegistryProvider } from './registries'
import { PluginLoader, type LoadedMainPlugin } from './loader'
import { PluginWatcher } from './watcher'
import { PluginDevWait } from './dev-wait'
import { initializeKisakiGlobal } from './context'

export class PluginService implements IService {
  readonly id = 'plugin'
  readonly deps = ['ipc', 'network'] as const satisfies readonly ServiceName[]

  /** Plugin registry manager for resolving plugin sources */
  registry!: PluginRegistryManager

  /** Plugin installer for downloading and installing plugins */
  installer!: PluginInstaller

  /** Plugin loader for managing plugin lifecycle */
  loader!: PluginLoader

  /** Plugin watcher for hot reload (dev-plugin mode only) */
  private watcher: PluginWatcher | null = null

  /** Plugin development wait gate (dev-plugin mode only) */
  readonly devWait = new PluginDevWait()

  /** Whether running in dev-plugin mode (--dev-plugin argument) */
  private hasDevPlugin = false

  private pluginsDir!: string
  private disabledPlugins = new Set<string>()
  private disabledConfigPath!: string
  private ipcService!: IpcService

  async init(container: ServiceInitContainer<this>): Promise<void> {
    this.pluginsDir = path.join(app.getPath('userData'), 'plugins')
    this.disabledConfigPath = path.join(this.pluginsDir, '.disabled.json')

    this.ipcService = container.get('ipc')
    const networkService = container.get('network')

    // Ensure plugins directory exists
    await fse.ensureDir(this.pluginsDir)

    // Clean up stale debug links (may remain from abnormal exit)
    await this.cleanupStaleDebugLinks()

    // Load disabled state
    await this.loadDisabledState()

    // Initialize global kisaki object for plugins
    initializeKisakiGlobal(container as unknown as ServiceContainer)

    // Initialize submodules
    // Initialize registry with providers
    this.registry = new PluginRegistryManager()
    this.registry.register(new GitHubRegistryProvider(networkService))
    this.registry.register(new LocalFileRegistryProvider())

    // Initialize installer
    this.installer = new PluginInstaller(this.pluginsDir, this.registry)

    // Check for --dev-plugin argument
    const args = getBootstrapArgs()
    if (args.devPlugin) {
      this.hasDevPlugin = true
    }

    // Initialize loader with dev-plugin mode flag
    this.loader = new PluginLoader(
      this.pluginsDir,
      this.disabledPlugins,
      this.devWait,
      this.hasDevPlugin
    )

    // Register plugin protocol handler
    this.setupPluginProtocol()

    // Setup IPC handlers
    this.setupPluginManagementIpc()
    this.setupInstallationIpc()

    // Setup dev-plugin mode features
    if (this.hasDevPlugin) {
      this.setupDevWaitIpc()

      // Setup file watcher for hot reload
      this.watcher = new PluginWatcher(this.pluginsDir, this.loader)
      this.watcher.onReload((pluginId) => {
        this.sendPluginEvent('plugin:reloaded', pluginId)
      })
      this.watcher.start()

      // Load dev plugin
      await this.loadDevPlugin(args.devPlugin!)
    }

    log.info('[PluginService] Initialized')
  }

  async dispose(): Promise<void> {
    // Release any pending dev wait to allow clean shutdown
    this.devWait.continue()

    await this.stopWatcher()

    for (const manifest of this.loader.getPluginManifests()) {
      try {
        await this.loader.unloadPlugin(manifest.id)
      } catch (error) {
        log.warn(`[PluginService] Failed to unload plugin ${manifest.id}:`, error)
      }
    }

    log.info('[PluginService] Disposed')
  }

  /**
   * Setup kisaki-plugin:// protocol handler for serving plugin files
   */
  private setupPluginProtocol(): void {
    protocol.handle(PLUGIN_SCHEME, (request) => {
      // URL format: kisaki-plugin://plugin-id/path/to/file.mjs
      const url = new URL(request.url)
      const pluginId = url.hostname
      const filePath = url.pathname.replace(/^\//, '')

      const pluginDir = this.loader.getPluginDirectory(pluginId)
      if (!pluginDir) {
        return new Response('Plugin not found', { status: 404 })
      }

      const fullPath = path.join(pluginDir, filePath)

      // Verify the file is within the plugin directory (security)
      if (!fullPath.startsWith(pluginDir)) {
        return new Response('Access denied', { status: 403 })
      }

      const fileUrl = pathToFileURL(fullPath).toString()
      return net.fetch(fileUrl)
    })
  }

  private setupDevWaitIpc(): void {
    // Query if continue has already happened (for renderer initialization)
    this.ipcService.handle('plugin:dev-is-continued', () => {
      return { success: true, data: this.devWait.isContinued() }
    })

    // When debugger is detected and wait is released, notify renderer
    this.devWait.setOnContinue(() => {
      this.ipcService.send('plugin:dev-continued')
    })

    log.info('[PluginService] Dev wait IPC registered')
  }

  /**
   * Load a development plugin from path.
   * Creates @debug.{id} symlink and loads the plugin.
   */
  private async loadDevPlugin(pluginPath: string): Promise<void> {
    // Validate path
    const manifestPath = path.join(pluginPath, 'manifest.json')
    if (!(await fse.pathExists(manifestPath))) {
      log.error(`[PluginService] Invalid dev plugin path: ${pluginPath}`)
      return
    }

    // Read manifest to get plugin ID
    const manifest = await fse.readJson(manifestPath)
    const pluginId = manifest.id as string

    // Create @debug.{id} symlink
    const debugLinkPath = path.join(this.pluginsDir, `@debug.${pluginId}`)
    await fse.remove(debugLinkPath)
    await fse.ensureSymlink(pluginPath, debugLinkPath, 'junction')

    log.info(`[PluginService] Dev plugin linked: ${pluginId} -> ${pluginPath}`)
  }

  private setupPluginManagementIpc(): void {
    this.ipcService.handle('plugin:disable', async (_, pluginId: string) => {
      try {
        await this.disablePlugin(pluginId)
        this.sendPluginEvent('plugin:unloaded', pluginId)
        return { success: true }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    this.ipcService.handle('plugin:enable', async (_, pluginId: string) => {
      try {
        await this.enablePlugin(pluginId)
        this.sendPluginEvent('plugin:loaded', pluginId)
        return { success: true }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    this.ipcService.handle('plugin:is-disabled', (_, pluginId: string) => {
      return { success: true, data: this.isPluginDisabled(pluginId) }
    })
  }

  private setupInstallationIpc(): void {
    this.ipcService.handle('plugin:install', async (_, source: string) => {
      try {
        const installed = await this.installer.install(source)
        if (!installed) {
          return { success: false, error: 'Cancelled' }
        }

        if (!this.isPluginDisabled(installed.pluginId)) {
          await this.loader.loadPlugin(installed.directory)
          this.sendPluginEvent('plugin:loaded', installed.pluginId)
        }
        return { success: true }
      } catch (error) {
        log.error('[PluginService] plugin:install failed:', error)
        return { success: false, error: (error as Error).message }
      }
    })

    this.ipcService.handle('plugin:install-from-file', async (_, filePath: string) => {
      try {
        const installed = await this.installer.installFromFile(filePath)
        if (!installed) {
          return { success: false, error: 'Cancelled' }
        }

        if (!this.isPluginDisabled(installed.pluginId)) {
          await this.loader.loadPlugin(installed.directory)
          this.sendPluginEvent('plugin:loaded', installed.pluginId)
        }
        return { success: true }
      } catch (error) {
        log.error('[PluginService] plugin:install-from-file failed:', error)
        return { success: false, error: (error as Error).message }
      }
    })

    this.ipcService.handle('plugin:uninstall', async (_, pluginId: string) => {
      try {
        if (this.loader.hasPlugin(pluginId)) {
          await this.loader.unloadPlugin(pluginId)
        }
        this.sendPluginEvent('plugin:unloaded', pluginId)
        await this.installer.uninstall(pluginId)
        return { success: true }
      } catch (error) {
        log.error('[PluginService] plugin:uninstall failed:', error)
        return { success: false, error: (error as Error).message }
      }
    })

    this.ipcService.handle('plugin:check-updates', async () => {
      try {
        const updates = await this.installer.checkUpdates()
        return { success: true, data: updates }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    this.ipcService.handle('plugin:update', async (_, pluginId: string) => {
      try {
        const wasLoaded = this.loader.hasPlugin(pluginId)
        if (wasLoaded) {
          await this.loader.unloadPlugin(pluginId)
        }

        const updated = await this.installer.update(pluginId)
        if (!updated) {
          if (wasLoaded && !this.isPluginDisabled(pluginId)) {
            await this.loader.loadPlugin(this.getPluginDir(pluginId))
          }
          return { success: false, error: 'Cancelled' }
        }

        if (!this.isPluginDisabled(pluginId)) {
          await this.loader.loadPlugin(updated.directory)
        }
        return { success: true }
      } catch (error) {
        log.error('[PluginService] plugin:update failed:', error)
        return { success: false, error: (error as Error).message }
      }
    })

    this.ipcService.handle('plugin:get-installed', async () => {
      try {
        const plugins = await this.installer.getInstalledPlugins()
        return { success: true, data: plugins }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    this.ipcService.handle('plugin:get-registries', () => {
      try {
        const registries = this.registry.getSearchableProviders()
        return { success: true, data: registries }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    this.ipcService.handle(
      'plugin:search',
      async (
        _,
        registryName: string,
        query: string,
        options?: { page?: number; limit?: number }
      ) => {
        try {
          const result = await this.registry.search(registryName, query, options)
          return { success: true, data: result }
        } catch (error) {
          return { success: false, error: (error as Error).message }
        }
      }
    )

    // Handler for renderer to fetch initially loaded plugins
    this.ipcService.handle('plugin:get-loaded-entries', () => {
      try {
        const entries: RendererPluginEntry[] = []
        for (const manifest of this.loader.getPluginManifests()) {
          const entry = this.loader.getRendererEntry(manifest.id)
          if (entry) {
            entries.push(entry)
          }
        }
        return { success: true, data: entries }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })
  }

  // ===========================================================================
  // Disabled State Management
  // ===========================================================================

  private getPluginDir(pluginId: string): string {
    return path.join(this.pluginsDir, pluginId)
  }

  private async loadDisabledState(): Promise<void> {
    try {
      if (await fse.pathExists(this.disabledConfigPath)) {
        const data = await fse.readJson(this.disabledConfigPath)
        this.disabledPlugins = new Set(data.disabled || [])
      }
    } catch {
      this.disabledPlugins = new Set()
    }
  }

  private async saveDisabledState(): Promise<void> {
    await fse.writeJson(
      this.disabledConfigPath,
      { disabled: [...this.disabledPlugins] },
      { spaces: 2 }
    )
  }

  async disablePlugin(pluginId: string): Promise<void> {
    if (this.loader.hasPlugin(pluginId)) {
      await this.loader.unloadPlugin(pluginId)
    }
    this.disabledPlugins.add(pluginId)
    await this.saveDisabledState()
    log.info(`[PluginService] Disabled plugin: ${pluginId}`)
  }

  async enablePlugin(pluginId: string): Promise<void> {
    if (!this.disabledPlugins.has(pluginId)) return
    this.disabledPlugins.delete(pluginId)
    await this.saveDisabledState()

    // Find and load the plugin
    const entries = await fse.readdir(this.pluginsDir, { withFileTypes: true })
    for (const entry of entries) {
      // Handle both directories and symlinks/junctions (local dev links)
      if (entry.isDirectory() || entry.isSymbolicLink()) {
        const pluginPath = path.join(this.pluginsDir, entry.name)
        const manifestPath = path.join(pluginPath, 'manifest.json')
        if (await fse.pathExists(manifestPath)) {
          const manifest = await fse.readJson(manifestPath)
          if (manifest.id === pluginId) {
            await this.loader.loadPlugin(pluginPath)
            log.info(`[PluginService] Enabled plugin: ${pluginId}`)
            return
          }
        }
      }
    }
  }

  isPluginDisabled(pluginId: string): boolean {
    return this.disabledPlugins.has(pluginId)
  }

  // ===========================================================================
  // Delegated Methods (for external access)
  // ===========================================================================

  /**
   * Scan plugins directory and load all plugins.
   * Emits plugin:loaded event for each plugin with a renderer entry.
   */
  async loadAllPlugins(): Promise<void> {
    await this.loader.loadAllPlugins()

    // Notify renderer about each loaded plugin with renderer entry
    for (const manifest of this.loader.getPluginManifests()) {
      this.sendPluginEvent('plugin:loaded', manifest.id)
    }
  }

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
    return this.loader.getPluginDirectory(pluginId)
  }

  /**
   * Get all loaded plugin manifests
   */
  getPluginManifests(): PluginManifest[] {
    return this.loader.getPluginManifests()
  }

  /**
   * Get a loaded plugin by ID
   */
  getLoadedPlugin(pluginId: string): LoadedMainPlugin | undefined {
    return this.loader.getLoadedPlugin(pluginId)
  }

  /**
   * Check if a plugin is loaded
   */
  hasPlugin(pluginId: string): boolean {
    return this.loader.hasPlugin(pluginId)
  }

  /**
   * Get renderer entry info for a plugin
   */
  getRendererEntry(pluginId: string): RendererPluginEntry | null {
    return this.loader.getRendererEntry(pluginId)
  }

  // ===========================================================================
  // Hot Reload Support
  // ===========================================================================

  /**
   * Send plugin lifecycle event to renderer
   */
  private sendPluginEvent(
    event: 'plugin:loaded' | 'plugin:unloaded' | 'plugin:reloaded',
    pluginId: string
  ): void {
    if (event === 'plugin:unloaded') {
      this.ipcService.send(event, pluginId)
    } else {
      // Events with entry payload (loaded, reloaded)
      const entry = this.loader.getRendererEntry(pluginId)
      this.ipcService.send(event, pluginId, entry)
    }
  }

  /**
   * Stop the file watcher (cleanup)
   */
  async stopWatcher(): Promise<void> {
    if (this.watcher) {
      await this.watcher.stop()
      this.watcher = null
    }
  }

  /**
   * Clean up stale debug symlinks that may remain from abnormal exit
   */
  private async cleanupStaleDebugLinks(): Promise<void> {
    try {
      const entries = await fse.readdir(this.pluginsDir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.name.startsWith('@debug.')) {
          const linkPath = path.join(this.pluginsDir, entry.name)
          await fse.remove(linkPath)
          log.info(`[PluginService] Cleaned up stale debug link: ${entry.name}`)
        }
      }
    } catch (error) {
      log.warn('[PluginService] Failed to cleanup stale debug links:', error)
    }
  }
}
