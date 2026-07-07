import type { HTMLAttributes } from 'vue'

export type HeatmapGranularity = 'day' | 'week' | 'month'
export type HeatmapLayoutMode = 'packed' | 'weekColumns'
export type HeatmapLayoutByGranularity = Partial<Record<HeatmapGranularity, HeatmapLayoutMode>>

export interface HeatmapDataPoint {
  date: Date
  value: number
}

export interface HeatmapProps {
  /** Time range to render cells for */
  range: { start: Date; end: Date }
  /** Data points to display */
  data: HeatmapDataPoint[]
  /** Render compact inline details when cells are large enough */
  showInlineDetails?: boolean
  /** Override the minimum cell size required for inline details */
  inlineDetailsMinCellSizePx?: number
  /** Available granularities (defaults to all). Selector hidden when only one. */
  availableGranularities?: HeatmapGranularity[]
  /**
   * Override the layout strategy for specific granularities.
   * `weekColumns` is only applied to `day` granularity.
   * When a granularity switches to `weekColumns`, inline labels are disabled for that mode.
   */
  layoutByGranularity?: HeatmapLayoutByGranularity
  /** Custom value formatter for tooltips */
  formatValue?: (value: number) => string
  /** Custom date formatter for tooltips */
  formatDate?: (date: Date, granularity: HeatmapGranularity) => string
  /** Preferred chart height in pixels. Some layouts may derive height from width. */
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
