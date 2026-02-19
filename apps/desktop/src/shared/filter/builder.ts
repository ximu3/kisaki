/**
 * Filter query builder.
 *
 * Builds Drizzle SQL fragments from FilterState + FilterQuerySpec.
 */
import { and, eq, inArray, gte, lte, asc, desc, sql, type SQL } from 'drizzle-orm'
import type { SortDirection } from '@shared/common'
import { escapeSqlStringLiteral } from '@shared/utils'
import type {
  FilterState,
  DateRangeValue,
  NumberRangeValue,
  RelationValue
} from '@shared/db/json-types'
import type { FilterQuerySpec, FieldQueryDef } from './spec'

function parseYyyyMmDd(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (!Number.isInteger(year) || year < 1 || year > 9999) return null
  if (!Number.isInteger(month) || month < 1 || month > 12) return null
  if (!Number.isInteger(day) || day < 1 || day > 31) return null

  return { year, month, day }
}

function localDayStartMs(date: string): number | null {
  const ymd = parseYyyyMmDd(date)
  if (!ymd) return null
  return new Date(ymd.year, ymd.month - 1, ymd.day, 0, 0, 0, 0).getTime()
}

function localDayEndMs(date: string): number | null {
  const ymd = parseYyyyMmDd(date)
  if (!ymd) return null
  return new Date(ymd.year, ymd.month - 1, ymd.day, 23, 59, 59, 999).getTime()
}

function dateSortExpr(columnSql: string): string {
  return `(
    (COALESCE(CAST(json_extract(${columnSql}, '$.year') AS INTEGER), 0) * 10000)
    + (COALESCE(CAST(json_extract(${columnSql}, '$.month') AS INTEGER), 1) * 100)
    + COALESCE(CAST(json_extract(${columnSql}, '$.day') AS INTEGER), 1)
  )`
}

function partialDateRangeCondition(
  tableName: string,
  columnName: string,
  value: DateRangeValue
): SQL | null {
  const columnSql = `${tableName}.${columnName}`
  const ymdExpr = dateSortExpr(columnSql)
  const hasYearExpr = `json_type(${columnSql}, '$.year') = 'integer'`
  const conditions: string[] = [hasYearExpr]

  if (value.from) {
    const from = parseYyyyMmDd(value.from)
    if (!from) return null
    const fromKey = from.year * 10000 + from.month * 100 + from.day
    conditions.push(`${ymdExpr} >= ${fromKey}`)
  }

  if (value.to) {
    const to = parseYyyyMmDd(value.to)
    if (!to) return null
    const toKey = to.year * 10000 + to.month * 100 + to.day
    conditions.push(`${ymdExpr} <= ${toKey}`)
  }

  if (conditions.length === 1) return null
  return sql.raw(`(${conditions.join(' AND ')})`)
}

function partialDateSortOrder(
  tableName: string,
  columnName: string,
  direction: SortDirection
): SQL {
  const columnSql = `${tableName}.${columnName}`
  const precisionRankExpr = `CASE
    WHEN json_type(${columnSql}, '$.year') = 'integer' THEN 0
    WHEN json_type(${columnSql}, '$.month') = 'integer' AND json_type(${columnSql}, '$.day') = 'integer' THEN 1
    WHEN json_type(${columnSql}, '$.month') = 'integer' THEN 2
    WHEN json_type(${columnSql}, '$.day') = 'integer' THEN 3
    ELSE 4
  END`
  const ymdExpr = dateSortExpr(columnSql)
  const mdExpr = `(
    (COALESCE(CAST(json_extract(${columnSql}, '$.month') AS INTEGER), 0) * 100)
    + COALESCE(CAST(json_extract(${columnSql}, '$.day') AS INTEGER), 0)
  )`
  const dayExpr = `COALESCE(CAST(json_extract(${columnSql}, '$.day') AS INTEGER), 0)`
  const sortDirection = direction === 'desc' ? 'DESC' : 'ASC'

  return sql.raw(
    `${precisionRankExpr} ASC, ${ymdExpr} ${sortDirection}, ${mdExpr} ${sortDirection}, ${dayExpr} ${sortDirection}`
  )
}

function buildFieldCondition(
  spec: FilterQuerySpec,
  field: FieldQueryDef,
  value: unknown
): SQL | null {
  switch (field.kind) {
    case 'boolean':
      return value === true ? eq(field.column, true) : null
    case 'select':
      return typeof value === 'string' && value.trim() ? eq(field.column, value) : null
    case 'multiSelect':
      return Array.isArray(value) && value.length > 0 ? inArray(field.column, value) : null
    case 'numberRange': {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return null
      const range = value as NumberRangeValue
      const conditions: SQL[] = []
      if (typeof range.min === 'number') conditions.push(gte(field.column, range.min))
      if (typeof range.max === 'number') conditions.push(lte(field.column, range.max))
      return conditions.length ? (and(...conditions) ?? null) : null
    }
    case 'dateRange': {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return null
      const range = value as DateRangeValue

      if (field.mode === 'partialDate') {
        return partialDateRangeCondition(spec.tableName, field.columnName, range)
      }

      const conditions: SQL[] = []
      if (range.from) {
        const fromMs = localDayStartMs(range.from)
        if (fromMs !== null) conditions.push(gte(field.column, fromMs))
      }
      if (range.to) {
        const toMs = localDayEndMs(range.to)
        if (toMs !== null) conditions.push(lte(field.column, toMs))
      }
      return conditions.length ? (and(...conditions) ?? null) : null
    }
    case 'relation': {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return null
      const relation = value as RelationValue
      if (!Array.isArray(relation.ids) || relation.ids.length === 0) return null

      const idList = relation.ids.map((id) => `'${escapeSqlStringLiteral(id)}'`).join(', ')
      const mainTable = spec.tableName
      const { linkTableName, mainIdColumn, relatedIdColumn } = field.link

      if (relation.match === 'any') {
        return sql.raw(`EXISTS (
          SELECT 1 FROM ${linkTableName}
          WHERE ${linkTableName}.${mainIdColumn} = ${mainTable}.id
            AND ${linkTableName}.${relatedIdColumn} IN (${idList})
        )`)
      }

      const count = relation.ids.length
      return sql.raw(`(
        SELECT COUNT(DISTINCT ${relatedIdColumn})
        FROM ${linkTableName}
        WHERE ${mainIdColumn} = ${mainTable}.id
          AND ${relatedIdColumn} IN (${idList})
      ) = ${count}`)
    }
  }
}

export function buildFilterConditions(spec: FilterQuerySpec, filter: FilterState): SQL | undefined {
  const conditions: SQL[] = []

  for (const [key, value] of Object.entries(filter)) {
    const field = spec.fieldByKey.get(key)
    if (!field) continue

    const sqlCond = buildFieldCondition(spec, field, value)
    if (sqlCond) conditions.push(sqlCond)
  }

  return conditions.length > 0 ? (and(...conditions) ?? undefined) : undefined
}

export function buildOrderBy(spec: FilterQuerySpec, key: string, direction: SortDirection) {
  const def = spec.sortByKey.get(key) ?? spec.sortByKey.get(spec.sort.defaultKey)
  if (!def) {
    throw new Error(`Sort key not found: ${key}`)
  }

  if ('kind' in def) {
    return partialDateSortOrder(spec.tableName, def.columnName, direction)
  }

  return direction === 'desc' ? desc(def.column as SQL.Aliased) : asc(def.column as SQL.Aliased)
}
