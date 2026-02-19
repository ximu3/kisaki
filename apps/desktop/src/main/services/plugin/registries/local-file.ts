/**
 * Local File Registry Provider
 *
 * Resolves and installs plugins from local file paths.
 * Supports both .zip files and extracted plugin directories.
 */

import path from 'path'
import { app } from 'electron'
import fse from 'fs-extra'
import AdmZip from 'adm-zip'
import log from 'electron-log/main'
import type { PluginRegistryEntry } from '@shared/plugin'
import type { IPluginRegistryProvider, PluginSearchOptions, PluginSearchResult } from '../registry'
import type { PluginManifest } from '../types'

/**
 * Local file-based plugin provider.
 *
 * Handles plugins from:
 * - Local .zip files
 * - Extracted plugin directories
 * - Relative and absolute paths
 */
export class LocalFileRegistryProvider implements IPluginRegistryProvider {
  readonly name = 'local-file'
  readonly displayName = 'Local File'
  readonly searchable = false

  /**
   * Search is not supported for local files.
   */
  async search(_query: string, _options?: PluginSearchOptions): Promise<PluginSearchResult> {
    return { entries: [], total: 0, hasMore: false }
  }

  /**
   * Resolve a local file path to plugin registry entry.
   */
  async resolve(source: string): Promise<PluginRegistryEntry | null> {
    if (!this.isLocalPath(source)) return null

    const resolvedPath = path.resolve(source)

    if (!(await fse.pathExists(resolvedPath))) {
      log.warn(`[LocalRegistry] Path does not exist: ${resolvedPath}`)
      return null
    }

    const stat = await fse.stat(resolvedPath)

    if (stat.isDirectory()) {
      // Read manifest from directory
      const manifestPath = path.join(resolvedPath, 'manifest.json')
      if (!(await fse.pathExists(manifestPath))) {
        log.warn(`[LocalRegistry] No manifest.json in directory: ${resolvedPath}`)
        return null
      }

      const manifest: PluginManifest = await fse.readJson(manifestPath)
      return {
        id: manifest.id,
        name: manifest.name,
        version: manifest.version,
        description: manifest.description,
        author: manifest.author,
        homepage: manifest.homepage,
        downloadUrl: resolvedPath, // Directory path for "download"
        source: this.name
      }
    } else if (resolvedPath.endsWith('.zip')) {
      // Extract manifest from zip
      const manifest = await this.extractManifestFromZip(resolvedPath)
      if (!manifest) {
        log.warn(`[LocalRegistry] No manifest.json in zip: ${resolvedPath}`)
        return null
      }

      return {
        id: manifest.id,
        name: manifest.name,
        version: manifest.version,
        description: manifest.description,
        author: manifest.author,
        homepage: manifest.homepage,
        downloadUrl: resolvedPath,
        source: this.name
      }
    }

    return null
  }

  /**
   * Get latest version - not applicable for local files.
   */
  async getLatestVersion(_pluginId: string, _currentSource: string): Promise<string | null> {
    return null
  }

  /**
   * Download (copy) local file to temp directory.
   */
  async download(entry: PluginRegistryEntry): Promise<string> {
    const tempDir = path.join(app.getPath('temp'), 'kisaki-plugins')
    await fse.ensureDir(tempDir)

    const fileName = `plugin-${Date.now()}.zip`
    const tempPath = path.join(tempDir, fileName)

    await fse.copy(entry.downloadUrl, tempPath)
    log.info(`[LocalRegistry] Copied ${entry.downloadUrl} to ${tempPath}`)

    return tempPath
  }

  // ===========================================================================
  // Private Helpers
  // ===========================================================================

  /**
   * Check if source is a local file path
   */
  private isLocalPath(source: string): boolean {
    // Reject registry prefixes
    if (source.startsWith('github:')) return false

    // Accept absolute paths and relative paths
    return (
      path.isAbsolute(source) ||
      source.startsWith('./') ||
      source.startsWith('../') ||
      source.endsWith('.zip')
    )
  }

  /**
   * Extract manifest.json from a .zip file
   */
  private async extractManifestFromZip(zipPath: string): Promise<PluginManifest | null> {
    const zip = new AdmZip(zipPath)
    const entries = zip.getEntries()

    // Find manifest.json entry (could be at root or in a subdirectory)
    for (const entry of entries) {
      if (entry.entryName.endsWith('manifest.json') && !entry.isDirectory) {
        const content = entry.getData().toString('utf-8')
        return JSON.parse(content) as PluginManifest
      }
    }

    return null
  }
}
