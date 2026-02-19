/**
 * Discover Plugin Store
 *
 * Pinia store for plugin marketplace UI state.
 * Manages search, filtering, sorting, and registry selection.
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { PluginCategory } from '@shared/plugin'
import type { SortDirection } from '@shared/common'

export type DiscoverPluginSortField = 'stars' | 'name' | 'updatedAt'

export const useDiscoverPluginStore = defineStore(
  'discoverPlugin',
  () => {
    // Search input value (for controlled input)
    const searchInput = ref('')

    // Committed search query (triggers actual search)
    const searchQuery = ref('')

    // Search trigger counter (increments to trigger search)
    const searchTrigger = ref(0)

    // Selected registry for browsing (e.g., 'github')
    const selectedRegistry = ref('github')

    // Category filter (null = all categories)
    const selectedCategory = ref<PluginCategory | null>(null)

    // Sort options
    const sortField = ref<DiscoverPluginSortField>('stars')
    const sortDirection = ref<SortDirection>('desc')

    // Actions
    function setSearchInput(input: string) {
      searchInput.value = input
    }

    function triggerSearch() {
      searchQuery.value = searchInput.value
      searchTrigger.value++
    }

    function clearSearch() {
      searchInput.value = ''
      searchQuery.value = ''
      searchTrigger.value++
    }

    function setSelectedRegistry(registry: string) {
      selectedRegistry.value = registry
    }

    function setSelectedCategory(category: PluginCategory | null) {
      selectedCategory.value = category
    }

    function setSortField(field: DiscoverPluginSortField) {
      sortField.value = field
    }

    function setSortDirection(direction: SortDirection) {
      sortDirection.value = direction
    }

    function setSort(field: DiscoverPluginSortField, direction: SortDirection) {
      sortField.value = field
      sortDirection.value = direction
    }

    function resetFilters() {
      searchInput.value = ''
      searchQuery.value = ''
      searchTrigger.value++
      selectedCategory.value = null
      sortField.value = 'stars'
      sortDirection.value = 'desc'
    }

    return {
      // State
      searchInput,
      searchQuery,
      searchTrigger,
      selectedRegistry,
      selectedCategory,
      sortField,
      sortDirection,
      // Actions
      setSearchInput,
      triggerSearch,
      clearSearch,
      setSelectedRegistry,
      setSelectedCategory,
      setSortField,
      setSortDirection,
      setSort,
      resetFilters
    }
  },
  {
    persist: {
      pick: ['selectedRegistry', 'sortField', 'sortDirection']
    }
  }
)
