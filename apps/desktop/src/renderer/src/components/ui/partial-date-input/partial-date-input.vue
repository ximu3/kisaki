<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, ref, watch } from 'vue'
import type { PartialDate } from '@shared/db'
import type { PartialDateInputExpose, PartialDateInputMessages, PartialDateInputValidationResult } from './types'
import { cn } from '@renderer/utils'
import { Input } from '@renderer/components/ui/input'

const props = defineProps<{
  modelValue?: PartialDate | null
  defaultValue?: PartialDate | null
  disabled?: boolean
  readonly?: boolean
  messages?: PartialDateInputMessages
  id?: string
  class?: HTMLAttributes['class']
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', payload: PartialDate | null): void
}>()

const messageTexts = computed(() => {
  return {
    invalidIntegerText: props.messages?.invalidIntegerText ?? '日期只能填写整数。',
    yearDayWithoutMonthText:
      props.messages?.yearDayWithoutMonthText ?? '填写了年份和日期时，必须同时填写月份。'
  }
})

const yearInputId = computed(() => (props.id ? `${props.id}-year` : undefined))
const monthInputId = computed(() => (props.id ? `${props.id}-month` : undefined))
const dayInputId = computed(() => (props.id ? `${props.id}-day` : undefined))

const isSyncing = ref(false)
const rawYear = ref<string | number>('')
const rawMonth = ref<string | number>('')
const rawDay = ref<string | number>('')

function toRawFields(value: PartialDate | null | undefined) {
  return {
    year: value?.year !== undefined ? String(value.year) : '',
    month: value?.month !== undefined ? String(value.month) : '',
    day: value?.day !== undefined ? String(value.day) : ''
  }
}

watch(
  () => props.modelValue ?? props.defaultValue ?? null,
  (value) => {
    isSyncing.value = true
    const raw = toRawFields(value)
    rawYear.value = raw.year
    rawMonth.value = raw.month
    rawDay.value = raw.day
    isSyncing.value = false
  },
  { immediate: true }
)

function toTrimmedString(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function isBlank(value: unknown): boolean {
  return toTrimmedString(value).length === 0
}

function parseIntegerField(value: unknown): number | undefined {
  const trimmed = toTrimmedString(value)
  if (!trimmed) return undefined
  const parsed = Number(trimmed)
  if (!Number.isInteger(parsed)) return undefined
  return parsed
}

function validateFromRaw(): PartialDateInputValidationResult {
  const hasYearInput = !isBlank(rawYear.value)
  const hasMonthInput = !isBlank(rawMonth.value)
  const hasDayInput = !isBlank(rawDay.value)

  const hasAnyInput = hasYearInput || hasMonthInput || hasDayInput
  if (!hasAnyInput) {
    return { valid: true, value: null }
  }

  const year = parseIntegerField(rawYear.value)
  const month = parseIntegerField(rawMonth.value)
  const day = parseIntegerField(rawDay.value)

  if ((hasYearInput && year === undefined) || (hasMonthInput && month === undefined) || (hasDayInput && day === undefined)) {
    return { valid: false, value: null, errorText: messageTexts.value.invalidIntegerText }
  }

  const hasYear = year !== undefined
  const hasMonth = month !== undefined
  const hasDay = day !== undefined

  if (hasYear && hasDay && !hasMonth) {
    return { valid: false, value: null, errorText: messageTexts.value.yearDayWithoutMonthText }
  }

  const partial: PartialDate = {}
  if (hasYear) partial.year = year
  if (hasMonth) partial.month = month
  if (hasDay) partial.day = day

  return { valid: true, value: partial }
}

function maybeEmitModelValue() {
  const result = validateFromRaw()
  if (result.valid) {
    emit('update:modelValue', result.value)
  }
}

watch([rawYear, rawMonth, rawDay], () => {
  if (isSyncing.value) return
  maybeEmitModelValue()
})

function validate(): PartialDateInputValidationResult {
  return validateFromRaw()
}

defineExpose<PartialDateInputExpose>({ validate })
</script>

<template>
  <div :class="cn('grid grid-cols-3 gap-2', props.class)">
    <Input
      :id="yearInputId"
      v-model="rawYear"
      type="number"
      placeholder="年"
      :disabled="props.disabled"
      :readonly="props.readonly"
    />
    <Input
      :id="monthInputId"
      v-model="rawMonth"
      type="number"
      placeholder="月"
      :disabled="props.disabled"
      :readonly="props.readonly"
    />
    <Input
      :id="dayInputId"
      v-model="rawDay"
      type="number"
      placeholder="日"
      :disabled="props.disabled"
      :readonly="props.readonly"
    />
  </div>
</template>
