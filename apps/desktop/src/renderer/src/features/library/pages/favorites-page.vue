<script setup lang="ts">
/**
 * Favorites Page
 *
 * Displays entities marked as favorite (isFavorite = true).
 */

import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { eq, and } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { SegmentedControl, SegmentedControlItem } from '@renderer/components/ui/segmented-control'
import { VirtualGrid } from '@renderer/components/ui/virtual'
import { EntityCard } from '@renderer/components/shared'
import { db } from '@renderer/core/db'
import { useAsyncData, useEvent, useRenderState } from '@renderer/composables'
import { games, characters, persons, companies } from '@shared/db'
import type { Game, Character, Person, Company } from '@shared/db'
import { type ContentEntityType, CONTENT_ENTITY_TYPES } from '@shared/common'
import { storeToRefs } from 'pinia'
import { usePreferencesStore } from '@renderer/stores'

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

type EntityData = Game | Character | Person | Company

// =============================================================================
// Router
// =============================================================================

const router = useRouter()

// =============================================================================
// State
// =============================================================================

const entityType = ref<ContentEntityType>('game')
const scrollContainerRef = ref<HTMLElement>()
const preferencesStore = usePreferencesStore()
const { showNsfw } = storeToRefs(preferencesStore)

// =============================================================================
// Data
// =============================================================================

async function fetchFavorites(): Promise<EntityData[]> {
  switch (entityType.value) {
    case 'game':
      return await db
        .select()
        .from(games)
        .where(
          and(eq(games.isFavorite, true), showNsfw.value ? undefined : eq(games.isNsfw, false))
        )
    case 'character':
      return await db
        .select()
        .from(characters)
        .where(
          and(
            eq(characters.isFavorite, true),
            showNsfw.value ? undefined : eq(characters.isNsfw, false)
          )
        )
    case 'person':
      return await db
        .select()
        .from(persons)
        .where(
          and(eq(persons.isFavorite, true), showNsfw.value ? undefined : eq(persons.isNsfw, false))
        )
    case 'company':
      return await db
        .select()
        .from(companies)
        .where(
          and(
            eq(companies.isFavorite, true),
            showNsfw.value ? undefined : eq(companies.isNsfw, false)
          )
        )
  }
}

const {
  data: entities,
  isLoading,
  error,
  refetch
} = useAsyncData(fetchFavorites, {
  watch: [entityType, showNsfw]
})
const state = useRenderState(isLoading, error, entities)

// =============================================================================
// Event Listeners
// =============================================================================

useEvent('db:inserted', ({ table }) => {
  if (table === 'games' || table === 'characters' || table === 'persons' || table === 'companies') {
    refetch()
  }
})
useEvent('db:updated', ({ table }) => {
  if (table === 'games' || table === 'characters' || table === 'persons' || table === 'companies') {
    refetch()
  }
})
useEvent('db:deleted', ({ table }) => {
  if (table === 'games' || table === 'characters' || table === 'persons' || table === 'companies') {
    refetch()
  }
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

function handleEntityClick(entity: EntityData) {
  router.push({
    path: getDetailPath(entityType.value, entity.id),
    query: { from: 'favorites' }
  })
}
</script>

<template>
  <div class="h-full flex flex-col w-full">
    <!-- Header -->
    <header
      class="shrink-0 flex items-center justify-between w-full gap-3 px-4 h-12 border-b border-border bg-surface"
    >
      <!-- Title -->
      <div class="flex items-center gap-3 min-w-0">
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
        <Icon
          icon="icon-[mdi--heart-outline]"
          class="size-5"
        />
        <h1 class="text-base font-semibold">喜欢</h1>
        <span class="text-xs text-muted-foreground">
          {{ entities?.length ?? 0 }} {{ ENTITY_CONFIG[entityType].unitLabel }}
        </span>
      </div>

      <!-- Entity type segmented control -->
      <SegmentedControl v-model="entityType">
        <SegmentedControlItem
          v-for="type in CONTENT_ENTITY_TYPES"
          :key="type"
          :value="type"
        >
          {{ ENTITY_CONFIG[type].label }}
        </SegmentedControlItem>
      </SegmentedControl>
    </header>

    <!-- Content -->
    <div
      ref="scrollContainerRef"
      class="flex-1 overflow-auto scrollbar-thin p-4"
    >
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

      <!-- Empty state -->
      <div
        v-else-if="!entities || entities.length === 0"
        class="flex flex-col items-center justify-center h-full gap-4"
      >
        <Icon
          icon="icon-[mdi--heart-off-outline]"
          class="size-12 text-muted-foreground"
        />
        <p class="text-muted-foreground">暂无喜欢的{{ ENTITY_CONFIG[entityType].label }}</p>
      </div>

      <!-- Grid -->
      <VirtualGrid
        v-else
        :items="entities"
        :get-key="(item) => item.id"
        :scroll-parent="scrollContainerRef"
        class="grid grid-cols-[repeat(auto-fill,8rem)] gap-3 justify-between"
      >
        <template #item="{ item }">
          <EntityCard
            :entity-type="entityType"
            :entity="item"
            size="md"
            @click="handleEntityClick(item)"
          />
        </template>
      </VirtualGrid>
    </div>
  </div>
</template>
