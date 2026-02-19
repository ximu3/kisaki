/**
 * i18n Composable
 *
 * Provides reactive translation in Vue components.
 */

import { computed, type ComputedRef } from 'vue'
import { i18n, getLocale, setLocale } from '@renderer/core/i18n'
import type { AppLocale } from '@shared/locale'

interface UseI18nReturn {
  /** Translation function */
  t: typeof i18n.t
  /** Current locale (reactive) */
  locale: ComputedRef<AppLocale>
  /** Change locale */
  changeLocale: typeof setLocale
}

/**
 * Composable for i18n in Vue components
 */
export function useI18n(): UseI18nReturn {
  return {
    t: i18n.t.bind(i18n),
    locale: computed(() => getLocale()),
    changeLocale: setLocale
  }
}
