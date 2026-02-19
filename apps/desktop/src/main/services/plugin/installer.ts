/**
 * Plugin Installer
 *
 * Handles downloading, validating, and installing plugins.
 * Works with PluginRegistryManager to resolve plugin sources.
 */

import path from 'path'
import { app, dialog, BrowserWindow } from 'electron'
import fse from 'fs-extra'
import AdmZip from 'adm-zip'
import semver from 'semver'
import log from 'electron-log/main'
import type { PluginRegistryEntry, PluginUpdateInfo, InstalledPluginInfo } from '@shared/plugin'
import type { PluginManifest } from './types'
import type { PluginRegistryManager } from './registry'

export interface PluginInstallResult {
  pluginId: string
  directory: string
}

/**
 * Plugin Installer
 *
 * Handles the complete plugin installation lifecycle:
 * 1. Resolve source to registry entry
 * 2. Download package to temp
 * 3. Extract and validate manifest
 * 4. Show trust confirmation dialog
 * 5. Install to plugins directory
 */
export class PluginInstaller {
  private installationSources = new Map<string, string>()

  constructor(
    private pluginsDir: string,
    private registryManager: PluginRegistryManager
  ) {}

  /**
   * Install a plugin from any registered source.
   *
   * @param source - Plugin source (e.g., 'github:owner/repo' or local path)
   */
  async install(source: string): Promise<PluginInstallResult | null> {
    log.info(`[PluginInstaller] Installing from: ${source}`)

    // Resolve source to registry entry
    const entry = await this.registryManager.resolve(source)
    if (!entry) {
      throw new Error(`Cannot resolve plugin source: ${source}`)
    }

    // Download to temp
    const tempPath = await this.registryManager.download(entry)

    try {
      // Extract and validate
      const manifest = await this.extractAndValidate(tempPath)

      // Check if already installed
      const existingDir = path.join(this.pluginsDir, manifest.id)
      if (await fse.pathExists(existingDir)) {
        throw new Error(`Plugin ${manifest.id} is already installed`)
      }

      // Show trust confirmation dialog
      const trusted = await this.showTrustDialog(manifest, entry)
      if (!trusted) {
        log.info(`[PluginInstaller] User cancelled installation of ${manifest.id}`)
        return null
      }

      // Install to plugins directory
      await this.installToPluginsDir(tempPath, manifest.id)

      // Store installation source for update checking
      this.installationSources.set(manifest.id, source)
      await this.saveInstallationSources()

      log.info(`[PluginInstaller] Installation complete, plugin should be loaded separately`)

      log.info(`[PluginInstaller] Successfully installed: ${manifest.id}`)
      return { pluginId: manifest.id, directory: path.join(this.pluginsDir, manifest.id) }
    } finally {
      // Cleanup temp file
      await fse.remove(tempPath).catch(() => {})
    }
  }

  /**
   * Install a plugin from a local file path.
   * Convenience method that delegates to install().
   */
  async installFromFile(filePath: string): Promise<PluginInstallResult | null> {
    return await this.install(filePath)
  }

  /**
   * Uninstall a plugin by removing its directory.
   */
  async uninstall(pluginId: string): Promise<void> {
    const pluginDir = path.join(this.pluginsDir, pluginId)

    if (!(await fse.pathExists(pluginDir))) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    await fse.remove(pluginDir)
    this.installationSources.delete(pluginId)
    await this.saveInstallationSources()

    log.info(`[PluginInstaller] Uninstalled: ${pluginId}`)
  }

