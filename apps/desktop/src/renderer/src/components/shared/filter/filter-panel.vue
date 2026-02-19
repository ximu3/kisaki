<!--
  FilterPanel
  Popover-based filter panel with real-time feedback.
  Filter changes apply immediately for instant visual feedback.
  Matches UX patterns of entertainment software like Steam/Spotify.
-->
<script setup lang="ts">
import type { FilterState } from '@shared/filter'
import { ref } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { createEmptyFilter, countActiveFilters } from '@shared/filter'
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/components/ui/popover'
import { Button } from '@renderer/components/ui/button'
import FilterBuilder from './filter-builder.vue'
import type { FilterUiSpec } from './specs/types'

interface Props {
  uiSpec: FilterUiSpec
  /** Side of the popover */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** Alignment of the popover */
  align?: 'start' | 'center' | 'end'
}

const props = withDefaults(defineProps<Props>(), {
  side: 'bottom',
  align: 'start'
})

const model = defineModel<FilterState>({ required: true })

const open = ref(false)

function handleClear() {
  model.value = createEmptyFilter()
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <slot />
    </PopoverTrigger>

    <PopoverContent
      :side="props.side"
      :align="props.align"
      :side-offset="4"
      class="w-[400px] p-0"
    >
      <div class="flex flex-col max-h-[70vh]">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b">
          <div class="text-sm font-medium">筛选条件</div>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            class="-mr-1"
            @click="open = false"
          >
            <Icon
              icon="icon-[mdi--close]"
              class="size-3.5"
            />
          </Button>
        </div>

        <!-- Body - Scrollable -->
        <div class="flex-1 overflow-auto scrollbar-thin p-4">
          <FilterBuilder
            v-model="model"
            :ui-spec="props.uiSpec"
          />
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-4 py-3 border-t">
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="text-muted-foreground"
            @click="handleClear"
          >
            <Icon
              icon="icon-[mdi--filter-off-outline]"
              class="size-4 mr-1.5"
            />
            清除筛选
          </Button>
          <span
            v-if="countActiveFilters(model) > 0"
            class="text-xs text-muted-foreground"
          >
            {{ countActiveFilters(model) }} 个条件
          </span>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
