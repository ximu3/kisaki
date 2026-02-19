<!--
  DateRangeField
  Date range input for date filter fields.
-->
<script setup lang="ts">
import type { FilterState, DateRangeValue } from '@shared/filter'
import { computed } from 'vue'
import { getFilterValue, setFilterValue } from '@shared/filter'
import { Field, FieldLabel, FieldContent } from '@renderer/components/ui/field'
import { Input } from '@renderer/components/ui/input'
import type { FilterUiFieldDef } from '../specs/types'

interface Props {
  field: Extract<FilterUiFieldDef, { control: 'dateRange' }>
}

const props = defineProps<Props>()

const filterModel = defineModel<FilterState>({ required: true })

// Computed for the field's value within the FilterState
const fieldValue = computed({
  get: () => getFilterValue(filterModel.value, props.field.key) as DateRangeValue | undefined,
  set: (value) => {
    filterModel.value = setFilterValue(filterModel.value, props.field.key, value)
  }
})

// Computed properties for two-way binding on individual date inputs
const fromDate = computed({
  get: () => fieldValue.value?.from || '',
  set: (value) => {
    const from = value || undefined
    const to = fieldValue.value?.to
    fieldValue.value = { from, to }
  }
})

const toDate = computed({
  get: () => fieldValue.value?.to || '',
  set: (value) => {
    const from = fieldValue.value?.from
    const to = value || undefined
    fieldValue.value = { from, to }
  }
})
</script>

<template>
  <Field>
    <FieldLabel>{{ props.field.label }}</FieldLabel>
    <FieldContent>
      <div class="flex items-center gap-2">
        <Input
          v-model="fromDate"
          type="date"
        />
        <span class="text-xs text-muted-foreground">-</span>
        <Input
          v-model="toDate"
          type="date"
        />
      </div>
    </FieldContent>
  </Field>
</template>
