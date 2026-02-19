<!--
  NumberRangeField
  Number range input for numeric filter fields.
  Uses local state with blur handler to sync values.
-->
<script setup lang="ts">
import type { FilterState, NumberRangeValue } from '@shared/filter'
import { ref, watch, computed } from 'vue'
import { getFilterValue, setFilterValue } from '@shared/filter'
import { Field, FieldLabel, FieldContent } from '@renderer/components/ui/field'
import { Input } from '@renderer/components/ui/input'
import type { FilterUiFieldDef } from '../specs/types'

interface Props {
  field: Extract<FilterUiFieldDef, { control: 'numberRange' }>
}

const props = defineProps<Props>()

const filterModel = defineModel<FilterState>({ required: true })

// Computed for the field's value within the FilterState
const fieldValue = computed({
  get: () => getFilterValue(filterModel.value, props.field.key) as NumberRangeValue | undefined,
  set: (value) => {
    filterModel.value = setFilterValue(filterModel.value, props.field.key, value)
  }
})

// Local state for inputs - initialized in watch
const minInput = ref('')
const maxInput = ref('')

// Sync local state when external value changes (including initial)
watch(
  fieldValue,
  (newValue) => {
    minInput.value = newValue?.min?.toString() || ''
    maxInput.value = newValue?.max?.toString() || ''
  },
  { immediate: true }
)

function handleBlur() {
  const min = minInput.value ? parseFloat(minInput.value) : undefined
  const max = maxInput.value ? parseFloat(maxInput.value) : undefined

  fieldValue.value = {
    min: min !== undefined && !isNaN(min) ? min : undefined,
    max: max !== undefined && !isNaN(max) ? max : undefined
  }
}
</script>

<template>
  <Field>
    <FieldLabel>{{ props.field.label }}</FieldLabel>
    <FieldContent>
      <div class="flex items-center gap-2">
        <Input
          v-model="minInput"
          type="number"
          :placeholder="props.field.min?.toString() || '最小'"
          :min="props.field.min"
          :max="props.field.max"
          :step="props.field.step"
          @blur="handleBlur"
        />
        <span class="text-xs text-muted-foreground">-</span>
        <Input
          v-model="maxInput"
          type="number"
          :placeholder="props.field.max?.toString() || '最大'"
          :min="props.field.min"
          :max="props.field.max"
          :step="props.field.step"
          @blur="handleBlur"
        />
      </div>
    </FieldContent>
  </Field>
</template>
