<!-- InputGroupButton component with size variants -->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { Button } from '@renderer/components/ui/button'
import { cn } from '@renderer/utils'

const inputGroupButtonVariants = cva('text-sm shadow-none flex gap-2 items-center', {
  variants: {
    size: {
      xs: "h-5 gap-1 px-1.5 rounded-md [&>svg:not([class*='size-'])]:size-3.5 has-[>svg]:px-1.5",
      sm: 'h-6 px-2 gap-1.5 rounded-md has-[>svg]:px-2',
      'icon-xs': 'size-5 rounded-md p-0 has-[>svg]:p-0',
      'icon-sm': 'size-6 p-0 has-[>svg]:p-0'
    }
  },
  defaultVariants: {
    size: 'xs'
  }
})

type ButtonSizeVariants = VariantProps<typeof inputGroupButtonVariants>

interface Props {
  size?: ButtonSizeVariants['size']
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  size: 'xs',
  variant: 'ghost',
  type: 'button'
})
</script>

<template>
  <Button
    :type="props.type"
    :variant="props.variant"
    :disabled="props.disabled"
    :data-size="props.size"
    :class="cn(inputGroupButtonVariants({ size: props.size }), props.class)"
  >
    <slot />
  </Button>
</template>
