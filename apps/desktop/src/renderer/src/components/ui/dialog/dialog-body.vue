<script setup lang="ts">
import { ref, type HTMLAttributes } from 'vue'
import { cn } from '@renderer/utils'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()

// Root element ref for scroll container binding
const rootRef = ref<HTMLElement>()

// Expose $el for parent to access the real DOM element
// Usage: const bodyRef = ref<InstanceType<typeof DialogBody>>()
//        :scroll-parent="bodyRef?.$el"
defineExpose({
  get $el() {
    return rootRef.value
  }
})
</script>

<template>
  <div
    ref="rootRef"
    data-slot="dialog-body"
    :class="cn('px-4 py-3', props.class)"
  >
    <slot />
  </div>
</template>
