<!--
  VirtualHorizontalScroll - Virtualized horizontal scroll with dynamic measurement

  Features:
  - Dynamic item width measurement
  - Horizontal virtual scrolling
  - Scroll navigation controls (scrollLeft/scrollRight)
  - Supports parent container scrolling

  @example
  ```vue
  <VirtualHorizontalScroll :items="games" @scroll-state-change="handleScroll">
    <template #item="{ item }">
      <GameCard :game="item as Game" size="md" />
    </template>
  </VirtualHorizontalScroll>
  ```
-->
<script setup lang="ts" generic="T">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
  toRef,
  type HTMLAttributes
} from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { cn } from '@renderer/utils'
import { useVirtualScrollParent } from './use-virtual-scroll-parent'

const props = withDefaults(
  defineProps<{
    /** Items to render */
    items: T[]
    /** Custom key extractor, defaults to index */
    getKey?: (item: T, index: number) => string | number
    /** External scroll parent element */
    scrollParent?: HTMLElement | null
    /** Container class - defaults to flex with gap */
    class?: HTMLAttributes['class']
    /** Overscan count for virtualizer */
    overscan?: number
  }>(),
  {
    getKey: undefined,
    scrollParent: null,
    class: 'flex gap-3',
    overscan: 3
  }
)

const emit = defineEmits<{
  /** Scroll state change event */
  scrollStateChange: [{ canScrollLeft: boolean; canScrollRight: boolean }]
}>()

defineSlots<{
  /** Item slot - receives item and index */
  item: (props: { item: T; index: number }) => void
  /** Empty state slot */
  empty?: () => void
}>()

// Refs
const containerRef = ref<HTMLDivElement>()
const measureRef = ref<HTMLDivElement>()

// State
const measuredItemWidth = ref(128)
const measuredItemHeight = ref(0)
const measuredGap = ref(12)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

// Scroll parent integration (must be before virtualizer to provide getScrollElement and scrollMargin)
const { scrollMargin, getScrollElement, notifyLayoutChange } = useVirtualScrollParent({
  containerRef,
  scrollParent: toRef(props, 'scrollParent'),
  observeRefs: [measureRef],
  horizontal: true,
  onMeasure: () => virtualizer.value.measure(),
  onResize: () => {
    measureLayout()
    updateScrollState()
  }
})

// Horizontal virtualizer
const virtualizer = useVirtualizer(
  computed(() => ({
    horizontal: true,
    count: props.items.length,
    getScrollElement,
    estimateSize: () => measuredItemWidth.value + measuredGap.value,
    overscan: props.overscan,
    scrollMargin: scrollMargin.value
  }))
)

/**
 * Measure actual item dimensions from rendered DOM.
 */
async function measureLayout() {
  if (!measureRef.value || props.items.length === 0) return

  await nextTick()

  const firstItem = measureRef.value.firstElementChild as HTMLElement | null
  if (!firstItem) return

  measuredItemWidth.value = firstItem.offsetWidth
  measuredItemHeight.value = firstItem.offsetHeight

  const computedStyle = getComputedStyle(measureRef.value)
  const gapValue = parseFloat(computedStyle.columnGap) || parseFloat(computedStyle.gap) || 0
  measuredGap.value = gapValue

  virtualizer.value.measure()
  notifyLayoutChange()
}

// Update scroll state
function updateScrollState() {
  const element = getScrollElement()
  if (!element) return

  const { scrollLeft, scrollWidth, clientWidth } = element
  canScrollLeft.value = scrollLeft > 1
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 1

  emit('scrollStateChange', {
    canScrollLeft: canScrollLeft.value,
    canScrollRight: canScrollRight.value
  })
}

// Scroll navigation methods
function scrollLeft() {
  const element = getScrollElement()
  if (!element) return

  const scrollAmount = element.clientWidth * 0.8
  element.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
}

function scrollRight() {
  const element = getScrollElement()
  if (!element) return

  const scrollAmount = element.clientWidth * 0.8
  element.scrollBy({ left: scrollAmount, behavior: 'smooth' })
}

function scrollToIndex(index: number, options?: { align?: 'start' | 'center' | 'end' }) {
  virtualizer.value.scrollToIndex(index, options)
}

// Setup scroll listener
let scrollCleanup: (() => void) | null = null

onMounted(() => {
  measureLayout()
  updateScrollState()

  const element = getScrollElement()
  if (element) {
    const handleScroll = () => updateScrollState()
    element.addEventListener('scroll', handleScroll, { passive: true })
    scrollCleanup = () => element.removeEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  scrollCleanup?.()
})

// Re-measure when items change
watch(
  () => props.items.length,
  (newLen, oldLen) => {
    if (newLen === oldLen || newLen === 0) return
    measureLayout()
    updateScrollState()
  }
)

// Expose methods
defineExpose({
  scrollLeft,
  scrollRight,
  scrollToIndex,
  canScrollLeft,
  canScrollRight,
  virtualizer,
  measuredItemWidth,
  measuredItemHeight
})
</script>

<template>
  <div
    ref="containerRef"
    :class="cn(!props.scrollParent && 'overflow-x-auto scrollbar-hide', 'relative')"
    :style="{
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      height: measuredItemHeight > 0 ? `${measuredItemHeight}px` : undefined
    }"
  >
    <slot
      v-if="props.items.length === 0"
      name="empty"
    />

    <template v-else>
      <!-- Hidden measurement element -->
      <div
        ref="measureRef"
        :class="cn(props.class, 'invisible absolute top-0 left-0 pointer-events-none')"
        aria-hidden="true"
      >
        <slot
          v-if="props.items[0]"
          name="item"
          :item="props.items[0]"
          :index="0"
        />
      </div>

      <!-- Virtual list container -->
      <div
        :style="{
          width: `${virtualizer.getTotalSize()}px`,
          height: '100%',
          position: 'relative'
        }"
      >
        <div
          v-for="virtualItem in virtualizer.getVirtualItems()"
          :key="
            props.getKey?.(props.items[virtualItem.index], virtualItem.index) ??
            String(virtualItem.key)
          "
          :style="{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            transform: `translateX(${virtualItem.start - scrollMargin}px)`
          }"
        >
          <slot
            name="item"
            :item="props.items[virtualItem.index]"
            :index="virtualItem.index"
          />
        </div>
      </div>
    </template>
  </div>
</template>
