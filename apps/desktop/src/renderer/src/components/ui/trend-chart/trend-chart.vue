<!--
  TrendChart - Time series line/area chart with granularity selector

  Features:
  - Line chart with area fill
  - Internal granularity selector (daily/weekly/monthly)
  - Tooltip support (shadcn-vue chart tooltip)
-->

<script setup lang="ts">
import { computed, onMounted, onUnmounted, shallowRef } from 'vue'
import {
  cn,
  toLocalDateKey,
  toLocalWeekKey,
  toLocalMonthKey,
  parseLocalDateKey
} from '@renderer/utils'
import { SegmentedControl, SegmentedControlItem } from '@renderer/components/ui/segmented-control'
import { Tooltip } from '@unovis/ts'
import { VisXYContainer, VisLine, VisAxis, VisArea } from '@unovis/vue'
import {
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
  type ChartConfig
} from '@renderer/components/ui/chart'
import type { TrendChartProps, TrendGranularity } from './types'

// =============================================================================
// Props & Model
// =============================================================================

const props = withDefaults(defineProps<TrendChartProps>(), {
  height: 200,
  granularityLabels: () => ({ daily: '日', weekly: '周', monthly: '月' }),
  availableGranularities: () => ['daily', 'weekly', 'monthly']
})

const granularity = defineModel<TrendGranularity>('granularity', {
  default: 'daily'
})

// Show selector only when multiple options available
const showGranularitySelector = computed(() => props.availableGranularities.length > 1)

// =============================================================================
// Chart Config (shadcn-vue)
// =============================================================================

