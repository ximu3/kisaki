/**
 * Plugin Watcher
 *
 * Watches plugin directories for file changes and triggers hot reload in development mode.
 */

import path from 'path'
import log from 'electron-log/main'
import fse from 'fs-extra'
import { watch, type FSWatcher } from 'chokidar'
import type { PluginLoader } from './loader'

export type PluginReloadCallback = (pluginId: string) => void

/**
 * Plugin file watcher for debug-mode hot reload.
 * Watches plugin directories for changes to .js/.mjs files and triggers reload.
 */
export class PluginWatcher {
  private pluginsDir: string
  private loader: PluginLoader
  private watcher: FSWatcher | null = null
  private reloadDebounceTimers = new Map<string, NodeJS.Timeout>()
  private onReloadCallback?: PluginReloadCallback

  constructor(pluginsDir: string, loader: PluginLoader) {
    this.pluginsDir = pluginsDir
    this.loader = loader
  }

  /**
   * Set callback to be called after a plugin is reloaded
   */
  onReload(callback: PluginReloadCallback): void {
    this.onReloadCallback = callback
  }

  /**
   * Start watching plugin directories for file changes.
   */
  start(): void {
    this.watcher = watch(this.pluginsDir, {
      ignored: [
        /(^|[/\\])\./, // Ignore dotfiles
        '**/node_modules/**',
        '**/.sources.json',
        '**/.disabled.json'
      ],
      persistent: true,
      ignoreInitial: true,
      depth: 3
    })

    this.watcher.on('change', (filePath) => {
      // Only reload for .mjs or .js files in dist directories
      if (!filePath.endsWith('.mjs') && !filePath.endsWith('.js')) return

      const relativePath = path.relative(this.pluginsDir, filePath)
      const pluginKey = relativePath.split(path.sep)[0]
      if (!pluginKey) return

      // Debounce reload to avoid rapid reloads during build
      const existingTimer = this.reloadDebounceTimers.get(pluginKey)
      if (existingTimer) clearTimeout(existingTimer)

      const timer = setTimeout(async () => {
        this.reloadDebounceTimers.delete(pluginKey)
        const pluginId = await this.resolvePluginId(filePath)
        if (!pluginId) return

        log.info(`[PluginWatcher] Hot reloading plugin: ${pluginId}`)
        try {
          await this.loader.reloadPlugin(pluginId)
          this.onReloadCallback?.(pluginId)
        } catch (error) {
          log.error(`[PluginWatcher] Failed to hot reload ${pluginId}:`, error)
        }
      }, 300)

      this.reloadDebounceTimers.set(pluginKey, timer)
    })

    log.info('[PluginWatcher] File watcher enabled for debug-mode hot reload')
  }

  /**
   * Stop the file watcher (cleanup)
   */
  async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close()
      this.watcher = null
    }
    for (const timer of this.reloadDebounceTimers.values()) {
      clearTimeout(timer)
    }
    this.reloadDebounceTimers.clear()
  }

  private async resolvePluginId(filePath: string): Promise<string | null> {
    const relativePath = path.relative(this.pluginsDir, filePath)
    const topDir = relativePath.split(path.sep)[0]
    if (!topDir) return null

    if (this.loader.hasPlugin(topDir)) {
      return topDir
    }

    const pluginDir = path.join(this.pluginsDir, topDir)
    const manifestPath = path.join(pluginDir, 'manifest.json')
    if (!(await fse.pathExists(manifestPath))) return null

    try {
      const manifest = await fse.readJson(manifestPath)
      const pluginId = manifest?.id
      if (pluginId && this.loader.hasPlugin(pluginId)) {
        return pluginId
      }
    } catch (error) {
      log.warn('[PluginWatcher] Failed to read manifest for reload:', error)
    }

    return null
  }
}
