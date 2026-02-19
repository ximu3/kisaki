/**
 * Plugin Manifest
 *
 * Type-safe manifest definition. Vite generates manifest.json from this at build time.
 * All plugin metadata is defined here for type safety and single source of truth.
 */

import type { PluginManifest } from '@kisaki/plugin-sdk/main'

export const manifest: PluginManifest = {
  id: 'kisaki-plugin-template',
  name: 'Kisaki Plugin Template',
  version: '1.0.0',
  description: 'A Kisaki plugin.',
  author: 'example.com',
  homepage: 'https://example.com',
  kisakiCompat: '>=1.0.0',
  category: 'tool',
  main: 'main/index.mjs',
  renderer: 'renderer/index.mjs'
}

// Re-export for convenience
export const PLUGIN_ID = manifest.id
