<!--
  Statistics Time Distribution

  Shows play time distribution by hour of day, weekday, or day of month.
  Adapts available options based on report type.
-->

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStatistics } from '../composables'
import { TimeDistributionChart, type DistributionType } from '@renderer/components/ui/time-distribution-chart'
import {
  aggregateByLocalDayOfMonth,
  aggregateByLocalHour,
  aggregateByLocalWeekdayMondayFirst
} from '@renderer/utils/statistics'
import type { GameSession } from '@shared/db'

interface Props {
  /** Override sessions (for custom data source) */
  sessions?: GameSession[]
  /** Available distribution types */
  availableTypes?: DistributionType[]
}

const props = withDefaults(defineProps<Props>(), {
  availableTypes: () => ['hourly', 'weekday', 'dayOfMonth']
})

const context = useStatistics()

const effectiveSessions = computed(() => props.sessions ?? context.sessions.value)

// Local distribution type state
const distributionType = ref<DistributionType>('hourly')

// Reset distribution type when available types change
watch(
  () => props.availableTypes,
  () => {
    distributionType.value = 'hourly'
  }
)

// Distribution labels - always provide all three for the component
const distributionLabels = { hourly: '小时', weekday: '星期', dayOfMonth: '日期' }

// Weekday names starting from Monday
const weekdayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

// Aggregate play time based on distribution type
const chartData = computed(() => {
  switch (distributionType.value) {
    case 'hourly': {
      const values = aggregateByLocalHour(effectiveSessions.value)
      return values.map((value, hour) => ({ key: hour, label: `${hour}:00`, value }))
    }
    case 'weekday': {
      const values = aggregateByLocalWeekdayMondayFirst(effectiveSessions.value)
      return values.map((value, day) => ({ key: day, label: weekdayNames[day], value }))
    }
    case 'dayOfMonth': {
      const values = aggregateByLocalDayOfMonth(effectiveSessions.value)
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
    :available-types="props.availableTypes"
    :format-value="(v: number) => `${v.toFixed(1)}h`"
    :distribution-labels="distributionLabels"
    :height="200"
  />
</template>
