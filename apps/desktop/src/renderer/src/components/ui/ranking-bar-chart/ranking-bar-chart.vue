<!--
  RankingBarChart - Horizontal ranking bar chart (primary/secondary metrics)

  Features:
  - Horizontal bar chart (Unovis StackedBar with horizontal orientation)
  - Unified chart tooltip (shadcn-vue chart tooltip)
  - Internal metric selector (primary/secondary)
-->

<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { cn } from '@renderer/utils'
import { SegmentedControl, SegmentedControlItem } from '@renderer/components/ui/segmented-control'
import { StackedBar } from '@unovis/ts'
import { VisXYContainer, VisStackedBar, VisAxis } from '@unovis/vue'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
  type ChartConfig
} from '@renderer/components/ui/chart'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import type { RankingBarChartProps, RankingMetric } from './types'

// =============================================================================
// Props & Model
// =============================================================================

const props = withDefaults(defineProps<RankingBarChartProps>(), {
  maxItems: 10,
  height: 300,
  metricLabels: () => ({ primary: '主指标', secondary: '次指标' })
})

const metric = defineModel<RankingMetric>('metric', {
  default: 'primary'
})

const dialogOpen = ref(false)

// =============================================================================
// Helpers
// =============================================================================

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

interface RankingChartDatum {
  index: number
  id: string
  name: string
  value: number
  fill: string
  primaryText: string
  secondaryText: string
}

/**
 * Generate gradient color based on ranking position.
 * Uses color-mix() to blend chart-1 with white for lower ranks.
 */
function getGradientColor(position: number, total: number): string {
  // Calculate interpolation factor (0 = top ranked, 1 = bottom ranked)
  const t = total > 1 ? position / (total - 1) : 0

  // Primary color percentage decreases for lower ranks (100% -> 75%)
  const primaryPercent = Math.round(100 - t * 25)

  return `color-mix(in oklch, var(--chart-1) ${primaryPercent}%, white)`
}

const chartData = computed<RankingChartDatum[]>(() => {
  const len = sortedData.value.length
  return sortedData.value.map((item, i) => {
    // Reverse index so highest value (first in sorted) appears at top
    const index = len - 1 - i
    // Generate gradient color based on ranking position
    const fill = getGradientColor(i, len)
    const primaryText = formatPrimary(item.primaryValue)
    const secondaryText = formatSecondary(item.secondaryValue)

    return {
      index,
      id: item.id,
      name: item.name,
      value: metric.value === 'primary' ? item.primaryValue : item.secondaryValue,
      fill,
      primaryText,
      secondaryText
    }
  })
})

const maxValue = computed(() => {
  if (!chartData.value.length) return 0
  return Math.max(...chartData.value.map((d) => d.value))
})

const tickValues = computed(() => chartData.value.map((d) => d.index))

// =============================================================================
// Full Chart Data (for dialog - shows all items without maxItems limit)
// =============================================================================

const fullSortedData = computed(() => {
  return [...props.data].sort((a, b) => {
    if (metric.value === 'primary') return b.primaryValue - a.primaryValue
    return b.secondaryValue - a.secondaryValue
  })
})

const fullChartData = computed<RankingChartDatum[]>(() => {
  const len = fullSortedData.value.length
  return fullSortedData.value.map((item, i) => {
    const index = len - 1 - i
    const fill = getGradientColor(i, len)
    const primaryText = formatPrimary(item.primaryValue)
    const secondaryText = formatSecondary(item.secondaryValue)

    return {
      index,
      id: item.id,
      name: item.name,
      value: metric.value === 'primary' ? item.primaryValue : item.secondaryValue,
      fill,
      primaryText,
      secondaryText
    }
  })
})

const fullMaxValue = computed(() => {
  if (!fullChartData.value.length) return 0
  return Math.max(...fullChartData.value.map((d) => d.value))
})

const fullTickValues = computed(() => fullChartData.value.map((d) => d.index))

const fullChartHeight = computed(() => Math.max(300, fullChartData.value.length * 28))

function formatFullNameTick(tick: number | Date): string {
  if (typeof tick !== 'number') return ''
  const i = Math.round(tick)
  return fullChartData.value.find((d) => d.index === i)?.name ?? ''
}

