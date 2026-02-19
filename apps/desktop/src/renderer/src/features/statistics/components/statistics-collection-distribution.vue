<!--
  Statistics Collection Distribution

  Pie chart showing play time distribution by collection.
-->

<script setup lang="ts">
import { computed } from 'vue'
import { useStatistics } from '../composables'
import { PieChart } from '@renderer/components/ui/pie-chart'
import { formatDuration } from '@renderer/utils'
import type { GameSession, Collection } from '@shared/db'

interface Props {
  /** Override sessions (for custom data source) */
  sessions?: GameSession[]
  /** Override collections map (for custom data source) */
  collections?: Map<string, Collection>
  /** Override game-collection links (for custom data source) */
  gameCollectionLinks?: { gameId: string; collectionId: string }[]
}

const props = defineProps<Props>()

const context = useStatistics()

const effectiveSessions = computed(() => props.sessions ?? context.sessions.value)
const effectiveCollections = computed(() => props.collections ?? context.collections.value)
const effectiveGameCollectionLinks = computed(
  () => props.gameCollectionLinks ?? context.gameCollectionLinks.value
)

const distributionData = computed(() => {
  const gameCollectionsMap = new Map<string, string[]>()
  for (const link of effectiveGameCollectionLinks.value) {
    const existing = gameCollectionsMap.get(link.gameId) ?? []
    existing.push(link.collectionId)
    gameCollectionsMap.set(link.gameId, existing)
  }

  const stats = new Map<string, { duration: number; count: number }>()

  for (const session of effectiveSessions.value) {
    const duration = session.endedAt.getTime() - session.startedAt.getTime()
    const collectionIds = gameCollectionsMap.get(session.gameId) ?? []

    for (const collectionId of collectionIds) {
      const current = stats.get(collectionId) ?? { duration: 0, count: 0 }
      current.duration += duration
      current.count += 1
      stats.set(collectionId, current)
    }
  }

  return [...stats.entries()].map(([id, value]) => ({
    id,
    name: effectiveCollections.value.get(id)?.name ?? 'Unknown',
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
