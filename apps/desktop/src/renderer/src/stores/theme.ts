/**
 * Theme Store
 *
 * Persistent wrapper around the core theme manager:
 * - Persists theme preset selection
 * - Persists theme mode preference (light/dark/system)
 * - Resolves system mode to light/dark and applies via themeManager
 */

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { themeManager } from '@renderer/core/theme'

export type ThemeMode = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore(
  'theme',
  () => {
    const DEFAULT_THEME_ID = 'default'
    const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)'

    const themes = themeManager.themes.items
    const activeThemeId = ref<string>(DEFAULT_THEME_ID)
    const mode = ref<ThemeMode>('system')

    const resolvedTheme = ref<'light' | 'dark'>('light')

    function setActiveTheme(themeId: string): void {
      activeThemeId.value = themeId
    }

    function setMode(newMode: ThemeMode): void {
      mode.value = newMode
    }

    function applyTheme(): void {
      // Resolve light/dark from preference
      let resolved: 'light' | 'dark' = 'light'

      if (mode.value === 'system') {
        const mql =
          typeof window !== 'undefined' && typeof window.matchMedia === 'function'
            ? window.matchMedia(DARK_MEDIA_QUERY)
            : null
        resolved = mql?.matches ? 'dark' : 'light'
      } else {
        resolved = mode.value
      }

      resolvedTheme.value = resolved

      // Apply dark mode class (themes provide both :root and .dark blocks)
      document.documentElement.classList.toggle('dark', resolved === 'dark')

      try {
        themeManager.setActiveTheme(activeThemeId.value)
      } catch {
        activeThemeId.value = DEFAULT_THEME_ID
        themeManager.setActiveTheme(DEFAULT_THEME_ID)
      }
    }

    // Watch preference changes and apply
    watch([activeThemeId, mode], applyTheme, { immediate: true })

    // Listen for system theme changes
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      window.matchMedia(DARK_MEDIA_QUERY).addEventListener('change', () => {
        if (mode.value === 'system') {
          applyTheme()
        }
      })
    }

    return {
      themes,
      activeThemeId,
      mode,
      resolvedTheme,
      setActiveTheme,
      setMode
    }
  },
  { persist: { pick: ['activeThemeId', 'mode'] } }
)
