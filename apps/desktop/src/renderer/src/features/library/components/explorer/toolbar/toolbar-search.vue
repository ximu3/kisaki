<script setup lang="ts">
/**
 * ToolbarSearch - Search input
 *
 * Pure search input for filtering entities by name.
 */

import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { Icon } from '@renderer/components/ui/icon'
import { Input } from '@renderer/components/ui/input'
import { Button } from '@renderer/components/ui/button'
import { useLibraryExplorerStore } from '../../../stores'

const store = useLibraryExplorerStore()
const { search } = storeToRefs(store)

function handleClear() {
  store.setSearch('')
}

// Computed model for search input (store binding)
const searchModel = computed({
  get: () => search.value,
  set: (v: string) => store.setSearch(v)
})
</script>

<template>
  <div class="relative flex-1">
    <Icon
      icon="icon-[mdi--magnify]"
      class="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
    />
    <Input
      v-model="searchModel"
      placeholder="搜索..."
      class="pl-8 h-7 text-xs bg-background/50"
    />
    <Button
      v-if="search"
      variant="ghost"
      size="icon"
      class="size-5 absolute right-1.5 top-1/2 -translate-y-1/2"
      @click="handleClear"
    >
      <Icon
        icon="icon-[mdi--close]"
        class="size-3"
      />
    </Button>
  </div>
</template>
