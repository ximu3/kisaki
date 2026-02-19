<!-- SegmentedControlItem - single option in a segmented control -->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { TabsTrigger } from 'reka-ui'
import { cn } from '@renderer/utils'

interface Props {
  value: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <TabsTrigger
    :value="props.value"
    :disabled="props.disabled"
    :class="
      cn(
        'inline-flex h-full items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground whitespace-nowrap transition-colors',
        'hover:text-foreground',
        'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
        'disabled:pointer-events-none disabled:opacity-50',
        `[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5`,
        props.class
      )
    "
    data-slot="segmented-control-item"
  >
    <slot />
  </TabsTrigger>
</template>
