import type { PartialDate } from '@shared/db'

const PARTIAL_DATE_KEYS = new Set(['year', 'month', 'day'])

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value)
}

function normalizePartialDate(value: PartialDate | null | undefined): PartialDate | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined
  }

  const record = value as Record<string, unknown>
  const keys = Object.keys(record)

  if (keys.length === 0) {
    return undefined
  }

  if (keys.some((key) => !PARTIAL_DATE_KEYS.has(key))) {
    return undefined
  }

  const hasYear = 'year' in record
  const hasMonth = 'month' in record
  const hasDay = 'day' in record

  if (hasYear && hasDay && !hasMonth) {
    return undefined
  }

  if (hasYear && !isInteger(record.year)) {
    return undefined
  }

  if (hasMonth && !isInteger(record.month)) {
    return undefined
  }

  if (hasDay && !isInteger(record.day)) {
    return undefined
  }

  const normalized: PartialDate = {}
  if (record.year !== undefined) normalized.year = record.year as number
  if (record.month !== undefined) normalized.month = record.month as number
  if (record.day !== undefined) normalized.day = record.day as number
  return normalized
}

/** Parse scraper date text into PartialDate. */
export function parsePartialDate(input: string | null | undefined): PartialDate | undefined {
  if (!input) {
    return undefined
  }

  const value = input.trim()
  if (!value) {
    return undefined
  }

  const lower = value.toLowerCase()
  if (lower === 'tba' || lower === 'unknown' || lower === 'n/a') {
    return undefined
  }

  const fullMatch = value.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:T.*)?$/)
  if (fullMatch) {
    const year = Number(fullMatch[1])
    const month = Number(fullMatch[2])
    const day = Number(fullMatch[3])
    if (year >= 3000) {
      return normalizePartialDate({ month, day })
    }
    return normalizePartialDate({ year, month, day })
  }

  const yearMonthMatch = value.match(/^(\d{4})[-/.](\d{1,2})$/)
  if (yearMonthMatch) {
    const year = Number(yearMonthMatch[1])
    const month = Number(yearMonthMatch[2])
    if (year >= 3000) {
      return undefined
    }
    return normalizePartialDate({ year, month })
  }

  const yearOnlyMatch = value.match(/^(\d{4})$/)
  if (yearOnlyMatch) {
    const year = Number(yearOnlyMatch[1])
    if (year >= 3000) {
      return undefined
    }
    return normalizePartialDate({ year })
  }

  const monthDayMatch = value.match(/^(\d{1,2})[-/.](\d{1,2})$/)
  if (monthDayMatch) {
    const month = Number(monthDayMatch[1])
    const day = Number(monthDayMatch[2])
    return normalizePartialDate({ month, day })
  }

  return undefined
}
