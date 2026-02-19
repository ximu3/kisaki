<!--
  Game Detail Activity Trend

  Time trend chart showing play time over time.
  Uses TrendChart UI component with sessions from game context.
-->

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GameSession } from '@shared/db'
import { aggregateByTime } from '@renderer/utils/statistics'
import { TrendChart, type TrendGranularity } from '@renderer/components/ui/trend-chart'

interface Props {
  sessions: GameSession[]
}

const props = defineProps<Props>()

const granularity = ref<TrendGranularity>('daily')

const range = computed(() => {
  if (props.sessions.length === 0) return null

  let start = props.sessions[0].startedAt
  let end = props.sessions[0].endedAt

  for (const session of props.sessions) {
    if (session.startedAt < start) start = session.startedAt
    if (session.endedAt > end) end = session.endedAt
  }

  return { start, end }
})

// Aggregate sessions using shared helper
const chartData = computed(() =>
  // TrendChart already handles weekly/monthly bucketing internally.
  // Keep the input data at daily granularity so partial-week/partial-month ranges still render correctly.
  aggregateByTime(props.sessions, 'daily').map((item) => ({
    date: item.date,
    value: item.totalDuration / 3600000 // Convert to hours
  }))
)
</script>

<template>
  <TrendChart
    v-if="range"
    v-model:granularity="granularity"
    :range="range"
    :data="chartData"
    :format-value="(v: number) => `${v.toFixed(1)}h`"
    :granularity-labels="{ daily: '日', weekly: '周', monthly: '月' }"
    :height="200"
  />
</template>
