<!--
  CharacterSelect
  Character select component with built-in data fetching.
  Supports both single and multiple selection modes.
  Uses virtual scrolling for performance.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePreferencesStore } from '@renderer/stores'
import { VirtualizedCombobox } from '@renderer/components/ui/virtualized-combobox'
import { getAttachmentUrl } from '@renderer/utils'
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
  /** Character IDs to exclude from the list */
  excludeIds?: string[]
  /** Custom class name */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  placeholder: '搜索角色...',
  emptyText: '选择角色...',
  disabled: false,
  excludeIds: () => []
})

/** Currently selected character ID (single mode) */
const modelValue = defineModel<string>({ default: '' })
/** Currently selected character IDs (multiple mode) */
const selectedIdsModel = defineModel<string[]>('selectedIds', { default: () => [] })

const preferencesStore = usePreferencesStore()
const { showNsfw } = storeToRefs(preferencesStore)

const { data: allCharacters, refetch } = useAsyncData(
  () =>
    db.query.characters.findMany({
      columns: { id: true, name: true, originalName: true, photoFile: true },
      ...(showNsfw.value ? {} : { where: (c, { eq }) => eq(c.isNsfw, false) })
    }),
  { watch: [showNsfw] }
)

useEvent('db:inserted', ({ table }) => {
  if (table === 'characters') refetch()
})
useEvent('db:updated', ({ table }) => {
  if (table === 'characters') refetch()
})
useEvent('db:deleted', ({ table }) => {
  if (table === 'characters') refetch()
})

const characterEntities = computed(() =>
  (allCharacters.value || [])
    .filter((char) => !props.excludeIds.includes(char.id))
    .map((char) => ({
      id: char.id,
      name: char.name,
      subText: char.originalName || undefined,
      imageUrl: char.photoFile
        ? getAttachmentUrl('characters', char.id, char.photoFile, {
            width: 100,
            height: 100
          })
        : null
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
    :entities="characterEntities"
    :placeholder="placeholder"
    :empty-text="emptyText"
    :multiple="multiple"
    :class="props.class"
    :disabled="disabled"
  />
</template>