  /**
   * Check for available updates for all installed plugins.
   */
  async checkUpdates(): Promise<PluginUpdateInfo[]> {
    const updates: PluginUpdateInfo[] = []
    await this.loadInstallationSources()

    const entries = await fse.readdir(this.pluginsDir, { withFileTypes: true })

    for (const entry of entries) {
      // Handle both directories and symlinks/junctions (local dev links)
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue

      const manifestPath = path.join(this.pluginsDir, entry.name, 'manifest.json')
      if (!(await fse.pathExists(manifestPath))) continue

      try {
        const manifest: PluginManifest = await fse.readJson(manifestPath)
        const source = this.installationSources.get(manifest.id)

        if (!source) continue // Cannot check updates without source

        const latestVersion = await this.registryManager.getLatestVersion(manifest.id, source)
        if (latestVersion && semver.gt(latestVersion, manifest.version)) {
          const latestEntry = await this.registryManager.resolve(source)
          if (latestEntry) {
            updates.push({
              pluginId: manifest.id,
              currentVersion: manifest.version,
              latestVersion,
              downloadUrl: latestEntry.downloadUrl
            })
          }
        }
      } catch (error) {
        log.warn(`[PluginInstaller] Failed to check updates for ${entry.name}:`, error)
      }
    }

    return updates
  }

  /**
   * Update a plugin to the latest version.
   */
  async update(pluginId: string): Promise<PluginInstallResult | null> {
    await this.loadInstallationSources()
    const source = this.installationSources.get(pluginId)

    if (!source) {
      throw new Error(`Cannot update ${pluginId}: installation source unknown`)
    }

    const entry = await this.registryManager.resolve(source)
    if (!entry) {
      throw new Error(`Cannot resolve plugin source: ${source}`)
    }

    const tempPath = await this.registryManager.download(entry)
    try {
      const manifest = await this.extractAndValidate(tempPath)
      if (manifest.id !== pluginId) {
        throw new Error(`Plugin package ID mismatch: expected ${pluginId}, got ${manifest.id}`)
      }

      const trusted = await this.showTrustDialog(manifest, entry)
      if (!trusted) {
        log.info(`[PluginInstaller] User cancelled update of ${pluginId}`)
        return null
      }

      await this.replaceInPluginsDir(tempPath, pluginId)

      this.installationSources.set(pluginId, source)
      await this.saveInstallationSources()

      log.info(`[PluginInstaller] Successfully updated: ${pluginId}`)
      return { pluginId, directory: path.join(this.pluginsDir, pluginId) }
    } finally {
      await fse.remove(tempPath).catch(() => {})
    }
  }

  /**
   * Get information about all installed plugins.
   */
  async getInstalledPlugins(): Promise<InstalledPluginInfo[]> {
    const plugins: InstalledPluginInfo[] = []
    const entries = await fse.readdir(this.pluginsDir, { withFileTypes: true })

    // Load disabled state
    const disabledPath = path.join(this.pluginsDir, '.disabled.json')
    let disabledSet = new Set<string>()
    if (await fse.pathExists(disabledPath)) {
      try {
        const data = await fse.readJson(disabledPath)
        disabledSet = new Set(data.disabled || [])
      } catch {
        // Intentionally ignored - use empty set as fallback
      }
    }

    for (const entry of entries) {
      // Handle both directories and symlinks/junctions (local dev links)
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue
      if (entry.name.startsWith('.')) continue

      const manifestPath = path.join(this.pluginsDir, entry.name, 'manifest.json')
      if (!(await fse.pathExists(manifestPath))) continue

      try {
        const manifest: PluginManifest = await fse.readJson(manifestPath)
        plugins.push({
          id: manifest.id,
          name: manifest.name,
          version: manifest.version,
          description: manifest.description,
          author: manifest.author,
          homepage: manifest.homepage,
          enabled: !disabledSet.has(manifest.id),
          directory: path.join(this.pluginsDir, entry.name)
        })
      } catch (error) {
        log.warn(`[PluginInstaller] Failed to read manifest for ${entry.name}:`, error)
      }
    }

    return plugins
  }

  // ===========================================================================
  // Private Helpers
  // ===========================================================================

