<!-- EmptyHeader component -->
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
    data-slot="empty-header"
    :class="cn('flex max-w-sm flex-col items-center gap-2 text-center', props.class)"
  >
    <slot />
  </div>
</template>
