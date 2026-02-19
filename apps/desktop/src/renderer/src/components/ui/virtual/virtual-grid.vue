<!--
  VirtualGrid - Virtualized grid with native CSS Grid layout

  Features:
  - Native CSS Grid layout (auto-fill, auto-fit, etc.)
  - Dynamic row height measurement
  - Auto-detects column count from actual DOM layout
  - Supports parent container scrolling

  @example
  ```vue
  <VirtualGrid :items="games" :scroll-parent="scrollContainerRef">
    <template #item="{ item }">
      <GameCard :game="item as Game" />
    </template>
  </VirtualGrid>
  ```
-->
<script setup lang="ts" generic="T">
import { ref, computed, watch, onMounted, nextTick, toRef, type HTMLAttributes } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { cn } from '@renderer/utils'
import { useVirtualScrollParent } from './use-virtual-scroll-parent'

const props = withDefaults(
  defineProps<{
    /** Items to render */
    items: T[]
    /** Custom key extractor, defaults to index */
    getKey?: (item: T, index: number) => string | number
    /** External scroll parent element (for parent container scrolling) */
    scrollParent?: HTMLElement | null
    /** Container/grid class - defaults to responsive auto-fill grid */
    class?: HTMLAttributes['class']
    /** Overscan row count for virtualizer */
    overscan?: number
  }>(),
  {
    getKey: undefined,
    scrollParent: null,
    class: 'grid grid-cols-[repeat(auto-fill,8rem)] gap-3 justify-between',
    overscan: 2
  }
)

defineSlots<{
  /** Item slot - receives item and index */
  item: (props: { item: T; index: number }) => void
  /** Empty state slot */
  empty?: () => void
}>()

// Refs
const containerRef = ref<HTMLDivElement>()
const measureRowRef = ref<HTMLDivElement>()

// State for dynamic measurement
const columnCount = ref(1)
const measuredRowHeight = ref(180)
const measuredRowGap = ref(12)

// Calculate row count based on detected columns
const rowCount = computed(() => Math.ceil(props.items.length / columnCount.value))

// Scroll parent integration (must be before virtualizer to provide getScrollElement and scrollMargin)
const { scrollMargin, getScrollElement, notifyLayoutChange } = useVirtualScrollParent({
  containerRef,
  scrollParent: toRef(props, 'scrollParent'),
  observeRefs: [measureRowRef],
  onMeasure: () => virtualizer.value.measure(),
  onResize: measureLayout
})

// Virtualizer for rows
const virtualizer = useVirtualizer(
  computed(() => ({
    count: rowCount.value,
    getScrollElement,
    estimateSize: () => measuredRowHeight.value + measuredRowGap.value,
    overscan: props.overscan,
    scrollMargin: scrollMargin.value
  }))
)

// Get items for a specific row
function getRowItems(rowIndex: number): { item: T; index: number }[] {
  const startIndex = rowIndex * columnCount.value
  const endIndex = Math.min(startIndex + columnCount.value, props.items.length)
  const result: { item: T; index: number }[] = []

  for (let i = startIndex; i < endIndex; i++) {
    result.push({ item: props.items[i], index: i })
  }

  return result
}

/**
 * Measure actual column count and row height from rendered DOM.
 */
async function measureLayout() {
  if (!measureRowRef.value || props.items.length === 0) return

  await nextTick()

  const measureRow = measureRowRef.value
  const children = measureRow.children

  if (children.length === 0) return

  // Detect column count by checking how many items fit in first row
  const firstItemTop = (children[0] as HTMLElement).offsetTop
  let cols = 0

  for (let i = 0; i < children.length; i++) {
    const child = children[i] as HTMLElement
    if (child.offsetTop === firstItemTop) {
      cols++
    } else {
      break
    }
  }

  columnCount.value = Math.max(1, cols)

  // Measure row height from first item
  const firstItem = children[0] as HTMLElement
  measuredRowHeight.value = firstItem.offsetHeight

  // Measure row gap from computed style
  const computedStyle = getComputedStyle(measureRow)
  const rowGapValue = parseFloat(computedStyle.rowGap) || 0
  measuredRowGap.value = rowGapValue

  virtualizer.value.measure()
  notifyLayoutChange()
}

onMounted(() => {
  measureLayout()
})

// Re-measure when items change
watch(
  () => props.items.length,
  (newLen, oldLen) => {
    if (newLen === oldLen || newLen === 0) return
    measureLayout()
  }
)

// Expose for parent access
defineExpose({
  scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' }) => {
    const rowIndex = Math.floor(index / columnCount.value)
    virtualizer.value.scrollToIndex(rowIndex, options)
  },
  virtualizer,
  columnCount,
  measuredRowHeight
})
</script>

<template>
  <div
    ref="containerRef"
    :class="cn(!props.scrollParent && 'overflow-auto scrollbar-thin', 'relative')"
  >
    <slot
      v-if="props.items.length === 0"
      name="empty"
    />

    <template v-else>
      <!-- Hidden measurement row -->
      <div
        ref="measureRowRef"
        :class="cn(props.class, 'invisible absolute top-0 left-0 w-full pointer-events-none')"
        aria-hidden="true"
      >
        <template
          v-for="(item, index) in props.items.slice(0, 20)"
          :key="props.getKey?.(item, index) ?? index"
        >
          <slot
            name="item"
            :item="item"
            :index="index"
          />
        </template>
      </div>

      <!-- Virtual list container -->
      <div
        :style="{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }"
      >
        <div
          v-for="virtualRow in virtualizer.getVirtualItems()"
          :key="String(virtualRow.key)"
          :class="props.class"
          :style="{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualRow.start - scrollMargin}px)`
          }"
        >
          <template
            v-for="{ item, index } in getRowItems(virtualRow.index)"
            :key="props.getKey?.(item, index) ?? index"
          >
            <slot
              name="item"
              :item="item"
              :index="index"
            />
          </template>
        </div>
      </div>
    </template>
  </div>
</template>
