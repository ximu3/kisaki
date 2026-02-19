<!--
  TagSelect
  Tag select component with built-in data fetching.
  Supports both single and multiple selection modes.
  Uses virtual scrolling for performance.
  Allows creating new tags.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { nanoid } from 'nanoid'
import { storeToRefs } from 'pinia'
import { usePreferencesStore } from '@renderer/stores'
import { VirtualizedCombobox } from '@renderer/components/ui/virtualized-combobox'
import { db } from '@renderer/core/db'
import { tags } from '@shared/db'
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
  /** Tag IDs to exclude from the list */
  excludeIds?: string[]
  /** Allow creating new tags */
  allowCreate?: boolean
  /** Custom class name */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  placeholder: '搜索标签...',
  emptyText: '选择标签...',
  disabled: false,
  excludeIds: () => [],
  allowCreate: false
})

/** Currently selected tag ID (single mode) */
const modelValue = defineModel<string>({ default: '' })
/** Currently selected tag IDs (multiple mode) */
const selectedIdsModel = defineModel<string[]>('selectedIds', { default: () => [] })

const preferencesStore = usePreferencesStore()
const { showNsfw } = storeToRefs(preferencesStore)

const { data: allTags, refetch } = useAsyncData(
  () =>
    db.query.tags.findMany({
      columns: { id: true, name: true },
      ...(showNsfw.value ? {} : { where: (t, { eq }) => eq(t.isNsfw, false) })
    }),
  { watch: [showNsfw] }
)

useEvent('db:inserted', ({ table }) => {
  if (table === 'tags') refetch()
})
useEvent('db:updated', ({ table }) => {
  if (table === 'tags') refetch()
})
useEvent('db:deleted', ({ table }) => {
  if (table === 'tags') refetch()
})

const tagEntities = computed(() =>
  (allTags.value || [])
    .filter((tag) => !props.excludeIds.includes(tag.id))
    .map((tag) => ({
      id: tag.id,
      name: tag.name
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

// Handle creating a new tag
async function handleCreate(name: string) {
  // Check if tag already exists
  const existing = (allTags.value || []).find((t) => t.name.toLowerCase() === name.toLowerCase())
  if (existing) {
    // Select existing tag instead of creating
    if (props.multiple) {
      if (!selectedIds.value.includes(existing.id)) {
        selectedIdsModel.value = [...selectedIds.value, existing.id]
      }
    } else {
      modelValue.value = existing.id
    }
    return
  }

  // Create new tag
  const newId = nanoid()
  await db.insert(tags).values({ id: newId, name })

  // Auto-select the new tag
  if (props.multiple) {
    selectedIdsModel.value = [...selectedIds.value, newId]
  } else {
    modelValue.value = newId
  }
}
</script>

<template>
  <VirtualizedCombobox
    v-model:selected-ids="selectedIds"
    :entities="tagEntities"
    :placeholder="placeholder"
    :empty-text="emptyText"
    :multiple="multiple"
    :class="props.class"
    :disabled="disabled"
    :allow-create="allowCreate"
    @create="handleCreate"
  />
</template>
