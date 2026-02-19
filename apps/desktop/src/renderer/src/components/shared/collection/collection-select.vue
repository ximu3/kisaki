<!--
  CollectionSelect
  Collection select with built-in data fetching.
  Supports both single and multiple selection modes.
  Uses virtual scrolling for performance.
-->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { nanoid } from 'nanoid'
import { storeToRefs } from 'pinia'
import { usePreferencesStore } from '@renderer/stores'
import { useAsyncData, useEvent } from '@renderer/composables'
import { db } from '@renderer/core/db'
import { collections } from '@shared/db'
import { VirtualizedCombobox } from '@renderer/components/ui/virtualized-combobox'

/** Special ID for "none" selection */
const NONE_ID = '#none'

interface Props {
  /** Multiple selection mode */
  multiple?: boolean
  /** Placeholder text */
  placeholder?: string
  /** Text when nothing selected */
  emptyText?: string
  /** Class name for trigger button */
  class?: HTMLAttributes['class']
  /** Whether the select is disabled */
  disabled?: boolean
  /** Allow creating new collections */
  allowCreate?: boolean
  /** Collection IDs to exclude from the list */
  excludeIds?: string[]
  /** Whether to show a "none" option (single mode only) */
  allowNone?: boolean
  /** Label for the "none" option */
  noneLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索合集...',
  emptyText: '选择合集...',
  multiple: false,
  allowCreate: false,
  excludeIds: () => [],
  allowNone: true,
  noneLabel: '无'
})

/** For single selection mode */
const modelValue = defineModel<string | null>({ default: null })
/** For multiple selection mode */
const selectedIdsModel = defineModel<string[]>('selectedIds', { default: () => [] })

const preferencesStore = usePreferencesStore()
const { showNsfw } = storeToRefs(preferencesStore)

const { data: allCollections, refetch } = useAsyncData(
  () =>
    db.query.collections.findMany({
      columns: { id: true, name: true },
      ...(showNsfw.value ? {} : { where: (c, { eq }) => eq(c.isNsfw, false) })
    }),
  { watch: [showNsfw] }
)

useEvent('db:inserted', ({ table }) => {
  if (table === 'collections') refetch()
})
useEvent('db:updated', ({ table }) => {
  if (table === 'collections') refetch()
})
useEvent('db:deleted', ({ table }) => {
  if (table === 'collections') refetch()
})

// Build entity list: optional "none" + all collections
const collectionEntities = computed(() => {
  const showNone = !props.multiple && props.allowNone
  const items = allCollections.value ?? []
  return [
    ...(showNone ? [{ id: NONE_ID, name: props.noneLabel }] : []),
    ...items
      .filter((c) => !props.excludeIds.includes(c.id))
      .map((c) => ({
        id: c.id,
        name: c.name
      }))
  ]
})

// Handle both single and multiple selection modes
const selectedIds = computed({
  get: () => {
    if (props.multiple) {
      return selectedIdsModel.value
    }
    if (modelValue.value) {
      return [modelValue.value]
    }
    return props.allowNone ? [NONE_ID] : []
  },
  set: (ids: string[]) => {
    if (props.multiple) {
      selectedIdsModel.value = ids
    } else {
      const selectedId = ids[0] || null
      modelValue.value = selectedId === NONE_ID ? null : selectedId
    }
  }
})

async function handleCreate(name: string) {
  // Check if collection already exists
  const items = allCollections.value ?? []
  const existing = items.find((c) => c.name.toLowerCase() === name.toLowerCase())
  if (existing) {
    // Select existing collection instead of creating
    if (props.multiple) {
      const currentIds = selectedIdsModel.value
      if (!currentIds.includes(existing.id)) {
        selectedIdsModel.value = [...currentIds, existing.id]
      }
    } else {
      modelValue.value = existing.id
    }
    return
  }

  // Create new collection
  const newId = nanoid()
  await db.insert(collections).values({ id: newId, name })

  // Auto-select the new collection
  if (props.multiple) {
    const currentIds = selectedIdsModel.value
    selectedIdsModel.value = [...currentIds, newId]
  } else {
    modelValue.value = newId
  }
}
</script>

<template>
  <VirtualizedCombobox
    v-model:selected-ids="selectedIds"
    :entities="collectionEntities"
    :placeholder="props.placeholder"
    :empty-text="props.emptyText"
    :multiple="props.multiple"
    :class="props.class"
    :disabled="props.disabled"
    :allow-create="props.allowCreate"
    @create="handleCreate"
  />
</template>
