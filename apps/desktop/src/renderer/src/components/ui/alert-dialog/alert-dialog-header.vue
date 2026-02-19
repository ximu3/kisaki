<!-- AlertDialog header component -->
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
    :class="cn('px-4 py-3 border-b border-border', props.class)"
    data-slot="alert-dialog-header"
  >
    <slot />
  </div>
</template>