function formatNameTick(tick: number | Date): string {
  if (typeof tick !== 'number') return ''
  const i = Math.round(tick)
  return chartData.value.find((d) => d.index === i)?.name ?? ''
}

function formatValueTick(v: number | Date): string {
  if (typeof v !== 'number') return ''
  if (metric.value === 'primary') return formatPrimary(v)
  return formatSecondary(v)
}

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

// Accessors (StackedBar horizontal orientation uses `x` as the category coordinate)
const x = (d: RankingChartDatum) => d.index
const y = (d: RankingChartDatum) => d.value
const color = (d: RankingChartDatum) => d.fill
</script>

<template>
  <div
    :class="cn('space-y-2', props.class)"
    data-slot="ranking-bar-chart"
  >
    <div class="flex items-center gap-2 h-7">
      <Button
        variant="ghost"
        size="sm"
        class="text-muted-foreground"
        @click="dialogOpen = true"
      >
        查看更多
      </Button>
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

    <div :style="{ height: `${props.height}px` }">
      <ChartContainer :config="tooltipConfig">
        <VisXYContainer
          v-if="chartData.length > 0"
          :data="chartData"
          :x-domain="[0, maxValue > 0 ? maxValue * 1.05 : 1]"
          :y-domain="[-0.5, chartData.length - 0.5]"
          :duration="0"
        >
          <VisStackedBar
            :x="x"
            :y="[y]"
            :color="color"
            orientation="horizontal"
            :data-step="1"
            :bar-padding="0.25"
            :rounded-corners="2"
          />

          <VisAxis
            type="y"
            :tick-values="tickValues"
            :tick-format="formatNameTick"
            :grid-line="false"
            :tick-line="false"
            :domain-line="false"
            tick-text-fit-mode="trim"
            tick-text-trim-type="end"
            :tick-text-width="70"
            tick-text-align="end"
          />

          <VisAxis
            type="x"
            :tick-format="formatValueTick"
            grid-line
          />

          <ChartTooltip
            :container="tooltipContainer!"
            class-name="chart-tooltip-portal"
            :triggers="{
              [StackedBar.selectors.bar]: tooltipTemplate!
            }"
          />
        </VisXYContainer>
      </ChartContainer>
    </div>

    <!-- Full chart dialog -->
    <Dialog
      v-if="dialogOpen"
      v-model:open="dialogOpen"
    >
      <DialogContent class="max-w-7xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>排行榜</DialogTitle>
        </DialogHeader>
        <DialogBody class="flex-1 overflow-y-auto scrollbar-thin">
          <div :style="{ height: `${fullChartHeight}px` }">
            <ChartContainer :config="tooltipConfig">
              <VisXYContainer
                v-if="fullChartData.length > 0"
                :data="fullChartData"
                :x-domain="[0, fullMaxValue > 0 ? fullMaxValue * 1.05 : 1]"
                :y-domain="[-0.5, fullChartData.length - 0.5]"
                :duration="0"
              >
                <VisStackedBar
                  :x="x"
                  :y="[y]"
                  :color="color"
                  orientation="horizontal"
                  :data-step="1"
                  :bar-padding="0.3"
                  :rounded-corners="2"
                />

                <VisAxis
                  type="y"
                  :tick-values="fullTickValues"
                  :tick-format="formatFullNameTick"
                  :grid-line="false"
                  :tick-line="false"
                  :domain-line="false"
                  tick-text-fit-mode="trim"
                  tick-text-trim-type="end"
                  :tick-text-width="170"
                  tick-text-align="end"
                />

                <VisAxis
                  type="x"
                  :tick-format="formatValueTick"
                  grid-line
                />

                <ChartTooltip
                  :container="tooltipContainer!"
                  class-name="chart-tooltip-portal"
                  :triggers="{
                    [StackedBar.selectors.bar]: tooltipTemplate!
                  }"
                />
              </VisXYContainer>
            </ChartContainer>
          </div>
        </DialogBody>
        <DialogFooter class="justify-start">
          <SegmentedControl v-model="metric">
            <SegmentedControlItem value="primary">
              {{ props.metricLabels.primary }}
            </SegmentedControlItem>
            <SegmentedControlItem value="secondary">
              {{ props.metricLabels.secondary }}
            </SegmentedControlItem>
          </SegmentedControl>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
