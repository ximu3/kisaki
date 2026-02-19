<script setup lang="ts">
/**
 * Plugin Browse Panel
 *
 * Grid layout for plugin discovery.
 * Reads filter state from Pinia store for reactive search.
 */

import { ref, computed, watch } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { Spinner } from '@renderer/components/ui/spinner'
import { Button } from '@renderer/components/ui/button'
import { ipcManager } from '@renderer/core/ipc'
import { useAsyncData } from '@renderer/composables/use-async-data'
import PluginDiscoverPanelCard from './discover-panel-card.vue'
import PluginDiscoverPanelFilterBar from './discover-panel-filter-bar.vue'
import { useDiscoverPluginStore } from '../../stores'
import type { PluginRegistryEntry } from '@shared/plugin'

const PAGE_SIZE = 20

interface SearchResult {
  entries: PluginRegistryEntry[]
  total: number
  hasMore: boolean
}

const store = useDiscoverPluginStore()

async function searchPlugins(
  page: number
): Promise<{ results: PluginRegistryEntry[]; hasMore: boolean }> {
  const res = await ipcManager.invoke('plugin:search', store.selectedRegistry, store.searchQuery, {
    page,
    limit: PAGE_SIZE
  })

  if (res.success && res.data) {
    const data = res.data as SearchResult
    return { results: data.entries, hasMore: data.hasMore }
  }

  return { results: [], hasMore: false }
}

const additionalResults = ref<PluginRegistryEntry[]>([])
const additionalHasMore = ref(false)
const page = ref(1)
const isLoadingMore = ref(false)

// Use useAsyncData for the initial search (page 1)
const {
  data: searchData,
  isFetching,
  isLoading
} = useAsyncData(() => searchPlugins(1), {
  watch: [() => store.searchTrigger, () => store.selectedRegistry],
  immediate: true
})

watch(
  [() => store.searchTrigger, () => store.selectedRegistry],
  () => {
    page.value = 1
    additionalResults.value = []
    additionalHasMore.value = false
  },
  { immediate: true }
)

const allResults = computed(() => {
  const base = searchData.value?.results ?? []
  return [...base, ...additionalResults.value]
})

const hasMore = computed(() => {
  return page.value === 1 ? (searchData.value?.hasMore ?? false) : additionalHasMore.value
})

const displayedResults = computed(() => {
  let result = [...allResults.value]

  if (store.selectedCategory) {
    result = result.filter((p) => p.category === store.selectedCategory)
  }

  const direction = store.sortDirection === 'asc' ? 1 : -1
  result.sort((a, b) => {
    let comparison = 0
    switch (store.sortField) {
      case 'stars':
        comparison = (a.stars ?? 0) - (b.stars ?? 0)
        break
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'updatedAt':
        comparison = String(a.updatedAt ?? '').localeCompare(String(b.updatedAt ?? ''))
        break
    }
    return direction * comparison
  })

  return result
})

const searched = computed(() => !isLoading.value)

async function handleLoadMore() {
  isLoadingMore.value = true
  const nextPage = page.value + 1

  try {
    const data = await searchPlugins(nextPage)

    page.value = nextPage
    additionalResults.value = [...additionalResults.value, ...data.results]
    additionalHasMore.value = data.hasMore
  } finally {
    isLoadingMore.value = false
  }
}

const loading = computed(() => isFetching.value || isLoadingMore.value)
</script>

<template>
  <div class="flex flex-col h-full">
    <PluginDiscoverPanelFilterBar />

    <div class="flex-1 overflow-auto scrollbar-thin">
      <template v-if="loading && displayedResults.length === 0">
        <div class="flex items-center justify-center h-48">
          <Spinner class="size-6" />
        </div>
      </template>

      <template v-else-if="displayedResults.length === 0 && searched">
        <div class="flex flex-col items-center justify-center h-48 text-muted-foreground">
          <Icon
            icon="icon-[mdi--puzzle-outline]"
            class="size-16 mb-3 opacity-30"
          />
          <p class="font-medium">未找到插件</p>
          <p class="text-sm mt-1 text-muted-foreground/70">
            {{ store.selectedCategory ? '该分类下暂无插件' : '暂无插件' }}
          </p>
        </div>

        <div
          v-if="hasMore"
          class="flex justify-center py-6"
        >
          <Button
            variant="outline"
            size="sm"
            :disabled="loading"
            @click="handleLoadMore"
          >
            <Spinner
              v-if="loading"
              class="size-4 mr-2"
            />
            加载更多
          </Button>
        </div>
      </template>

      <template v-else>
        <!-- Grid - no container borders -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <PluginDiscoverPanelCard
            v-for="plugin in displayedResults"
            :key="plugin.id"
            :plugin="plugin"
          />
        </div>

        <div
          v-if="hasMore"
          class="flex justify-center py-6"
        >
          <Button
            variant="outline"
            size="sm"
            :disabled="loading"
            @click="handleLoadMore"
          >
            <Spinner
              v-if="loading"
              class="size-4 mr-2"
            />
            加载更多
          </Button>
        </div>
      </template>
    </div>
  </div>
</template>
