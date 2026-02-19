<!-- Card container component -->
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
    :class="cn('rounded-md border border-border bg-card text-card-foreground', props.class)"
    data-slot="card"
  >
    <slot />
  </div>
</template>
