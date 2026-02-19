<!--
  Statistics Yearly Page

  Yearly report showing full visualizations for a specific year.
  Features: Stats with X/365 active days, most active month, monthly average,
  full year heatmap, monthly trend, all distributions and rankings.
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
      <!-- Stats Summary (with X/365 active days, most active month, monthly avg) -->
      <section>
        <SectionHeader title="年度概览" />
        <StatisticsStatsSummary report-type="yearly" />
      </section>

      <!-- Activity Heatmap (full year) -->
      <section>
        <SectionHeader title="活动热力图" />
        <div class="rounded-lg border bg-card p-4">
          <StatisticsActivityHeatmap />
        </div>
      </section>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 items-stretch">
        <!-- Monthly Trend -->
        <section class="flex h-full flex-col">
          <SectionHeader title="游玩趋势" />
          <div class="flex-1 rounded-lg border bg-card p-4">
            <StatisticsTimeTrend />
          </div>
        </section>

        <!-- Time Distribution (all options) -->
        <section class="flex h-full flex-col">
          <SectionHeader title="时段分布" />
          <div class="flex-1 rounded-lg border bg-card p-4">
            <StatisticsTimeDistribution />
          </div>
        </section>
      </div>

      <!-- Distribution Pie Charts Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <!-- Game Distribution -->
        <section class="flex h-full flex-col">
          <SectionHeader title="游戏分布" />
          <div class="flex-1 rounded-lg border bg-card p-4">
            <StatisticsGameDistribution />
          </div>
        </section>

        <!-- Tag Distribution -->
        <section class="flex h-full flex-col">
          <SectionHeader title="标签分布" />
          <div class="flex-1 rounded-lg border bg-card p-4">
            <StatisticsTagDistribution />
          </div>
        </section>

        <!-- Collection Distribution -->
        <section class="flex h-full flex-col">
          <SectionHeader title="收藏分布" />
          <div class="flex-1 rounded-lg border bg-card p-4">
            <StatisticsCollectionDistribution />
          </div>
        </section>
      </div>

      <!-- Rankings Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <!-- Game Ranking -->
        <section class="flex h-full flex-col">
          <SectionHeader title="游戏排行" />
          <div class="flex-1 rounded-lg border bg-card p-4">
            <StatisticsGameRanking />
          </div>
        </section>

        <!-- Tag Ranking -->
        <section class="flex h-full flex-col">
          <SectionHeader title="标签排行" />
          <div class="flex-1 rounded-lg border bg-card p-4">
            <StatisticsTagRanking />
          </div>
        </section>

        <!-- Collection Ranking -->
        <section class="flex h-full flex-col">
          <SectionHeader title="收藏排行" />
          <div class="flex-1 rounded-lg border bg-card p-4">
            <StatisticsCollectionRanking />
          </div>
        </section>
      </div>
    </div>
  </template>
</template>
