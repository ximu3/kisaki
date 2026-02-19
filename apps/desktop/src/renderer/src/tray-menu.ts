import './styles/globals.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import TrayMenu from './tray-menu.vue'
import { useThemeStore } from './stores/theme'

function initTrayMenuRenderer() {
  const app = createApp(TrayMenu)

  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)

  useThemeStore(pinia)

  app.mount('#root')
}

initTrayMenuRenderer()
