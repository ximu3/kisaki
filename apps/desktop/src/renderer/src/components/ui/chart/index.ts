import { createContext } from 'reka-ui'
import type { ChartContextProps } from './types'

export { default as ChartContainer } from './chart-container.vue'
export { default as ChartLegendContent } from './chart-legend-content.vue'
export { default as ChartTooltipContent } from './chart-tooltip-content.vue'
export { componentToString } from './utils'
export { THEMES, type ChartConfig, type ChartContextProps } from './types'

export const [useChart, provideChartContext] = createContext<ChartContextProps>('Chart')

export { VisCrosshair as ChartCrosshair, VisTooltip as ChartTooltip } from '@unovis/vue'
