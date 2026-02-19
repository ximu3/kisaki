<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@renderer/utils'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div
    data-slot="dialog-footer"
    :class="cn('flex justify-end gap-2 px-4 py-3 border-t border-border', props.class)"
  >
    <slot />
  </div>
</template>
