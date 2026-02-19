<script setup lang="ts">
import type { ContextMenuSubTriggerProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { Icon } from '@renderer/components/ui/icon'
import { ContextMenuSubTrigger, useForwardProps } from 'reka-ui'
import { cn } from '@renderer/utils'

const props = defineProps<
  ContextMenuSubTriggerProps & { class?: HTMLAttributes['class']; inset?: boolean }
>()

const delegatedProps = reactiveOmit(props, 'class')

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <ContextMenuSubTrigger
    data-slot="context-menu-sub-trigger"
    :data-inset="inset ? '' : undefined"
    v-bind="forwardedProps"
    :class="
      cn(
        `focus:bg-accent gap-2 focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center rounded-sm px-2 py-1 text-sm outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
        'data-[inset]:pl-8',
        props.class
      )
    "
  >
    <slot />
    <Icon
      icon="icon-[mdi--chevron-right]"
      class="ml-auto"
    />
  </ContextMenuSubTrigger>
</template>
