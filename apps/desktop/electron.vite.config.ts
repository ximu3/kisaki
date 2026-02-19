import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@main': resolve('src/main'),
        '@shared': resolve('src/shared')
      }
    }
  },
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared'),
        '@assets': resolve('src/renderer/assets')
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve('src/renderer/main.html'),
          'tray-menu': resolve('src/renderer/tray-menu.html')
        }
      }
    },
    plugins: [vue(), tailwindcss()],
    server: {
      host: '127.0.0.1'
    }
  }
})
