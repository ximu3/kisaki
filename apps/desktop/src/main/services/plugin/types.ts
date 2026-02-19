/**
 * Plugin Types
 *
 * Types for the plugin system used by main process.
 */

import type { PluginCategory } from '@shared/plugin'

/**
 * Plugin metadata definition
 */
export interface PluginManifest {
  /** Unique plugin identifier (e.g. 'com.example.myplugin') */
  readonly id: string
  /** Display name */
  readonly name: string
  /** Semantic version */
  readonly version: string
  /** Description */
  readonly description?: string
  /** Author name */
  readonly author?: string
  /** Homepage URL */
  readonly homepage?: string
  /**
   * Kisaki version compatibility range (semver format)
   * @example ">=1.0.0" - Compatible with Kisaki 1.0.0 and above
   * @example ">=1.0.0 <2.0.0" - Compatible with Kisaki 1.x only
   */
  readonly kisakiCompat?: string
  /** Plugin category */
  readonly category?: PluginCategory
  /** Main process entry file (relative path, defaults to 'main.js') */
  readonly main?: string
  /** Renderer process entry file (relative path) */
  readonly renderer?: string
}
