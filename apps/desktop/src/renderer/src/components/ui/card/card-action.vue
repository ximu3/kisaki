<!-- Card action slot for header actions -->
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
    :class="cn('ml-auto', props.class)"
    data-slot="card-action"
  >
    <slot />
  </div>
</template>
