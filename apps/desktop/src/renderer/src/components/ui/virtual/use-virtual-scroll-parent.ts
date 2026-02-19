import { ref, unref, watch, onMounted, onUnmounted, type Ref } from 'vue'
import { onLayoutInvalidate, invalidateLayout } from './virtual-layout-invalidation'

export interface UseVirtualScrollParentOptions {
  /** Reference to the container element */
  containerRef: Ref<HTMLElement | undefined>
  /** External scroll parent element */
  scrollParent: Ref<HTMLElement | null | undefined>
  /** Additional elements to observe for resize */
  observeRefs?: Ref<HTMLElement | undefined>[]
  /** Callback to trigger virtualizer measure (called lazily to avoid circular deps) */
  onMeasure?: () => void
  /** Whether this is horizontal scrolling (affects margin calculation) */
  horizontal?: boolean
  /** Callback when resize is detected */
  onResize?: () => void
}

/**
 * Composable for managing scroll parent integration in virtual components.
 * Handles scroll margin calculation, resize observation, and layout invalidation.
 */
export function useVirtualScrollParent(options: UseVirtualScrollParentOptions) {
  const {
    containerRef,
    scrollParent,
    observeRefs = [],
    onMeasure,
    horizontal = false,
    onResize
  } = options

  const scrollMargin = ref(0)

  // Get the effective scroll element
  const getScrollElement = () => unref(scrollParent) ?? containerRef.value ?? null

  // Calculate scroll margin based on container position relative to scroll parent
  function computeScrollMargin(): number {
    const parent = unref(scrollParent)
    if (!parent || !containerRef.value) return 0

    const containerRect = containerRef.value.getBoundingClientRect()
    const parentRect = parent.getBoundingClientRect()

    if (horizontal) {
      return containerRect.left - parentRect.left + parent.scrollLeft
    }
    return containerRect.top - parentRect.top + parent.scrollTop
  }

  // Update scroll margin and trigger virtualizer measure
  function updateScrollMargin() {
    if (!unref(scrollParent)) {
      scrollMargin.value = 0
      return
    }
    const nextMargin = computeScrollMargin()
    if (nextMargin === scrollMargin.value) return
    scrollMargin.value = nextMargin
    onMeasure?.()
  }

  // Throttled scroll margin update using requestAnimationFrame
  let updateScheduled = false
  function scheduleScrollMarginUpdate() {
    if (updateScheduled) return
    updateScheduled = true
    requestAnimationFrame(() => {
      updateScheduled = false
      updateScrollMargin()
    })
  }

  // Internal state
  let resizeObserver: ResizeObserver | null = null
  let unsubscribeLayout: (() => void) | null = null

  onMounted(() => {
    scheduleScrollMarginUpdate()

    // Setup resize observer
    resizeObserver = new ResizeObserver(() => {
      scheduleScrollMarginUpdate()
      onResize?.()
    })

    if (containerRef.value) resizeObserver.observe(containerRef.value)
    for (const observeRef of observeRefs) {
      if (observeRef.value) resizeObserver.observe(observeRef.value)
    }
    const parent = unref(scrollParent)
    if (parent) resizeObserver.observe(parent)

    // Subscribe to layout invalidation
    if (parent) {
      unsubscribeLayout = onLayoutInvalidate(parent, scheduleScrollMarginUpdate)
      invalidateLayout(parent)
    }
  })

  onUnmounted(() => {
    const parent = unref(scrollParent)
    if (parent) invalidateLayout(parent)
    resizeObserver?.disconnect()
    unsubscribeLayout?.()
  })

  // Watch for scroll parent changes
  watch(scrollParent, (nextParent, prevParent) => {
    if (nextParent === prevParent) return

    // Update resize observer
    if (resizeObserver) {
      if (prevParent) resizeObserver.unobserve(prevParent)
      if (nextParent) resizeObserver.observe(nextParent)
    }

    // Update layout subscription
    unsubscribeLayout?.()
    unsubscribeLayout = null
    scrollMargin.value = 0

    if (!nextParent) return
    unsubscribeLayout = onLayoutInvalidate(nextParent, scheduleScrollMarginUpdate)
    scheduleScrollMarginUpdate()
    invalidateLayout(nextParent)
  })

  return {
    scrollMargin,
    getScrollElement,
    scheduleScrollMarginUpdate,
    /** Notify sibling components that layout has changed */
    notifyLayoutChange: () => {
      const parent = unref(scrollParent)
      if (parent) invalidateLayout(parent)
    }
  }
}
