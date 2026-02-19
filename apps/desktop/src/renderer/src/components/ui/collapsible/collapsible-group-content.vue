<!-- CollapsibleGroupContent - Collapsible body -->
<script setup lang="ts">
import { cn } from '@renderer/utils'
import { collapsibleGroupContentVariants } from './collapsible-group-variants'
import type { CollapsibleGroupContentProps } from './collapsible-group-types'

const props = withDefaults(defineProps<CollapsibleGroupContentProps>(), {
  variant: 'default'
})
</script>

<template>
  <div
    v-if="!props.collapsed"
    data-slot="collapsible-group-content"
    :class="cn(collapsibleGroupContentVariants({ variant: props.variant }), props.class)"
  >
    <slot />
  </div>
</template>
