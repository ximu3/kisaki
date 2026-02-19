import { ComponentCore, type ComponentConfigInterface } from '@unovis/ts'
import { smartTransition } from '@unovis/ts/utils/d3'

export type HeatmapRectGridDatum = object

export type StringAccessor<Datum> = string | ((d: Datum, i: number) => string)

export interface HeatmapRectGridConfigInterface<
  Datum extends HeatmapRectGridDatum
> extends ComponentConfigInterface {
  id?: (d: Datum, i: number) => string
  fill?: (d: Datum, i: number) => string
  cursor?: StringAccessor<Datum>
  gapRem?: number
  cornerRadiusRem?: number
  shapeRendering?: 'auto' | 'crispEdges' | 'geometricPrecision'
}

export const HeatmapRectGridSelectors = {
  root: 'vis-heatmap-rect-grid',
  cell: 'vis-heatmap-rect-grid-cell'
} as const

export const HeatmapRectGridDefaultConfig = {
  duration: 0,
  events: {},
  attributes: {},
  id: (_d: HeatmapRectGridDatum, i: number) => String(i),
  fill: (d: HeatmapRectGridDatum) =>
    ((d as any).fill as string | undefined) ?? 'var(--color-muted)',
  cursor: 'default',
  gapRem: 0.25, // tailwind gap-1
  cornerRadiusRem: 0.125, // tailwind rounded-sm
  shapeRendering: 'auto'
} satisfies HeatmapRectGridConfigInterface<HeatmapRectGridDatum>

function getRootFontSizePx(): number {
  if (typeof window === 'undefined') return 16
  const v = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
  return Number.isFinite(v) && v > 0 ? v : 16
}

function clampNonNegative(n: number): number {
  return Number.isFinite(n) && n >= 0 ? n : 0
}

function clampNonNegativeInt(n: number): number {
  return Math.max(0, Math.floor(clampNonNegative(n)))
}

function computeBestLayout(
  count: number,
  width: number,
  height: number,
  gapPx: number
): { columns: number; rows: number; cellSizePx: number } {
  if (count <= 0) return { columns: 1, rows: 0, cellSizePx: 0 }

  const w = clampNonNegative(width)
  const h = clampNonNegative(height)
  const gap = clampNonNegative(gapPx)

  let bestColumns = 1
  let bestRows = count
  let bestCell = 0

  for (let columns = 1; columns <= count; columns++) {
    const rows = Math.ceil(count / columns)
    const maxCellByWidth = (w - (columns - 1) * gap) / columns
    const maxCellByHeight = rows > 0 ? (h - (rows - 1) * gap) / rows : 0
    const cell = Math.min(maxCellByWidth, maxCellByHeight)
    if (!Number.isFinite(cell) || cell <= 0) continue

    if (cell > bestCell + 1e-6 || (Math.abs(cell - bestCell) <= 1e-6 && columns > bestColumns)) {
      bestCell = cell
      bestColumns = columns
      bestRows = rows
    }
  }

  return { columns: bestColumns, rows: bestRows, cellSizePx: Math.max(0, bestCell) }
}

export class HeatmapRectGrid<Datum extends HeatmapRectGridDatum> extends ComponentCore<
  Datum[],
  HeatmapRectGridConfigInterface<Datum>
> {
  static selectors = HeatmapRectGridSelectors
  protected _defaultConfig =
    HeatmapRectGridDefaultConfig as unknown as HeatmapRectGridConfigInterface<Datum>
  public config: HeatmapRectGridConfigInterface<Datum> = this._defaultConfig

  constructor(config?: HeatmapRectGridConfigInterface<Datum>, data?: Datum[]) {
    super()
    if (config) this.setConfig(config)
    if (data) this.setData(data)
  }

  _render(duration?: number): void {
    const data = (this.datamodel.data ?? []) as Datum[]
    const count = data.length

    if (this._width <= 0 || this._height <= 0) return
    if (count <= 0) return

    // Unovis containers pass `duration = 0` for resize-driven re-renders (`render(0)`).
    // For heatmaps, a small animated transition produces a much better resize experience.
    const resolvedDuration =
      duration === 0
        ? Math.min(this.config.duration ?? 0, HeatmapRectGridDefaultConfig.duration)
        : duration

    const fontSizePx = getRootFontSizePx()
    const gapPx = clampNonNegativeInt((this.config.gapRem ?? 0.25) * fontSizePx)
    const cornerRadiusPxRaw = clampNonNegative((this.config.cornerRadiusRem ?? 0.125) * fontSizePx)

    const layout = computeBestLayout(count, this._width, this._height, gapPx)
    const cellSizePx = Math.max(1, Math.floor(layout.cellSizePx))
    const columns = Math.max(1, layout.columns)
    const rows = Math.ceil(count / columns)

    const cornerRadiusPx = Math.min(cornerRadiusPxRaw, cellSizePx / 2)

    const gridHeight = rows * cellSizePx + Math.max(0, rows - 1) * gapPx
    const offsetX = 0
    const offsetY = Math.max(0, Math.floor((this._height - gridHeight) / 2))

    const g = this.g as any
    const selection = g
      .selectAll(`rect.${HeatmapRectGridSelectors.cell}`)
      .data(data, (d: Datum, i: number) => this.config.id?.(d, i) ?? String(i))

    const enter = selection
      .enter()
      .append('rect')
      .attr('class', HeatmapRectGridSelectors.cell)
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
      .attr('x', (_d: any, i: number) => offsetX + (i % columns) * (cellSizePx + gapPx))
      .attr('y', (_d: any, i: number) => offsetY + Math.floor(i / columns) * (cellSizePx + gapPx))
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
