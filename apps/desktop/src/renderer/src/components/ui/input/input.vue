<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '@renderer/utils'

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  type?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  class?: HTMLAttributes['class']
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true
})
</script>

<template>
  <input
    v-model="modelValue"
    :type="props.type ?? 'text'"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :readonly="props.readonly"
    data-slot="input"
    :class="
      cn(
        'flex h-7 w-full min-w-0 rounded-md bg-input border border-border px-2 py-1 text-sm transition-colors',
        'placeholder:text-muted-foreground',
        'focus:border-primary focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        props.type === 'number' &&
          '[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]',
        (props.type === 'date' || props.type === 'datetime-local') &&
          '[&::-webkit-calendar-picker-indicator]:hidden',
        props.class
      )
    "
    :spellcheck="false"
  />
</template>
