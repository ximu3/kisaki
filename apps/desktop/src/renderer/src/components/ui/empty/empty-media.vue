<!-- EmptyMedia component with variants -->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@renderer/utils'

const emptyMediaVariants = cva(
  'flex shrink-0 items-center justify-center mb-2 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6"
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

type MediaVariants = VariantProps<typeof emptyMediaVariants>

interface Props {
  variant?: MediaVariants['variant']
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default'
})
</script>

<template>
  <div
    data-slot="empty-icon"
    :data-variant="props.variant"
    :class="cn(emptyMediaVariants({ variant: props.variant }), props.class)"
  >
    <slot />
  </div>
</template>
