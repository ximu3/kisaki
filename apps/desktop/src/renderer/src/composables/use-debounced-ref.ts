/**
 * Composable: useDebouncedRef
 *
 * Returns a debounced ref that only updates after the specified
 * delay has passed without changes.
 *
 * @example
 * ```ts
 * const search = ref('')
 * const debouncedSearch = useDebouncedRef(search, 300)
 *
 * // debouncedSearch.value updates 300ms after user stops typing
 * watch(
 *   debouncedSearch,
 *   (value) => {
 *     performSearch(value)
 *   },
 *   { immediate: true }
 * )
 * ```
 */

import { ref, watch, onUnmounted, type Ref, type MaybeRefOrGetter, toValue } from 'vue'

export function useDebouncedRef<T>(source: MaybeRefOrGetter<T>, delay: number): Ref<T> {
  const debouncedValue = ref(toValue(source)) as Ref<T>

  let timer: ReturnType<typeof setTimeout> | null = null

  watch(
    () => toValue(source),
    (newValue) => {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        debouncedValue.value = newValue
      }, delay)
    }
  )

  onUnmounted(() => {
    if (timer) {
      clearTimeout(timer)
    }
  })

  return debouncedValue
}
