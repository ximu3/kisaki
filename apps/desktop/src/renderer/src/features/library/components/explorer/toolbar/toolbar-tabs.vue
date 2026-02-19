<script setup lang="ts">
/**
 * ToolbarTabs - Entity type switcher
 *
 * Allows switching between different entity types (game, character, etc).
 */

import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { Icon } from '@renderer/components/ui/icon'
import { SegmentedControl, SegmentedControlItem } from '@renderer/components/ui/segmented-control'
import { useLibraryExplorerStore } from '../../../stores'
import { getEntityIcon } from '@renderer/utils'
import type { ContentEntityType } from '@shared/common'

const ENTITY_TABS: ContentEntityType[] = ['game', 'character', 'person', 'company']

const store = useLibraryExplorerStore()
const { activeEntityType } = storeToRefs(store)

// Computed wrapper for v-model binding
const entityTypeModel = computed({
  get: () => activeEntityType.value,
  set: (value: ContentEntityType) => store.setActiveEntityType(value)
})
</script>

<template>
  <SegmentedControl
    v-model="entityTypeModel"
    class="w-full"
  >
  <SegmentedControlItem
      v-for="type in ENTITY_TABS"
      :key="type"
      :value="type"
    >
      <Icon
        :icon="getEntityIcon(type)"
        class="size-3.5"
      />
    </SegmentedControlItem>
  </SegmentedControl>
</template>
