/**
 * Demo Plugin - Renderer Process Entry Point
 */

import './styles/globals.css'

import { events, notify, extensions, router } from '@kisaki/plugin-sdk/renderer'
import { useThemeStore } from '@kisaki/plugin-sdk/renderer/stores'
import { PLUGIN_ID } from '../shared/manifest'
import SettingsDialog from './components/settings-dialog.vue'

export async function activate(): Promise<void> {
  console.log(`[${PLUGIN_ID}] Plugin activated`)
  notify.success('Demo Plugin loaded!')

  // Register settings dialog (plugin provides complete dialog component)
  extensions.settings.plugins.dialogs.register({
    id: PLUGIN_ID,
    component: SettingsDialog
  })

  // Listen for events
  events.on('demo-plugin:ready', () => {
    console.log(`[${PLUGIN_ID}] Main process ready`)
  })

  events.on('db:updated', ({ table, id }) => {
    console.log(`[${PLUGIN_ID}] DB updated: ${table}/${id}`)
  })

  // Access store
  const themeStore = useThemeStore()
  console.log(`[${PLUGIN_ID}] Current theme:`, themeStore.activeThemeId)

  // Use router instance directly in activate() (useRouter() doesn't work here)
  console.log(`[${PLUGIN_ID}] Current route:`, router.currentRoute.value.path)
}

export function deactivate(): void {
  console.log(`[${PLUGIN_ID}] Plugin deactivated`)
}
