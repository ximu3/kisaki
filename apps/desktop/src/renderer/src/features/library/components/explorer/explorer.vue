<script setup lang="ts">
/**
 * LibraryExplorer - Main Explorer Component
 *
 * Complete entity browser with unified toolbar, list, and footer.
 */

import { ref, provide } from 'vue'
import { LibraryExplorerToolbar } from './toolbar'
import LibraryExplorerList from './explorer-list.vue'
import LibraryExplorerFooter from './explorer-footer.vue'

// Scroll container ref for virtual list
const scrollContainerRef = ref<HTMLElement>()

// Provide scroll container to children
provide('explorerScrollContainer', scrollContainerRef)
</script>

<template>
  <div class="h-full flex flex-col bg-background border-r">
    <!-- Unified toolbar: nav, tabs, search, filter -->
    <LibraryExplorerToolbar />

    <!-- Entity list -->
    <div
      ref="scrollContainerRef"
      class="flex-1 min-h-0 overflow-auto scrollbar-thin"
    >
      <LibraryExplorerList />
    </div>

    <!-- Footer with stats -->
    <LibraryExplorerFooter />
  </div>
</template>
