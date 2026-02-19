<!-- Resizable Layout - provides context for panels and handle -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, type HTMLAttributes } from 'vue'
import { cn } from '@renderer/utils'
import { useProvideResizable } from './use-resizable'

interface Props {
  leftWidth: number
  defaultWidth?: number
  minLeftWidth?: number
  maxLeftWidth?: number
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  defaultWidth: 220,
  minLeftWidth: 200,
  maxLeftWidth: 400
})

const emit = defineEmits<{
  'update:leftWidth': [width: number]
}>()

const containerRef = ref<HTMLDivElement>()
const containerWidth = ref(0)
const isResizing = ref(false)

const handleSize = 4
let startX = 0
let startWidth = 0

const rightWidth = computed(() => Math.max(0, containerWidth.value - props.leftWidth - handleSize))

function startResize(e: MouseEvent) {
  e.preventDefault()
  isResizing.value = true
  startX = e.clientX
  startWidth = props.leftWidth
}

function resetToDefault() {
  emit('update:leftWidth', props.defaultWidth)
}

function handleMouseMove(e: MouseEvent) {
  if (!isResizing.value) return

  const delta = e.clientX - startX
  const newWidth = Math.max(props.minLeftWidth, Math.min(props.maxLeftWidth, startWidth + delta))
  emit('update:leftWidth', newWidth)
}

function handleMouseUp() {
  if (isResizing.value) {
    isResizing.value = false
  }
}

let observer: ResizeObserver | null = null

onMounted(() => {
  if (!containerRef.value) return

  observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      containerWidth.value = entry.contentRect.width
    }
  })
  observer.observe(containerRef.value)

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  observer?.disconnect()
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})

useProvideResizable({
  get leftWidth() {
    return props.leftWidth
  },
  get rightWidth() {
    return rightWidth.value
  },
  get containerWidth() {
    return containerWidth.value
  },
  handleSize,
  get isResizing() {
    return isResizing.value
  },
  startResize,
  resetToDefault
})
</script>

<template>
  <div
    ref="containerRef"
    :class="cn('flex h-full relative', props.class)"
    data-slot="resizable-layout"
  >
    <slot />
  </div>
</template>
