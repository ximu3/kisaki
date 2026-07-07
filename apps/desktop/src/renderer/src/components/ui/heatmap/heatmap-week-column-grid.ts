import { ComponentCore, type ComponentConfigInterface } from '@unovis/ts'
import { smartTransition } from '@unovis/ts/utils/d3'
import type { StringAccessor } from './heatmap-grid'
import { clampNonNegative, clampNonNegativeInt, getRootFontSizePx } from './heatmap-utils'

export type HeatmapWeekColumnGridDatum = object
const WEEK_COLUMN_ROW_COUNT = 7

export interface HeatmapWeekColumnGridConfigInterface<
  Datum extends HeatmapWeekColumnGridDatum
> extends ComponentConfigInterface {
  id?: (d: Datum, i: number) => string
  fill?: (d: Datum, i: number) => string
  cursor?: StringAccessor<Datum>
  leadingOffset?: number
  cellSizePx?: number
  gapRem?: number
  cornerRadiusRem?: number
  shapeRendering?: 'auto' | 'crispEdges' | 'geometricPrecision'
}

export const HeatmapWeekColumnGridSelectors = {
  root: 'vis-heatmap-week-column-grid',
  cell: 'vis-heatmap-week-column-grid-cell'
} as const

export const HeatmapWeekColumnGridDefaultConfig = {
  duration: 0,
  events: {},
  attributes: {},
  id: (_d: HeatmapWeekColumnGridDatum, i: number) => String(i),
  fill: (d: HeatmapWeekColumnGridDatum) =>
    ((d as any).fill as string | undefined) ?? 'var(--color-muted)',
  cursor: 'default',
  leadingOffset: 0,
  cellSizePx: 0,
  gapRem: 0.25,
  cornerRadiusRem: 0.125,
  shapeRendering: 'auto'
} satisfies HeatmapWeekColumnGridConfigInterface<HeatmapWeekColumnGridDatum>

function normalizeLeadingOffset(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0
  return Math.min(WEEK_COLUMN_ROW_COUNT - 1, Math.max(0, Math.floor(value)))
}

export class HeatmapWeekColumnGrid<Datum extends HeatmapWeekColumnGridDatum> extends ComponentCore<
  Datum[],
  HeatmapWeekColumnGridConfigInterface<Datum>
> {
  static selectors = HeatmapWeekColumnGridSelectors
  protected _defaultConfig =
    HeatmapWeekColumnGridDefaultConfig as unknown as HeatmapWeekColumnGridConfigInterface<Datum>
  public config: HeatmapWeekColumnGridConfigInterface<Datum> = this._defaultConfig

  constructor(config?: HeatmapWeekColumnGridConfigInterface<Datum>, data?: Datum[]) {
    super()
    if (config) this.setConfig(config)
    if (data) this.setData(data)
  }

  _render(duration?: number): void {
    const data = (this.datamodel.data ?? []) as Datum[]
    const count = data.length

    if (this._width <= 0 || this._height <= 0) return
    if (count <= 0) return

    const resolvedDuration =
      duration === 0
        ? Math.min(this.config.duration ?? 0, HeatmapWeekColumnGridDefaultConfig.duration)
        : duration

    const fontSizePx = getRootFontSizePx()
    const gapPx = clampNonNegativeInt((this.config.gapRem ?? 0.25) * fontSizePx)
    const leadingOffset = normalizeLeadingOffset(this.config.leadingOffset)
    const cellSizePx = clampNonNegative(this.config.cellSizePx ?? 0)
    if (cellSizePx <= 0) return

    const slotCount = leadingOffset + count
    const columns = Math.max(1, Math.ceil(slotCount / WEEK_COLUMN_ROW_COUNT))
    const cornerRadiusPx = Math.min(
      clampNonNegative((this.config.cornerRadiusRem ?? 0.125) * fontSizePx),
      cellSizePx / 2
    )

    const gridWidth = columns * cellSizePx + Math.max(0, columns - 1) * gapPx
    const gridHeight =
      WEEK_COLUMN_ROW_COUNT * cellSizePx + Math.max(0, WEEK_COLUMN_ROW_COUNT - 1) * gapPx
    const offsetX = Math.max(0, (this._width - gridWidth) / 2)
    const offsetY = Math.max(0, (this._height - gridHeight) / 2)
    const getCellX = (index: number): number => {
      const visualIndex = leadingOffset + index
      const column = Math.floor(visualIndex / WEEK_COLUMN_ROW_COUNT)
      return offsetX + column * (cellSizePx + gapPx)
    }
    const getCellY = (index: number): number => {
      const visualIndex = leadingOffset + index
      const row = visualIndex % WEEK_COLUMN_ROW_COUNT
      return offsetY + row * (cellSizePx + gapPx)
    }

    const g = this.g as any
    const selection = g
      .selectAll(`rect.${HeatmapWeekColumnGridSelectors.cell}`)
      .data(data, (d: Datum, i: number) => this.config.id?.(d, i) ?? String(i))

    const enter = selection
      .enter()
      .append('rect')
      .attr('class', HeatmapWeekColumnGridSelectors.cell)
      .attr('shape-rendering', this.config.shapeRendering ?? 'auto')
      .attr('width', cellSizePx)
      .attr('height', cellSizePx)
      .attr('rx', cornerRadiusPx)
      .attr('ry', cornerRadiusPx)
      .style('cursor', (d: Datum, i: number) => {
        const cursor = this.config.cursor
        return typeof cursor === 'function' ? cursor(d, i) : (cursor ?? 'default')
      })

    const merged = enter.merge(selection)
    smartTransition(merged as any, resolvedDuration)
      .attr('x', (_d: any, i: number) => getCellX(i))
      .attr('y', (_d: any, i: number) => getCellY(i))
      .attr('width', cellSizePx)
      .attr('height', cellSizePx)
      .attr('rx', cornerRadiusPx)
      .attr('ry', cornerRadiusPx)
      .style('fill', (d: any, i: number) => this.config.fill?.(d, i) ?? 'var(--color-muted)')

    smartTransition(selection.exit() as any, resolvedDuration)
      .style('opacity', 0)
      .remove()
  }
}
