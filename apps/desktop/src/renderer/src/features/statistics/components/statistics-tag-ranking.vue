<!--
  Statistics Tag Ranking

  Tag ranking by play time or session count.
  Uses local state for sort preference (resets on page reload).
-->

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStatistics } from '../composables'
import { computeTagRanking, type RankingSort } from '@renderer/utils/statistics'
import { RankingBarChart } from '@renderer/components/ui/ranking-bar-chart'
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

// Local sort state (not persisted)
const sort = ref<RankingSort>('time')

const metric = computed({
  get: () => (sort.value === 'time' ? 'primary' : 'secondary'),
  set: (m: 'primary' | 'secondary') => {
    sort.value = m === 'primary' ? 'time' : 'count'
  }
})

const rankingData = computed(() =>
  computeTagRanking(
    effectiveSessions.value,
    effectiveGameTagLinks.value,
    effectiveTags.value,
    sort.value
  ).map((item) => ({
    id: item.id,
    name: item.name,
    primaryValue: item.totalDuration,
    secondaryValue: item.sessionCount
  }))
)

const hasData = computed(() =>
  rankingData.value.some((d) => d.primaryValue > 0 || d.secondaryValue > 0)
)
</script>

<template>
  <RankingBarChart
    v-if="hasData"
    v-model:metric="metric"
    :data="rankingData"
    :max-items="5"
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
