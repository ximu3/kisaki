import type {
  FilterState,
  FilterValue,
  RelationValue,
  DateRangeValue,
  NumberRangeValue
} from '@shared/db/json-types'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isNumberRangeValue(value: unknown): value is NumberRangeValue {
  if (!isPlainObject(value)) return false
  return 'min' in value || 'max' in value
}

function isDateRangeValue(value: unknown): value is DateRangeValue {
  if (!isPlainObject(value)) return false
  return 'from' in value || 'to' in value
}

function isRelationValue(value: unknown): value is RelationValue {
  if (!isPlainObject(value)) return false
  const match = value.match
  const ids = value.ids
  return (match === 'any' || match === 'all') && Array.isArray(ids)
}

function normalizeFilterValue(value: FilterValue | undefined): FilterValue | undefined {
  if (value === undefined || value === null) return undefined

  if (value === true) return true
  if (value === (false as unknown as FilterValue)) return undefined

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed ? trimmed : undefined
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value : undefined
  }

  if (isRelationValue(value)) {
    return value.ids.length > 0 ? value : undefined
  }

  if (isNumberRangeValue(value)) {
    return value.min === undefined && value.max === undefined ? undefined : value
  }

  if (isDateRangeValue(value)) {
    const from = typeof value.from === 'string' && value.from.trim() ? value.from : undefined
    const to = typeof value.to === 'string' && value.to.trim() ? value.to : undefined
    return from || to ? ({ from, to } satisfies DateRangeValue) : undefined
  }

  return undefined
}

export function createEmptyFilter(): FilterState {
  return {}
}

export function hasActiveFilters(filter: FilterState): boolean {
  return Object.keys(filter).length > 0
}

export function countActiveFilters(filter: FilterState): number {
  return Object.keys(filter).length
}

export function getFilterValue(filter: FilterState, key: string): FilterValue | undefined {
  return filter[key]
}

export function setFilterValue(
  filter: FilterState,
  key: string,
  value: FilterValue | undefined
): FilterState {
  const normalized = normalizeFilterValue(value)

  if (!normalized) {
    if (!(key in filter)) return filter
    const { [key]: _removed, ...rest } = filter
    return rest
  }

  if (filter[key] === normalized) return filter
  return { ...filter, [key]: normalized }
}

export function removeFilterValue(filter: FilterState, key: string): FilterState {
  if (!(key in filter)) return filter
  const { [key]: _removed, ...rest } = filter
  return rest
}
