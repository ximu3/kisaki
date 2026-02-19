<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Button } from '@renderer/components/ui/button'
import { cn } from '@renderer/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  disabled?: boolean
}>()
</script>

<template>
  <Button
    variant="destructive"
    :disabled="props.disabled"
    :class="cn(props.class)"
    data-slot="alert-dialog-action"
  >
    <slot />
  </Button>
</template>
