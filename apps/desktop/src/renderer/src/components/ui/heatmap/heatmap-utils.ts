const DEFAULT_ROOT_FONT_SIZE_PX = 16

export function getRootFontSizePx(): number {
  if (typeof window === 'undefined') return DEFAULT_ROOT_FONT_SIZE_PX

  const fontSizePx = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
  return Number.isFinite(fontSizePx) && fontSizePx > 0 ? fontSizePx : DEFAULT_ROOT_FONT_SIZE_PX
}

export function clampNonNegative(value: number): number {
  return Number.isFinite(value) && value >= 0 ? value : 0
}

export function clampNonNegativeInt(value: number): number {
  return Math.max(0, Math.floor(clampNonNegative(value)))
}
