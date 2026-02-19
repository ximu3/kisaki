<!-- Card header component -->
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
    :class="cn('flex flex-col gap-1 px-3 py-2 border-b border-border', props.class)"
    data-slot="card-header"
  >
    <slot />
  </div>
</template>
