<!-- CollapsibleGroupTrigger - Clickable header -->
<script setup lang="ts">
import { cn } from '@renderer/utils'
import { collapsibleGroupTriggerVariants } from './collapsible-group-variants'
import type { CollapsibleGroupTriggerProps } from './collapsible-group-types'

const props = withDefaults(defineProps<CollapsibleGroupTriggerProps>(), {
  variant: 'default'
})
</script>

<template>
  <div
    data-slot="collapsible-group-trigger"
    :data-state="props.collapsed ? 'closed' : 'open'"
    :class="cn(collapsibleGroupTriggerVariants({ variant: props.variant }), props.class)"
  >
    <slot />
  </div>
</template>
