import type { HTMLAttributes } from 'vue'

export interface StatsGridItem {
  icon: string
  label: string
  value: string | number
  truncate?: boolean
}

export interface StatsGridProps {
  items: StatsGridItem[]
  /** Grid class, e.g. "grid-cols-2 md:grid-cols-4" */
  gridClass?: HTMLAttributes['class']
  /** Custom class for outer container */
  class?: HTMLAttributes['class']
}
