<!--
  CompanySelect
  Company select component with built-in data fetching.
  Supports both single and multiple selection modes.
  Uses virtual scrolling for performance.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePreferencesStore } from '@renderer/stores'
import { VirtualizedCombobox } from '@renderer/components/ui/virtualized-combobox'
import { db } from '@renderer/core/db'
import { useAsyncData, useEvent } from '@renderer/composables'

interface Props {
  /** Multiple selection mode */
  multiple?: boolean
  /** Placeholder text */
  placeholder?: string
  /** Text when nothing selected */
  emptyText?: string
  /** Whether the select is disabled */
  disabled?: boolean
  /** Company IDs to exclude from the list */
  excludeIds?: string[]
  /** Custom class name */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  placeholder: '搜索公司...',
  emptyText: '选择公司...',
  disabled: false,
  excludeIds: () => []
})

/** Currently selected company ID (single mode) */
const modelValue = defineModel<string>({ default: '' })
/** Currently selected company IDs (multiple mode) */
const selectedIdsModel = defineModel<string[]>('selectedIds', { default: () => [] })

const preferencesStore = usePreferencesStore()
const { showNsfw } = storeToRefs(preferencesStore)

const { data: allCompanies, refetch } = useAsyncData(
  () =>
    db.query.companies.findMany({
      columns: { id: true, name: true, originalName: true },
      ...(showNsfw.value ? {} : { where: (c, { eq }) => eq(c.isNsfw, false) })
    }),
  { watch: [showNsfw] }
)

useEvent('db:inserted', ({ table }) => {
  if (table === 'companies') refetch()
})
useEvent('db:updated', ({ table }) => {
  if (table === 'companies') refetch()
})
useEvent('db:deleted', ({ table }) => {
  if (table === 'companies') refetch()
})

const companyEntities = computed(() =>
  (allCompanies.value || [])
    .filter((company) => !props.excludeIds.includes(company.id))
    .map((company) => ({
      id: company.id,
      name: company.name,
      subText: company.originalName || undefined
    }))
)

// Handle both single and multiple selection modes
const selectedIds = computed({
  get: () => {
    if (props.multiple) {
      return selectedIdsModel.value
    }
    return modelValue.value ? [modelValue.value] : []
  },
  set: (ids: string[]) => {
    if (props.multiple) {
      selectedIdsModel.value = ids
    } else {
      modelValue.value = ids[0] || ''
    }
  }
})
</script>

<template>
  <VirtualizedCombobox
    v-model:selected-ids="selectedIds"
    :entities="companyEntities"
    :placeholder="placeholder"
    :empty-text="emptyText"
    :multiple="multiple"
    :class="props.class"
    :disabled="disabled"
  />
</template>
