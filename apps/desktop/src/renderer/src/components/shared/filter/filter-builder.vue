<!--
  FilterBuilder
  Core filter construction component.
  Renders all available filter fields grouped by category.
-->
<script setup lang="ts">
import type { FilterState } from '@shared/filter'
import { FieldGroup } from '@renderer/components/ui/field'
import {
  FilterBooleanField,
  FilterSelectField,
  FilterMultiSelectField,
  FilterNumberRangeField,
  FilterDateRangeField,
  FilterRelationField
} from './fields'
import type { FilterUiCategory, FilterUiFieldDef, FilterUiSpec } from './specs/types'

interface Props {
  uiSpec: FilterUiSpec
}

const props = defineProps<Props>()

const model = defineModel<FilterState>({ required: true })

function getFields<TCategory extends FilterUiCategory>(
  category: TCategory
): Extract<FilterUiFieldDef, { category: TCategory }>[] {
  return props.uiSpec.fields.filter(
    (f): f is Extract<FilterUiFieldDef, { category: TCategory }> => f.category === category
  )
}
</script>

<template>
  <FieldGroup>
    <!-- Toggle fields -->
    <FilterBooleanField
      v-for="field in getFields('toggle')"
      :key="field.key"
      v-model="model"
      :field="field"
    />

    <!-- Enum fields -->
    <template
      v-for="field in getFields('enum')"
      :key="field.key"
    >
      <FilterSelectField
        v-if="field.control === 'select'"
        v-model="model"
        :field="field"
      />
      <FilterMultiSelectField
        v-else
        v-model="model"
        :field="field"
      />
    </template>

    <!-- Numeric fields - use grid for compact layout -->
    <div
      v-if="getFields('numeric').length > 0"
      class="grid grid-cols-2 gap-4"
    >
      <FilterNumberRangeField
        v-for="field in getFields('numeric')"
        :key="field.key"
        v-model="model"
        :field="field"
      />
    </div>

    <!-- Date fields -->
    <FilterDateRangeField
      v-for="field in getFields('date')"
      :key="field.key"
      v-model="model"
      :field="field"
    />

    <!-- Relation fields -->
    <FilterRelationField
      v-for="field in getFields('relation')"
      :key="field.key"
      v-model="model"
      :field="field"
    />
  </FieldGroup>
</template>
