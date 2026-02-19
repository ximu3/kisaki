<script setup lang="ts">
import type { DialogTriggerProps } from 'reka-ui'
import { DialogTrigger, useForwardProps } from 'reka-ui'

const props = defineProps<DialogTriggerProps>()

const forwardedProps = useForwardProps(props)
</script>

<template>
  <DialogTrigger
    data-slot="dialog-trigger"
    v-bind="forwardedProps"
  >
    <slot />
  </DialogTrigger>
</template>
