/**
 * Rolldown configuration for generating plugin type definitions
 *
 * Uses rolldown-plugin-dts to bundle types from main app API files
 * into standalone .d.ts files for the plugin SDK.
 */

import { defineConfig } from 'rolldown'
import { dts } from 'rolldown-plugin-dts'

// External packages to preserve as imports (not inlined into the type bundle)
// NOTE: Keep in sync with packages/plugin-sdk/package.json peerDependencies
const externalPackages = [
  // Vue ecosystem
  'vue',
  'vue-router',
  'pinia',
  'reka-ui',
  // Database
  'drizzle-orm',
  // Electron
  'electron-log',
  'electron',
  // SQLite
  'better-sqlite3',
  // i18n
  'i18next',
  '@tanstack/vue-virtual',
  'class-variance-authority'
]

/**
 * Check if a module ID should be treated as external.
 * Matches both exact package names and their subpaths to prevent
 * type inlining from node_modules deep paths.
 *
 * @example
 * isExternal('drizzle-orm') // true
 * isExternal('drizzle-orm/sqlite-core/columns/text') // true
 */
function isExternal(id: string): boolean {
  for (const pkg of externalPackages) {
    if (id === pkg || id.startsWith(`${pkg}/`)) {
      return true
    }
  }
  return false
}

/**
 * Generate banner comment for output files
 */
function generateBanner(processName: string): string {
  return `/**
 * Kisaki Plugin SDK - ${processName} Process Types
 *
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 * Generated from apps/desktop/src/${processName === 'Main' ? 'main/services' : 'renderer/src/core'}/plugin/api.ts
 *
 * @packageDocumentation
 */
`
}

export default defineConfig([
  // Main process types
  {
    input: { 'main.plugin': 'src/main/services/plugin/api.ts' },
    plugins: [
      dts({
        tsconfig: 'tsconfig.node.json',
        emitDtsOnly: true
      })
    ],
    external: isExternal,
    output: {
      dir: 'plugin-types',
      format: 'es',
      inlineDynamicImports: true,
      banner: generateBanner('Main')
    }
  },
  // Renderer process types
  {
    input: { 'renderer.plugin': 'src/renderer/src/core/plugin/api.ts' },
    plugins: [
      dts({
        tsconfig: 'tsconfig.web.json',
        emitDtsOnly: true,
        vue: true // Use vue-tsc for Vue component types
      })
    ],
    external: isExternal,
    output: {
      dir: 'plugin-types',
      format: 'es',
      inlineDynamicImports: true,
      banner: generateBanner('Renderer')
    }
  }
])
