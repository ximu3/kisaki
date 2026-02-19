import type { HTMLAttributes } from 'vue'

export type RankingMetric = 'primary' | 'secondary'

export interface RankingBarChartItem {
  id: string
  name: string
  primaryValue: number
  secondaryValue: number
}

export interface RankingBarChartProps {
  /** Data items to display */
  data: RankingBarChartItem[]
  /** Maximum items to display */
  maxItems?: number
  /** Primary/secondary metric labels */
  metricLabels?: { primary: string; secondary: string }
  /** Custom primary value formatter */
  formatPrimaryValue?: (value: number) => string
  /** Custom secondary value formatter */
  formatSecondaryValue?: (value: number) => string
  /** Chart height in pixels */
  height?: number
  /** Custom class */
  class?: HTMLAttributes['class']
}
