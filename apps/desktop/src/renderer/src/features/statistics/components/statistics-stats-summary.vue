<!--
  Statistics Stats Summary

  Statistics summary component that adapts to different report types.
  Shows unique metrics based on the report type.
-->

<script setup lang="ts">
import { computed } from 'vue'
import { useStatistics } from '../composables'
import type { ReportType } from '../types'
import { StatsGrid, type StatsGridItem } from '@renderer/components/ui/stats-grid'
import {
  countActiveDays,
  getMostActiveMonth,
  getMostActiveWeek,
  getMostActiveWeekdayMondayFirst,
  type GlobalStatisticsStats
} from '@renderer/utils/statistics'
import { parseLocalDateKey } from '@renderer/utils/datetime'
import { getEntityIcon } from '@renderer/utils'
import type { GameSession } from '@shared/db'

interface Props {
  /** Override report type (for custom layouts) */
  reportType?: ReportType
  /** Override sessions (for custom data source) */
  sessions?: GameSession[]
  /** Override stats (for custom data source) */
  stats?: GlobalStatisticsStats
  /** Total days in period (for X/N display) */
  totalDays?: number
}

const props = defineProps<Props>()

const context = useStatistics()

const effectiveReportType = computed(() => props.reportType ?? context.reportType.value)
const effectiveSessions = computed(() => props.sessions ?? context.sessions.value)
const effectiveStats = computed(() => props.stats ?? context.stats.value)

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟`
}

function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  const monthNames = [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月'
  ]
  return `${year}年${monthNames[parseInt(month) - 1]}`
}

function formatWeekdayMondayFirst(weekday: number): string {
  const names = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  return names[weekday] ?? '-'
}

function formatWeekRange(weekStartKey: string): string {
  const start = parseLocalDateKey(weekStartKey)
  if (!start) return weekStartKey
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return `${start.getMonth() + 1}/${start.getDate()}~${end.getMonth() + 1}/${end.getDate()}`
}

function startOfLocalWeekMonday(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const jsDay = d.getDay() // 0=Sun ... 6=Sat
  const diff = d.getDate() - jsDay + (jsDay === 0 ? -6 : 1)
  d.setDate(diff)
  return d
}

function countWeeksInLocalRange(start: Date, end: Date): number {
  const startWeek = startOfLocalWeekMonday(start)
  const endDay = new Date(end)
  endDay.setHours(0, 0, 0, 0)

  let count = 0
  const cursor = new Date(startWeek)
  while (cursor.getTime() <= endDay.getTime()) {
    count++
    cursor.setDate(cursor.getDate() + 7)
  }
  return count
}

const activeDays = computed(() => countActiveDays(effectiveSessions.value))

const mostActiveMonth = computed(() => getMostActiveMonth(effectiveSessions.value))

const mostActiveWeekday = computed(() => getMostActiveWeekdayMondayFirst(effectiveSessions.value))

const mostActiveWeek = computed(() => getMostActiveWeek(effectiveSessions.value))

const items = computed<StatsGridItem[]>(() => {
  const stats = effectiveStats.value
  const type = effectiveReportType.value

  // Base items common to all report types
  const baseItems: StatsGridItem[] = [
    {
      icon: 'icon-[mdi--timer-outline]',
      label: '总游玩时长',
      value: formatDuration(stats.totalDuration)
    },
    {
      icon: 'icon-[mdi--play-circle-outline]',
      label: '游玩次数',
      value: `${stats.totalSessions}次`
    },
    {
      icon: getEntityIcon('game'),
      label: '游玩数量',
      value: `${stats.uniqueGamesPlayed}款`
    },
    {
      icon: 'icon-[mdi--timer-sand-paused]',
      label: '平均时长',
      value: formatDuration(stats.averageSessionDuration)
    }
  ]

  // Report-specific items
  switch (type) {
    case 'weekly': {
      // Weekly: Active days X/7, average per day, most active weekday
      const totalDays = props.totalDays ?? 7
      const dailyAvg = totalDays > 0 ? stats.totalDuration / totalDays : 0

      return [
        ...baseItems,
        {
          icon: 'icon-[mdi--calendar-check-outline]',
          label: '活跃天数',
          value: `${activeDays.value}/${totalDays}天`
        },
        {
          icon: 'icon-[mdi--calendar-today-outline]',
          label: '日均时长',
          value: formatDuration(dailyAvg)
        },
        {
          icon: 'icon-[mdi--calendar-star-outline]',
          label: '最活跃日',
          value: mostActiveWeekday.value
            ? formatWeekdayMondayFirst(mostActiveWeekday.value.weekday)
            : '-'
        },
        {
          icon: 'icon-[mdi--starburst-outline]',
          label: '最常玩',
          value: stats.mostPlayedGame?.name ?? '-',
          truncate: true
        }
      ]
    }

    case 'monthly': {
      // Monthly: Active days X/N, average per week, most active week
      const totalDays =
        props.totalDays ??
        new Date(context.currentPeriod.value.year, context.currentPeriod.value.month!, 0).getDate()
      const weeksInMonth = countWeeksInLocalRange(
        context.dateRange.value.start,
        context.dateRange.value.end
      )
      const weeklyAvg = weeksInMonth > 0 ? stats.totalDuration / weeksInMonth : 0

      return [
        ...baseItems,
        {
          icon: 'icon-[mdi--calendar-check-outline]',
          label: '活跃天数',
          value: `${activeDays.value}/${totalDays}天`
        },
        {
          icon: 'icon-[mdi--calendar-week-outline]',
          label: '周均时长',
          value: formatDuration(weeklyAvg)
        },
        {
          icon: 'icon-[mdi--calendar-star-outline]',
          label: '最活跃周',
          value: mostActiveWeek.value ? formatWeekRange(mostActiveWeek.value.weekStart) : '-'
        },
        {
          icon: 'icon-[mdi--starburst-outline]',
          label: '最常玩',
          value: stats.mostPlayedGame?.name ?? '-',
          truncate: true
        }
      ]
    }

    case 'yearly': {
      // Yearly: Active days X/365, most active month, monthly average
      const daysInYear = context.currentPeriod.value.year % 4 === 0 ? 366 : 365
      const monthlyAvg = stats.totalDuration / 12

      return [
        ...baseItems,
        {
          icon: 'icon-[mdi--calendar-check-outline]',
          label: '活跃天数',
          value: `${activeDays.value}/${daysInYear}天`
        },
        {
          icon: 'icon-[mdi--calendar-star-outline]',
          label: '最活跃月份',
          value: mostActiveMonth.value ? formatMonth(mostActiveMonth.value.month) : '-'
        },
        {
          icon: 'icon-[mdi--calendar-week-begin-outline]',
          label: '月均时长',
          value: formatDuration(monthlyAvg)
        },
        {
          icon: 'icon-[mdi--starburst-outline]',
          label: '最常玩',
          value: stats.mostPlayedGame?.name ?? '-',
          truncate: true
        }
      ]
    }

    case 'overview':
    default: {
      // Overview: Full stats with streaks
      return [
        ...baseItems,
        {
          icon: 'icon-[mdi--trophy-variant-outline]',
          label: '最长单次',
          value: formatDuration(stats.longestSession)
        },
        {
          icon: 'icon-[mdi--lightbulb-variant-outline]',
          label: '当前连续',
          value: `${stats.currentStreak}天`
        },
        {
          icon: 'icon-[mdi--medal-outline]',
          label: '最长连续',
          value: `${stats.longestStreak}天`
        },
        {
          icon: 'icon-[mdi--starburst-outline]',
          label: '最常玩',
          value: stats.mostPlayedGame?.name ?? '-',
          truncate: true
        }
      ]
    }
  }
})
</script>

<template>
  <StatsGrid :items="items" />
</template>
