/**
 * Kisaki Plugin SDK - Renderer Process Composables
 *
 * Vue composables for common patterns and data fetching.
 *
 * @example
 * import { useGame, useCollection } from '@kisaki/plugin-sdk/renderer/composables'
 */

import type { KisakiRendererAPI } from '../types/renderer.plugin'

const w = (typeof window !== 'undefined' ? window : globalThis) as unknown as {
  kisaki: KisakiRendererAPI
}

// =============================================================================
// Utility Composables
// =============================================================================

/** Async data loading composable */
export const useAsyncData: KisakiRendererAPI['composables']['useAsyncData'] =
  w.kisaki.composables.useAsyncData

/** Debounced ref composable */
export const useDebouncedRef: KisakiRendererAPI['composables']['useDebouncedRef'] =
  w.kisaki.composables.useDebouncedRef

/** Delayed loading state composable */
export const useDelayedLoading: KisakiRendererAPI['composables']['useDelayedLoading'] =
  w.kisaki.composables.useDelayedLoading

/** Event listener composable (auto-cleanup on unmount) */
export const useEvent: KisakiRendererAPI['composables']['useEvent'] = w.kisaki.composables.useEvent

/** Internationalization composable */
export const useI18n: KisakiRendererAPI['composables']['useI18n'] = w.kisaki.composables.useI18n

/** Render state management composable */
export const useRenderState: KisakiRendererAPI['composables']['useRenderState'] =
  w.kisaki.composables.useRenderState

// =============================================================================
// Entity Data Composables
// =============================================================================

/** Game data composable */
export const useGame: KisakiRendererAPI['composables']['useGame'] = w.kisaki.composables.useGame

/** Collection data composable */
export const useCollection: KisakiRendererAPI['composables']['useCollection'] =
  w.kisaki.composables.useCollection

/** Person data composable */
export const usePerson: KisakiRendererAPI['composables']['usePerson'] =
  w.kisaki.composables.usePerson

/** Character data composable */
export const useCharacter: KisakiRendererAPI['composables']['useCharacter'] =
  w.kisaki.composables.useCharacter

/** Company data composable */
export const useCompany: KisakiRendererAPI['composables']['useCompany'] =
  w.kisaki.composables.useCompany

/** Tag data composable */
export const useTag: KisakiRendererAPI['composables']['useTag'] = w.kisaki.composables.useTag
