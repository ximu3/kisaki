<!-- InputGroupTextarea component - styled textarea for input groups -->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Textarea } from '@renderer/components/ui/textarea'
import { cn } from '@renderer/utils'

interface Props {
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const model = defineModel<string>()
</script>

<template>
  <Textarea
    v-model="model"
    data-slot="input-group-control"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :readonly="props.readonly"
    :class="
      cn(
        'flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent',
        props.class
      )
    "
  />
</template>
