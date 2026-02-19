<script setup lang="ts">
/**
 * Installed Plugin Filter Bar
 *
 * Filter bar for installed plugins panel.
 * Contains search input, status filter, category tabs, and sort options.
 */

import { computed } from 'vue'
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
import {
  useInstalledPluginStore,
  type InstalledPluginSortField,
  type InstalledPluginStatusFilter
} from '../../stores'
import { PLUGIN_CATEGORIES } from '../../types'
import type { PluginCategory } from '@shared/plugin'

interface Props {
  updateCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  updateCount: 0
})

// Status filter configuration
const STATUS_OPTIONS: { value: InstalledPluginStatusFilter; label: string; icon: string }[] = [
  { value: 'all', label: '全部', icon: 'icon-[mdi--filter-outline]' },
  { value: 'enabled', label: '已启用', icon: 'icon-[mdi--check-circle-outline]' },
  { value: 'disabled', label: '已禁用', icon: 'icon-[mdi--pause-circle-outline]' }
]

const SORT_OPTIONS: { value: InstalledPluginSortField; label: string }[] = [
  { value: 'name', label: '名称' },
  { value: 'status', label: '状态' },
  { value: 'hasUpdate', label: '更新' }
]

// Category icon mapping
const CATEGORY_ICONS: Record<string, string> = {
  scraper: 'icon-[mdi--database-outline]',
  tool: 'icon-[mdi--wrench-outline]',
  theme: 'icon-[mdi--palette-outline]',
  integration: 'icon-[mdi--connection]'
}

const store = useInstalledPluginStore()

// Computed models for v-model binding
const searchQueryModel = computed({
  get: () => store.searchQuery,
  set: (v: string | number | undefined) => store.setSearchQuery(String(v ?? ''))
})

const sortFieldModel = computed({
  get: () => store.sortField,
  set: (v: InstalledPluginSortField) => store.setSortField(v)
})

const categoryModel = computed({
  get: () => store.selectedCategory ?? 'all',
  set: (value: string) =>
    store.setSelectedCategory(value === 'all' ? null : (value as PluginCategory))
})

function handleClearSearch() {
  store.setSearchQuery('')
}

function handleToggleSortDirection() {
  store.setSortDirection(store.sortDirection === 'desc' ? 'asc' : 'desc')
}
</script>

<template>
  <div class="shrink-0 flex flex-col gap-3 px-4 py-3 border-b border-border bg-background/50">
    <!-- Top row: Search + Status + Updates + Sort -->
    <div class="flex items-center gap-3">
      <!-- Search input -->
      <InputGroup class="flex-1 max-w-xl">
        <InputGroupAddon>
          <Icon
            icon="icon-[mdi--magnify]"
            class="size-4"
          />
        </InputGroupAddon>
        <InputGroupInput
          v-model="searchQueryModel"
          class="text-xs"
          placeholder="搜索已安装的插件..."
        />
        <InputGroupAddon
          v-if="store.searchQuery"
          class="cursor-pointer"
          align="inline-end"
          @click="handleClearSearch"
        >
          <Icon
            icon="icon-[mdi--close]"
            class="size-4 text-muted-foreground hover:text-foreground"
          />
        </InputGroupAddon>
      </InputGroup>

      <!-- Spacer -->
      <div class="flex-1" />

      <!-- Status filter as button group -->
      <ButtonGroup>
        <template
          v-for="opt in STATUS_OPTIONS"
          :key="opt.value"
        >
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                :variant="store.statusFilter === opt.value ? 'secondary' : 'outline'"
                size="icon-sm"
                :class="cn(store.statusFilter !== opt.value && 'text-muted-foreground')"
                @click="store.setStatusFilter(opt.value)"
              >
                <Icon
                  :icon="opt.icon"
                  class="size-4"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{{ opt.label }}</TooltipContent>
          </Tooltip>
        </template>
      </ButtonGroup>

      <!-- Updates filter toggle -->
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            :variant="store.showUpdatesOnly ? 'secondary' : 'outline'"
            size="sm"
            :class="cn('gap-1.5', !store.showUpdatesOnly && 'text-muted-foreground')"
            @click="store.setShowUpdatesOnly(!store.showUpdatesOnly)"
          >
            <Icon
              icon="icon-[mdi--refresh]"
              class="size-4"
            />
            <span
              v-if="props.updateCount > 0"
              :class="
                cn(
                  'text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center',
                  store.showUpdatesOnly
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted-foreground/20'
                )
              "
            >
              {{ props.updateCount }}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {{ store.showUpdatesOnly ? '显示全部' : '仅显示有更新' }}
        </TooltipContent>
      </Tooltip>

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
