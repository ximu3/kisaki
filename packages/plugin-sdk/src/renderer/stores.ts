/**
 * Kisaki Plugin SDK - Renderer Process Stores
 *
 * Pinia stores for UI state management.
 *
 * @example
 * import { useThemeStore, useScannerStore } from '@kisaki/plugin-sdk/renderer/stores'
 */

import type { KisakiRendererAPI } from '../types/renderer.plugin'

const w = (typeof window !== 'undefined' ? window : globalThis) as unknown as {
  kisaki: KisakiRendererAPI
}

/** Theme store for managing app theme */
export const useThemeStore: KisakiRendererAPI['stores']['useThemeStore'] =
  w.kisaki.stores.useThemeStore

/** Game monitor store for tracking running games */
export const useGameMonitorStore: KisakiRendererAPI['stores']['useGameMonitorStore'] =
  w.kisaki.stores.useGameMonitorStore

/** Scanner store for managing folder scanners */
export const useScannerStore: KisakiRendererAPI['stores']['useScannerStore'] =
  w.kisaki.stores.useScannerStore

/** Default from store for managing default sources */
export const useDefaultFromStore: KisakiRendererAPI['stores']['useDefaultFromStore'] =
  w.kisaki.stores.useDefaultFromStore
