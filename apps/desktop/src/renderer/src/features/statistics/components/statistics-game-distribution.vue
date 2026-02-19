<!--
  Statistics Game Distribution

  Pie chart showing play time distribution by game.
-->

<script setup lang="ts">
import { computed } from 'vue'
import { useStatistics } from '../composables'
import { PieChart } from '@renderer/components/ui/pie-chart'
import { formatDuration } from '@renderer/utils'
import type { GameSession, Game } from '@shared/db'

interface Props {
  /** Override sessions (for custom data source) */
  sessions?: GameSession[]
  /** Override games map (for custom data source) */
  games?: Map<string, Game>
}

const props = defineProps<Props>()

const context = useStatistics()

const effectiveSessions = computed(() => props.sessions ?? context.sessions.value)
const effectiveGames = computed(() => props.games ?? context.games.value)

const distributionData = computed(() => {
  const stats = new Map<string, { duration: number; count: number }>()

  for (const session of effectiveSessions.value) {
    const duration = session.endedAt.getTime() - session.startedAt.getTime()
    const current = stats.get(session.gameId) ?? { duration: 0, count: 0 }
    current.duration += duration
    current.count += 1
    stats.set(session.gameId, current)
  }

  return [...stats.entries()].map(([id, value]) => ({
    id,
    name: effectiveGames.value.get(id)?.name ?? 'Unknown',
    primaryValue: value.duration,
    secondaryValue: value.count
  }))
})

const hasData = computed(() =>
  distributionData.value.some((d) => d.primaryValue > 0 || d.secondaryValue > 0)
)
</script>

<template>
  <PieChart
    v-if="hasData"
    :data="distributionData"
    :format-primary-value="formatDuration"
    :format-secondary-value="(v: number) => `${v}次`"
    :metric-labels="{ primary: '时长', secondary: '次数' }"
    :height="200"
  />
  <div
    v-else
    class="flex items-center justify-center text-sm text-muted-foreground"
    :style="{ height: '200px' }"
  >
    暂无数据
  </div>
</template>
