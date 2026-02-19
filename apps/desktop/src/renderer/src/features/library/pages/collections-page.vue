<script setup lang="ts">
/**
 * Collections Page
 *
 * Lists all collections for browsing.
 * Entity-agnostic view showing all available collections.
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { VirtualGrid } from '@renderer/components/ui/virtual'
import { CollectionInfoFormDialog, CollectionCard } from '@renderer/components/shared/collection'
import { getEntityIcon } from '@renderer/utils'
import { db } from '@renderer/core/db'
import { useAsyncData, useEvent, useRenderState } from '@renderer/composables'
import { collections } from '@shared/db'
import { storeToRefs } from 'pinia'
import { usePreferencesStore } from '@renderer/stores'
import { eq } from 'drizzle-orm'

// =============================================================================
// Router
// =============================================================================

const router = useRouter()

// =============================================================================
// Refs
// =============================================================================

const scrollContainerRef = ref<HTMLElement>()

const preferencesStore = usePreferencesStore()
const { showNsfw } = storeToRefs(preferencesStore)

// =============================================================================
// Data
// =============================================================================

const {
  data: collectionList,
  isLoading,
  error,
  refetch
} = useAsyncData(
  async () =>
    await db
      .select()
      .from(collections)
      .where(showNsfw.value ? undefined : eq(collections.isNsfw, false)),
  { watch: [showNsfw] }
)
const state = useRenderState(isLoading, error, collectionList)

// =============================================================================
// State
// =============================================================================

const showCreateDialog = ref(false)

// =============================================================================
// Event Listeners
// =============================================================================

useEvent('db:inserted', ({ table }) => {
  if (table === 'collections') refetch()
})
useEvent('db:updated', ({ table }) => {
  if (table === 'collections') refetch()
})
useEvent('db:deleted', ({ table }) => {
  if (table === 'collections') refetch()
})

// =============================================================================
// Actions
// =============================================================================

function handleCollectionClick(collectionId: string) {
  router.push({
    name: 'collection-detail',
    params: { collectionId }
  })
}
</script>

<template>
  <!-- Loading state -->
  <div
    v-if="state === 'loading'"
    class="flex items-center justify-center h-full"
  >
    <Icon
      icon="icon-[mdi--loading]"
      class="size-8 animate-spin text-muted-foreground"
    />
  </div>

  <!-- Content -->
  <div
    v-else
    class="h-full flex flex-col"
  >
    <!-- Header -->
    <header
      class="shrink-0 flex items-center justify-between px-4 h-12 border-b border-border bg-surface"
    >
      <div class="flex items-center gap-3">
        <RouterLink to="/library">
          <Button
            variant="ghost"
            size="icon-sm"
          >
            <Icon
              icon="icon-[mdi--arrow-left]"
              class="size-4"
            />
          </Button>
        </RouterLink>
          <Icon
          :icon="getEntityIcon('collection')"
          class="size-5"
        />
        <h1 class="text-base font-semibold">合集</h1>
        <span class="text-xs text-muted-foreground">{{ collectionList?.length ?? 0 }} 个</span>
      </div>

      <div class="flex items-center gap-2">
        <Button
          size="sm"
          @click="showCreateDialog = true"
        >
          <Icon
            icon="icon-[mdi--plus]"
            class="size-4"
          />
          新建合集
        </Button>
      </div>
    </header>

    <!-- Collection grid -->
    <div
      ref="scrollContainerRef"
      class="flex-1 overflow-auto scrollbar-thin p-4"
    >
      <!-- Empty state -->
      <div
        v-if="!collectionList || collectionList.length === 0"
        class="flex flex-col items-center justify-center h-full gap-4"
      >
        <Icon
          icon="icon-[mdi--folder-plus-outline]"
          class="size-16 text-muted-foreground"
        />
        <p class="text-muted-foreground">暂无合集</p>
        <p class="text-sm text-muted-foreground">创建合集来整理你的媒体库</p>
      </div>

      <!-- Grid -->
      <VirtualGrid
        v-else
        :items="collectionList"
        :get-key="(item) => item.id"
        :scroll-parent="scrollContainerRef"
        class="grid grid-cols-[repeat(auto-fill,8rem)] gap-3 justify-between"
      >
        <template #item="{ item }">
          <CollectionCard
            :collection="item"
            size="md"
            @click="handleCollectionClick(item.id)"
          />
        </template>
      </VirtualGrid>
    </div>

    <!-- Create dialog -->
    <CollectionInfoFormDialog
      v-if="showCreateDialog"
      v-model:open="showCreateDialog"
    />
  </div>
</template>
