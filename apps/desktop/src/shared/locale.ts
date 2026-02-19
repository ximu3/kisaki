/**
 * Locale type definitions
 * Using BCP 47 language tags
 */

/**
 * Common BCP 47 language tags for scraper providers
 */
export type Locale =
  // English
  | 'en'
  // Chinese
  | 'zh-Hans'
  | 'zh-Hant'
  // Japanese
  | 'ja'
  // Korean
  | 'ko'
  // German
  | 'de'
  // French
  | 'fr'
  // Spanish
  | 'es'
  // Portuguese
  | 'pt'
  // Italian
  | 'it'
  // Russian
  | 'ru'
  // Vietnamese
  | 'vi'
  // Thai
  | 'th'
  // Indonesian
  | 'id'
  // Polish
  | 'pl'
  // Turkish
  | 'tr'
  // Arabic
  | 'ar'
  // Ukrainian
  | 'uk'

/** All valid Locale values */
export const LOCALES: Locale[] = [
  'en',
  'zh-Hans',
  'zh-Hant',
  'ja',
  'ko',
  'de',
  'fr',
  'es',
  'pt',
  'it',
  'ru',
  'vi',
  'th',
  'id',
  'pl',
  'tr',
  'ar',
  'uk'
]

/**
 * Application UI supported locales (subset of Locale)
 * Only languages with translation files available
 */
export type AppLocale = 'zh-Hans' | 'en' | 'ja'

/** Default application locale */
export const DEFAULT_LOCALE: AppLocale = 'zh-Hans'

/** All supported app locales */
export const APP_LOCALES: AppLocale[] = ['zh-Hans', 'en', 'ja']
