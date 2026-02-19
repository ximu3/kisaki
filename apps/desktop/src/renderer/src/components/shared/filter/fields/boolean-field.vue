<!--
  BooleanField
  Toggle switch for boolean filter fields.
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { FilterState } from '@shared/filter'
import { getFilterValue, setFilterValue } from '@shared/filter'
import { Field, FieldLabel, FieldContent } from '@renderer/components/ui/field'
import { Switch } from '@renderer/components/ui/switch'
import type { FilterUiFieldDef } from '../specs/types'

interface Props {
  field: Extract<FilterUiFieldDef, { control: 'boolean' }>
}

const props = defineProps<Props>()

const filterModel = defineModel<FilterState>({ required: true })

// Computed for the field's value within the FilterState
const fieldValue = computed({
  get: () => (getFilterValue(filterModel.value, props.field.key) as boolean | undefined) ?? undefined,
  set: (value) => {
    // Only true is meaningful, false/undefined both mean "no filter"
    const cleanValue = value === true ? true : undefined
    filterModel.value = setFilterValue(filterModel.value, props.field.key, cleanValue)
  }
})

// Switch expects boolean, convert undefined to false for display
const switchValue = computed({
  get: () => fieldValue.value === true,
  set: (v) => {
    fieldValue.value = v
  }
})
</script>

<template>
  <Field orientation="horizontal">
    <FieldLabel>{{ props.field.label }}</FieldLabel>
    <FieldContent>
      <Switch v-model="switchValue" />
    </FieldContent>
  </Field>
</template>
