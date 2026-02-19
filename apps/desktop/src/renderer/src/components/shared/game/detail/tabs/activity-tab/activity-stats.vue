<!--
  Game Detail Activity Stats

  Statistics summary for a single game's play history.
-->

<script setup lang="ts">
import { computed } from 'vue'
import type { GameSession } from '@shared/db'
import { StatsGrid, type StatsGridItem } from '@renderer/components/ui/stats-grid'
import { computeStreaks } from '@renderer/utils/statistics'

interface Props {
  sessions: GameSession[]
}

const props = defineProps<Props>()

const stats = computed(() => {
  const sessions = props.sessions
  if (sessions.length === 0) {
    return {
      totalDuration: 0,
      totalSessions: 0,
      averageSessionDuration: 0,
      longestSession: 0,
      currentStreak: 0,
      longestStreak: 0,
      firstSessionDate: null as Date | null,
      lastSessionDate: null as Date | null
    }
  }

  let totalDuration = 0
  let longestSession = 0
  let firstSessionDate: Date | null = null
  let lastSessionDate: Date | null = null

  for (const s of sessions) {
    const d = s.endedAt.getTime() - s.startedAt.getTime()
    totalDuration += d
    if (d > longestSession) longestSession = d

    if (!firstSessionDate || s.startedAt < firstSessionDate) firstSessionDate = s.startedAt
    if (!lastSessionDate || s.endedAt > lastSessionDate) lastSessionDate = s.endedAt
  }

  const totalSessions = sessions.length
  const averageSessionDuration = totalDuration / totalSessions
  const { currentStreak, longestStreak } = computeStreaks(sessions)

  return {
    totalDuration,
    totalSessions,
    averageSessionDuration,
    longestSession,
    currentStreak,
    longestStreak,
    firstSessionDate,
    lastSessionDate
  }
})

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟`
}

function formatDate(date: Date | null): string {
  if (!date) return '-'
  return date.toLocaleDateString('zh-Hans', { year: 'numeric', month: 'short', day: 'numeric' })
}

const items = computed<StatsGridItem[]>(() => [
  {
    icon: 'icon-[mdi--timer-outline]',
    label: '游玩时长',
    value: formatDuration(stats.value.totalDuration)
  },
  {
    icon: 'icon-[mdi--play-circle-outline]',
    label: '游玩次数',
    value: `${stats.value.totalSessions}次`
  },
  {
    icon: 'icon-[mdi--timer-sand-paused]',
    label: '平均时长',
    value: formatDuration(stats.value.averageSessionDuration)
  },
  {
    icon: 'icon-[mdi--trophy-variant-outline]',
    label: '最长单次',
    value: formatDuration(stats.value.longestSession)
  },
  {
    icon: 'icon-[mdi--lightbulb-variant-outline]',
    label: '当前连续',
    value: `${stats.value.currentStreak}天`
  },
  {
    icon: 'icon-[mdi--medal-outline]',
    label: '最长连续',
    value: `${stats.value.longestStreak}天`
  },
  {
    icon: 'icon-[mdi--calendar-start-outline]',
    label: '首次游玩',
    value: formatDate(stats.value.firstSessionDate)
  },
  {
    icon: 'icon-[mdi--calendar-end-outline]',
    label: '最近游玩',
    value: formatDate(stats.value.lastSessionDate)
  }
])
</script>

<template>
  <StatsGrid :items="items" />
</template>
