import type { PartialDate } from '@shared/db'

export type IgdbImageSize = 'cover_big' | 'screenshot_huge' | '720p' | 'logo_med'

const IMAGE_BASE_URL = 'https://images.igdb.com/igdb/image/upload'

export function escapeApicalypseString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

export function toPartialDateFromUnix(timestamp?: number): PartialDate | undefined {
  if (!Number.isFinite(timestamp) || !timestamp) return undefined
  const date = new Date(timestamp * 1000)
  if (Number.isNaN(date.getTime())) return undefined

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate()
  }
}

export function toPartialDateFromYearMonth(
  year?: number,
  month?: number,
  timestamp?: number
): PartialDate | undefined {
  if (Number.isFinite(year) && year && Number.isFinite(month) && month) {
    return { year, month }
  }
  if (Number.isFinite(year) && year) {
    return { year }
  }
  return toPartialDateFromUnix(timestamp)
}

export function buildIgdbImageUrl(imageId: string, size: IgdbImageSize): string {
  return `${IMAGE_BASE_URL}/t_${size}/${imageId}.jpg`
}

export function resolveIgdbImageUrl(
  image: { image_id?: string; url?: string } | null | undefined,
  size: IgdbImageSize
): string | undefined {
  if (!image) return undefined

  if (image.image_id?.trim()) {
    return buildIgdbImageUrl(image.image_id.trim(), size)
  }

  if (!image.url?.trim()) return undefined

  const normalized = image.url.startsWith('//') ? `https:${image.url}` : image.url
  return normalized.replace(/\/t_[^/]+\//, `/t_${size}/`)
}

export function normalizeExternalSource(source: string): string {
  return source
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function mapIgdbGender(name?: string): 'male' | 'female' | 'other' | undefined {
  if (!name) return undefined
  const lower = name.trim().toLowerCase()
  if (!lower) return undefined

  if (lower === 'male') return 'male'
  if (lower === 'female') return 'female'
  return 'other'
}

export function dedupeStrings(values: string[]): string[] {
  const seen = new Set<string>()
  return values.filter((value) => {
    const key = value.trim().toLowerCase()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function clampLimit(limit: number, max = 500): number {
  if (!Number.isFinite(limit)) return 1
  return Math.max(1, Math.min(Math.floor(limit), max))
}
