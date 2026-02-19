<!--
  Game Detail Activity Heatmap

  Activity heatmap showing play frequency over time.
  Uses the generic Heatmap component.
-->

<script setup lang="ts">
import { computed } from 'vue'
import type { GameSession } from '@shared/db'
import { Heatmap, type HeatmapDataPoint } from '@renderer/components/ui/heatmap'

interface Props {
  sessions: GameSession[]
}

const props = defineProps<Props>()

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

// Transform sessions to heatmap data points
const heatmapData = computed<HeatmapDataPoint[]>(() => {
  return props.sessions.map((session) => ({
    date: session.startedAt,
    value: session.endedAt.getTime() - session.startedAt.getTime()
  }))
})
</script>

<template>
  <Heatmap
    v-if="range"
    :range="range"
    :data="heatmapData"
    :legend-labels="{ less: '少', more: '多' }"
  />
</template>
