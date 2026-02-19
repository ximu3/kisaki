<!--
  Game Detail Activity Tab

  Activity tab showing game play history, statistics, and charts.
  Uses sessions data from useGame() context.
-->

<script setup lang="ts">
import { useGame } from '@renderer/composables/use-game'
import { useRenderState } from '@renderer/composables'
import { Spinner } from '@renderer/components/ui/spinner'
import { SectionHeader } from '@renderer/components/ui/section-header'
import GameDetailActivityEmpty from './activity-empty.vue'
import GameDetailActivityStats from './activity-stats.vue'
import GameDetailActivityHeatmap from './activity-heatmap.vue'
import GameDetailActivityTrend from './activity-trend.vue'
import GameDetailActivityDistribution from './activity-distribution.vue'

// Get sessions from game context
const { sessions, isLoading, error } = useGame()
const state = useRenderState(isLoading, error, sessions)
</script>

<template>
  <!-- Loading -->
  <div
    v-if="state === 'loading'"
    class="flex items-center justify-center py-12"
  >
    <Spinner class="size-8" />
  </div>

  <!-- Empty -->
  <GameDetailActivityEmpty v-else-if="sessions.length === 0" />

  <!-- Content -->
  <div
    v-else
    class="space-y-6"
  >
    <!-- Stats Summary -->
    <section>
      <SectionHeader title="统计概览" />
      <GameDetailActivityStats :sessions="sessions" />
    </section>

    <!-- Activity Heatmap -->
    <section>
      <SectionHeader title="活动热力图" />
      <div class="rounded-lg border bg-card p-4">
        <GameDetailActivityHeatmap :sessions="sessions" />
      </div>
    </section>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
      <!-- Time Trend -->
      <section class="flex h-full flex-col">
        <SectionHeader title="游玩趋势" />
        <div class="flex-1 rounded-lg border bg-card p-4">
          <GameDetailActivityTrend :sessions="sessions" />
        </div>
      </section>

      <!-- Daily Distribution -->
      <section class="flex h-full flex-col">
        <SectionHeader title="时段分布" />
        <div class="flex-1 rounded-lg border bg-card p-4">
          <GameDetailActivityDistribution :sessions="sessions" />
        </div>
      </section>
    </div>
  </div>
</template>
