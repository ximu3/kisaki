<!-- InputGroup container component -->
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
    data-slot="input-group"
    role="group"
    :class="
      cn(
        'group/input-group relative flex w-full items-center rounded-md border border-border bg-input transition-colors',
        'h-7 min-w-0 has-[>textarea]:h-auto',

        // Variants based on alignment
        'has-[>[data-align=inline-start]]:[&>input]:pl-2',
        'has-[>[data-align=inline-end]]:[&>input]:pr-2',
        'has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3',
        'has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3',

        // Focus state - only border color change
        'has-[[data-slot=input-group-control]:focus]:border-primary',

        // Error state
        'has-[[data-slot][aria-invalid=true]]:border-destructive',

        props.class
      )
    "
  >
    <slot />
  </div>
</template>
