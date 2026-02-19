<!-- CollapsibleGroupLabel - Text label -->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@renderer/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <span
    data-slot="collapsible-group-label"
    :class="cn('truncate flex-1 text-left', props.class)"
  >
    <slot />
  </span>
</template>
