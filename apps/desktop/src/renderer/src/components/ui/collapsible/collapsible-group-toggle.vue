<!-- CollapsibleGroupToggle - Expand/collapse button -->
<script setup lang="ts">
import { Icon } from '@renderer/components/ui/icon'
import { cn } from '@renderer/utils'
import { collapsibleGroupToggleVariants } from './collapsible-group-variants'
import type { CollapsibleGroupToggleProps } from './collapsible-group-types'

const props = withDefaults(defineProps<CollapsibleGroupToggleProps>(), {
  variant: 'default'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  emit('click', e)
}
</script>

<template>
  <button
    type="button"
    data-slot="collapsible-group-toggle"
    :data-state="props.collapsed ? 'closed' : 'open'"
    :class="cn(collapsibleGroupToggleVariants({ variant: props.variant }), props.class)"
    @click="handleClick"
  >
    <Icon
      icon="icon-[mdi--chevron-down]"
      :class="cn('transition-transform', props.collapsed ? 'rotate-0' : 'rotate-180')"
    />
  </button>
</template>