  /**
   * Extract and validate a plugin package
   */
  private async extractAndValidate(zipPath: string): Promise<PluginManifest> {
    const zip = new AdmZip(zipPath)
    const entries = zip.getEntries()

    // Find manifest.json
    const manifestEntry = entries.find(
      (e) => e.entryName === 'manifest.json' || e.entryName.endsWith('/manifest.json')
    )

    if (!manifestEntry) {
      throw new Error('No manifest.json found in plugin package')
    }

    const manifestContent = manifestEntry.getData().toString('utf-8')
    const manifest: PluginManifest = JSON.parse(manifestContent)

    // Validate required fields
    if (!manifest.id || !manifest.name || !manifest.version) {
      throw new Error('Invalid manifest: missing required fields (id, name, version)')
    }

    // Validate kisakiCompat version range
    if (manifest.kisakiCompat) {
      const appVersion = app.getVersion()
      if (!semver.satisfies(appVersion, manifest.kisakiCompat)) {
        throw new Error(`Plugin requires Kisaki ${manifest.kisakiCompat}, current: ${appVersion}`)
      }
    }

    // Validate entry file exists (use manifest.main or default patterns)
    const entryFile = manifest.main ?? 'main.js'
    const hasEntry = entries.some(
      (e) =>
        e.entryName === entryFile ||
        e.entryName.endsWith(`/${entryFile}`) ||
        e.entryName === 'main/index.mjs' ||
        e.entryName.endsWith('/main/index.mjs')
    )
    if (!hasEntry) {
      throw new Error(`Entry file '${entryFile}' not found in plugin package`)
    }

    return manifest
  }

  /**
   * Show trust confirmation dialog
   */
  private async showTrustDialog(
    manifest: PluginManifest,
    entry: PluginRegistryEntry
  ): Promise<boolean> {
    const win = BrowserWindow.getFocusedWindow()

    const result = await dialog.showMessageBox(win!, {
      type: 'question',
      buttons: ['取消', '信任并安装'],
      defaultId: 0,
      cancelId: 0,
      title: '安装插件',
      message: `是否信任并安装插件 "${manifest.name}"?`,
      detail: [
        `插件 ID: ${manifest.id}`,
        `版本: ${manifest.version}`,
        manifest.author ? `作者: ${manifest.author}` : '',
        manifest.description ? `\n${manifest.description}` : '',
        `\n来源: ${entry.source}`,
        '\n请确认您信任此插件及其来源。'
      ]
        .filter(Boolean)
        .join('\n')
    })

    return result.response === 1
  }

  /**
   * Install extracted plugin to plugins directory
   */
  private async installToPluginsDir(zipPath: string, pluginId: string): Promise<void> {
    const targetDir = path.join(this.pluginsDir, pluginId)
    await fse.ensureDir(targetDir)

    const zip = new AdmZip(zipPath)
    const entries = zip.getEntries()

    // Detect if files are in a subdirectory
    const manifestEntry = entries.find(
      (e) => e.entryName === 'manifest.json' || e.entryName.endsWith('/manifest.json')
    )!

    const prefix = manifestEntry.entryName.replace('manifest.json', '')

    // Extract with path adjustment
    for (const entry of entries) {
      if (entry.isDirectory) continue

      let relativePath = entry.entryName
      if (prefix && relativePath.startsWith(prefix)) {
        relativePath = relativePath.slice(prefix.length)
      }

      const targetPath = path.join(targetDir, relativePath)
      await fse.ensureDir(path.dirname(targetPath))
      await fse.writeFile(targetPath, entry.getData())
    }
  }

  private async replaceInPluginsDir(zipPath: string, pluginId: string): Promise<void> {
    const targetDir = path.join(this.pluginsDir, pluginId)
    await fse.remove(targetDir)
    await this.installToPluginsDir(zipPath, pluginId)
  }

  /**
   * Save installation sources for update checking
   */
  private async saveInstallationSources(): Promise<void> {
    const sourcesPath = path.join(this.pluginsDir, '.sources.json')
    const data = Object.fromEntries(this.installationSources)
    await fse.writeJson(sourcesPath, data, { spaces: 2 })
  }

  /**
   * Load installation sources
   */
  private async loadInstallationSources(): Promise<void> {
    const sourcesPath = path.join(this.pluginsDir, '.sources.json')
    if (await fse.pathExists(sourcesPath)) {
      try {
        const data = await fse.readJson(sourcesPath)
        this.installationSources = new Map(Object.entries(data))
      } catch {
        // Intentionally ignored - use empty map as fallback
      }
    }
  }
}
