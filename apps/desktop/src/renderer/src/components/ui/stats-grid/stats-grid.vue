<!--
  StatsGrid - Simple statistics grid with optional date range header

  Features:
  - Uniform card container
  - Icon + label + value cells
-->

<script setup lang="ts">
import { cn } from '@renderer/utils'
import { Icon } from '@renderer/components/ui/icon'
import type { StatsGridProps } from './types'

const props = withDefaults(defineProps<StatsGridProps>(), {
  gridClass: 'grid-cols-2 md:grid-cols-4'
})
</script>

<template>
  <div
    :class="cn('rounded-lg border bg-card overflow-hidden', props.class)"
    data-slot="stats-grid"
  >
    <div :class="cn('grid -m-px', props.gridClass)">
      <div
        v-for="(item, index) in props.items"
        :key="index"
        class="p-4 border-r border-b"
      >
        <div class="flex items-center gap-2 text-muted-foreground mb-2">
          <Icon
            :icon="item.icon"
            class="size-4"
          />
          <span class="text-sm">{{ item.label }}</span>
        </div>
        <div
          class="text-lg font-semibold"
          :class="item.truncate && 'truncate'"
        >
          {{ item.value }}
        </div>
      </div>
    </div>
  </div>
</template>
