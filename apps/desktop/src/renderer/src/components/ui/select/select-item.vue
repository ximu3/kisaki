<script setup lang="ts">
import type { SelectItemProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { Icon } from '@renderer/components/ui/icon'
import { SelectItem, SelectItemIndicator, SelectItemText, useForwardProps } from 'reka-ui'
import { cn } from '@renderer/utils'

const props = defineProps<
  SelectItemProps & { class?: HTMLAttributes['class']; description?: string }
>()

const delegatedProps = reactiveOmit(props, 'class', 'description')

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <SelectItem
    data-slot="select-item"
    v-bind="forwardedProps"
    :class="
      cn(
        'relative flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1 text-sm outline-none select-none',
        'focus:bg-accent focus:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        `[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5`,
        props.description && 'py-1.5',
        props.class
      )
    "
  >
    <span class="absolute right-2 flex size-3.5 items-center justify-center">
      <SelectItemIndicator>
        <slot name="indicator-icon">
          <Icon
            icon="icon-[mdi--check]"
            class="size-3.5"
          />
        </slot>
      </SelectItemIndicator>
    </span>
    <div class="flex flex-col items-start pr-4">
      <SelectItemText>
        <slot />
      </SelectItemText>
      <span
        v-if="props.description"
        class="text-xs text-muted-foreground"
        >{{ props.description }}</span
      >
    </div>
  </SelectItem>
</template>
