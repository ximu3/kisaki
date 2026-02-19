<!-- Hover Scale Image with spring-like animation -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, type HTMLAttributes } from 'vue'
import { cn } from '@renderer/utils'

interface Props {
  class?: HTMLAttributes['class']
  scaleInitial?: number
  scaleHover?: number
}

const props = withDefaults(defineProps<Props>(), {
  scaleInitial: 1,
  scaleHover: 1.01
})

const containerRef = ref<HTMLDivElement>()
const isHovered = ref(false)

const innerStyle = computed(() => ({
  transform: `scale(${isHovered.value ? props.scaleHover : props.scaleInitial})`,
  transition: 'transform 0.2s ease-out'
}))

function handleEnter() {
  isHovered.value = true
}

function handleLeave() {
  isHovered.value = false
}

onMounted(() => {
  if (!containerRef.value) return

  // Find closest parent with 'group' class
  const groupParent = containerRef.value.closest('.group') as HTMLElement | null
  const target = groupParent || containerRef.value

  target.addEventListener('mouseenter', handleEnter)
  target.addEventListener('mouseleave', handleLeave)
})

onUnmounted(() => {
  if (!containerRef.value) return

  const groupParent = containerRef.value.closest('.group') as HTMLElement | null
  const target = groupParent || containerRef.value

  target.removeEventListener('mouseenter', handleEnter)
  target.removeEventListener('mouseleave', handleLeave)
})
</script>

<template>
  <div
    ref="containerRef"
    :class="cn('relative overflow-hidden', props.class)"
    data-slot="hover-scale-image"
  >
    <div
      class="size-full transform-gpu will-change-transform"
      :style="innerStyle"
    >
      <slot />
    </div>
  </div>
</template>
