<script setup lang="ts">
/**
 * ExplorerListItem - Single entity item
 *
 * Renders a single entity in the explorer list with lazy-loaded images.
 * Each entity is wrapped with its corresponding context menu.
 */

import { computed, inject, type ComputedRef } from 'vue'
import { RouterLink, useRoute, type LocationQuery } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Icon } from '@renderer/components/ui/icon'
import { GameContextMenu, GameBatchContextMenu } from '@renderer/components/shared/game'
import { CharacterContextMenu, CharacterBatchContextMenu } from '@renderer/components/shared/character'
import { PersonContextMenu, PersonBatchContextMenu } from '@renderer/components/shared/person'
import { CompanyContextMenu, CompanyBatchContextMenu } from '@renderer/components/shared/company'
import { getAttachmentUrl } from '@renderer/utils/attachment'
import { getEntityIcon } from '@renderer/utils'
import { useLibraryExplorerStore } from '../../stores'
import { parseExplorerSelectionKey, toExplorerSelectionKey } from '../../utils/explorer-selection'
import type { EntityData } from '../../composables'
import type { ContentEntityType } from '@shared/common'
import type { Game, Character, Person, Company } from '@shared/db'

interface Props {
  entity: EntityData
  entityType: ContentEntityType
  from: string
}

const props = defineProps<Props>()

const store = useLibraryExplorerStore()
const { selectedKeys } = storeToRefs(store)

const visibleSelectionKeys = inject<ComputedRef<string[]>>(
  'explorerVisibleSelectionKeys',
  computed(() => [])
)

const ENTITY_PATHS: Record<ContentEntityType, string> = {
  game: '/library/game',
  character: '/library/character',
  person: '/library/person',
  company: '/library/company'
} as const

const rowKey = computed(() => toExplorerSelectionKey(props.from, props.entity.id))

const isSelected = computed(() => selectedKeys.value.includes(rowKey.value))
const useBatchMenu = computed(() => isSelected.value && selectedEntityIds.value.length > 1)

const selectedEntityIds = computed(() => {
  const ids = selectedKeys.value.map((key) => parseExplorerSelectionKey(key).id)
  return [...new Set(ids)]
})

const detailPath = computed(() => `${ENTITY_PATHS[props.entityType]}/${props.entity.id}`)

const linkQuery = computed(() => ({ from: props.from }))

const route = useRoute()

function isStrictQueryMatch(actual: LocationQuery, expected: Record<string, string>) {
  const actualKeys = Object.keys(actual)
  const expectedKeys = Object.keys(expected)

  if (actualKeys.length !== expectedKeys.length) {
    return false
  }

  actualKeys.sort()
  expectedKeys.sort()

  for (let index = 0; index < actualKeys.length; index++) {
    if (actualKeys[index] !== expectedKeys[index]) {
      return false
    }
  }

  return actualKeys.every((key) => {
    const actualValue = actual[key]
    const expectedValue = expected[key]

    if (Array.isArray(actualValue)) {
      return actualValue.length === 1 && actualValue[0] === expectedValue
    }

    return actualValue === expectedValue
  })
}

const isStrictActive = computed(() => {
  if (route.path !== detailPath.value) {
    return false
  }

  return isStrictQueryMatch(route.query, linkQuery.value)
})

const imageUrl = computed(() => {
  switch (props.entityType) {
    case 'game': {
      const game = props.entity as Game
      if (game.iconFile) {
        return getAttachmentUrl('games', game.id, game.iconFile, { width: 100, height: 100 })
      }
      if (game.coverFile) {
        return getAttachmentUrl('games', game.id, game.coverFile, { width: 100, height: 100 })
      }
      return null
    }
    case 'character': {
      const character = props.entity as Character
      if (character.photoFile) {
        return getAttachmentUrl('characters', character.id, character.photoFile, {
          width: 100,
          height: 100
        })
      }
      return null
    }
    case 'person': {
      const person = props.entity as Person
      if (person.photoFile) {
        return getAttachmentUrl('persons', person.id, person.photoFile, {
          width: 100,
          height: 100
        })
      }
      return null
    }
    case 'company': {
      const company = props.entity as Company
      if (company.logoFile) {
        return getAttachmentUrl('companies', company.id, company.logoFile, {
          width: 100,
          height: 100
        })
      }
      return null
    }
    default:
      return null
  }
})

const entityIcon = computed(() => getEntityIcon(props.entityType))

function handleClick(e: MouseEvent) {
  if (e.shiftKey) {
    e.preventDefault()
    e.stopPropagation()
    store.selectRange(rowKey.value, visibleSelectionKeys.value, e.ctrlKey || e.metaKey)
    return
  }

  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    e.stopPropagation()
    store.toggleSelection(rowKey.value)
    return
  }

  store.setSelection([rowKey.value], rowKey.value)
}
</script>

