/**
 * Date/time utilities (system local timezone)
 *
 * Conventions:
 * - We store instants as `Date` (epoch-ms under the hood).
 * - Any "calendar" logic (day/week/month/hour buckets, date-only parsing/formatting)
 *   MUST use system local time.
 * - Never use `new Date('YYYY-MM-DD')` for date-only strings (it parses as UTC).
 * - Uses Intl API for locale-aware formatting (no external dependencies).
 */

import type { PartialDate } from '@shared/db'

export interface TimeSlice {
  start: Date
  end: Date
  durationMs: number
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

// =============================================================================
// Date Key Functions
// =============================================================================

/** Local calendar day key: `YYYY-MM-DD` (system timezone). */
export function toLocalDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = pad2(date.getMonth() + 1)
  const d = pad2(date.getDate())
  return `${y}-${m}-${d}`
}

/**
 * ISO week key: `YYYY-Www` (e.g., "2024-W01").
 * Week starts on Monday (ISO 8601).
 */
export function toLocalWeekKey(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  // Thursday of current week determines the year
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  const weekNum =
    1 +
    Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
  return `${d.getFullYear()}-W${pad2(weekNum)}`
}

/** Month key: `YYYY-MM` (e.g., "2024-01"). */
export function toLocalMonthKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`
}

/** Parse `YYYY-MM-DD` as a local midnight `Date`. */
export function parseLocalDateKey(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!m) return null
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  if (Number.isNaN(date.getTime())) return null
  date.setHours(0, 0, 0, 0)
  return date
}

// =============================================================================
// ISO Week Functions
// =============================================================================

/** Get year and ISO week number from a date */
export function getYearWeek(date: Date): { year: number; week: number } {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return { year: d.getFullYear(), week }
}

/** Get the start date of a week (Monday) given year and week number */
export function getWeekStartDate(year: number, week: number): Date {
  // ISO week date calculation
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const firstMonday = new Date(jan4)
  firstMonday.setDate(jan4.getDate() - dayOfWeek + 1)

  const result = new Date(firstMonday)
  result.setDate(firstMonday.getDate() + (week - 1) * 7)
  return result
}

/** Parse `<input type="date">` value as a local midnight `Date`. */
export function parseDateInputLocal(value: string): Date | null {
  return parseLocalDateKey(value)
}

export function startOfLocalDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfLocalDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function nextLocalDayBoundary(date: Date): Date {
  const d = startOfLocalDay(date)
  d.setDate(d.getDate() + 1)
  return d
}

function nextLocalHourBoundary(date: Date): Date {
  const d = new Date(date)
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + 1)
  return d
}

export function splitLocalByDay(start: Date, end: Date): TimeSlice[] {
  const startMs = start.getTime()
  const endMs = end.getTime()
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) return []

  const slices: TimeSlice[] = []
  let cursor = new Date(startMs)

  while (cursor.getTime() < endMs) {
    const boundary = nextLocalDayBoundary(cursor)
    const sliceEndMs = Math.min(boundary.getTime(), endMs)
    const sliceEnd = new Date(sliceEndMs)
    slices.push({
      start: new Date(cursor),
      end: sliceEnd,
      durationMs: sliceEndMs - cursor.getTime()
    })
    cursor = sliceEnd
  }

  return slices
}

export function splitLocalByHour(start: Date, end: Date): TimeSlice[] {
  const startMs = start.getTime()
  const endMs = end.getTime()
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) return []

  const slices: TimeSlice[] = []
  let cursor = new Date(startMs)

  while (cursor.getTime() < endMs) {
    const boundary = nextLocalHourBoundary(cursor)
    const sliceEndMs = Math.min(boundary.getTime(), endMs)
    const sliceEnd = new Date(sliceEndMs)
    slices.push({
      start: new Date(cursor),
      end: sliceEnd,
      durationMs: sliceEndMs - cursor.getTime()
    })
    cursor = sliceEnd
  }

  return slices
}

// =============================================================================
// Duration Formatting
// =============================================================================

/**
 * Format duration in milliseconds to human readable string.
 *
 * @example
 * formatDuration(3700000) // "1小时1分钟"
 * formatDuration(0, { emptyText: '未游玩' }) // "未游玩"
 */
export function formatDuration(ms: number, options?: { emptyText?: string }): string {
  if (!ms || ms <= 0) {
    return options?.emptyText ?? '0分钟'
  }

  const seconds = Math.floor(ms / 1000)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`
  }

  return `${minutes}分钟`
}

/**
 * Format duration in milliseconds to compact string.
 *
 * @example
 * formatDurationCompact(45000000) // "12.5h"
 * formatDurationCompact(1800000)  // "30m"
 */
export function formatDurationCompact(ms: number, options?: { emptyText?: string }): string {
  if (!ms || ms <= 0) {
    return options?.emptyText ?? '0m'
  }

  const seconds = ms / 1000
  const hours = seconds / 3600

  if (hours >= 1) {
    return `${hours.toFixed(1)}h`
  }

  const minutes = Math.floor(seconds / 60)
  return `${minutes}m`
}

// =============================================================================
// Date/Time Formatting (using Intl API)
// =============================================================================

