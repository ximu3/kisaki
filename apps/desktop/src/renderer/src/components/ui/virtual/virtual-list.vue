<!--
  VirtualList - Virtualized vertical list component

  Features:
  - Vertical virtual scrolling for fixed-height items
  - Supports parent container scrolling
  - Dynamic item height measurement

  @example
  ```vue
  <VirtualList :items="entities" :scroll-parent="scrollContainerRef">
    <template #item="{ item, index }">
      <ListItem :entity="item" />
    </template>
  </VirtualList>
  ```
-->
<script setup lang="ts" generic="T">
import { ref, computed, onMounted, watch, nextTick, toRef, type HTMLAttributes } from 'vue'
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
    /** Container class - defaults to flex column with small gap */
    class?: HTMLAttributes['class']
    /** Overscan count for virtualizer */
    overscan?: number
  }>(),
  {
    getKey: undefined,
    scrollParent: null,
    class: 'flex flex-col gap-0.5',
    overscan: 5
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
const measureRef = ref<HTMLDivElement>()

// State
const measuredItemHeight = ref(24)
const measuredGap = ref(2)

// Scroll parent integration (must be before virtualizer to provide getScrollElement and scrollMargin)
const { scrollMargin, getScrollElement, notifyLayoutChange } = useVirtualScrollParent({
  containerRef,
  scrollParent: toRef(props, 'scrollParent'),
  observeRefs: [measureRef],
  onMeasure: () => virtualizer.value.measure(),
  onResize: measureLayout
})

// Virtualizer
const virtualizer = useVirtualizer(
  computed(() => ({
    count: props.items.length,
    getScrollElement,
    estimateSize: () => measuredItemHeight.value + measuredGap.value,
    overscan: props.overscan,
    scrollMargin: scrollMargin.value
  }))
)

/**
 * Measure actual item height from rendered DOM.
 */
async function measureLayout() {
  if (!measureRef.value || props.items.length === 0) return

  await nextTick()

  const firstItem = measureRef.value.firstElementChild as HTMLElement | null
  if (!firstItem) return

  measuredItemHeight.value = firstItem.offsetHeight

  const computedStyle = getComputedStyle(measureRef.value)
  const gapValue = parseFloat(computedStyle.rowGap) || parseFloat(computedStyle.gap) || 0
  measuredGap.value = gapValue

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

// Expose methods
defineExpose({
  scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' }) => {
    virtualizer.value.scrollToIndex(index, options)
  },
  virtualizer,
  measuredItemHeight,
  measuredGap
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
      <!-- Hidden measurement element -->
      <div
        ref="measureRef"
        :class="cn(props.class, 'invisible absolute top-0 left-0 w-full pointer-events-none')"
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
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
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
            width: '100%',
            transform: `translateY(${virtualItem.start - scrollMargin}px)`
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
