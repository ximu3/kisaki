<!-- InputGroupInput component - styled input for input groups -->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Input } from '@renderer/components/ui/input'
import { cn } from '@renderer/utils'

interface Props {
  type?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text'
})

const model = defineModel<string | number>()
</script>

<template>
  <Input
    v-model="model"
    data-slot="input-group-control"
    :type="props.type"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :readonly="props.readonly"
    :class="
      cn(
        'flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent',
        props.class
      )
    "
  />
</template>
