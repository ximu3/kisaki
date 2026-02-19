<script setup lang="ts">
/**
 * ToolbarFilter - Filter trigger and panel
 *
 * Filter button with badge showing active filter count.
 * Uses the shared FilterPanel component from components/filter.
 */

import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { Icon } from '@renderer/components/ui/icon'
import { cn } from '@renderer/utils/cn'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import {
  FilterPanel,
  gameFilterUiSpec,
  characterFilterUiSpec,
  personFilterUiSpec,
  companyFilterUiSpec
} from '@renderer/components/shared/filter'
import { useLibraryExplorerStore } from '../../../stores'
import { countActiveFilters } from '@shared/filter'
import type { FilterState } from '@shared/filter'
import type { ContentEntityType } from '@shared/common'

const store = useLibraryExplorerStore()
const { activeEntityType, filter } = storeToRefs(store)

const activeCount = computed(() => countActiveFilters(filter.value))

const uiSpec = computed(() => getUiSpec(activeEntityType.value))

// Computed model for filter (store binding)
const filterModel = computed({
  get: () => filter.value,
  set: (newFilter: FilterState) => store.setFilter(newFilter)
})

function getUiSpec(entityType: ContentEntityType) {
  switch (entityType) {
    case 'game':
      return gameFilterUiSpec
    case 'character':
      return characterFilterUiSpec
    case 'person':
      return personFilterUiSpec
    case 'company':
      return companyFilterUiSpec
  }
}
</script>

<template>
  <FilterPanel
    v-model="filterModel"
    :ui-spec="uiSpec"
    side="right"
    align="start"
  >
    <Button
      variant="secondary"
      size="icon"
      :class="cn('size-7 relative bg-background/50', activeCount > 0 && 'text-primary')"
      title="筛选"
    >
      <Icon
        icon="icon-[mdi--filter-outline]"
        class="size-4 text-muted-foreground"
      />
      <Badge
        v-if="activeCount > 0"
        variant="secondary"
        class="absolute -top-1 -right-1 size-4 p-0 flex items-center justify-center text-[9px]"
      >
        {{ activeCount }}
      </Badge>
    </Button>
  </FilterPanel>
</template>
