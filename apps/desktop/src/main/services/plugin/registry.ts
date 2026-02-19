/**
 * Plugin Registry Manager
 *
 * Manages multiple plugin registry providers and provides unified search/resolution.
 * Supports GitHub releases and local file installation.
 */

import type { PluginRegistryEntry } from '@shared/plugin'

// =============================================================================
// Search Options
// =============================================================================

export interface PluginSearchOptions {
  page?: number
  limit?: number
  sortBy?: 'stars' | 'updated' | 'name'
}

export interface PluginSearchResult {
  entries: PluginRegistryEntry[]
  total: number
  hasMore: boolean
}

// =============================================================================
// Registry Provider Interface
// =============================================================================

/**
 * Registry provider metadata for UI display
 */
export interface RegistryProviderInfo {
  name: string
  displayName: string
  description?: string
  /** Whether this provider supports search/browse functionality */
  searchable: boolean
}

/**
 * Plugin registry provider interface.
 * Each provider implements a specific source (GitHub, local file, etc.)
 */
export interface IPluginRegistryProvider {
  /** Unique provider name (e.g., 'github', 'local') */
  readonly name: string

  /** Display name for UI (e.g., 'GitHub', '本地文件') */
  readonly displayName: string

  /** Whether this provider supports search functionality */
  readonly searchable: boolean

  /**
   * Search for plugins in this registry.
   * Only available if searchable is true.
   *
   * @param query - Search query string
   * @param options - Pagination and sorting options
   */
  search(query: string, options?: PluginSearchOptions): Promise<PluginSearchResult>

  /**
   * Resolve a plugin source string to registry entry.
   * Returns null if the source format doesn't match this provider.
   *
   * @param source - Plugin source string (e.g., 'github:owner/repo')
   */
  resolve(source: string): Promise<PluginRegistryEntry | null>

  /**
   * Get the latest version for a plugin.
   * Used for update checking.
   *
   * @param pluginId - Plugin ID to check
   * @param currentSource - Original source string used for installation
   */
  getLatestVersion(pluginId: string, currentSource: string): Promise<string | null>

  /**
   * Download plugin package to a temporary location.
   * Returns the path to the downloaded file.
   *
   * @param entry - Plugin registry entry with download URL
   */
  download(entry: PluginRegistryEntry): Promise<string>
}

// =============================================================================
// Registry Manager
// =============================================================================

/**
 * Manages multiple plugin registry providers.
 * Provides unified search and resolution across all registered providers.
 */
export class PluginRegistryManager {
  private providers = new Map<string, IPluginRegistryProvider>()

  /**
   * Register a new registry provider
   */
  register(provider: IPluginRegistryProvider): void {
    this.providers.set(provider.name, provider)
  }

  /**
   * Get a provider by name
   */
  getProvider(name: string): IPluginRegistryProvider | undefined {
    return this.providers.get(name)
  }

  /**
   * Get all registered providers
   */
  getAllProviders(): IPluginRegistryProvider[] {
    return [...this.providers.values()]
  }

  /**
   * Get providers that support search functionality (for UI dropdown)
   */
  getSearchableProviders(): RegistryProviderInfo[] {
    return [...this.providers.values()]
      .filter((p) => p.searchable)
      .map((p) => ({
        name: p.name,
        displayName: p.displayName,
        searchable: p.searchable
      }))
  }

  /**
   * Search for plugins in a specific registry.
   *
   * @param registryName - Name of the registry to search in
   * @param query - Search query string
   * @param options - Pagination and sorting options
   */
  async search(
    registryName: string,
    query: string,
    options?: PluginSearchOptions
  ): Promise<PluginSearchResult> {
    const provider = this.providers.get(registryName)
    if (!provider) {
      throw new Error(`Registry provider not found: ${registryName}`)
    }
    if (!provider.searchable) {
      throw new Error(`Registry ${registryName} does not support search`)
    }
    return provider.search(query, options)
  }

  /**
   * Resolve a plugin source to registry entry.
   *
   * @param source - Plugin source string (e.g., 'github:owner/repo', '/path/to/file.zip')
   * @param registryName - Optional. If provided, only uses that specific registry.
   *                       If not provided, tries each provider until one matches.
   */
  async resolve(source: string, registryName?: string): Promise<PluginRegistryEntry | null> {
    if (registryName) {
      const provider = this.providers.get(registryName)
      if (!provider) {
        throw new Error(`Registry provider not found: ${registryName}`)
      }
      return provider.resolve(source)
    }

    // Auto-detect: try each provider until one matches
    for (const provider of this.providers.values()) {
      const entry = await provider.resolve(source)
      if (entry) {
        return entry
      }
    }
    return null
  }

  /**
   * Get the latest version for a plugin from the appropriate provider
   */
  async getLatestVersion(pluginId: string, source: string): Promise<string | null> {
    for (const provider of this.providers.values()) {
      const version = await provider.getLatestVersion(pluginId, source)
      if (version) {
        return version
      }
    }
    return null
  }

  /**
   * Download a plugin using the appropriate provider
   */
  async download(entry: PluginRegistryEntry): Promise<string> {
    const provider = this.providers.get(entry.source)
    if (!provider) {
      throw new Error(`No provider found for source: ${entry.source}`)
    }
    return provider.download(entry)
  }
}
