<script setup lang="ts">
/**
 * Browse Plugin Filter Bar
 *
 * Full-width filter bar for plugin browsing.
 * Contains search input, registry selector, category tabs, and sort options.
 */

import { watch, computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@renderer/components/ui/input-group'
import { Button } from '@renderer/components/ui/button'
import { ButtonGroup } from '@renderer/components/ui/button-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { SegmentedControl, SegmentedControlItem } from '@renderer/components/ui/segmented-control'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { cn } from '@renderer/utils/cn'
import { ipcManager } from '@renderer/core/ipc'
import { useAsyncData } from '@renderer/composables/use-async-data'
import { useDebouncedRef } from '@renderer/composables/use-debounced-ref'
import { useDiscoverPluginStore, type DiscoverPluginSortField } from '../../stores'
import { PLUGIN_CATEGORIES } from '../../types'
import type { PluginCategory } from '@shared/plugin'

interface RegistryInfo {
  name: string
  searchable: boolean
}

// Registry display configuration
const REGISTRY_CONFIG: Record<string, { label: string; icon: string }> = {
  github: { label: 'GitHub', icon: 'icon-[mdi--github]' },
  local: { label: '本地', icon: 'icon-[mdi--folder-outline]' }
}

// Category icon mapping
const CATEGORY_ICONS: Record<string, string> = {
  scraper: 'icon-[mdi--database-outline]',
  tool: 'icon-[mdi--wrench-outline]',
  theme: 'icon-[mdi--palette-outline]',
  integration: 'icon-[mdi--connection]'
}

const SORT_OPTIONS: { value: DiscoverPluginSortField; label: string }[] = [
  { value: 'stars', label: '星标' },
  { value: 'name', label: '名称' },
  { value: 'updatedAt', label: '更新' }
]

const store = useDiscoverPluginStore()

const { data: registries } = useAsyncData(
  async () => {
    const res = await ipcManager.invoke('plugin:get-registries')
    return res.success && res.data ? (res.data as RegistryInfo[]) : []
  },
  { immediate: true }
)

const registriesList = computed(() => registries.value ?? [])

// Debounced search: auto-trigger search when input changes
const debouncedSearchInput = useDebouncedRef(() => store.searchInput, 300)

// Trigger search when debounced value changes
watch(debouncedSearchInput, () => {
  store.triggerSearch()
})

// Computed models for v-model binding
const searchInputModel = computed({
  get: () => store.searchInput,
  set: (v: string | number | undefined) => store.setSearchInput(String(v ?? ''))
})

const sortFieldModel = computed({
  get: () => store.sortField,
  set: (v: DiscoverPluginSortField) => store.setSortField(v)
})

const categoryModel = computed({
  get: () => store.selectedCategory ?? 'all',
  set: (value: string) =>
    store.setSelectedCategory(value === 'all' ? null : (value as PluginCategory))
})

function handleToggleSortDirection() {
  store.setSortDirection(store.sortDirection === 'desc' ? 'asc' : 'desc')
}
</script>

<template>
  <div class="shrink-0 flex flex-col gap-3 px-4 py-3 border-b border-border bg-background/50">
    <!-- Top row: Search + Registry + Sort -->
    <div class="flex items-center gap-3">
      <!-- Search input with button -->
      <div class="flex items-center gap-2 flex-1 max-w-xl">
        <InputGroup class="flex-1">
          <InputGroupAddon>
            <Icon
              icon="icon-[mdi--magnify]"
              class="size-4"
            />
          </InputGroupAddon>
          <InputGroupInput
            v-model="searchInputModel"
            class="text-xs"
            placeholder="搜索插件名称或描述..."
          />
          <InputGroupAddon
            v-if="store.searchInput"
            class="cursor-pointer"
            align="inline-end"
            @click="store.clearSearch"
          >
            <Icon
              icon="icon-[mdi--close]"
              class="size-4 text-muted-foreground hover:text-foreground"
            />
          </InputGroupAddon>
        </InputGroup>
      </div>

      <!-- Spacer -->
      <div class="flex-1" />

      <!-- Registry selector as button group -->
      <ButtonGroup v-if="registriesList.length > 0">
        <template
          v-for="reg in registriesList"
          :key="reg.name"
        >
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                :variant="store.selectedRegistry === reg.name ? 'secondary' : 'outline'"
                size="icon-sm"
                :class="cn(store.selectedRegistry !== reg.name && 'text-muted-foreground')"
                @click="store.setSelectedRegistry(reg.name)"
              >
                <Icon
                  :icon="REGISTRY_CONFIG[reg.name]?.icon ?? 'icon-[mdi--folder-outline]'"
                  class="size-4"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {{ REGISTRY_CONFIG[reg.name]?.label ?? reg.name }}
            </TooltipContent>
          </Tooltip>
        </template>
      </ButtonGroup>

      <!-- Sort controls: Select + Direction toggle -->
      <ButtonGroup>
        <Select v-model="sortFieldModel">
          <SelectTrigger
            size="sm"
            class="border-r-0 focus:border-border"
          >
            <SelectValue class="leading-none" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="option in SORT_OPTIONS"
              :key="option.value"
              :value="option.value"
              class="leading-none"
            >
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="outline"
              size="icon-sm"
              @click="handleToggleSortDirection"
            >
              <Icon
                :icon="
                  store.sortDirection === 'asc'
                    ? 'icon-[mdi--sort-ascending]'
                    : 'icon-[mdi--sort-descending]'
                "
                class="size-4 transition-transform"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {{ store.sortDirection === 'asc' ? '升序' : '降序' }}
          </TooltipContent>
        </Tooltip>
      </ButtonGroup>
    </div>

    <!-- Bottom row: Category filter -->
    <SegmentedControl v-model="categoryModel">
      <SegmentedControlItem value="all">
        <Icon
          icon="icon-[mdi--view-grid-outline]"
          class="size-3.5"
        />
        全部
      </SegmentedControlItem>
      <SegmentedControlItem
        v-for="cat in PLUGIN_CATEGORIES"
        :key="cat.id"
        :value="cat.id"
      >
        <Icon
          :icon="CATEGORY_ICONS[cat.id]"
          class="size-3.5"
        />
        {{ cat.label }}
      </SegmentedControlItem>
    </SegmentedControl>
  </div>
</template>
