<script setup lang="ts">
/**
 * ExplorerToolbar - Unified toolbar container
 *
 * Combines navigation, entity tabs, search, sort, and filter into a cohesive toolbar.
 * Layout: Row 1 = Nav, Row 2 = Tabs, Row 3 = Search + Sort + Filter
 */

import LibraryExplorerToolbarNav from './toolbar-nav.vue'
import LibraryExplorerToolbarTabs from './toolbar-tabs.vue'
import LibraryExplorerToolbarSearch from './toolbar-search.vue'
import LibraryExplorerToolbarSort from './toolbar-sort.vue'
import LibraryExplorerToolbarFilter from './toolbar-filter.vue'
</script>

<template>
  <div class="shrink-0 border-b">
    <!-- Row 1: Navigation -->
    <div class="flex items-center justify-between px-2 py-1.5 border-b h-12">
      <LibraryExplorerToolbarNav />
    </div>
    <!-- Row 2: Entity Tabs -->
    <div class="flex items-center justify-between px-2 py-1.5 border-b">
      <LibraryExplorerToolbarTabs />
    </div>
    <!-- Row 3: Search + Sort + Filter -->
    <div class="flex items-center gap-1.5 px-2 py-1.5">
      <LibraryExplorerToolbarSearch />
      <LibraryExplorerToolbarSort />
      <LibraryExplorerToolbarFilter />
    </div>
  </div>
</template>
