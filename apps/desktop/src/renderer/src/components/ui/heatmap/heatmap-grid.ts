import { ComponentCore, type ComponentConfigInterface } from '@unovis/ts'
import { smartTransition } from '@unovis/ts/utils/d3'
import { clampNonNegative, clampNonNegativeInt, getRootFontSizePx } from './heatmap-utils'

export type HeatmapRectGridDatum = object

export type StringAccessor<Datum> = string | ((d: Datum, i: number) => string)
export type HeatmapRectGridLabel = string | string[]
type HeatmapRectGridLayout = { columns: number; rows: number; cellSizePx: number }

export interface HeatmapRectGridConfigInterface<
  Datum extends HeatmapRectGridDatum
> extends ComponentConfigInterface {
  id?: (d: Datum, i: number) => string
  fill?: (d: Datum, i: number) => string
  cursor?: StringAccessor<Datum>
  label?: (d: Datum, i: number) => HeatmapRectGridLabel | null | undefined
  labelColor?: StringAccessor<Datum>
  labelMinCellSizePx?: number
  gapRem?: number
  cornerRadiusRem?: number
  shapeRendering?: 'auto' | 'crispEdges' | 'geometricPrecision'
}

export const HeatmapRectGridSelectors = {
  root: 'vis-heatmap-rect-grid',
  cell: 'vis-heatmap-rect-grid-cell',
  label: 'vis-heatmap-rect-grid-label'
} as const

export const HeatmapRectGridDefaultConfig = {
  duration: 0,
  events: {},
  attributes: {},
  id: (_d: HeatmapRectGridDatum, i: number) => String(i),
  fill: (d: HeatmapRectGridDatum) =>
    ((d as any).fill as string | undefined) ?? 'var(--color-muted)',
  cursor: 'default',
  label: undefined,
  labelColor: 'var(--color-foreground)',
  // Inline labels are opt-in; callers must provide both label text and a threshold.
  labelMinCellSizePx: Number.POSITIVE_INFINITY,
  gapRem: 0.25, // tailwind gap-1
  cornerRadiusRem: 0.125, // tailwind rounded-sm
  shapeRendering: 'auto'
} satisfies HeatmapRectGridConfigInterface<HeatmapRectGridDatum>

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

function normalizeLabelMinCellSizePx(value: unknown): number {
  if (typeof value !== 'number') return Number.POSITIVE_INFINITY
  if (!Number.isFinite(value)) return Number.POSITIVE_INFINITY
  return value >= 0 ? value : Number.POSITIVE_INFINITY
}

function normalizeLabelLines(label: HeatmapRectGridLabel | null | undefined): string[] {
  if (Array.isArray(label)) {
    return label.map((line) => String(line).trim()).filter(Boolean)
  }

  if (label == null) return []

  return String(label)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function getLabelFontSizePx(cellSizePx: number, lineCount: number): number {
  const maxFontSizePx = lineCount > 1 ? 12 : 14
  const scale = lineCount > 1 ? 0.18 : 0.24
  return Math.max(10, Math.min(maxFontSizePx, Math.floor(cellSizePx * scale)))
}

function getLabelLineHeightPx(fontSizePx: number): number {
  return Math.max(fontSizePx + 2, Math.round(fontSizePx * 1.25))
}

function updateLabelText(
  node: SVGTextElement,
  lines: string[],
  centerX: number,
  fontSizePx: number
): void {
  if (lines.length === 0) {
    if (node.firstChild) node.textContent = ''
    return
  }

  const lineHeightPx = getLabelLineHeightPx(fontSizePx)
  const firstLineOffsetPx = -((lines.length - 1) * lineHeightPx) / 2
  const tspans = Array.from(node.children).filter(
    (child): child is SVGTSpanElement => child.tagName.toLowerCase() === 'tspan'
  )

  // Reuse existing tspans on resize; only add or remove nodes when the line count changes.
  tspans.slice(lines.length).forEach((tspan) => tspan.remove())

  lines.forEach((line, lineIndex) => {
    const tspan = tspans[lineIndex] ?? document.createElementNS(SVG_NAMESPACE, 'tspan')
    if (!tspans[lineIndex]) node.appendChild(tspan)

    tspan.setAttribute('x', String(centerX))
    tspan.setAttribute('dy', String(lineIndex === 0 ? firstLineOffsetPx : lineHeightPx))
    tspan.textContent = line
  })
}

function computeBestLayout(
  count: number,
  width: number,
  height: number,
  gapPx: number
): HeatmapRectGridLayout {
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
    const labelMinCellSizePx = normalizeLabelMinCellSizePx(this.config.labelMinCellSizePx)
    const showLabels = !!this.config.label && cellSizePx >= labelMinCellSizePx

    const cornerRadiusPx = Math.min(cornerRadiusPxRaw, cellSizePx / 2)

    const gridHeight = rows * cellSizePx + Math.max(0, rows - 1) * gapPx
    const offsetX = 0
    const offsetY = Math.max(0, Math.floor((this._height - gridHeight) / 2))
    const getCellX = (index: number): number => offsetX + (index % columns) * (cellSizePx + gapPx)
    const getCellY = (index: number): number =>
      offsetY + Math.floor(index / columns) * (cellSizePx + gapPx)
    const getCellCenterX = (index: number): number => getCellX(index) + cellSizePx / 2
    const getCellCenterY = (index: number): number => getCellY(index) + cellSizePx / 2

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
      .attr('x', (_d: any, i: number) => getCellX(i))
      .attr('y', (_d: any, i: number) => getCellY(i))
      .attr('width', cellSizePx)
      .attr('height', cellSizePx)
      .attr('rx', cornerRadiusPx)
      .attr('ry', cornerRadiusPx)
      .style('fill', (d: any, i: number) => this.config.fill?.(d, i) ?? 'var(--color-muted)')

    const labelSelection = g
      .selectAll(`text.${HeatmapRectGridSelectors.label}`)
      .data(showLabels ? data : [], (d: Datum, i: number) => this.config.id?.(d, i) ?? String(i))

    const labelEnter = labelSelection
      .enter()
      .append('text')
      .attr('class', HeatmapRectGridSelectors.label)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .style('font-weight', '500')

    const getLabelLines = (d: unknown, i: number): string[] =>
      normalizeLabelLines(this.config.label?.(d as Datum, i))

    const getLabelColor = (d: unknown, i: number): string => {
      const labelColor = this.config.labelColor
      return typeof labelColor === 'function'
        ? labelColor(d as Datum, i)
        : (labelColor ?? 'var(--color-foreground)')
    }

    const maxLabelLineCount = showLabels
      ? Math.max(1, ...data.map((datum, index) => getLabelLines(datum, index).length))
      : 1
    const labelFontSizePx = getLabelFontSizePx(cellSizePx, maxLabelLineCount)

    const mergedLabels = labelEnter.merge(labelSelection)
    smartTransition(mergedLabels as any, resolvedDuration)
      .attr('x', (_d: unknown, i: number) => getCellCenterX(i))
      .attr('y', (_d: unknown, i: number) => getCellCenterY(i))
      .style('fill', getLabelColor)
      .style('font-size', `${labelFontSizePx}px`)

    mergedLabels.each((d: unknown, i: number, nodes: ArrayLike<SVGTextElement>) => {
      const lines = getLabelLines(d, i)
      updateLabelText(nodes[i], lines, getCellCenterX(i), labelFontSizePx)
    })

    smartTransition(selection.exit() as any, resolvedDuration)
      .style('opacity', 0)
      .remove()

    smartTransition(labelSelection.exit() as any, resolvedDuration)
      .style('opacity', 0)
      .remove()
  }
}
