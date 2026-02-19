<!-- FieldSeparator component - visual separator with optional content -->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useSlots } from 'vue'
import { Separator } from '@renderer/components/ui/separator'
import { cn } from '@renderer/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const slots = useSlots()
const hasContent = !!slots.default
</script>

<template>
  <div
    data-slot="field-separator"
    :data-content="hasContent"
    :class="
      cn('relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2', props.class)
    "
  >
    <Separator class="absolute inset-0 top-1/2" />
    <span
      v-if="hasContent"
      class="bg-background text-muted-foreground relative mx-auto block w-fit px-2"
      data-slot="field-separator-content"
    >
      <slot />
    </span>
  </div>
</template>
