<!--
  MultiSelectField
  Multi-select for enum filter fields.
  Uses IN operator only since enum fields are single-value
  (AND semantics would never match anything).
-->
<script setup lang="ts">
import type { FilterState } from '@shared/filter'
import { computed } from 'vue'
import { getFilterValue, setFilterValue } from '@shared/filter'
import { Field, FieldLabel, FieldContent } from '@renderer/components/ui/field'
import { Button } from '@renderer/components/ui/button'
import { cn } from '@renderer/utils'
import type { FilterUiFieldDef } from '../specs/types'

interface Props {
  field: Extract<FilterUiFieldDef, { control: 'multiSelect' }>
}

const props = defineProps<Props>()

const filterModel = defineModel<FilterState>({ required: true })

// Computed for the field's value within the FilterState
const fieldValue = computed({
  get: () => getFilterValue(filterModel.value, props.field.key) as string[] | undefined,
  set: (value) => {
    filterModel.value = setFilterValue(filterModel.value, props.field.key, value)
  }
})

const selectedValues = computed(() => fieldValue.value || [])

function handleToggle(optionValue: string) {
  const newValues = selectedValues.value.includes(optionValue)
    ? selectedValues.value.filter((v) => v !== optionValue)
    : [...selectedValues.value, optionValue]

  fieldValue.value = newValues
}
</script>

<template>
  <Field v-if="props.field.options && props.field.options.length > 0">
    <FieldLabel>{{ props.field.label }}</FieldLabel>
    <FieldContent>
      <div class="flex flex-wrap gap-1.5">
        <Button
          v-for="option in props.field.options"
          :key="option.value"
          type="button"
          variant="secondary"
          size="xs"
          :class="
            cn(
              selectedValues.includes(option.value)
                ? 'bg-accent text-accent-foreground hover:bg-accent/80 border-accent'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )
          "
          @click="() => handleToggle(option.value)"
        >
          {{ option.label }}
        </Button>
      </div>
    </FieldContent>
  </Field>
</template>
