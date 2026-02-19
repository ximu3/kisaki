<script setup lang="ts">
/**
 * ToolbarSort - Sort field and direction selector
 *
 * Compact dropdown trigger with sort field selection and direction toggle.
 * Uses filter UI specs for sort options.
 */

import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { useLibraryExplorerStore } from '../../../stores'
import {
  gameFilterUiSpec,
  characterFilterUiSpec,
  personFilterUiSpec,
  companyFilterUiSpec
} from '@renderer/components/shared/filter'
import type { ContentEntityType } from '@shared/common'

const store = useLibraryExplorerStore()
const { activeEntityType, sortField, sortDirection, overrideCollectionOrder } = storeToRefs(store)

const uiSpec = computed(() => getUiSpec(activeEntityType.value))
const sortFields = computed(() => uiSpec.value.sortOptions)

// Computed wrappers for v-model binding
const sortFieldModel = computed({
  get: () => sortField.value,
  set: (value: string) => store.setSort(value, sortDirection.value)
})

const sortDirectionModel = computed({
  get: () => sortDirection.value,
  set: (value: 'asc' | 'desc') => store.setSort(sortField.value, value)
})

// Computed model for override collection order checkbox
const overrideModel = computed({
  get: () => overrideCollectionOrder.value,
  set: (checked: boolean | undefined) => {
    if (checked !== undefined && checked !== overrideCollectionOrder.value) {
      store.toggleOverrideCollectionOrder()
    }
  }
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
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="secondary"
        size="icon"
        class="size-7 bg-background/50"
        title="排序"
      >
        <Icon
          v-if="sortDirection === 'asc'"
          icon="icon-[mdi--sort-ascending]"
          class="size-4 text-muted-foreground"
        />
        <Icon
          v-else
          icon="icon-[mdi--sort-descending]"
          class="size-4 text-muted-foreground"
        />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent
      align="end"
      class="w-36"
    >
      <!-- Sort field selection -->
      <DropdownMenuRadioGroup v-model="sortFieldModel">
        <DropdownMenuRadioItem
          v-for="field in sortFields"
          :key="field.key"
          :value="field.key"
        >
          {{ field.label }}
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>

      <DropdownMenuSeparator />

      <!-- Sort direction -->
      <DropdownMenuRadioGroup v-model="sortDirectionModel">
        <DropdownMenuRadioItem value="asc">升序</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="desc">降序</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>

      <DropdownMenuSeparator />

      <!-- Override collection order -->
      <DropdownMenuCheckboxItem v-model="overrideModel"> 覆盖合集内排序 </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
