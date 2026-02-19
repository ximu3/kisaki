<!-- FieldError component - displays validation errors -->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, useSlots } from 'vue'
import { cn } from '@renderer/utils'

interface ErrorItem {
  message?: string
}

interface Props {
  errors?: Array<ErrorItem | undefined>
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const slots = useSlots()

const uniqueErrors = computed(() => {
  if (!props.errors?.length) return []
  const errorMap = new Map<string, ErrorItem>()
  for (const error of props.errors) {
    if (error?.message) {
      errorMap.set(error.message, error)
    }
  }
  return [...errorMap.values()]
})

const hasContent = computed(() => slots.default || uniqueErrors.value.length > 0)
</script>

<template>
  <div
    v-if="hasContent"
    role="alert"
    data-slot="field-error"
    :class="cn('text-destructive text-sm font-normal', props.class)"
  >
    <slot>
      <!-- Single error -->
      <template v-if="uniqueErrors.length === 1">
        {{ uniqueErrors[0]?.message }}
      </template>
      <!-- Multiple errors as list -->
      <ul
        v-else-if="uniqueErrors.length > 1"
        class="ml-4 flex list-disc flex-col gap-1"
      >
        <li
          v-for="(error, index) in uniqueErrors"
          :key="index"
        >
          {{ error.message }}
        </li>
      </ul>
    </slot>
  </div>
</template>
