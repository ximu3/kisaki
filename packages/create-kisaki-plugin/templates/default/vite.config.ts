import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { writeFileSync } from 'fs'

/**
 * Vite plugin to generate manifest.json from src/shared/manifest.ts
 */
function manifestPlugin(): Plugin {
  return {
    name: 'manifest-plugin',
    async writeBundle() {
      const { manifest } = await import('./src/shared/manifest')
      writeFileSync(resolve(__dirname, 'dist/manifest.json'), JSON.stringify(manifest, null, 2))
    }
  }
}

export default defineConfig({
  plugins: [vue(), manifestPlugin()],
  resolve: {
    // Redirect 'vue' imports to SDK shim (for SFC compilation)
    // Other deps (drizzle, pinia, router) are imported directly from SDK
    alias: {
      vue: '@kisaki/plugin-sdk/renderer/vue'
    }
  },
  build: {
    lib: {
      entry: {
        main: resolve(__dirname, 'src/main/index.ts'),
        renderer: resolve(__dirname, 'src/renderer/index.ts')
      },
      formats: ['es']
    },
    rollupOptions: {
      // No externals needed - SDK shims are bundled and access host deps at runtime
      output: {
        entryFileNames: '[name]/index.mjs',
        chunkFileNames: '[name]-[hash].mjs'
      }
    },
    outDir: 'dist',
    sourcemap: true
  }
})
