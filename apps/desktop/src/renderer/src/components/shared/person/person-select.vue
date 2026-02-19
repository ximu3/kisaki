<!--
  PersonSelect
  Person select component with built-in data fetching.
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
  /** Person IDs to exclude from the list */
  excludeIds?: string[]
  /** Custom class name */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  placeholder: '搜索人员...',
  emptyText: '选择人员...',
  disabled: false,
  excludeIds: () => []
})

/** Currently selected person ID (single mode) */
const modelValue = defineModel<string>({ default: '' })
/** Currently selected person IDs (multiple mode) */
const selectedIdsModel = defineModel<string[]>('selectedIds', { default: () => [] })

const preferencesStore = usePreferencesStore()
const { showNsfw } = storeToRefs(preferencesStore)

const { data: allPersons, refetch } = useAsyncData(
  () =>
    db.query.persons.findMany({
      columns: { id: true, name: true },
      ...(showNsfw.value ? {} : { where: (p, { eq }) => eq(p.isNsfw, false) })
    }),
  { watch: [showNsfw] }
)

useEvent('db:inserted', ({ table }) => {
  if (table === 'persons') refetch()
})
useEvent('db:updated', ({ table }) => {
  if (table === 'persons') refetch()
})
useEvent('db:deleted', ({ table }) => {
  if (table === 'persons') refetch()
})

const personEntities = computed(() =>
  (allPersons.value || [])
    .filter((person) => !props.excludeIds.includes(person.id))
    .map((person) => ({
      id: person.id,
      name: person.name
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
    :entities="personEntities"
    :placeholder="placeholder"
    :empty-text="emptyText"
    :multiple="multiple"
    :class="props.class"
    :disabled="disabled"
  />
</template>
