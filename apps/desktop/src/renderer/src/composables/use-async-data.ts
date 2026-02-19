/**
 * Async data fetching composable
 *
 * Provides loading states, error handling, and automatic refetching
 * when dependencies change.
 */

import { ref, watch, onUnmounted, toValue, type Ref, type MaybeRefOrGetter } from 'vue'

/**
 * Options for useAsyncData
 */
export interface UseAsyncDataOptions {
  /** Dependencies to watch for refetch */
  watch?: MaybeRefOrGetter<unknown>[]
  /** Whether to fetch immediately (default: true) */
  immediate?: boolean
  /** Whether fetching is enabled (default: true) */
  enabled?: MaybeRefOrGetter<boolean>
}

/**
 * Return type for useAsyncData
 */
export interface UseAsyncDataReturn<T> {
  /** The fetched data (undefined before first successful fetch) */
  data: Ref<T | undefined>
  /** True during initial load (no data yet) */
  isLoading: Ref<boolean>
  /** True during any fetch (including refetch) */
  isFetching: Ref<boolean>
  /** Error message if fetch failed */
  error: Ref<string | null>
  /** Fetch counter for keying components */
  fetchId: Ref<number>
  /** Manually trigger refetch */
  refetch: () => Promise<void>
}

/**
 * Async data fetching composable
 *
 * Use computed() to extract fields and provide default values.
 *
 * @example
 * ```ts
 * const { data, isLoading } = useAsyncData(
 *   () => fetchGameData(toValue(gameId)),
 *   { watch: [gameId] }
 * )
 *
 * // Use computed for derived values with defaults
 * const game = computed(() => data.value?.game ?? null)
 * const tags = computed(() => data.value?.tags ?? [])
 * ```
 */
export function useAsyncData<T>(
  fetcher: (signal?: AbortSignal) => Promise<T>,
  options: UseAsyncDataOptions = {}
): UseAsyncDataReturn<T> {
  const { watch: watchSources, immediate = true, enabled = true } = options

  // State
  const data = ref<T>() as Ref<T | undefined>
  const isLoading = ref(false)
  const isFetching = ref(false)
  const error = ref<string | null>(null)
  const fetchId = ref(0)

  // Track successful fetches for isLoading calculation
  let hasSucceeded = false

  // AbortController for cancellation
  let abortController: AbortController | null = null

  async function execute(): Promise<void> {
    // Check if enabled
    if (!toValue(enabled)) return

    // Cancel previous request
    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()

    // Set loading states
    if (!hasSucceeded) {
      isLoading.value = true
    }
    isFetching.value = true
    error.value = null

    try {
      const result = await fetcher(abortController.signal)

      // Check if aborted
      if (abortController.signal.aborted) return

      data.value = result
      hasSucceeded = true
      fetchId.value++
    } catch (e) {
      // Ignore abort errors
      if (e instanceof Error && e.name === 'AbortError') return

      const err = e instanceof Error ? e : new Error(String(e))
      error.value = err.message
      console.error('useAsyncData fetch error:', e)
    } finally {
      isLoading.value = false
      isFetching.value = false
    }
  }

  // Watch enabled state - fetch when it becomes true
  watch(
    () => toValue(enabled),
    (newEnabled, oldEnabled) => {
      if (newEnabled && !oldEnabled) {
        execute()
      }
    }
  )

  // Watch dependencies
  if (watchSources && watchSources.length > 0) {
    watch(
      watchSources.map((s) => () => toValue(s)),
      execute,
      { immediate }
    )
  } else if (immediate) {
    execute()
  }

  // Cleanup on unmount
  onUnmounted(() => {
    if (abortController) {
      abortController.abort()
    }
  })

  return {
    data,
    isLoading,
    isFetching,
    error,
    fetchId,
    refetch: execute
  }
}
