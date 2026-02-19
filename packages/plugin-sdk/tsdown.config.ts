import { defineConfig } from 'tsdown'

/**
 * Common build options for all entries
 */
const commonOptions = {
  format: 'esm' as const,
  dts: true,
  clean: false, // Don't clean between builds
  outDir: 'dist',
  outputOptions: {
    inlineDynamicImports: true
  }
}

export default defineConfig([
  // Main process - index
  {
    ...commonOptions,
    entry: { 'main/index': 'src/main/index.ts' },
    clean: true // Only first build cleans
  },
  // Main process - tables
  {
    ...commonOptions,
    entry: { 'main/tables': 'src/main/tables.ts' }
  },
  // Main process - shared deps
  {
    ...commonOptions,
    entry: { 'main/electron': 'src/main/electron.ts' }
  },
  {
    ...commonOptions,
    entry: { 'main/drizzle': 'src/main/drizzle.ts' }
  },
  // Renderer process - index
  {
    ...commonOptions,
    entry: { 'renderer/index': 'src/renderer/index.ts' }
  },
  // Renderer process - tables
  {
    ...commonOptions,
    entry: { 'renderer/tables': 'src/renderer/tables.ts' }
  },
  // Renderer process - ui
  {
    ...commonOptions,
    entry: { 'renderer/ui': 'src/renderer/ui.ts' }
  },
  // Renderer process - composables
  {
    ...commonOptions,
    entry: { 'renderer/composables': 'src/renderer/composables.ts' }
  },
  // Renderer process - stores
  {
    ...commonOptions,
    entry: { 'renderer/stores': 'src/renderer/stores.ts' }
  },
  // Renderer process - shared deps
  {
    ...commonOptions,
    entry: { 'renderer/vue': 'src/renderer/vue.ts' }
  },
  {
    ...commonOptions,
    entry: { 'renderer/vue-router': 'src/renderer/vue-router.ts' }
  },
  {
    ...commonOptions,
    entry: { 'renderer/pinia': 'src/renderer/pinia.ts' }
  },
  {
    ...commonOptions,
    entry: { 'renderer/drizzle': 'src/renderer/drizzle.ts' }
  }
])
