/**
 * Render state composable
 *
 * Transforms async data states into unified UI render states.
 * Integrates delayed loading to prevent spinner flicker for fast operations.
 *
 * This is the standard way to handle UI state transitions across the project.
 */

import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { useDelayedLoading, type LoadingPreset } from './use-delayed-loading'

// =============================================================================
// Types
// =============================================================================

/**
 * Render state for async data
 *
 * - `loading`: Show loading spinner (delay threshold exceeded)
 * - `pending`: Waiting for data but no spinner (fast load, within delay threshold)
 * - `error`: Fetch failed
 * - `not-found`: Data loaded but entity doesn't exist (data === null)
 * - `success`: Data is ready for rendering
 *
 * Note: For list queries, empty array [] is considered 'success'.
 * The component should handle empty state UI separately.
 *
 * Components should treat 'pending' as blank/skeleton state.
 */
export type RenderState = 'loading' | 'pending' | 'error' | 'not-found' | 'success'

export interface UseRenderStateOptions {
  /** Loading delay preset (default: 'local' for SQLite queries) */
  preset?: LoadingPreset
}

// =============================================================================
// Composable
// =============================================================================

/**
 * Transform async data states into UI render state
 *
 * Handles delayed loading internally to prevent spinner flicker.
 * Use this as the standard way to determine what UI to render.
 *
 * Data state mapping:
 * - `undefined` → 'pending' or 'loading' (not fetched yet)
 * - `null` → 'not-found' (fetched but entity doesn't exist)
 * - `[]` or `{...}` → 'success' (fetched with data)
 *
 * @example
 * ```ts
 * const state = useRenderState(isLoading, error, data)
 *
 * // In template:
 * // state === 'loading' → show spinner
 * // state === 'pending' → show blank/skeleton (fast load, no spinner)
 * // state === 'error' → show error message
 * // state === 'not-found' → show not found
 * // state === 'success' → show content
 * ```
 *
 * @example
 * ```ts
 * // For network requests, use 'network' preset
 * const state = useRenderState(isLoading, error, data, { preset: 'network' })
 * ```
 */
export function useRenderState(
  isLoading: MaybeRefOrGetter<boolean>,
  error: MaybeRefOrGetter<string | Error | null>,
  data: MaybeRefOrGetter<unknown>,
  options: UseRenderStateOptions = {}
): ComputedRef<RenderState> {
  const { preset = 'local' } = options

  // Delayed loading to prevent flicker
  const { showLoading } = useDelayedLoading(isLoading, preset)

  return computed<RenderState>(() => {
    // Error takes priority
    if (toValue(error)) return 'error'

    const d = toValue(data)
    const loading = toValue(isLoading)

    // Show loading spinner only when delay threshold exceeded
    if (showLoading.value) return 'loading'

    // Loading but within delay threshold - pending (no spinner, no not-found)
    if (loading) return 'pending'

    // Has valid data - show success
    if (d !== undefined && d !== null) return 'success'

    // Loading completed with null - now safe to show not-found
    if (d === null) return 'not-found'

    // Unexpected: d === undefined and not loading
    return 'pending'
  })
}
