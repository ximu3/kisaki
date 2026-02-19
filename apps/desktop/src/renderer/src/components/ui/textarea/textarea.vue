<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { toRef } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '@renderer/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  defaultValue?: string | number
  modelValue?: string | number
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  rows?: number
}>()

const emits = defineEmits<{
  'update:modelValue': [payload: string | number]
}>()

const defaultValue = toRef(() => props.defaultValue)

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: defaultValue.value
})
</script>

<template>
  <textarea
    v-model="modelValue"
    data-slot="textarea"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :readonly="props.readonly"
    :rows="props.rows"
    :spellcheck="false"
    :class="
      cn(
        'flex w-full min-w-0 rounded-md bg-input border border-border px-2 py-1.5 text-sm transition-colors resize-none',
        'placeholder:text-muted-foreground',
        'focus:border-primary focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted',
        props.class
      )
    "
  />
</template>
