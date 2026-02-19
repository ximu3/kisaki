<script setup lang="ts">
/**
 * Tag Detail Page
 *
 * Full page view for tag detail, used by routing.
 * Uses TagProvider for data management and shared TagDetailContent.
 */

import { ref, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import { SegmentedControl, SegmentedControlItem } from '@renderer/components/ui/segmented-control'
import { TagDetailContent, TagDropdownMenu, TagInfoFormDialog } from '@renderer/components/shared/tag'
import { useEvent, useRenderState, useTagProvider } from '@renderer/composables'
import { getEntityIcon } from '@renderer/utils'
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

const tagId = computed(() => route.params.tagId as string | undefined)
const backTo = computed(() => (route.query.from as string) || '/library')

// Redirect if no tagId
if (!tagId.value) {
  router.push(backTo.value)
}

// =============================================================================
// Provider
// =============================================================================

const { tag, entityType, entityCounts, setEntityType, isLoading, error } = useTagProvider(
  () => tagId.value ?? ''
)
const state = useRenderState(isLoading, error, tag)

useEvent('db:deleted', ({ table, id }) => {
  if (table === 'tags' && id === tagId.value) {
    router.push(backTo.value)
  }
})

// =============================================================================
// State
// =============================================================================

const editDialogOpen = ref(false)
const scrollContainerRef = ref<HTMLElement>()

// =============================================================================
// Computed
// =============================================================================

const entityTypeModel = computed({
  get: () => entityType.value,
  set: (value: ContentEntityType) => setEntityType(value)
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
  if (!tag.value) return
  router.push({
    path: getDetailPath(payload.type, payload.id),
    query: { from: `tag:${tag.value.id}` }
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
        :icon="getEntityIcon('tag')"
        class="size-12 text-muted-foreground/30 mb-3 mx-auto"
      />
      <p class="text-sm text-muted-foreground">标签不存在</p>
    </div>
  </div>

  <!-- Content -->
  <div
    v-else-if="state === 'success' && tag"
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

      <!-- Tag info -->
      <div class="flex items-center gap-2 min-w-0 mr-auto">
        <h1 class="text-base font-semibold truncate">{{ tag.name }}</h1>
        <Badge
          v-if="tag.isNsfw"
          variant="destructive"
          class="text-[10px] px-1.5 py-0"
        >
          NSFW
        </Badge>
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
        <Button
          variant="secondary"
          size="sm"
          @click="editDialogOpen = true"
        >
          <Icon
            icon="icon-[mdi--pencil-outline]"
            class="size-4 mr-1.5"
          />
          编辑
        </Button>
        <TagDropdownMenu :tag-id="tag.id" />
      </div>
    </header>

    <!-- Main content -->
    <div
      ref="scrollContainerRef"
      class="flex-1 overflow-auto scrollbar-thin p-4"
    >
      <TagDetailContent
        :scroll-parent="scrollContainerRef"
        @entity-click="handleEntityClick"
      />
    </div>
  </div>

  <TagInfoFormDialog
    v-if="editDialogOpen && tagId"
    v-model:open="editDialogOpen"
    :tag-id="tagId"
  />
</template>
