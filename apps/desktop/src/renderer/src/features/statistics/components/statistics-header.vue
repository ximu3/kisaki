<!--
  Statistics Header

  Page header with:
  - Title and icon
  - Report type navigation (RouterLinks styled as ghost buttons)
  - Period navigator (prev/next buttons with label) - hidden for overview
  - Media type selector
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useStatistics } from '../composables'
import { getYearWeek, getWeekStartDate } from '@renderer/utils/datetime'
import { getEntityIcon } from '@renderer/utils'
import type { ReportType } from '../types'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { SegmentedControl, SegmentedControlItem } from '@renderer/components/ui/segmented-control'

const route = useRoute()
const { reportType, currentPeriod, setCurrentPeriod, periodDisplay } = useStatistics()

// Media type (currently only game, future expansion)
const mediaType = ref<'game'>('game')

// Report type navigation items
const reportNavItems: { type: ReportType; label: string; routeName: string }[] = [
  { type: 'overview', label: '总览', routeName: 'statistics-overview' },
  { type: 'weekly', label: '周报', routeName: 'statistics-weekly' },
  { type: 'monthly', label: '月报', routeName: 'statistics-monthly' },
  { type: 'yearly', label: '年报', routeName: 'statistics-yearly' }
]

// Period navigation - only shown for non-overview reports
const showPeriodNav = computed(() => reportType.value !== 'overview')

function navigatePeriod(direction: 'prev' | 'next') {
  const current = currentPeriod.value
  const delta = direction === 'prev' ? -1 : 1

  switch (reportType.value) {
    case 'weekly': {
      // Navigate weeks
      const date = getWeekStartDate(current.year, current.week!)
      date.setDate(date.getDate() + delta * 7)
      const { year, week } = getYearWeek(date)
      setCurrentPeriod({ year, week })
      break
    }
    case 'monthly': {
      // Navigate months
      let newMonth = current.month! + delta
      let newYear = current.year
      if (newMonth < 1) {
        newMonth = 12
        newYear--
      }
      if (newMonth > 12) {
        newMonth = 1
        newYear++
      }
      setCurrentPeriod({ year: newYear, month: newMonth })
      break
    }
    case 'yearly': {
      // Navigate years
      setCurrentPeriod({ year: current.year + delta })
      break
    }
  }
}

// Check if can navigate to future
const canNavigateNext = computed(() => {
  const now = new Date()
  const current = currentPeriod.value

  switch (reportType.value) {
    case 'weekly': {
      const { year, week } = getYearWeek(now)
      return current.year < year || (current.year === year && current.week! < week)
    }
    case 'monthly':
      return (
        current.year < now.getFullYear() ||
        (current.year === now.getFullYear() && current.month! < now.getMonth() + 1)
      )
    case 'yearly':
      return current.year < now.getFullYear()
    default:
      return false
  }
})

// Check if route is active
function isRouteActive(routeName: string): boolean {
  const currentRouteName = route.name
  if (!currentRouteName || typeof currentRouteName !== 'string') return routeName === 'statistics-overview'
  return currentRouteName === routeName
}
</script>

<template>
  <div
    class="shrink-0 flex items-center justify-between gap-3 px-4 h-12 border-b border-border bg-surface"
  >
    <!-- Left: Title + Report Type Navigation -->
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-3">
        <Icon
          icon="icon-[mdi--chart-box-outline]"
          class="size-5"
        />
        <h1 class="text-base font-semibold">统计</h1>
      </div>

      <!-- Report Type Navigation -->
      <div class="flex items-center gap-1">
        <RouterLink
          v-for="item in reportNavItems"
          :key="item.type"
          v-slot="{ navigate }"
          :to="{ name: item.routeName }"
          custom
        >
          <Button
            variant="ghost"
            size="sm"
            :class="{ 'bg-accent': isRouteActive(item.routeName) }"
            @click="navigate"
          >
            {{ item.label }}
          </Button>
        </RouterLink>
      </div>
    </div>

    <!-- Right: Period Navigator + Media Selector -->
    <div class="flex items-center gap-3">
      <!-- Period Navigator (hidden for overview) -->
      <div
        v-if="showPeriodNav"
        class="flex items-center gap-1"
      >
        <Button
          variant="ghost"
          size="icon-sm"
          @click="navigatePeriod('prev')"
        >
          <Icon
            icon="icon-[mdi--chevron-left]"
            class="size-4"
          />
        </Button>
        <span class="min-w-32 text-center text-sm font-medium">
          {{ periodDisplay.label }}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          :disabled="!canNavigateNext"
          @click="navigatePeriod('next')"
        >
          <Icon
            icon="icon-[mdi--chevron-right]"
            class="size-4"
          />
        </Button>
      </div>

      <!-- Media Type Selector -->
      <SegmentedControl v-model="mediaType">
        <SegmentedControlItem value="game">
          <div class="flex items-center gap-1.5">
            <Icon
              :icon="getEntityIcon('game')"
              class="size-4"
            />
            <span>游戏</span>
          </div>
        </SegmentedControlItem>
      </SegmentedControl>
    </div>
  </div>
</template>
