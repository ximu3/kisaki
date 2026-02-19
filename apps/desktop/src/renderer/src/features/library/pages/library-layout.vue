<script setup lang="ts">
/**
 * Library Layout
 *
 * Route-level parent layout for the library feature.
 * Provides:
 * - Top header (title + global search)
 * - Two-panel resizable layout (explorer + RouterView)
 * - Global Ctrl+F shortcut for search
 */

import { onMounted, onUnmounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { ResizableHandle, ResizableLayout, ResizablePanel } from '@renderer/components/ui/resizable'
import { useLibraryExplorerStore } from '../stores'
import { LibraryExplorer, LibrarySearchDialog } from '../components'

const store = useLibraryExplorerStore()
const { explorerWidth } = storeToRefs(store)

const isSearchOpen = ref(false)

function handleKeyDown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
    event.preventDefault()
    isSearchOpen.value = true
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="h-full flex flex-col">
    <header class="shrink-0 flex items-center justify-between px-4 h-12 border-b border-border bg-surface">
      <div class="flex items-center gap-3">
        <Icon
          icon="icon-[mdi--bookshelf]"
          class="size-5"
        />
        <h1 class="text-base font-semibold">媒体库</h1>
      </div>

      <div class="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          @click="isSearchOpen = true"
        >
          <Icon
            icon="icon-[mdi--magnify]"
            class="size-4"
          />
          全局搜索
          <kbd
            class="ml-2 -mr-1 p-0 pointer-events-none h-5 select-none items-center gap-1 rounded px-1.5 font-mono text-xs font-medium text-muted-foreground hidden sm:inline-flex"
          >
            Ctrl F
          </kbd>
        </Button>
      </div>
    </header>

    <div class="flex-1 min-h-0">
      <ResizableLayout
        v-model:left-width="explorerWidth"
        :default-width="220"
        :min-left-width="180"
        :max-left-width="400"
        class="h-full"
      >
        <ResizablePanel
          position="left"
          class="bg-muted/30"
        >
          <LibraryExplorer />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel position="right">
          <div class="h-full overflow-hidden">
            <RouterView />
          </div>
        </ResizablePanel>
      </ResizableLayout>
    </div>

    <LibrarySearchDialog v-model:open="isSearchOpen" />
  </div>
</template>

