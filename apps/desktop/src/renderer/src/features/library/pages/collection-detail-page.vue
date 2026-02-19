<script setup lang="ts">
/**
 * Collection Detail Page
 *
 * Library page for viewing collection contents.
 * Uses CollectionProvider for data management and shared CollectionDetailContent.
 * Supports both static collections (link-based) and dynamic collections (filter-based).
 */

import { ref, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { SegmentedControl, SegmentedControlItem } from '@renderer/components/ui/segmented-control'
import {
  CollectionDetailContent,
  CollectionDropdownMenu,
  CollectionEntitiesFormDialog,
  CollectionDynamicConfigFormDialog,
  CollectionConvertToStaticFormDialog
} from '@renderer/components/shared/collection'
import { useCollectionProvider, useRenderState } from '@renderer/composables'
import { CONTENT_ENTITY_TYPES, type ContentEntityType } from '@shared/common'

// =============================================================================
// Types & Config
// =============================================================================

interface EntityConfig {
  label: string
  unitLabel: string
}

const ENTITY_CONFIG: Record<ContentEntityType, EntityConfig> = {
  game: { label: '游戏', unitLabel: '款' },
  character: { label: '角色', unitLabel: '个' },
  person: { label: '人物', unitLabel: '位' },
  company: { label: '公司', unitLabel: '家' }
}

// =============================================================================
// Route & Navigation
// =============================================================================

const route = useRoute()
const router = useRouter()

const collectionId = computed(() => route.params.collectionId as string | undefined)

// Redirect if no collectionId
if (!collectionId.value) {
  router.push('/library/collections')
}

// =============================================================================
// Provider
// =============================================================================

const {
  collection,
  entityType,
  entityCounts,
  configuredEntityTypes,
  setEntityType,
  isLoading,
  refetch,
  error
} = useCollectionProvider(() => collectionId.value ?? '')
const state = useRenderState(isLoading, error, collection)

// =============================================================================
// State
// =============================================================================

const editEntitiesOpen = ref(false)
const editFilterOpen = ref(false)
const convertDialogOpen = ref(false)

// Scroll container ref for VirtualGrid
const scrollContainerRef = ref<HTMLElement>()

// =============================================================================
// Computed
// =============================================================================

const isDynamic = computed(() => collection.value?.isDynamic ?? false)
const totalCount = computed(() => Object.values(entityCounts.value).reduce((a, b) => a + b, 0))

// Wrapper for entityType to use with v-model
const entityTypeModel = computed({
  get: () => entityType.value,
  set: (type: ContentEntityType) => setEntityType(type)
})

// =============================================================================
// Actions
// =============================================================================

function getDetailPath(type: ContentEntityType, id: string): string {
  switch (type) {
    case 'game':
      return `/library/game/${id}`
    case 'character':
      return `/library/character/${id}`
    case 'person':
      return `/library/person/${id}`
    case 'company':
      return `/library/company/${id}`
  }
}

function handleEntityClick(payload: { type: ContentEntityType; id: string }) {
  if (!collection.value) return
  router.push({
    path: getDetailPath(payload.type, payload.id),
    query: { from: `collection:${collection.value.id}` }
  })
}
</script>

<template>
  <!-- Loading state -->
  <div
    v-if="state === 'loading'"
    class="flex-1 flex items-center justify-center h-full"
  >
    <Icon
      icon="icon-[mdi--loading]"
      class="size-8 text-muted-foreground animate-spin"
    />
  </div>

  <!-- Error state -->
  <div
    v-else-if="state === 'error'"
    class="flex-1 flex items-center justify-center h-full"
  >
    <div class="text-center">
      <Icon
        icon="icon-[mdi--alert-circle-outline]"
        class="size-12 text-destructive/30 mb-3 mx-auto"
      />
      <p class="text-sm text-muted-foreground">{{ error?.message ?? error }}</p>
    </div>
  </div>

  <!-- Not found state -->
  <div
    v-else-if="state === 'not-found'"
    class="flex-1 flex items-center justify-center h-full"
  >
    <div class="text-center">
      <Icon
        icon="icon-[mdi--folder-open-outline]"
        class="size-12 text-muted-foreground/30 mb-3 mx-auto"
      />
      <p class="text-sm text-muted-foreground">合集不存在</p>
    </div>
  </div>

  <!-- Content -->
  <div
    v-else-if="state === 'success' && collection"
    class="h-full flex flex-col w-full"
  >
    <!-- Header -->
    <header class="shrink-0 flex items-center gap-3 px-4 h-12 border-b border-border bg-surface">
      <!-- Back button -->
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

      <!-- Collection info -->
      <div class="flex items-center gap-2 min-w-0 mr-auto">
        <h1 class="text-base font-semibold truncate">{{ collection?.name }}</h1>
        <Icon
          v-if="isDynamic"
          icon="icon-[mdi--lightning-bolt]"
          class="size-4 shrink-0"
          title="动态合集"
        />
      </div>

      <!-- Entity type segmented control -->
      <SegmentedControl
        v-model="entityTypeModel"
        class="ml-auto"
      >
        <SegmentedControlItem
          v-for="type in CONTENT_ENTITY_TYPES"
          :key="type"
          :value="type"
          :disabled="isDynamic && !configuredEntityTypes.includes(type)"
          :class="isDynamic && !configuredEntityTypes.includes(type) ? 'opacity-50' : ''"
        >
          {{ ENTITY_CONFIG[type].label }}
          <span
            v-if="entityCounts[type] > 0"
            class="ml-1 text-xs text-muted-foreground"
          >
            ({{ entityCounts[type] }})
          </span>
        </SegmentedControlItem>
      </SegmentedControl>

      <!-- Action buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- For static collections: edit content button -->
        <Button
          v-if="!isDynamic"
          variant="secondary"
          size="sm"
          @click="editEntitiesOpen = true"
        >
          <Icon
            icon="icon-[mdi--format-list-numbered]"
            class="size-4 mr-1.5"
          />
          编辑内容
        </Button>

        <!-- For dynamic collections: edit filter and convert buttons -->
        <template v-if="isDynamic">
          <Button
            variant="secondary"
            size="sm"
            @click="editFilterOpen = true"
          >
            <Icon
              icon="icon-[mdi--filter-outline]"
              class="size-4 mr-1.5"
            />
            编辑筛选
          </Button>
          <Button
            variant="secondary"
            size="sm"
            @click="convertDialogOpen = true"
          >
            <Icon
              icon="icon-[mdi--arrow-bottom-left]"
              class="size-4 mr-1.5"
            />
            转为静态
          </Button>
        </template>

        <!-- Dropdown menu -->
        <CollectionDropdownMenu
          v-if="collectionId"
          :collection-id="collectionId"
          navigate-on-delete
        />
      </div>
    </header>

    <!-- Main content -->
    <div
      ref="scrollContainerRef"
      class="flex-1 overflow-auto scrollbar-thin p-4"
    >
      <CollectionDetailContent
        :scroll-parent="scrollContainerRef"
        @entity-click="handleEntityClick"
      />
    </div>

    <!-- Edit entities dialog - static mode only -->
    <CollectionEntitiesFormDialog
      v-if="collectionId && !isDynamic && editEntitiesOpen"
      v-model:open="editEntitiesOpen"
      :collection-id="collectionId"
    />

    <!-- Edit filter dialog - dynamic mode only -->
    <CollectionDynamicConfigFormDialog
      v-if="isDynamic && editFilterOpen"
      v-model:open="editFilterOpen"
      :collection-id="collectionId!"
      @updated="refetch()"
    />

    <!-- Convert to static confirmation dialog -->
    <CollectionConvertToStaticFormDialog
      v-if="isDynamic && convertDialogOpen"
      v-model:open="convertDialogOpen"
      :collection-id="collectionId!"
      :total-count="totalCount"
      @converted="refetch()"
    />
  </div>
</template>
