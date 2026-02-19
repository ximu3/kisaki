<!--
  Statistics Monthly Page

  Monthly report showing visualizations for a specific month.
  Features: Stats with X/N active days, calendar heatmap, weekly trend,
  hourly/weekday distribution, game distribution and ranking.
-->

<script setup lang="ts">
import { computed } from 'vue'
import { useStatistics } from '../composables'
import { useRenderState } from '@renderer/composables'
import { Spinner } from '@renderer/components/ui/spinner'
import { SectionHeader } from '@renderer/components/ui/section-header'
import {
  StatisticsStatsSummary,
  StatisticsActivityHeatmap,
  StatisticsTimeTrend,
  StatisticsTimeDistribution,
  StatisticsGameDistribution,
  StatisticsGameRanking
} from '../components'

const { sessions, currentPeriod, isLoading, error } = useStatistics()

const state = useRenderState(isLoading, error, sessions)

// Calculate days in the current month
const daysInMonth = computed(() => {
  return new Date(currentPeriod.value.year, currentPeriod.value.month!, 0).getDate()
})
</script>

<template>
  <!-- Loading -->
  <div
    v-if="state === 'loading'"
    class="flex items-center justify-center h-full"
  >
    <Spinner class="size-8" />
  </div>

  <!-- Error -->
  <div
    v-else-if="state === 'error'"
    class="flex items-center justify-center h-full"
  >
    <p class="text-destructive">加载数据时出错</p>
  </div>

  <!-- Success -->
  <template v-else-if="state === 'success'">
    <!-- Content -->
    <div class="space-y-6">
      <!-- Stats Summary (with X/N active days) -->
      <section>
        <SectionHeader title="本月概览" />
        <StatisticsStatsSummary
          report-type="monthly"
          :total-days="daysInMonth"
        />
      </section>

      <!-- Activity Heatmap (month calendar) -->
      <section>
        <SectionHeader title="活动热力图" />
        <div class="rounded-lg border bg-card p-4">
          <StatisticsActivityHeatmap :available-granularities="['day', 'week']" />
        </div>
      </section>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 items-stretch">
        <!-- Weekly Trend -->
        <section class="flex h-full flex-col">
          <SectionHeader title="游玩趋势" />
          <div class="flex-1 rounded-lg border bg-card p-4">
            <StatisticsTimeTrend :available-granularities="['daily', 'weekly']" />
          </div>
        </section>

        <!-- Time Distribution (hourly, weekday) -->
        <section class="flex h-full flex-col">
          <SectionHeader title="时段分布" />
          <div class="flex-1 rounded-lg border bg-card p-4">
            <StatisticsTimeDistribution :available-types="['hourly', 'weekday']" />
          </div>
        </section>
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 items-stretch">
        <!-- Game Distribution -->
        <section class="flex h-full flex-col">
          <SectionHeader title="游戏分布" />
          <div class="flex-1 rounded-lg border bg-card p-4">
            <StatisticsGameDistribution />
          </div>
        </section>

        <!-- Game Ranking -->
        <section class="flex h-full flex-col">
          <SectionHeader title="游戏排行" />
          <div class="flex-1 rounded-lg border bg-card p-4">
            <StatisticsGameRanking />
          </div>
        </section>
      </div>
    </div>
  </template>
</template>
