import type { HTMLAttributes } from 'vue'

export type HeatmapGranularity = 'day' | 'week' | 'month'

export interface HeatmapDataPoint {
  date: Date
  value: number
}

export interface HeatmapProps {
  /** Time range to render cells for */
  range: { start: Date; end: Date }
  /** Data points to display */
  data: HeatmapDataPoint[]
  /** Available granularities (defaults to all). Selector hidden when only one. */
  availableGranularities?: HeatmapGranularity[]
  /** Custom value formatter for tooltips */
  formatValue?: (value: number) => string
  /** Custom date formatter for tooltips */
  formatDate?: (date: Date, granularity: HeatmapGranularity) => string
  /** Chart height in pixels */
  height?: number
  /** Show legend */
  showLegend?: boolean
  /** Legend labels */
  legendLabels?: { less: string; more: string }
  /** Granularity selector labels */
  granularityLabels?: { day: string; week: string; month: string }
  /** Custom class */
  class?: HTMLAttributes['class']
}
