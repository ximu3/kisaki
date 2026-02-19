<!-- Resizable Handle component -->
<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { useResizable } from './use-resizable'
import { cn } from '@renderer/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const context = useResizable()

const handleStyle = computed(() => ({
  width: `${context.handleSize}px`,
  left: `${context.leftWidth}px`
}))
</script>

<template>
  <div
    :class="
      cn(
        'shrink-0 cursor-col-resize transition-colors absolute h-full z-10',
        'bg-transparent hover:bg-primary',
        context.isResizing && 'bg-primary',
        props.class
      )
    "
    :style="handleStyle"
    data-slot="resizable-handle"
    @mousedown="context.startResize"
    @dblclick="context.resetToDefault"
  />
</template>
