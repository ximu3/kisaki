import { like, or, sql, type SQL } from 'drizzle-orm'
import { escapeSqlStringLiteral } from '@shared/utils'
import type { SearchQuerySpec } from './spec'

export function normalizeSearchText(text: string | null | undefined): string | undefined {
  if (!text) return undefined
  const trimmed = text.trim()
  return trimmed ? trimmed : undefined
}

export function hasActiveSearch(text: string | null | undefined): boolean {
  return Boolean(normalizeSearchText(text))
}

function escapeFtsQuery(text: string): string {
  return text
    .replace(/["'*^:(){}[\]|!-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function buildFtsMatchText(searchText: string): string {
  const escaped = escapeFtsQuery(searchText)
  if (!escaped) return ''
  const words = escaped.split(/\s+/).filter(Boolean)
  return words.map((word) => `"${word}"*`).join(' ')
}

function buildFtsCondition(
  spec: { ftsTable: string; sourceTable: string },
  searchText: string
): SQL | null {
  const query = buildFtsMatchText(searchText)
  if (!query) return null
  const q = escapeSqlStringLiteral(query)
  return sql.raw(`id IN (
    SELECT id FROM ${spec.sourceTable}
    WHERE rowid IN (
      SELECT rowid FROM ${spec.ftsTable}
      WHERE ${spec.ftsTable} MATCH '${q}'
    )
  )`)
}

export function buildSearchCondition(
  spec: SearchQuerySpec,
  searchText: string | null | undefined
): SQL | undefined {
  const normalized = normalizeSearchText(searchText)
  if (!normalized) return undefined

  if (spec.kind === 'fts') {
    return buildFtsCondition(spec, normalized) ?? undefined
  }

  const pattern = `%${normalized}%`
  const likeConds = spec.columns.map((col) => like(col as never, pattern))
  if (likeConds.length === 0) return undefined
  if (likeConds.length === 1) return likeConds[0]
  return or(...likeConds) ?? undefined
}
