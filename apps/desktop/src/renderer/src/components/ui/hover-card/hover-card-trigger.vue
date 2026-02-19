<script setup lang="ts">
import type { HoverCardTriggerProps } from 'reka-ui'
import { HoverCardTrigger, useForwardProps } from 'reka-ui'

const props = defineProps<HoverCardTriggerProps>()

const forwardedProps = useForwardProps(props)
</script>

<template>
  <HoverCardTrigger
    data-slot="hover-card-trigger"
    v-bind="forwardedProps"
  >
    <slot />
  </HoverCardTrigger>
</template>
