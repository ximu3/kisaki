/**
 * Installed Plugin Store
 *
 * Pinia store for installed plugins panel UI state.
 * Manages search, filtering, and sorting for installed plugins.
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { PluginCategory } from '@shared/plugin'
import type { SortDirection } from '@shared/common'

export type InstalledPluginSortField = 'name' | 'status' | 'hasUpdate'
export type InstalledPluginStatusFilter = 'all' | 'enabled' | 'disabled'

export const useInstalledPluginStore = defineStore(
  'installedPlugin',
  () => {
    // Search query
    const searchQuery = ref('')

    // Status filter (enabled/disabled/all)
    const statusFilter = ref<InstalledPluginStatusFilter>('all')

    // Category filter (null = all categories)
    const selectedCategory = ref<PluginCategory | null>(null)

    // Show only plugins with updates
    const showUpdatesOnly = ref(false)

    // Sort options
    const sortField = ref<InstalledPluginSortField>('name')
    const sortDirection = ref<SortDirection>('asc')

    // Actions
    function setSearchQuery(query: string) {
      searchQuery.value = query
    }

    function setStatusFilter(status: InstalledPluginStatusFilter) {
      statusFilter.value = status
    }

    function setSelectedCategory(category: PluginCategory | null) {
      selectedCategory.value = category
    }

    function setShowUpdatesOnly(show: boolean) {
      showUpdatesOnly.value = show
    }

    function setSortField(field: InstalledPluginSortField) {
      sortField.value = field
    }

    function setSortDirection(direction: SortDirection) {
      sortDirection.value = direction
    }

    function resetFilters() {
      searchQuery.value = ''
      statusFilter.value = 'all'
      selectedCategory.value = null
      showUpdatesOnly.value = false
    }

    return {
      // State
      searchQuery,
      statusFilter,
      selectedCategory,
      showUpdatesOnly,
      sortField,
      sortDirection,
      // Actions
      setSearchQuery,
      setStatusFilter,
      setSelectedCategory,
      setShowUpdatesOnly,
      setSortField,
      setSortDirection,
      resetFilters
    }
  },
  {
    persist: {
      pick: ['statusFilter', 'sortField', 'sortDirection']
    }
  }
)
