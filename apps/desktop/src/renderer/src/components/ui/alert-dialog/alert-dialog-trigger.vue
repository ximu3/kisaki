<script setup lang="ts">
import type { AlertDialogTriggerProps } from 'reka-ui'
import { AlertDialogTrigger } from 'reka-ui'

const props = defineProps<AlertDialogTriggerProps>()
</script>

<template>
  <AlertDialogTrigger
    v-bind="props"
    data-slot="alert-dialog-trigger"
  >
    <slot />
  </AlertDialogTrigger>
</template>
