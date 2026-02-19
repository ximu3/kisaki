<script setup lang="ts">
import type { PopoverTriggerProps } from 'reka-ui'
import { PopoverTrigger, useForwardProps } from 'reka-ui'

const props = defineProps<PopoverTriggerProps>()

const forwardedProps = useForwardProps(props)
</script>

<template>
  <PopoverTrigger
    data-slot="popover-trigger"
    v-bind="forwardedProps"
  >
    <slot />
  </PopoverTrigger>
</template>