<template>
  <!-- Game context menu -->
  <component
    :is="useBatchMenu ? GameBatchContextMenu : GameContextMenu"
    v-if="props.entityType === 'game'"
    v-bind="useBatchMenu ? { gameIds: selectedEntityIds } : { gameId: props.entity.id }"
    @deleted="store.clearSelection()"
  >
    <RouterLink
      :to="{ path: detailPath, query: linkQuery }"
      class="group relative flex items-center h-6 pl-4 pr-2 text-xs rounded-r-md text-muted-foreground hover:text-foreground hover:bg-accent/70 [&.is-strict-active]:text-accent-foreground [&.is-strict-active]:bg-accent [&.is-strict-active]:shadow-sm [&.is-selected]:text-foreground [&.is-selected]:bg-accent/50"
      :class="{ 'is-strict-active': isStrictActive, 'is-selected': isSelected && !isStrictActive }"
      @click="handleClick"
    >
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="props.entity.name"
        class="size-4 rounded-sm mr-1.5 border shadow-sm object-cover"
      />
      <Icon
        v-else
        :icon="entityIcon"
        class="size-4 text-muted-foreground/50 mr-1.5"
      />
      <span class="truncate">{{ props.entity.name }}</span>
    </RouterLink>
  </component>

  <!-- Character context menu -->
  <component
    :is="useBatchMenu ? CharacterBatchContextMenu : CharacterContextMenu"
    v-else-if="props.entityType === 'character'"
    v-bind="
      useBatchMenu
        ? { characterIds: selectedEntityIds }
        : { characterId: props.entity.id }
    "
    @deleted="store.clearSelection()"
  >
    <RouterLink
      :to="{ path: detailPath, query: linkQuery }"
      class="group relative flex items-center h-6 pl-4 pr-2 text-xs rounded-r-md text-muted-foreground hover:text-foreground hover:bg-accent/70 [&.is-strict-active]:text-accent-foreground [&.is-strict-active]:bg-accent [&.is-strict-active]:shadow-sm [&.is-selected]:text-foreground [&.is-selected]:bg-accent/30"
      :class="{ 'is-strict-active': isStrictActive, 'is-selected': isSelected && !isStrictActive }"
      @click="handleClick"
    >
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="props.entity.name"
        class="size-4 rounded-sm mr-1.5 border shadow-sm object-cover"
      />
      <Icon
        v-else
        :icon="entityIcon"
        class="size-4 text-muted-foreground/50 mr-1.5"
      />
      <span class="truncate">{{ props.entity.name }}</span>
    </RouterLink>
  </component>

  <!-- Person context menu -->
  <component
    :is="useBatchMenu ? PersonBatchContextMenu : PersonContextMenu"
    v-else-if="props.entityType === 'person'"
    v-bind="useBatchMenu ? { personIds: selectedEntityIds } : { personId: props.entity.id }"
    @deleted="store.clearSelection()"
  >
    <RouterLink
      :to="{ path: detailPath, query: linkQuery }"
      class="group relative flex items-center h-6 pl-4 pr-2 text-xs rounded-r-md text-muted-foreground hover:text-foreground hover:bg-accent/70 [&.is-strict-active]:text-accent-foreground [&.is-strict-active]:bg-accent [&.is-strict-active]:shadow-sm [&.is-selected]:text-foreground [&.is-selected]:bg-accent/30"
      :class="{ 'is-strict-active': isStrictActive, 'is-selected': isSelected && !isStrictActive }"
      @click="handleClick"
    >
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="props.entity.name"
        class="size-4 rounded-sm mr-1.5 border shadow-sm object-cover"
      />
      <Icon
        v-else
        :icon="entityIcon"
        class="size-4 text-muted-foreground/50 mr-1.5"
      />
      <span class="truncate">{{ props.entity.name }}</span>
    </RouterLink>
  </component>

  <!-- Company context menu -->
  <component
    :is="useBatchMenu ? CompanyBatchContextMenu : CompanyContextMenu"
    v-else
    v-bind="useBatchMenu ? { companyIds: selectedEntityIds } : { companyId: props.entity.id }"
    @deleted="store.clearSelection()"
  >
    <RouterLink
      :to="{ path: detailPath, query: linkQuery }"
      class="group relative flex items-center h-6 pl-4 pr-2 text-xs rounded-r-md text-muted-foreground hover:text-foreground hover:bg-accent/70 [&.is-strict-active]:text-accent-foreground [&.is-strict-active]:bg-accent [&.is-strict-active]:shadow-sm [&.is-selected]:text-foreground [&.is-selected]:bg-accent/30"
      :class="{ 'is-strict-active': isStrictActive, 'is-selected': isSelected && !isStrictActive }"
      @click="handleClick"
    >
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="props.entity.name"
        class="size-4 rounded-sm mr-1.5 border shadow-sm object-cover"
      />
      <Icon
        v-else
        :icon="entityIcon"
        class="size-4 text-muted-foreground/50 mr-1.5"
      />
      <span class="truncate">{{ props.entity.name }}</span>
    </RouterLink>
  </component>
</template>
