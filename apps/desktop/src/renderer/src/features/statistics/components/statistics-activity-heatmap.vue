<!--
  Statistics Activity Heatmap

  Activity heatmap showing play frequency over time.
  Uses the generic Heatmap UI component.
-->

<script setup lang="ts">
import {
  Heatmap,
  type HeatmapGranularity,
  type HeatmapLayoutByGranularity
} from '@renderer/components/ui/heatmap'
import type { GameSession } from '@shared/db'
import { computed } from 'vue'
import { useStatistics } from '../composables'

interface Props {
  /** Override sessions (for custom data source) */
  sessions?: GameSession[]
  /** Override date range (for custom range) */
  dateRange?: { start: Date; end: Date }
  /** Available heatmap granularities */
  availableGranularities?: HeatmapGranularity[]
}

const props = withDefaults(defineProps<Props>(), {
  availableGranularities: () => ['day', 'week', 'month']
})

const context = useStatistics()

const effectiveSessions = computed(() => props.sessions ?? context.sessions.value)
const effectiveDateRange = computed(() => props.dateRange ?? context.dateRange.value)
const layoutByGranularity = computed<HeatmapLayoutByGranularity | undefined>(() => {
  const reportType = context.reportType.value
  if (reportType === 'overview' || reportType === 'yearly') {
    return { day: 'weekColumns' }
  }
  return undefined
})

const heatmapData = computed(() => {
  return effectiveSessions.value.map((s) => ({
    date: s.startedAt,
    value: s.endedAt.getTime() - s.startedAt.getTime()
  }))
})
</script>

<template>
  <Heatmap
    :range="effectiveDateRange"
    :data="heatmapData"
    :available-granularities="props.availableGranularities"
    :layout-by-granularity="layoutByGranularity"
    :legend-labels="{ less: '少', more: '多' }"
  />
</template>