const chartConfig = {
  valueText: {
    label: '时长',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig

// =============================================================================
// Range & Data Normalization (range-driven, like Heatmap)
// =============================================================================

interface TrendChartSeriesPoint {
  date: Date
  dateKey: string
  value: number
  valueText: string
  label: string
}

const range = computed(() => {
  const start = new Date(props.range.start)
  const end = new Date(props.range.end)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  if (end < start) return null

  return { start, end }
})

function parseInputDate(input: string): Date | null {
  const parsed = parseLocalDateKey(input)
  if (parsed) return parsed
  const date = new Date(input)
  return Number.isNaN(date.getTime()) ? null : date
}

const valueMap = computed(() => {
  const map = new Map<string, number>()
  for (const point of props.data) {
    const date = parseInputDate(point.date)
    if (!date) continue

    if (range.value) {
      const day = new Date(date)
      day.setHours(0, 0, 0, 0)
      if (day < range.value.start || day > range.value.end) continue
    }

    let key: string
    switch (granularity.value) {
      case 'weekly':
        key = toLocalWeekKey(date)
        break
      case 'monthly':
        key = toLocalMonthKey(date)
        break
      default:
        key = toLocalDateKey(date)
    }

    map.set(key, (map.get(key) ?? 0) + point.value)
  }
  return map
})

function formatYLabel(v: number): string {
  if (props.formatValue) return props.formatValue(v)
  return v.toFixed(1)
}

function formatTooltipLabel(date: Date): string {
  if (granularity.value === 'weekly') {
    const weekEnd = new Date(date)
    weekEnd.setDate(weekEnd.getDate() + 6)
    return `${date.toLocaleDateString('zh-Hans', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('zh-Hans', { month: 'short', day: 'numeric' })}`
  }
  if (granularity.value === 'monthly') {
    return date.toLocaleDateString('zh-Hans', { year: 'numeric', month: 'long' })
  }
  return date.toLocaleDateString('zh-Hans', { year: 'numeric', month: 'short', day: 'numeric' })
}

const series = computed<TrendChartSeriesPoint[]>(() => {
  if (!range.value) return []
  const rangeStart = range.value.start
  const rangeEnd = range.value.end

  const points: Array<Omit<TrendChartSeriesPoint, 'valueText' | 'label'>> = []

  if (granularity.value === 'daily') {
    const current = new Date(rangeStart)
    current.setHours(0, 0, 0, 0)
    const end = new Date(rangeEnd)
    end.setHours(0, 0, 0, 0)

    while (current <= end) {
      const dateKey = toLocalDateKey(current)
      points.push({
        date: new Date(current),
        dateKey,
        value: valueMap.value.get(dateKey) ?? 0
      })
      current.setDate(current.getDate() + 1)
    }
  } else if (granularity.value === 'weekly') {
    const current = new Date(rangeStart)
    current.setHours(0, 0, 0, 0)
    current.setDate(current.getDate() - ((current.getDay() + 6) % 7))

    const end = new Date(rangeEnd)
    end.setHours(0, 0, 0, 0)

    while (current <= end) {
      const weekKey = toLocalWeekKey(current)
      points.push({
        date: new Date(current),
        dateKey: weekKey,
        value: valueMap.value.get(weekKey) ?? 0
      })
      current.setDate(current.getDate() + 7)
    }
  } else {
    const current = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1)
    const end = new Date(rangeEnd)
    end.setHours(0, 0, 0, 0)

    while (current <= end) {
      const monthKey = toLocalMonthKey(current)
      points.push({
        date: new Date(current),
        dateKey: monthKey,
        value: valueMap.value.get(monthKey) ?? 0
      })
      current.setMonth(current.getMonth() + 1)
    }
  }

  return points.map((p) => ({
    ...p,
    valueText: formatYLabel(p.value),
    label: formatTooltipLabel(p.date)
  }))
})

const canRender = computed(() => range.value !== null && series.value.length > 0)

// Accessors
const x = (_d: TrendChartSeriesPoint, i: number) => i
const y = (d: TrendChartSeriesPoint) => d.value

const numTicks = computed(() => Math.min(series.value.length, 10))

function formatXLabel(i: number): string {
  const idx = Math.round(i)
  const item = series.value[idx]
  if (!item) return ''

  if (props.formatDate) return props.formatDate(item.dateKey, granularity.value)

  switch (granularity.value) {
    case 'daily':
      return `${item.date.getMonth() + 1}/${item.date.getDate()}`
    case 'weekly':
      return `${item.date.getMonth() + 1}/${item.date.getDate()}`
    case 'monthly':
      return `${item.date.getFullYear()}/${item.date.getMonth() + 1}`
  }
}

const tooltipTemplate = componentToString(chartConfig, ChartTooltipContent, { labelKey: 'label' })

// Tooltip instance for crosshair - appended to body to avoid clipping
const crosshairTooltip = shallowRef<Tooltip | null>(null)
const tooltipContainer = shallowRef<HTMLElement | null>(null)

onMounted(() => {
  tooltipContainer.value = document.body
  crosshairTooltip.value = new Tooltip({
    container: document.body,
    className: 'chart-tooltip-portal'
  })
})

onUnmounted(() => {
  crosshairTooltip.value?.destroy()
  crosshairTooltip.value = null
})

const insight = computed(() => {
  if (!canRender.value) return ''
  let best: TrendChartSeriesPoint | null = null
  for (const point of series.value) {
    if (point.value <= 0) continue
    if (!best || point.value > best.value) best = point
  }
  if (!best) return '峰值：无活动'
  return `峰值：${best.label}，${best.valueText}`
})
</script>

<template>
  <div
    :class="cn('space-y-2', props.class)"
    data-slot="trend-chart"
  >
    <div class="flex items-center gap-2 h-7">
      <div
        v-if="insight"
        class="text-xs text-muted-foreground truncate"
        data-slot="chart-insight"
      >
        {{ insight }}
      </div>
      <div
        v-if="showGranularitySelector"
        class="ml-auto"
      >
        <SegmentedControl v-model="granularity">
          <SegmentedControlItem
            v-for="g in props.availableGranularities"
            :key="g"
            :value="g"
          >
            {{ props.granularityLabels[g] }}
          </SegmentedControlItem>
        </SegmentedControl>
      </div>
    </div>

    <div
      v-if="canRender"
      :style="{ height: `${props.height}px` }"
    >
      <ChartContainer :config="chartConfig">
        <VisXYContainer
          :data="series"
          :duration="0"
          :clip-path-extend="6"
        >
          <VisArea
            :x="x"
            :y="y"
            color="var(--chart-1)"
            :opacity="0.2"
          />
          <VisLine
            :x="x"
            :y="y"
            color="var(--chart-1)"
          />
          <VisAxis
            type="x"
            :tick-format="formatXLabel"
            :num-ticks="numTicks"
          />
          <VisAxis
            type="y"
            :tick-format="(v: number) => formatYLabel(v)"
          />
          <ChartTooltip
            :container="tooltipContainer!"
            class-name="chart-tooltip-portal"
          />
          <ChartCrosshair
            :x="x"
            :y="y"
            :duration="0"
            :template="tooltipTemplate"
            :color="['var(--chart-1)']"
            :hide-when-far-from-pointer="false"
            :tooltip="crosshairTooltip!"
          />
        </VisXYContainer>
      </ChartContainer>
    </div>
  </div>
</template>
