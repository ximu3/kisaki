<!-- Card footer component -->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@renderer/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <div
    :class="cn('flex items-center px-3 py-2 border-t border-border', props.class)"
    data-slot="card-footer"
  >
    <slot />
  </div>
</template>
