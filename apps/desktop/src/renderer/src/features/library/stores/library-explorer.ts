/**
 * Library Explorer Store
 *
 * Manages explorer panel state including entity browsing, filtering,
 * search, and UI preferences with partial persistence.
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ContentEntityType } from '@shared/common'
import type { FilterState } from '@shared/filter'
import { createEmptyFilter } from '@shared/filter'

type SortDirection = 'asc' | 'desc'

const DEFAULT_EXPLORER_WIDTH = 220

export const useLibraryExplorerStore = defineStore(
  'libraryExplorer',
  () => {
    // ========================================================================
    // State - Browsing (not persisted)
    // ========================================================================

    const activeEntityType = ref<ContentEntityType>('game')
    const search = ref('')
    const filter = ref<FilterState>(createEmptyFilter())
    const selectedKeys = ref<string[]>([])
    const selectionAnchorKey = ref<string | null>(null)

    // ========================================================================
    // State - UI Preferences (persisted)
    // ========================================================================

    const explorerWidth = ref(DEFAULT_EXPLORER_WIDTH)
    const collapsedIds = ref<string[]>([])
    const sortField = ref('name')
    const sortDirection = ref<SortDirection>('asc')
    const overrideCollectionOrder = ref(false)

    // ========================================================================
    // Actions
    // ========================================================================

    function dedupeKeys(keys: string[]) {
      return [...new Set(keys)]
    }

    function clearSelection() {
      selectedKeys.value = []
      selectionAnchorKey.value = null
    }

    function setSelection(keys: string[], anchorKey: string | null = null) {
      selectedKeys.value = dedupeKeys(keys)
      selectionAnchorKey.value = anchorKey
    }

    function toggleSelection(key: string) {
      if (selectedKeys.value.includes(key)) {
        selectedKeys.value = selectedKeys.value.filter((existing) => existing !== key)
        if (selectionAnchorKey.value === key) {
          selectionAnchorKey.value = null
        }
      } else {
        selectedKeys.value = [...selectedKeys.value, key]
        selectionAnchorKey.value = key
      }

      if (selectedKeys.value.length === 0) {
        selectionAnchorKey.value = null
      }
    }

    function addToSelection(keys: string[], anchorKey: string | null = null) {
      selectedKeys.value = dedupeKeys([...selectedKeys.value, ...keys])
      if (anchorKey !== null) {
        selectionAnchorKey.value = anchorKey
      }
    }

    function removeFromSelection(keys: string[]) {
      const removeSet = new Set(keys)
      selectedKeys.value = selectedKeys.value.filter((key) => !removeSet.has(key))

      if (selectionAnchorKey.value && removeSet.has(selectionAnchorKey.value)) {
        selectionAnchorKey.value = null
      }
      if (selectedKeys.value.length === 0) {
        selectionAnchorKey.value = null
      }
    }

    function selectRange(targetKey: string, orderedVisibleKeys: string[], additive: boolean) {
      const ordered = dedupeKeys(orderedVisibleKeys)
      const anchorKey = selectionAnchorKey.value

      if (!anchorKey) {
        setSelection([targetKey], targetKey)
        return
      }

      const anchorIndex = ordered.indexOf(anchorKey)
      const targetIndex = ordered.indexOf(targetKey)

      if (anchorIndex === -1 || targetIndex === -1) {
        setSelection([targetKey], targetKey)
        return
      }

      const start = Math.min(anchorIndex, targetIndex)
      const end = Math.max(anchorIndex, targetIndex)
      const rangeIds = ordered.slice(start, end + 1)

      if (additive) {
        addToSelection(rangeIds, targetKey)
      } else {
        setSelection(rangeIds, targetKey)
      }
    }

    function toggleGroupSelection(groupKeys: string[], anchorKey: string | null = null) {
      const group = dedupeKeys(groupKeys)
      const selected = new Set(selectedKeys.value)
      const isAllSelected = group.every((key) => selected.has(key))

      if (isAllSelected) {
        removeFromSelection(group)
        return
      }

      addToSelection(group, anchorKey)
    }

    function pruneSelection(allowedKeys: Set<string>) {
      const next = selectedKeys.value.filter((key) => allowedKeys.has(key))
      if (next.length === selectedKeys.value.length) return

      selectedKeys.value = next

      if (selectionAnchorKey.value && !allowedKeys.has(selectionAnchorKey.value)) {
        selectionAnchorKey.value = null
      }
      if (selectedKeys.value.length === 0) {
        selectionAnchorKey.value = null
      }
    }

    function setActiveEntityType(type: ContentEntityType) {
      activeEntityType.value = type
      search.value = ''
      filter.value = createEmptyFilter()
      clearSelection()
    }

    function setSearch(value: string) {
      search.value = value
    }

    function setFilter(newFilter: FilterState) {
      filter.value = newFilter
    }

    function clearFilter() {
      filter.value = createEmptyFilter()
    }

    function setExplorerWidth(width: number) {
      explorerWidth.value = width
    }

    function toggleCollapsed(id: string) {
      if (collapsedIds.value.includes(id)) {
        collapsedIds.value = collapsedIds.value.filter((i) => i !== id)
      } else {
        collapsedIds.value = [...collapsedIds.value, id]
      }
    }

    function resetExplorerWidth() {
      explorerWidth.value = DEFAULT_EXPLORER_WIDTH
    }

    function setSort(field: string, direction: SortDirection) {
      sortField.value = field
      sortDirection.value = direction
    }

    function toggleSortDirection() {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    }

    function toggleOverrideCollectionOrder() {
      overrideCollectionOrder.value = !overrideCollectionOrder.value
    }

    return {
      // State - Browsing
      activeEntityType,
      search,
      filter,
      selectedKeys,
      selectionAnchorKey,
      // State - UI Preferences
      explorerWidth,
      collapsedIds,
      sortField,
      sortDirection,
      overrideCollectionOrder,
      // Actions
      setActiveEntityType,
      setSearch,
      setFilter,
      clearFilter,
      clearSelection,
      setSelection,
      toggleSelection,
      addToSelection,
      removeFromSelection,
      selectRange,
      toggleGroupSelection,
      pruneSelection,
      setExplorerWidth,
      toggleCollapsed,
      resetExplorerWidth,
      setSort,
      toggleSortDirection,
      toggleOverrideCollectionOrder
    }
  },
  {
    persist: {
      pick: [
        'explorerWidth',
        'collapsedIds',
        'sortField',
        'sortDirection',
        'overrideCollectionOrder'
      ]
    }
  }
)
