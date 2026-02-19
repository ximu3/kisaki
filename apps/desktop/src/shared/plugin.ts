/**
 * Plugin System Shared Types
 *
 * Types shared between main and renderer processes via IPC.
 */

// =============================================================================
// Common Types
// =============================================================================

/**
 * Plugin category types
 */
export type PluginCategory = 'scraper' | 'tool' | 'theme' | 'integration'

// =============================================================================
// IPC Types
// =============================================================================

/**
 * Renderer plugin entry info returned via IPC
 */
export interface RendererPluginEntry {
  id: string
  entry: string // file:// URL to renderer/index.js
  enabled: boolean
}

// =============================================================================
// Plugin Registry Types (used by both processes via IPC)
// =============================================================================

export interface PluginRegistryEntry {
  id: string
  name: string
  version: string
  description?: string
  author?: string
  homepage?: string
  downloadUrl: string
  /** @deprecated Use kisakiCompat instead */
  minAppVersion?: string
  kisakiCompat?: string
  source: string
  iconUrl?: string
  stars?: number
  updatedAt?: string
  category?: PluginCategory
}

export interface PluginUpdateInfo {
  pluginId: string
  currentVersion: string
  latestVersion: string
  downloadUrl: string
}

export interface InstalledPluginInfo {
  id: string
  name: string
  version: string
  description?: string
  author?: string
  homepage?: string
  enabled: boolean
  directory: string
  category?: PluginCategory
}
