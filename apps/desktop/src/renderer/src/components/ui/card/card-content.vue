<!-- Card content component -->
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
    :class="cn('px-3 py-2', props.class)"
    data-slot="card-content"
  >
    <slot />
  </div>
</template>
