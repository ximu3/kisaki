<!-- CollapsibleGroup - A lightweight collapsible section component -->
<script setup lang="ts">
import { cn } from '@renderer/utils'
import { collapsibleGroupVariants } from './collapsible-group-variants'
import type { CollapsibleGroupProps } from './collapsible-group-types'

const props = withDefaults(defineProps<CollapsibleGroupProps>(), {
  variant: 'default'
})
</script>

<template>
  <div
    data-slot="collapsible-group"
    :class="cn(collapsibleGroupVariants({ variant: props.variant }), props.class)"
  >
    <slot />
  </div>
</template>
