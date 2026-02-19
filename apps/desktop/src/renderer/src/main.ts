import './styles/globals.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import Main from './main.vue'
import { router } from './core/router'
import { initI18n } from './core/i18n'
import { eventManager } from './core/event'
import {
  initializeKisakiGlobal,
  setupPluginEventListeners,
  fetchInitialPlugins
} from './core/plugin'
import { setupDeeplinkHandlers } from './core/deeplink'
import { useGameMonitorStore, useScannerStore, useDefaultFromStore } from './stores'

async function initMainWindowRenderer() {
  // ===========================================================================
  // Phase 1: Critical Path (blocking - UI must wait)
  // ===========================================================================
  await initI18n()
  eventManager.init()

  const app = createApp(Main)

  // Pinia with persistence plugin
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)

  // Router
  app.use(router)

  // Global error handler
  app.config.errorHandler = (err, _instance, info) => {
    console.error('Vue Error:', err, info)
  }

  // Initialize plugin system (registers global kisaki object with router/pinia)
  initializeKisakiGlobal({ app, router, pinia })

  // ===========================================================================
  // Phase 2: Mount (UI becomes visible immediately)
  // ===========================================================================
  app.mount('#root')

  // ===========================================================================
  // Phase 3: Non-blocking Initialization
  // Deferred to idle time to avoid blocking first paint
  // ===========================================================================
  requestIdleCallback(async () => {
    // Deeplink handlers (must be set up early to receive events)
    setupDeeplinkHandlers()

    // Plugin system
    setupPluginEventListeners()
    await fetchInitialPlugins()

    // Store initialization (registers listeners + fetches initial state)
    await useGameMonitorStore().init()
    await useScannerStore().init()
    await useDefaultFromStore().init()
  })
}

initMainWindowRenderer()
