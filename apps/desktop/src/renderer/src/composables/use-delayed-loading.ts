/**
 * Delayed loading state composable
 *
 * Prevents UI flicker for fast operations (like SQLite queries) by:
 * 1. Only showing loading indicator after a delay threshold
 * 2. Ensuring minimum display duration once shown
 *
 * For local database queries that typically complete in 10-50ms,
 * the loading indicator will never appear. For slower operations,
 * it appears smoothly without jarring transitions.
 */

import { ref, watch, onUnmounted, toValue, type MaybeRefOrGetter } from 'vue'

/**
 * Preset configurations for different scenarios
 */
export const LOADING_PRESETS = {
  /** Local database queries (SQLite) - most common */
  local: { delay: 150, minDuration: 300 },
  /** Network requests - show sooner */
  network: { delay: 80, minDuration: 400 },
  /** Heavy computations */
  heavy: { delay: 50, minDuration: 500 },
  /** Instant display (bypass delay) */
  instant: { delay: 0, minDuration: 0 }
} as const

export type LoadingPreset = keyof typeof LOADING_PRESETS

export interface DelayedLoadingOptions {
  /** Delay before showing loading indicator (ms). Default: 150 */
  delay?: number
  /** Minimum display duration once shown (ms). Default: 300 */
  minDuration?: number
}

export interface UseDelayedLoadingReturn {
  /** Whether to show the loading indicator */
  showLoading: Readonly<ReturnType<typeof ref<boolean>>>
}

/**
 * Creates a delayed loading state that prevents flicker
 *
 * @param isLoading - Reactive loading state to watch
 * @param options - Delay and minimum duration settings, or a preset name
 *
 * @example
 * ```ts
 * // With useAsyncData
 * const { isLoading } = useAsyncData(() => fetchData())
 * const { showLoading } = useDelayedLoading(isLoading)
 *
 * // With preset
 * const { showLoading } = useDelayedLoading(isLoading, 'network')
 *
 * // With custom options
 * const { showLoading } = useDelayedLoading(isLoading, { delay: 200, minDuration: 400 })
 * ```
 */
export function useDelayedLoading(
  isLoading: MaybeRefOrGetter<boolean>,
  options: DelayedLoadingOptions | LoadingPreset = 'local'
): UseDelayedLoadingReturn {
  // Resolve options from preset or custom config
  const resolvedOptions = typeof options === 'string' ? LOADING_PRESETS[options] : options
  const { delay = 150, minDuration = 300 } = resolvedOptions

  const showLoading = ref(false)

  let showTimer: ReturnType<typeof setTimeout> | null = null
  let hideTimer: ReturnType<typeof setTimeout> | null = null
  let shownAt: number | null = null

  function clearTimers(): void {
    if (showTimer) {
      clearTimeout(showTimer)
      showTimer = null
    }
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
  }

  watch(
    () => toValue(isLoading),
    (loading) => {
      if (loading) {
        // Clear any pending hide timer
        if (hideTimer) {
          clearTimeout(hideTimer)
          hideTimer = null
        }

        // Start loading: schedule show after delay
        if (delay === 0) {
          showLoading.value = true
          shownAt = Date.now()
        } else {
          showTimer = setTimeout(() => {
            showLoading.value = true
            shownAt = Date.now()
            showTimer = null
          }, delay)
        }
      } else {
        // Loading complete: clear show timer
        if (showTimer) {
          clearTimeout(showTimer)
          showTimer = null
        }

        // If visible, ensure minimum display duration
        if (showLoading.value && shownAt !== null) {
          const elapsed = Date.now() - shownAt
          const remaining = minDuration - elapsed

          if (remaining > 0) {
            hideTimer = setTimeout(() => {
              showLoading.value = false
              shownAt = null
              hideTimer = null
            }, remaining)
          } else {
            showLoading.value = false
            shownAt = null
          }
        }
      }
    },
    { immediate: true }
  )

  onUnmounted(clearTimers)

  return { showLoading }
}
