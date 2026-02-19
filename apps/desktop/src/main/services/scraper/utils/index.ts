/**
 * Scraper Utilities
 *
 * IMPORTANT:
 * This module is intentionally leaf + pure (no main-process runtime imports),
 * because it is included by `apps/desktop/tsconfig.web.json` for shared typing.
 */

export * from './date'
export * from './description'
export * from './merge'
