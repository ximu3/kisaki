/**
 * GitHub Registry Provider
 *
 * Resolves and downloads plugins from GitHub repositories.
 * Supports both search and direct resolution via github:owner/repo format.
 * Uses NetworkService for unified network handling.
 */

import path from 'path'
import { app } from 'electron'
import fse from 'fs-extra'
import log from 'electron-log/main'
import type { PluginRegistryEntry } from '@shared/plugin'
import type { IPluginRegistryProvider, PluginSearchOptions, PluginSearchResult } from '../registry'
import type { NetworkService } from '@main/services/network'

interface GitHubRelease {
  tag_name: string
  name: string
  body: string
  assets: Array<{
    name: string
    browser_download_url: string
    size: number
  }>
}

interface GitHubRepo {
  full_name: string
  name: string
  owner: { login: string }
  description: string | null
  html_url: string
  stargazers_count: number
  updated_at: string
}

interface GitHubSearchResponse {
  total_count: number
  items: GitHubRepo[]
}

/**
 * GitHub-based plugin registry provider.
 *
 * Provides plugin discovery and download via GitHub's API:
 * - Search: Uses GitHub search API with 'kisaki-plugin' topic
 * - Resolve: Parses 'github:owner/repo[@tag]' format
 * - Download: Fetches .zip assets from GitHub releases
 */
export class GitHubRegistryProvider implements IPluginRegistryProvider {
  readonly name = 'github'
  readonly displayName = 'GitHub'
  readonly searchable = true

  constructor(private readonly networkService: NetworkService) {}

  // ===========================================================================
  // Search
  // ===========================================================================

  /**
   * Search for plugins on GitHub.
   * Looks for repositories with 'kisaki-plugin' topic.
   */
  async search(query: string, options?: PluginSearchOptions): Promise<PluginSearchResult> {
    const { page = 1, limit = 20, sortBy = 'stars' } = options ?? {}

    // Build GitHub search query
    let q = 'topic:kisaki-plugin'
    if (query) {
      q += ` ${query}`
    }

    const sortMap: Record<string, string> = {
      popularity: 'stars',
      updated: 'updated',
      name: 'name'
    }

    const url = new URL('https://api.github.com/search/repositories')
    url.searchParams.set('q', q)
    url.searchParams.set('sort', sortMap[sortBy] || 'stars')
    url.searchParams.set('order', 'desc')
    url.searchParams.set('per_page', String(limit))
    url.searchParams.set('page', String(page))

    log.debug(`[GitHubRegistry] Searching: ${url.toString()}`)

    const response = await this.networkService.fetch(url.toString(), {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Kisaki-Plugin-Manager'
      }
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    const data: GitHubSearchResponse = await response.json()

    // Convert to PluginRegistryEntry format
    // Note: We don't have full manifest info until actual installation
    const entries: PluginRegistryEntry[] = await Promise.all(
      data.items.map(async (repo) => {
        // Try to get latest release info
        const release = await this.fetchRelease(repo.owner.login, repo.name).catch(() => null)

        return {
          id: repo.full_name, // Will be replaced by manifest.id after download
          name: repo.name,
          version: release?.tag_name.replace(/^v/, '') ?? 'unknown',
          description: repo.description ?? undefined,
          author: repo.owner.login,
          homepage: repo.html_url,
          downloadUrl:
            release?.assets.find((a) => a.name.endsWith('.zip'))?.browser_download_url ?? '',
          source: this.name,
          // Standard fields - no registry-specific extras
          iconUrl: `https://raw.githubusercontent.com/${repo.full_name}/main/icon.png`,
          stars: repo.stargazers_count,
          updatedAt: repo.updated_at
        }
      })
    )

    // Filter out repos without valid releases
    const validEntries = entries.filter((e) => e.downloadUrl)

    return {
      entries: validEntries,
      total: data.total_count,
      hasMore: page * limit < data.total_count
    }
  }

  // ===========================================================================
  // Direct Resolution
  // ===========================================================================

  /**
   * Resolve a GitHub source to plugin registry entry.
   * Format: github:owner/repo[@tag]
   */
  async resolve(source: string): Promise<PluginRegistryEntry | null> {
    const parsed = this.parseSource(source)
    if (!parsed) return null

    const { owner, repo, tag } = parsed

    try {
      const release = await this.fetchRelease(owner, repo, tag)
      if (!release) {
        throw new Error(`No release found for ${owner}/${repo}${tag ? `@${tag}` : ''}`)
      }

      // Find .zip asset
      const zipAsset = release.assets.find((a) => a.name.endsWith('.zip'))
      if (!zipAsset) {
        throw new Error(`No .zip asset found in release ${release.tag_name}`)
      }

      // Extract version from tag (remove 'v' prefix if present)
      const version = release.tag_name.replace(/^v/, '')

      return {
        id: `${owner}/${repo}`, // Will be replaced by actual plugin id after download
        name: release.name || repo,
        version,
        description: release.body?.slice(0, 200),
        homepage: `https://github.com/${owner}/${repo}`,
        downloadUrl: zipAsset.browser_download_url,
        source: this.name
      }
    } catch (error) {
      log.error(`[GitHubRegistry] Failed to resolve ${source}:`, error)
      return null
    }
  }

  /**
   * Get latest version from GitHub releases
   */
  async getLatestVersion(pluginId: string, currentSource: string): Promise<string | null> {
    const parsed = this.parseSource(currentSource)
    if (!parsed) return null

    const { owner, repo } = parsed

    try {
      const release = await this.fetchRelease(owner, repo)
      if (!release) return null

      return release.tag_name.replace(/^v/, '')
    } catch (error) {
      log.error(`[GitHubRegistry] Failed to get latest version for ${pluginId}:`, error)
      return null
    }
  }

  /**
   * Download plugin package from GitHub
   */
  async download(entry: PluginRegistryEntry): Promise<string> {
    const tempDir = path.join(app.getPath('temp'), 'kisaki-plugins')
    await fse.ensureDir(tempDir)

    const fileName = `plugin-${Date.now()}.zip`
    const tempPath = path.join(tempDir, fileName)

    log.info(`[GitHubRegistry] Downloading ${entry.downloadUrl}`)

    const buffer = await this.networkService.downloadBuffer(entry.downloadUrl)
    await fse.writeFile(tempPath, buffer)

    log.info(`[GitHubRegistry] Downloaded to ${tempPath}`)
    return tempPath
  }

  // ===========================================================================
  // Private Helpers
  // ===========================================================================

  /**
   * Parse github:owner/repo[@tag] format
   */
  private parseSource(source: string): { owner: string; repo: string; tag?: string } | null {
    if (!source.startsWith('github:')) return null

    const rest = source.slice(7) // Remove 'github:'
    const atIndex = rest.indexOf('@')

    let ownerRepo: string
    let tag: string | undefined

    if (atIndex !== -1) {
      ownerRepo = rest.slice(0, atIndex)
      tag = rest.slice(atIndex + 1)
    } else {
      ownerRepo = rest
    }

    const parts = ownerRepo.split('/')
    if (parts.length !== 2) return null

    return { owner: parts[0], repo: parts[1], tag }
  }

  /**
   * Fetch release from GitHub API
   */
  private async fetchRelease(
    owner: string,
    repo: string,
    tag?: string
  ): Promise<GitHubRelease | null> {
    const url = tag
      ? `https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`
      : `https://api.github.com/repos/${owner}/${repo}/releases/latest`

    const response = await this.networkService.fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Kisaki-Plugin-Manager'
      }
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    return response.json()
  }
}