// Cached formatters for performance
const dateFormatter = new Intl.DateTimeFormat('zh-Hans', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

const relativeTimeFormatter = new Intl.RelativeTimeFormat('zh-Hans', { numeric: 'auto' })

// =============================================================================
// PartialDate Formatting (using Intl API)
// =============================================================================

const PARTIAL_DATE_LOCALE = 'zh-Hans'

const partialDateYmdFormatter = new Intl.DateTimeFormat(PARTIAL_DATE_LOCALE, {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

const partialDateYmFormatter = new Intl.DateTimeFormat(PARTIAL_DATE_LOCALE, {
  year: 'numeric',
  month: 'long'
})

const partialDateYearFormatter = new Intl.DateTimeFormat(PARTIAL_DATE_LOCALE, {
  year: 'numeric'
})

const partialDateMdFormatter = new Intl.DateTimeFormat(PARTIAL_DATE_LOCALE, {
  month: 'long',
  day: 'numeric'
})

const partialDateMonthFormatter = new Intl.DateTimeFormat(PARTIAL_DATE_LOCALE, {
  month: 'numeric'
})

const partialDateDayFormatter = new Intl.DateTimeFormat(PARTIAL_DATE_LOCALE, {
  day: 'numeric'
})

function createLocalDate(year: number, month = 1, day = 1): Date {
  const date = new Date(0)
  date.setFullYear(year, month - 1, day)
  date.setHours(0, 0, 0, 0)
  return date
}

export function formatPartialDate(
  date: PartialDate | null | undefined,
  options?: { emptyText?: string }
): string {
  if (!date) {
    return options?.emptyText ?? '-'
  }

  const year = date.year
  const month = date.month
  const day = date.day

  if (year && month && day) {
    return partialDateYmdFormatter.format(createLocalDate(year, month, day))
  }

  if (year && month) {
    return partialDateYmFormatter.format(createLocalDate(year, month))
  }

  if (year) {
    return partialDateYearFormatter.format(createLocalDate(year))
  }

  if (month && day) {
    return partialDateMdFormatter.format(createLocalDate(2000, month, day))
  }

  if (month) {
    return partialDateMonthFormatter.format(createLocalDate(2000, month))
  }

  if (day) {
    return partialDateDayFormatter.format(createLocalDate(2000, 1, day))
  }

  return options?.emptyText ?? '-'
}

/**
 * Format relative time using Intl.RelativeTimeFormat.
 *
 * @example
 * formatRelativeTime(new Date()) // "现在"
 * formatRelativeTime(null)       // "从未"
 */
export function formatRelativeTime(date: Date | null, options?: { emptyText?: string }): string {
  if (!date) {
    return options?.emptyText ?? '从未'
  }

  const now = Date.now()
  const diffMs = date.getTime() - now
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffMs / 60000)
  const diffHour = Math.round(diffMs / 3600000)
  const diffDay = Math.round(diffMs / 86400000)
  const diffWeek = Math.round(diffMs / 604800000)
  const diffMonth = Math.round(diffMs / 2592000000)
  const diffYear = Math.round(diffMs / 31536000000)

  // Choose appropriate unit based on magnitude
  if (Math.abs(diffSec) < 60) {
    return relativeTimeFormatter.format(diffSec, 'second')
  }
  if (Math.abs(diffMin) < 60) {
    return relativeTimeFormatter.format(diffMin, 'minute')
  }
  if (Math.abs(diffHour) < 24) {
    return relativeTimeFormatter.format(diffHour, 'hour')
  }
  if (Math.abs(diffDay) < 7) {
    return relativeTimeFormatter.format(diffDay, 'day')
  }
  if (Math.abs(diffWeek) < 4) {
    return relativeTimeFormatter.format(diffWeek, 'week')
  }
  if (Math.abs(diffMonth) < 12) {
    return relativeTimeFormatter.format(diffMonth, 'month')
  }
  return relativeTimeFormatter.format(diffYear, 'year')
}

/** Format date to localized string using Intl.DateTimeFormat. */
export function formatDate(
  date: Date | PartialDate | null,
  options?: { emptyText?: string }
): string {
  if (!date) {
    return options?.emptyText ?? '-'
  }

  // Handle Date objects directly
  if (date instanceof Date) {
    return dateFormatter.format(date)
  }

  return formatPartialDate(date, options)
}

/**
 * Format date for HTML datetime-local input.
 *
 * @example
 * formatDatetimeLocalInput(new Date()) // "2024-12-16T15:30"
 */
export function formatDatetimeLocalInput(date: Date | null): string {
  if (!date) return ''
  const y = date.getFullYear()
  const m = pad2(date.getMonth() + 1)
  const d = pad2(date.getDate())
  const h = pad2(date.getHours())
  const min = pad2(date.getMinutes())
  return `${y}-${m}-${d}T${h}:${min}`
}

/**
 * Format date for HTML date input.
 *
 * @example
 * formatDateInput(new Date()) // "2024-12-16"
 */
export function formatDateInput(date: Date | null): string {
  if (!date) return ''
  return toLocalDateKey(date)
}

// Cached formatter for date range
const dateRangeFormatter = new Intl.DateTimeFormat('zh-Hans', {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
})

/**
 * Format date range for display.
 *
 * @example
 * formatDateRange(new Date('2024-01-01'), new Date('2024-01-31'))
 * // "2024年1月1日 - 2024年1月31日"
 */
export function formatDateRange(start: Date, end: Date): string {
  return `${dateRangeFormatter.format(start)} - ${dateRangeFormatter.format(end)}`
}

// Cached formatter for date-time range (with time)
const dateTimeRangeFormatter = new Intl.DateTimeFormat('zh-Hans', {
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

/**
 * Format date-time range for display (includes time).
 *
 * @example
 * formatDateTimeRange(new Date('2024-01-01T15:30'), new Date('2024-01-01T17:30'))
 * // "1月1日 15:30 - 1月1日 17:30"
 */
export function formatDateTimeRange(start: Date, end: Date): string {
  return `${dateTimeRangeFormatter.format(start)} - ${dateTimeRangeFormatter.format(end)}`
}
