<!-- Card title component -->
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
    :class="cn('text-sm font-medium leading-none', props.class)"
    data-slot="card-title"
  >
    <slot />
  </div>
</template>
