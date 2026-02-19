<!--
  Statistics Tag Distribution

  Pie chart showing play time distribution by tag.
-->

<script setup lang="ts">
import { computed } from 'vue'
import { useStatistics } from '../composables'
import { PieChart } from '@renderer/components/ui/pie-chart'
import { formatDuration } from '@renderer/utils'
import type { GameSession, Tag } from '@shared/db'

interface Props {
  /** Override sessions (for custom data source) */
  sessions?: GameSession[]
  /** Override tags map (for custom data source) */
  tags?: Map<string, Tag>
  /** Override game-tag links (for custom data source) */
  gameTagLinks?: { gameId: string; tagId: string }[]
}

const props = defineProps<Props>()

const context = useStatistics()

const effectiveSessions = computed(() => props.sessions ?? context.sessions.value)
const effectiveTags = computed(() => props.tags ?? context.tags.value)
const effectiveGameTagLinks = computed(() => props.gameTagLinks ?? context.gameTagLinks.value)

const distributionData = computed(() => {
  const gameTagsMap = new Map<string, string[]>()
  for (const link of effectiveGameTagLinks.value) {
    const existing = gameTagsMap.get(link.gameId) ?? []
    existing.push(link.tagId)
    gameTagsMap.set(link.gameId, existing)
  }

  const stats = new Map<string, { duration: number; count: number }>()

  for (const session of effectiveSessions.value) {
    const duration = session.endedAt.getTime() - session.startedAt.getTime()
    const tagIds = gameTagsMap.get(session.gameId) ?? []

    for (const tagId of tagIds) {
      const current = stats.get(tagId) ?? { duration: 0, count: 0 }
      current.duration += duration
      current.count += 1
      stats.set(tagId, current)
    }
  }

  return [...stats.entries()].map(([id, value]) => ({
    id,
    name: effectiveTags.value.get(id)?.name ?? 'Unknown',
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
