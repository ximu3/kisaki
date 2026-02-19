<!--
  PieChart - Pie chart for distribution data

  Features:
  - Full pie chart (not donut)
  - Unified chart tooltip (shadcn-vue chart tooltip)
  - Internal metric selector (primary/secondary)
-->

<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { cn } from '@renderer/utils'
import { SegmentedControl, SegmentedControlItem } from '@renderer/components/ui/segmented-control'
import { Donut } from '@unovis/ts'
import { VisSingleContainer, VisDonut } from '@unovis/vue'
import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
  type ChartConfig
} from '@renderer/components/ui/chart'
import type { PieChartMetric, PieChartProps } from './types'

// =============================================================================
// Props & Model
// =============================================================================

const props = withDefaults(defineProps<PieChartProps>(), {
  height: 200,
  maxItems: 5,
  metricLabels: () => ({ primary: '主指标', secondary: '次指标' })
})

const metric = defineModel<PieChartMetric>('metric', {
  default: 'primary'
})

// =============================================================================
// Helpers
// =============================================================================

const SLICE_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)'
] as const

function getSliceColor(index: number): string {
  return SLICE_COLORS[index % SLICE_COLORS.length]
}

function formatPrimary(value: number): string {
  if (props.formatPrimaryValue) return props.formatPrimaryValue(value)
  return value.toString()
}

function formatSecondary(value: number): string {
  if (props.formatSecondaryValue) return props.formatSecondaryValue(value)
  return value.toString()
}

// =============================================================================
// Data
// =============================================================================

const sortedData = computed(() => {
  const sorted = [...props.data].sort((a, b) => {
    if (metric.value === 'primary') return b.primaryValue - a.primaryValue
    return b.secondaryValue - a.secondaryValue
  })
  return sorted.slice(0, props.maxItems)
})

interface PieChartDatum {
  id: string
  name: string
  value: number
  fill: string
  primaryText: string
  secondaryText: string
}

const chartData = computed<PieChartDatum[]>(() =>
  sortedData.value.map((item, index) => {
    const fill = getSliceColor(index)
    const primaryText = formatPrimary(item.primaryValue)
    const secondaryText = formatSecondary(item.secondaryValue)

    return {
      id: item.id,
      name: item.name,
      value: metric.value === 'primary' ? item.primaryValue : item.secondaryValue,
      fill,
      primaryText,
      secondaryText
    }
  })
)

const legendConfig = computed<ChartConfig>(() => {
  const cfg: ChartConfig = {}
  for (const d of chartData.value) {
    if (!(d.value > 0)) continue
    cfg[d.id] = { label: d.name, color: d.fill }
  }
  return cfg
})

const tooltipConfig = {
  primaryText: { label: props.metricLabels.primary },
  secondaryText: { label: props.metricLabels.secondary }
} satisfies ChartConfig

const tooltipTemplate = componentToString(tooltipConfig, ChartTooltipContent, { labelKey: 'name' })

// Tooltip container - appended to body to avoid clipping
const tooltipContainer = shallowRef<HTMLElement | null>(null)

onMounted(() => {
  tooltipContainer.value = document.body
})

const insight = computed(() => {
  const top = sortedData.value[0]
  if (!top) return ''

  let total = 0
  for (const item of sortedData.value) {
    total += metric.value === 'primary' ? item.primaryValue : item.secondaryValue
  }
  if (!Number.isFinite(total) || total <= 0) return ''

  const topValue = metric.value === 'primary' ? top.primaryValue : top.secondaryValue
  if (!Number.isFinite(topValue) || topValue <= 0) return ''

  const pct = (topValue / total) * 100
  const formatted =
    metric.value === 'primary'
      ? formatPrimary(top.primaryValue)
      : formatSecondary(top.secondaryValue)
  return `最大占比：${top.name}，${pct.toFixed(1)}%，${formatted}`
})

// Accessors
const value = (d: PieChartDatum) => d.value
const color = (d: PieChartDatum) => d.fill
</script>

<template>
  <div
    :class="cn('space-y-2', props.class)"
    data-slot="pie-chart"
  >
    <div class="flex items-center gap-2 h-7">
      <div
        v-if="insight"
        class="text-xs text-muted-foreground truncate"
        data-slot="chart-insight"
      >
        {{ insight }}
      </div>
      <div class="ml-auto">
        <SegmentedControl v-model="metric">
          <SegmentedControlItem value="primary">
            {{ props.metricLabels.primary }}
          </SegmentedControlItem>
          <SegmentedControlItem value="secondary">
            {{ props.metricLabels.secondary }}
          </SegmentedControlItem>
        </SegmentedControl>
      </div>
    </div>

    <ChartContainer
      :config="legendConfig"
      class="aspect-auto h-auto"
    >
      <div :style="{ height: `${props.height}px` }">
        <VisSingleContainer
          v-if="chartData.length > 0"
          :data="chartData"
          :duration="0"
        >
          <VisDonut
            :value="value"
            :color="color"
            :arc-width="100"
            :pad-angle="0.02"
          />
          <ChartTooltip
            :container="tooltipContainer!"
            class-name="chart-tooltip-portal"
            :triggers="{
              [Donut.selectors.segment]: tooltipTemplate!
            }"
          />
        </VisSingleContainer>
      </div>

      <ChartLegendContent
        v-if="chartData.length > 0"
        class="flex-wrap justify-start"
      />
    </ChartContainer>
  </div>
</template>
