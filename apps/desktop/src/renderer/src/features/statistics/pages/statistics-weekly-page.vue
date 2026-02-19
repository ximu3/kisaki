<!--
  Statistics Weekly Page

  Weekly report showing simplified visualizations for a specific week.
  Features: Stats with X/7 active days, daily breakdown, hourly distribution,
  game distribution and ranking.
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
  StatisticsGameRanking
} from '../components'

const { sessions, isLoading, error } = useStatistics()

const state = useRenderState(isLoading, error, sessions)
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
      <!-- Stats Summary (with X/7 active days) -->
      <section>
        <SectionHeader title="本周概览" />
        <StatisticsStatsSummary
          report-type="weekly"
          :total-days="7"
        />
      </section>

      <!-- Activity Heatmap (7 days) -->
      <section>
        <SectionHeader title="活动热力图" />
        <div class="rounded-lg border bg-card p-4">
          <StatisticsActivityHeatmap :available-granularities="['day']" />
        </div>
      </section>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 items-stretch">
        <!-- Daily Breakdown (trend chart with daily only) -->
        <section class="flex h-full flex-col">
          <SectionHeader title="游玩趋势" />
          <div class="flex-1 rounded-lg border bg-card p-4">
            <StatisticsTimeTrend :available-granularities="['daily']" />
          </div>
        </section>

        <!-- Hourly Distribution -->
        <section class="flex h-full flex-col">
          <SectionHeader title="时段分布" />
          <div class="flex-1 rounded-lg border bg-card p-4">
            <StatisticsTimeDistribution :available-types="['hourly']" />
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
