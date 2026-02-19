<!--
  Statistics Overview Page

  Overview report showing past year data for time-based visualizations
  and all-time data for stats/distributions/rankings.
-->

<script setup lang="ts">
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
  StatisticsTagDistribution,
  StatisticsCollectionDistribution,
  StatisticsGameRanking,
  StatisticsTagRanking,
  StatisticsCollectionRanking
} from '../components'

const {
  sessions,
  allTimeSessions,
  allTimeStats,
  isLoading,
  error,
  timeBasedDateRange
} = useStatistics()

const state = useRenderState(isLoading, error, sessions)
</script>

<template>
  <!-- Loading -->
  <div v-if="state === 'loading'" class="flex items-center justify-center h-full">
    <Spinner class="size-8" />
  </div>

  <!-- Error -->
  <div v-else-if="state === 'error'" class="flex items-center justify-center h-full">
    <p class="text-destructive">加载数据时出错</p>
  </div>

  <!-- Success -->
  <template v-else-if="state === 'success'">
    <!-- Content -->
    <div class="space-y-6">
    <!-- Stats Summary (all-time data) -->
    <section>
      <SectionHeader title="统计概览" />
      <StatisticsStatsSummary :stats="allTimeStats" :sessions="allTimeSessions" />
    </section>

    <!-- Activity Heatmap (past year) -->
    <section>
      <SectionHeader title="活动热力图" />
      <div class="rounded-lg border bg-card p-4">
        <StatisticsActivityHeatmap :sessions="sessions" :date-range="timeBasedDateRange" />
      </div>
    </section>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 items-stretch">
      <!-- Time Trend (past year) -->
      <section class="flex h-full flex-col">
        <SectionHeader title="游玩趋势" />
        <div class="flex-1 rounded-lg border bg-card p-4">
          <StatisticsTimeTrend :sessions="sessions" :date-range="timeBasedDateRange" />
        </div>
      </section>

      <!-- Time Distribution (past year) -->
      <section class="flex h-full flex-col">
        <SectionHeader title="时段分布" />
        <div class="flex-1 rounded-lg border bg-card p-4">
          <StatisticsTimeDistribution :sessions="sessions" />
        </div>
      </section>
    </div>

    <!-- Distribution Pie Charts Grid (all-time data) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
      <!-- Game Distribution -->
      <section class="flex h-full flex-col">
        <SectionHeader title="游戏分布" />
        <div class="flex-1 rounded-lg border bg-card p-4">
          <StatisticsGameDistribution :sessions="allTimeSessions" />
        </div>
      </section>

      <!-- Tag Distribution -->
      <section class="flex h-full flex-col">
        <SectionHeader title="标签分布" />
        <div class="flex-1 rounded-lg border bg-card p-4">
          <StatisticsTagDistribution :sessions="allTimeSessions" />
        </div>
      </section>

      <!-- Collection Distribution -->
      <section class="flex h-full flex-col">
        <SectionHeader title="收藏分布" />
        <div class="flex-1 rounded-lg border bg-card p-4">
          <StatisticsCollectionDistribution :sessions="allTimeSessions" />
        </div>
      </section>
    </div>

    <!-- Rankings Grid (all-time data) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
      <!-- Game Ranking -->
      <section class="flex h-full flex-col">
        <SectionHeader title="游戏排行" />
        <div class="flex-1 rounded-lg border bg-card p-4">
          <StatisticsGameRanking :sessions="allTimeSessions" />
        </div>
      </section>

      <!-- Tag Ranking -->
      <section class="flex h-full flex-col">
        <SectionHeader title="标签排行" />
        <div class="flex-1 rounded-lg border bg-card p-4">
          <StatisticsTagRanking :sessions="allTimeSessions" />
        </div>
      </section>

      <!-- Collection Ranking -->
      <section class="flex h-full flex-col">
        <SectionHeader title="收藏排行" />
        <div class="flex-1 rounded-lg border bg-card p-4">
          <StatisticsCollectionRanking :sessions="allTimeSessions" />
        </div>
      </section>
    </div>
  </div>
  </template>
</template>
