<!-- InputGroupAddon component with alignment variants -->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@renderer/utils'

const inputGroupAddonVariants = cva(
  "text-muted-foreground flex h-auto cursor-text items-center justify-center gap-2 py-1 text-sm font-medium select-none [&>svg:not([class*='size-'])]:size-4 group-data-[disabled=true]/input-group:opacity-50",
  {
    variants: {
      align: {
        'inline-start': 'order-first pl-2 has-[>button]:ml-[-0.25rem]',
        'inline-end': 'order-last pr-2 has-[>button]:mr-[-0.25rem]',
        'block-start':
          'order-first w-full justify-start px-2 pt-2 group-has-[>input]/input-group:pt-1.5',
        'block-end':
          'order-last w-full justify-start px-2 pb-2 group-has-[>input]/input-group:pb-1.5'
      }
    },
    defaultVariants: {
      align: 'inline-start'
    }
  }
)

type AddonVariants = VariantProps<typeof inputGroupAddonVariants>

interface Props {
  align?: AddonVariants['align']
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  align: 'inline-start'
})

function handleClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target.closest('button')) return
  const parent = (event.currentTarget as HTMLElement).parentElement
  parent?.querySelector('input')?.focus()
}
</script>

<template>
  <div
    role="group"
    data-slot="input-group-addon"
    :data-align="props.align"
    :class="cn(inputGroupAddonVariants({ align: props.align }), props.class)"
    @click="handleClick"
  >
    <slot />
  </div>
</template>
