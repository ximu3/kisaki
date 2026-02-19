<!-- AlertDialog footer component -->
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
    :class="cn('flex justify-end gap-2 px-4 py-3', props.class)"
    data-slot="alert-dialog-footer"
  >
    <slot />
  </div>
</template>
