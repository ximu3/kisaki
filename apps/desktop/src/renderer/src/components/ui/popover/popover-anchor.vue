<script setup lang="ts">
import type { PopoverAnchorProps } from 'reka-ui'
import { PopoverAnchor, useForwardProps } from 'reka-ui'

const props = defineProps<PopoverAnchorProps>()

const forwardedProps = useForwardProps(props)
</script>

<template>
  <PopoverAnchor
    data-slot="popover-anchor"
    v-bind="forwardedProps"
  >
    <slot />
  </PopoverAnchor>
</template>
