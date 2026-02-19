import { computed, ref, watch } from 'vue'
import { builtinThemePresets } from './presets'
import type { ThemeDefinition } from './types'
import { createReactiveRegistry } from '@renderer/utils'

const STYLE_ELEMENT_ID = 'kisaki-theme-style'

function ensureThemeStyleElement(): HTMLStyleElement {
  const existing = document.getElementById(STYLE_ELEMENT_ID)
  if (existing && existing instanceof HTMLStyleElement) return existing

  const style = document.createElement('style')
  style.id = STYLE_ELEMENT_ID
  style.setAttribute('data-kisaki', 'theme')
  document.head.appendChild(style)
  return style
}

function validateThemeCss(css: string): void {
  const hasRoot = /:root\s*\{/.test(css)
  const hasDark = /\.dark\s*\{/.test(css)
  if (!hasRoot || !hasDark) {
    throw new Error(`Theme CSS must include both ":root { ... }" and ".dark { ... }" blocks`)
  }
}

class ThemeManager {
  readonly themes = createReactiveRegistry<ThemeDefinition>()
  readonly activeThemeId = ref<string>('default')

  private readonly activeCss = computed(() => this.themes.get(this.activeThemeId.value)?.css ?? '')

  constructor() {
    for (const preset of builtinThemePresets) {
      this.registerTheme(preset)
    }

    watch(
      this.activeThemeId,
      (themeId) => {
        if (this.themes.has(themeId)) return
        this.activeThemeId.value = 'default'
      },
      { immediate: true }
    )

    watch(
      this.activeCss,
      (css) => {
        const style = ensureThemeStyleElement()
        style.textContent = css
      },
      { immediate: true }
    )
  }

  registerTheme(definition: ThemeDefinition): () => void {
    validateThemeCss(definition.css)

    this.themes.register(definition)
    return () => this.unregisterTheme(definition.id)
  }

  unregisterTheme(themeId: string): void {
    const existed = this.themes.unregister(themeId)
    if (!existed) return

    if (this.activeThemeId.value === themeId) {
      this.activeThemeId.value = 'default'
    }
  }

  setActiveTheme(themeId: string): void {
    if (!this.themes.has(themeId)) {
      throw new Error(`Unknown theme: ${themeId}`)
    }
    this.activeThemeId.value = themeId
  }

  // Theme list is derived from registry; no manual sync needed.
}

export const themeManager = new ThemeManager()
