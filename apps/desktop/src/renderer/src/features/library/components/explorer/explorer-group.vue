<script setup lang="ts">
/**
 * ExplorerGroup - Collapsible collection group
 *
 * Renders a collection with virtualized collapsible entity list.
 * Shows lightning icon for dynamic collections.
 */

import { computed, inject, type Ref } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Icon } from '@renderer/components/ui/icon'
import { VirtualList } from '@renderer/components/ui/virtual'
import { CollectionContextMenu } from '@renderer/components/shared/collection'
import { cn } from '@renderer/utils/cn'
import { useLibraryExplorerStore } from '../../stores'
import LibraryExplorerListItem from './explorer-list-item.vue'
import type { CollectionGroup } from '../../composables'
import type { ContentEntityType } from '@shared/common'
import { toExplorerSelectionKey } from '../../utils/explorer-selection'

interface Props {
  group: CollectionGroup
  entityType: ContentEntityType
  isUncategorized?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isUncategorized: false
})

// Inject scroll container from parent explorer
const scrollContainer = inject<Ref<HTMLElement | undefined>>('explorerScrollContainer')

const store = useLibraryExplorerStore()
const { collapsedIds } = storeToRefs(store)

const isCollapsed = computed(() => collapsedIds.value.includes(props.group.id))

const linkTarget = computed(() => {
  if (props.isUncategorized) {
    return `/library/uncategorized/${props.entityType}`
  }
  return `/library/collection/${props.group.id}`
})

function handleToggleClick(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  store.toggleCollapsed(props.group.id)
}

function handleGroupRowClick(e: MouseEvent) {
  if (!e.ctrlKey && !e.metaKey) {
    if (store.selectedKeys.length > 0) {
      store.clearSelection()
    }
    return
  }

  e.preventDefault()
  e.stopPropagation()

  const from = props.isUncategorized ? 'uncategorized' : `collection:${props.group.id}`
  const keys = props.group.entities.map((entity) => toExplorerSelectionKey(from, entity.id))
  const anchorKey = keys.length > 0 ? keys[keys.length - 1] : null
  store.toggleGroupSelection(keys, anchorKey)
}
</script>

<template>
  <div class="mb-0.5 space-y-0.5">
    <!-- Group header - entire row is a link -->
    <CollectionContextMenu
      v-if="!props.isUncategorized"
      :collection-id="props.group.id"
    >
      <RouterLink
        :to="linkTarget"
        class="group flex items-center rounded-r-md text-muted-foreground hover:bg-accent/70 [&.router-link-active]:text-accent-foreground [&.router-link-active]:bg-accent [&.router-link-active]:shadow-sm"
        @click="handleGroupRowClick"
      >
        <!-- Collapse toggle -->
        <button
          class="flex items-center justify-center size-6 shrink-0"
          @click="handleToggleClick"
        >
          <Icon
            icon="icon-[mdi--chevron-right]"
            :class="cn('size-4 transition-transform', !isCollapsed && 'rotate-90')"
          />
        </button>

        <!-- Group name -->
        <div class="flex-1 flex items-center gap-1.5 h-6 pr-2 text-xs truncate">
          <span class="truncate">{{ props.group.name }}</span>
          <!-- Dynamic collection indicator -->
          <Icon
            v-if="props.group.isDynamic"
            icon="icon-[mdi--flash-outline]"
            class="size-3 shrink-0"
            title="动态合集"
          />
        </div>
      </RouterLink>
    </CollectionContextMenu>

    <RouterLink
      v-else
      :to="linkTarget"
      class="group flex items-center rounded-r-md text-muted-foreground hover:bg-accent/70 [&.router-link-active]:text-accent-foreground [&.router-link-active]:bg-accent [&.router-link-active]:shadow-sm"
      @click="handleGroupRowClick"
    >
      <!-- Collapse toggle -->
      <button
        class="flex items-center justify-center size-6 shrink-0"
        @click="handleToggleClick"
      >
        <Icon
          icon="icon-[mdi--chevron-right]"
          :class="cn('size-4 transition-transform', !isCollapsed && 'rotate-90')"
        />
      </button>

      <!-- Group name -->
      <div class="flex-1 flex items-center gap-1.5 h-6 pr-2 text-xs truncate">
        <span class="truncate">{{ props.group.name }}</span>
        <!-- Dynamic collection indicator -->
        <Icon
          v-if="props.group.isDynamic"
          icon="icon-[mdi--flash-outline]"
          class="size-3 shrink-0"
          title="动态合集"
        />
      </div>
    </RouterLink>

    <!-- Virtualized entity list -->
    <VirtualList
      v-if="!isCollapsed && props.group.entities.length > 0"
      :items="props.group.entities"
      :scroll-parent="scrollContainer"
      class="flex flex-col gap-0.5"
    >
      <template #item="{ item }">
        <LibraryExplorerListItem
          :entity="item"
          :entity-type="props.entityType"
          :from="props.isUncategorized ? 'uncategorized' : `collection:${props.group.id}`"
        />
      </template>
    </VirtualList>
  </div>
</template>
