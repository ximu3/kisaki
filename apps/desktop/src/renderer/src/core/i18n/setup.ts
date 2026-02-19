/**
 * i18n setup for Vue renderer
 *
 * Uses i18next without react-i18next integration
 */

import i18next, { type i18n as I18nInstance } from 'i18next'
import { db } from '@renderer/core/db'
import { settings } from '@shared/db'
import { eventManager } from '@renderer/core/event'
import type { AppLocale } from '@shared/locale'
import { APP_LOCALES, DEFAULT_LOCALE } from '@shared/locale'
import { eq } from 'drizzle-orm'

// Import translation resources
import zhHans from './locales/zh-Hans.json'
import en from './locales/en.json'
import ja from './locales/ja.json'

/** i18next instance for renderer process */
export const i18n: I18nInstance = i18next.createInstance()

/**
 * Detect initial locale from settings or system
 */
async function detectInitialLocale(): Promise<AppLocale> {
  try {
    const result = await db.select({ locale: settings.locale }).from(settings).get()

    if (result?.locale && APP_LOCALES.includes(result.locale)) {
      return result.locale
    }
  } catch (error) {
    console.warn('[i18n] Failed to read locale from settings:', error)
  }

  // Fallback to system locale
  return navigator.language as AppLocale
}

/**
 * Initialize i18n for renderer process
 */
export async function initI18n(): Promise<typeof i18n> {
  const initialLocale = await detectInitialLocale()

  await i18n.init({
    lng: initialLocale,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: APP_LOCALES,
    resources: {
      'zh-Hans': { translation: zhHans },
      'en-US': { translation: en },
      ja: { translation: ja }
    },
    interpolation: {
      escapeValue: false
    }
  })

  console.log(`[i18n] Renderer process initialized with locale: ${initialLocale}`)

  // Listen for locale changes from main process
  eventManager.on('app:locale-changed', ({ locale }: { locale: AppLocale | null }) => {
    const targetLocale = locale ?? (navigator.language as AppLocale)
    if (APP_LOCALES.includes(targetLocale) && i18n.language !== targetLocale) {
      i18n.changeLanguage(targetLocale)
      console.log(`[i18n] Renderer process locale changed to: ${targetLocale}`)
    }
  })

  return i18n
}

/**
 * Get current locale
 */
export function getLocale(): AppLocale {
  return i18n.language as AppLocale
}

/**
 * Change locale and persist to settings
 * @param locale - AppLocale to set, or null to follow system
 */
export async function setLocale(locale: AppLocale | null): Promise<void> {
  if (locale !== null && !APP_LOCALES.includes(locale)) {
    throw new Error(`Unsupported locale: ${locale}`)
  }

  const targetLocale = locale ?? (navigator.language as AppLocale)
  await i18n.changeLanguage(targetLocale)

  // Persist to database (null means follow system)
  await db.update(settings).set({ locale }).where(eq(settings.id, 0))

  // Notify other processes
  eventManager.emit('app:locale-changed', { locale })

  console.log(
    `[i18n] Locale changed and persisted: ${locale ?? 'system'} (actual: ${targetLocale})`
  )
}
