<!--
  Game Detail Activity Distribution

  Shows play time distribution by hour of day, weekday, or day of month.
  Uses TimeDistributionChart UI component with sessions from game context.
-->

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GameSession } from '@shared/db'
import {
  aggregateByLocalDayOfMonth,
  aggregateByLocalHour,
  aggregateByLocalWeekdayMondayFirst
} from '@renderer/utils/statistics'
import { TimeDistributionChart, type DistributionType } from '@renderer/components/ui/time-distribution-chart'

interface Props {
  sessions: GameSession[]
}

const props = defineProps<Props>()

const distributionType = ref<DistributionType>('hourly')

// Weekday names starting from Monday
const weekdayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

// Aggregate play time based on distribution type
const chartData = computed(() => {
  switch (distributionType.value) {
    case 'hourly': {
      const values = aggregateByLocalHour(props.sessions)
      return values.map((value, hour) => ({ key: hour, label: `${hour}:00`, value }))
    }
    case 'weekday': {
      const values = aggregateByLocalWeekdayMondayFirst(props.sessions)
      return values.map((value, day) => ({ key: day, label: weekdayNames[day], value }))
    }
    case 'dayOfMonth': {
      const values = aggregateByLocalDayOfMonth(props.sessions)
      return values.map((value, i) => ({ key: i + 1, label: `${i + 1}日`, value }))
    }
    default: {
      const _exhaustive: never = distributionType.value
      return _exhaustive
    }
  }
})
</script>

<template>
  <TimeDistributionChart
    v-model:distribution-type="distributionType"
    :data="chartData"
    :format-value="(v: number) => `${v.toFixed(1)}h`"
    :distribution-labels="{ hourly: '小时', weekday: '星期', dayOfMonth: '日期' }"
    :height="200"
  />
</template>
