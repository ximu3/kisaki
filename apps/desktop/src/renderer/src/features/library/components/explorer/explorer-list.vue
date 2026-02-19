<script setup lang="ts">
/**
 * ExplorerList - Entity list with collection grouping
 *
 * Displays entities grouped by collection, with collapsible groups.
 * Uses virtualization for filter mode flat list.
 */

import { computed, inject, provide, watch, type Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Icon } from '@renderer/components/ui/icon'
import { Spinner } from '@renderer/components/ui/spinner'
import { VirtualList } from '@renderer/components/ui/virtual'
import { useRenderState } from '@renderer/composables'
import { useDefaultFromStore } from '@renderer/stores'
import { getEntityIcon } from '@renderer/utils'
import { useLibraryExplorerStore } from '../../stores'
import { useExplorerList } from '../../composables'
import LibraryExplorerGroup from './explorer-group.vue'
import LibraryExplorerListItem from './explorer-list-item.vue'
import { hasActiveFilters } from '@shared/filter'
import { hasActiveSearch } from '@shared/search'
import { toExplorerSelectionKey } from '../../utils/explorer-selection'

const ENTITY_CONFIG = {
  game: { icon: getEntityIcon('game'), label: '游戏' },
  character: { icon: getEntityIcon('character'), label: '角色' },
  person: { icon: getEntityIcon('person'), label: '人物' },
  company: { icon: getEntityIcon('company'), label: '公司' }
} as const

const store = useLibraryExplorerStore()
const defaultFromStore = useDefaultFromStore()
const { activeEntityType, search, filter, collapsedIds } = storeToRefs(store)
const { data, rawData, isLoading } = useExplorerList()
const state = useRenderState(isLoading, null, rawData)

// Inject scroll container from parent
const scrollContainer = inject<Ref<HTMLElement | undefined>>('explorerScrollContainer')

const isFiltering = computed(() => hasActiveSearch(search.value) || hasActiveFilters(filter.value))

const hasData = computed(
  () => data.value.collections.length > 0 || data.value.uncategorized.length > 0
)

watch(isFiltering, (value, oldValue) => {
  if (value === oldValue) return
  store.clearSelection()
})

// Deduplicated flat list for filter mode
const allEntities = computed(() => {
  const seenIds = new Set<string>()
  return [...data.value.collections.flatMap((c) => c.entities), ...data.value.uncategorized].filter(
    (entity) => {
      if (seenIds.has(entity.id)) return false
      seenIds.add(entity.id)
      return true
    }
  )
})

const visibleSelectionKeys = computed(() => {
  if (isFiltering.value) {
    return allEntities.value.map((e) => {
      const from = defaultFromStore.getFrom(activeEntityType.value, e.id)
      return toExplorerSelectionKey(from, e.id)
    })
  }

  const keys: string[] = []
  for (const group of data.value.collections) {
    if (collapsedIds.value.includes(group.id)) continue
    const from = `collection:${group.id}`
    keys.push(...group.entities.map((e) => toExplorerSelectionKey(from, e.id)))
  }

  if (!collapsedIds.value.includes('__uncategorized__')) {
    keys.push(...data.value.uncategorized.map((e) => toExplorerSelectionKey('uncategorized', e.id)))
  }

  return keys
})

provide('explorerVisibleSelectionKeys', visibleSelectionKeys)

const allKnownSelectionKeys = computed(() => {
  const keys = new Set<string>()

  // Grouped view instances (including collapsed groups).
  for (const group of data.value.collections) {
    const from = `collection:${group.id}`
    for (const entity of group.entities) {
      keys.add(toExplorerSelectionKey(from, entity.id))
    }
  }
  for (const entity of data.value.uncategorized) {
    keys.add(toExplorerSelectionKey('uncategorized', entity.id))
  }

  // Filter view instances (stable key space).
  for (const entity of allEntities.value) {
    const from = defaultFromStore.getFrom(activeEntityType.value, entity.id)
    keys.add(toExplorerSelectionKey(from, entity.id))
  }

  return keys
})

watch(
  allKnownSelectionKeys,
  (allowedKeys) => {
    store.pruneSelection(allowedKeys)
  },
  { immediate: true }
)

const currentConfig = computed(() => ENTITY_CONFIG[activeEntityType.value])
</script>

<template>
  <!-- Loading state -->
  <div
    v-if="state === 'loading'"
    class="flex items-center justify-center py-8"
  >
    <Spinner class="size-5" />
  </div>

  <!-- Success state -->
  <template v-else-if="state === 'success'">
    <!-- Filter mode: virtualized flat list -->
    <div
      v-if="isFiltering"
      class="py-1 pr-1"
    >
      <div
        class="flex items-center h-6 px-2 text-xs text-muted-foreground/70 rounded-r-md bg-accent/20 mb-0.5"
      >
        筛选结果
        <span class="ml-auto tabular-nums opacity-50">{{ allEntities.length }}</span>
      </div>
      <VirtualList
        v-if="allEntities.length > 0"
        :items="allEntities"
        :scroll-parent="scrollContainer"
        class="flex flex-col gap-0.5"
      >
        <template #item="{ item }">
          <LibraryExplorerListItem
            :entity="item"
            :entity-type="activeEntityType"
            :from="defaultFromStore.getFrom(activeEntityType, item.id)"
          />
        </template>
      </VirtualList>
      <!-- Empty filter results -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-10 text-center"
      >
        <Icon
          icon="icon-[mdi--filter-off-outline]"
          class="size-6 text-muted-foreground/40 mb-1.5"
        />
        <p class="text-xs text-muted-foreground/60">无匹配结果</p>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!hasData"
      class="flex flex-col items-center justify-center py-10 text-center"
    >
      <Icon
        :icon="currentConfig.icon"
        class="size-6 text-muted-foreground/40 mb-1.5"
      />
      <p class="text-xs text-muted-foreground/60">暂无{{ currentConfig.label }}</p>
    </div>

    <!-- Normal grouped view -->
    <div
      v-else
      class="py-1 pr-1"
    >
      <!-- Collection groups -->
      <LibraryExplorerGroup
        v-for="group in data.collections"
        :key="group.id"
        :group="group"
        :entity-type="activeEntityType"
      />

      <!-- Uncategorized -->
      <LibraryExplorerGroup
        v-if="data.uncategorized.length > 0"
        :group="{
          id: '__uncategorized__',
          name: '未分类',
          coverFile: null,
          isDynamic: false,
          entities: data.uncategorized
        }"
        :entity-type="activeEntityType"
        is-uncategorized
      />
    </div>
  </template>
</template>
