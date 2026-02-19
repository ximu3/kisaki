<script setup lang="ts">
/**
 * Plugin Installed Panel
 *
 * Grid layout for installed plugin management with filtering and sorting.
 * Uses useAsyncData for data fetching with proper abort handling.
 */

import { computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { Spinner } from '@renderer/components/ui/spinner'
import { ipcManager } from '@renderer/core/ipc'
import { useAsyncData, useRenderState } from '@renderer/composables'
import PluginInstalledPanelCard from './installed-panel-card.vue'
import PluginInstalledPanelFilterBar from './installed-panel-filter-bar.vue'
import { useInstalledPluginStore } from '../../stores'
import type { PluginUpdateInfo } from '@shared/plugin'

interface Props {
  updates: PluginUpdateInfo[]
}

interface Emits {
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const store = useInstalledPluginStore()

const {
  data: plugins,
  isLoading,
  error,
  refetch
} = useAsyncData(
  async () => {
    const res = await ipcManager.invoke('plugin:get-installed')
    return res.success && res.data ? res.data : []
  },
  { immediate: true }
)
const state = useRenderState(isLoading, error, plugins, { preset: 'network' })

const pluginsList = computed(() => plugins.value ?? [])

function getUpdateInfo(pluginId: string) {
  return props.updates.find((u) => u.pluginId === pluginId)
}

function handleRefresh() {
  refetch()
  emit('refresh')
}

// Filter and sort plugins
const filteredPlugins = computed(() => {
  let result = [...pluginsList.value]

  // Search filter
  if (store.searchQuery) {
    const query = store.searchQuery.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.author?.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (store.statusFilter === 'enabled') {
    result = result.filter((p) => p.enabled)
  } else if (store.statusFilter === 'disabled') {
    result = result.filter((p) => !p.enabled)
  }

  // Category filter
  if (store.selectedCategory) {
    result = result.filter((p) => p.category === store.selectedCategory)
  }

  // Updates filter
  if (store.showUpdatesOnly) {
    result = result.filter((p) => props.updates.some((u) => u.pluginId === p.id))
  }

  // Sort
  result.sort((a, b) => {
    let comparison = 0
    switch (store.sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'status':
        comparison = (a.enabled ? 1 : 0) - (b.enabled ? 1 : 0)
        break
      case 'hasUpdate': {
        const aHasUpdate = props.updates.some((u) => u.pluginId === a.id) ? 1 : 0
        const bHasUpdate = props.updates.some((u) => u.pluginId === b.id) ? 1 : 0
        comparison = aHasUpdate - bHasUpdate
        break
      }
    }
    return store.sortDirection === 'asc' ? comparison : -comparison
  })

  return result
})
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Filter Bar -->
    <PluginInstalledPanelFilterBar :update-count="props.updates.length" />

    <!-- Plugin Grid -->
    <div class="flex-1 overflow-auto scrollbar-thin">
      <template v-if="state === 'loading'">
        <div class="flex items-center justify-center h-48">
          <Spinner class="size-6" />
        </div>
      </template>

      <template v-else-if="pluginsList.length === 0">
        <div class="flex flex-col items-center justify-center h-48 text-muted-foreground">
          <Icon
            icon="icon-[mdi--puzzle-outline]"
            class="size-16 mb-3 opacity-30"
          />
          <p class="font-medium">暂无已安装的插件</p>
          <p class="text-sm mt-1 text-muted-foreground/70">从"发现"页面安装插件</p>
        </div>
      </template>

      <template v-else-if="filteredPlugins.length === 0">
        <div class="flex flex-col items-center justify-center h-48 text-muted-foreground">
          <Icon
            icon="icon-[mdi--filter-off-outline]"
            class="size-16 mb-3 opacity-30"
          />
          <p class="font-medium">没有匹配的插件</p>
          <p class="text-sm mt-1 text-muted-foreground/70">尝试调整筛选条件</p>
        </div>
      </template>

      <template v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <PluginInstalledPanelCard
            v-for="plugin in filteredPlugins"
            :key="plugin.id"
            :plugin="plugin"
            :update-info="getUpdateInfo(plugin.id)"
            @refresh="handleRefresh"
          />
        </div>
      </template>
    </div>
  </div>
</template>
