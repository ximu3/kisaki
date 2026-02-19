<!-- Card description component -->
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
    :class="cn('text-xs text-muted-foreground', props.class)"
    data-slot="card-description"
  >
    <slot />
  </div>
</template>
