<!-- FieldLegend component - legend for fieldset -->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@renderer/utils'

interface Props {
  variant?: 'legend' | 'label'
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'legend'
})
</script>

<template>
  <legend
    data-slot="field-legend"
    :data-variant="props.variant"
    :class="
      cn(
        'mb-3 font-medium',
        'data-[variant=legend]:text-base',
        'data-[variant=label]:text-sm',
        props.class
      )
    "
  >
    <slot />
  </legend>
</template>
