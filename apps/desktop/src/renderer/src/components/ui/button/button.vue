<script setup lang="ts">
import { Primitive } from 'reka-ui'
import { cn } from '@renderer/utils'
import { buttonVariants } from './variants'
import type { ButtonProps } from './types'

const props = withDefaults(defineProps<ButtonProps>(), {
  as: 'button'
})
</script>

<template>
  <Primitive
    data-slot="button"
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </Primitive>
</template>
