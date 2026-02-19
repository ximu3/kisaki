<!--
  Statistics Time Trend

  Time trend chart showing play time over time.
  Respects granularity constraints based on report type.
-->

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStatistics } from '../composables'
import { aggregateByTime, type TimeGranularity } from '@renderer/utils/statistics'
import { TrendChart } from '@renderer/components/ui/trend-chart'
import type { GameSession } from '@shared/db'

interface Props {
  /** Override sessions (for custom data source) */
  sessions?: GameSession[]
  /** Override date range (for custom range) */
  dateRange?: { start: Date; end: Date }
  /** Available granularities for the trend chart */
  availableGranularities?: TimeGranularity[]
  /** Default granularity */
  defaultGranularity?: TimeGranularity
}

const props = withDefaults(defineProps<Props>(), {
  availableGranularities: () => ['daily', 'weekly', 'monthly'],
  defaultGranularity: 'daily'
})

const context = useStatistics()

const effectiveSessions = computed(() => props.sessions ?? context.sessions.value)
const effectiveDateRange = computed(() => props.dateRange ?? context.dateRange.value)

// Local granularity state - initialized by watcher with immediate: true
const granularity = ref<TimeGranularity>('daily')

// Reset granularity when default changes (e.g., when navigating between report types)
watch(
  () => props.defaultGranularity,
  (newDefault) => {
    granularity.value = newDefault
  },
  { immediate: true }
)

// Granularity labels - always provide all three for the component
const granularityLabels = { daily: '日', weekly: '周', monthly: '月' }

const chartData = computed(() =>
  // TrendChart already handles weekly/monthly bucketing internally.
  // Keep the input data at daily granularity so partial-week/partial-month ranges still render correctly.
  aggregateByTime(effectiveSessions.value, 'daily').map((item) => ({
    date: item.date,
    value: item.totalDuration / 3600000
  }))
)
</script>

<template>
  <TrendChart
    v-model:granularity="granularity"
    :range="effectiveDateRange"
    :data="chartData"
    :available-granularities="props.availableGranularities"
    :format-value="(v: number) => `${v.toFixed(1)}h`"
    :granularity-labels="granularityLabels"
    :height="200"
  />
</template>
