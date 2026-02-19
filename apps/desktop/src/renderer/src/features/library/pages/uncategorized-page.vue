<script setup lang="ts">
/**
 * Uncategorized Page
 *
 * Displays entities that are not assigned to any collection.
 */

import { ref, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { notInArray, and, eq } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { VirtualGrid } from '@renderer/components/ui/virtual'
import { EntityCard } from '@renderer/components/shared'
import { db } from '@renderer/core/db'
import { useAsyncData, useEvent, useRenderState } from '@renderer/composables'
import {
  games,
  characters,
  persons,
  companies,
  collectionGameLinks,
  collectionCharacterLinks,
  collectionPersonLinks,
  collectionCompanyLinks
} from '@shared/db'
import type { Game, Character, Person, Company } from '@shared/db'
import type { ContentEntityType } from '@shared/common'
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
// Route
// =============================================================================

const route = useRoute()
const router = useRouter()
const scrollContainerRef = ref<HTMLElement>()

const entityType = computed(() => (route.params.entityType as ContentEntityType) || 'game')
const preferencesStore = usePreferencesStore()
const { showNsfw } = storeToRefs(preferencesStore)

// =============================================================================
// Data
// =============================================================================

async function fetchUncategorized(): Promise<EntityData[]> {
  switch (entityType.value) {
    case 'game': {
      const linkedIds = await db
        .selectDistinct({ id: collectionGameLinks.gameId })
        .from(collectionGameLinks)
      const linkedIdSet = linkedIds.map((l) => l.id)

      if (linkedIdSet.length > 0) {
        return await db
          .select()
          .from(games)
          .where(
            and(
              notInArray(games.id, linkedIdSet),
              showNsfw.value ? undefined : eq(games.isNsfw, false)
            )
          )
      } else {
        return await db
          .select()
          .from(games)
          .where(showNsfw.value ? undefined : eq(games.isNsfw, false))
      }
    }
    case 'character': {
      const linkedIds = await db
        .selectDistinct({ id: collectionCharacterLinks.characterId })
        .from(collectionCharacterLinks)
      const linkedIdSet = linkedIds.map((l) => l.id)

      if (linkedIdSet.length > 0) {
        return await db
          .select()
          .from(characters)
          .where(
            and(
              notInArray(characters.id, linkedIdSet),
              showNsfw.value ? undefined : eq(characters.isNsfw, false)
            )
          )
      } else {
        return await db
          .select()
          .from(characters)
          .where(showNsfw.value ? undefined : eq(characters.isNsfw, false))
      }
    }
    case 'person': {
      const linkedIds = await db
        .selectDistinct({ id: collectionPersonLinks.personId })
        .from(collectionPersonLinks)
      const linkedIdSet = linkedIds.map((l) => l.id)

      if (linkedIdSet.length > 0) {
        return await db
          .select()
          .from(persons)
          .where(
            and(
              notInArray(persons.id, linkedIdSet),
              showNsfw.value ? undefined : eq(persons.isNsfw, false)
            )
          )
      } else {
        return await db
          .select()
          .from(persons)
          .where(showNsfw.value ? undefined : eq(persons.isNsfw, false))
      }
    }
    case 'company': {
      const linkedIds = await db
        .selectDistinct({ id: collectionCompanyLinks.companyId })
        .from(collectionCompanyLinks)
      const linkedIdSet = linkedIds.map((l) => l.id)

      if (linkedIdSet.length > 0) {
        return await db
          .select()
          .from(companies)
          .where(
            and(
              notInArray(companies.id, linkedIdSet),
              showNsfw.value ? undefined : eq(companies.isNsfw, false)
            )
          )
      } else {
        return await db
          .select()
          .from(companies)
          .where(showNsfw.value ? undefined : eq(companies.isNsfw, false))
      }
    }
  }
}

const {
  data: entities,
  isLoading,
  error,
  refetch
} = useAsyncData(fetchUncategorized, {
  watch: [entityType, showNsfw]
})
const state = useRenderState(isLoading, error, entities)

// =============================================================================
// Event Listeners
// =============================================================================

useEvent('db:inserted', ({ table }) => {
  if (
    table === 'games' ||
    table === 'characters' ||
    table === 'persons' ||
    table === 'companies' ||
    table.includes('collection')
  ) {
    refetch()
  }
})
useEvent('db:updated', ({ table }) => {
  if (
    table === 'games' ||
    table === 'characters' ||
    table === 'persons' ||
    table === 'companies' ||
    table.includes('collection')
  ) {
    refetch()
  }
})
useEvent('db:deleted', ({ table }) => {
  if (
    table === 'games' ||
    table === 'characters' ||
    table === 'persons' ||
    table === 'companies' ||
    table.includes('collection')
  ) {
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
    query: { from: 'uncategorized' }
  })
}
</script>

<template>
  <div class="h-full flex flex-col w-full">
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

      <!-- Title -->
      <div class="flex items-center gap-3 min-w-0">
        <Icon
          icon="icon-[mdi--folder-question-outline]"
          class="size-5"
        />
        <h1 class="text-base font-semibold">未分类{{ ENTITY_CONFIG[entityType].label }}</h1>
        <span class="text-xs text-muted-foreground">
          {{ entities?.length ?? 0 }} {{ ENTITY_CONFIG[entityType].unitLabel }}
        </span>
      </div>
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
          icon="icon-[mdi--check-circle-outline]"
          class="size-12 text-muted-foreground"
        />
        <p class="text-muted-foreground">所有{{ ENTITY_CONFIG[entityType].label }}都已分类</p>
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
