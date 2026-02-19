/**
 * Filter query spec.
 *
 * Declares how a FilterState should be translated into SQL conditions and ordering.
 */
import type { AllEntityType } from '@shared/common'

export type DateRangeMode = 'timestampMs' | 'partialDate'

export type SortQueryDef =
  | { key: string; column: any }
  | { key: string; kind: 'partialDate'; columnName: string }

export type FieldQueryDef =
  | { key: string; kind: 'boolean'; column: any }
  | { key: string; kind: 'select'; column: any }
  | { key: string; kind: 'multiSelect'; column: any }
  | { key: string; kind: 'numberRange'; column: any }
  | { key: string; kind: 'dateRange'; mode: 'timestampMs'; column: any }
  | { key: string; kind: 'dateRange'; mode: 'partialDate'; columnName: string }
  | {
      key: string
      kind: 'relation'
      link: { linkTableName: string; mainIdColumn: string; relatedIdColumn: string }
    }

export interface FilterQuerySpec {
  entityType: AllEntityType
  tableName: string
  fields: readonly FieldQueryDef[]
  sort: {
    defaultKey: string
    fields: readonly SortQueryDef[]
  }
  fieldByKey: ReadonlyMap<string, FieldQueryDef>
  sortByKey: ReadonlyMap<string, SortQueryDef>
}

export interface FilterQuerySpecInput {
  entityType: AllEntityType
  tableName: string
  fields: readonly FieldQueryDef[]
  sort: {
    defaultKey: string
    fields: readonly SortQueryDef[]
  }
}

export function defineQuerySpec(input: FilterQuerySpecInput): FilterQuerySpec {
  const fieldByKey = new Map<string, FieldQueryDef>()
  for (const field of input.fields) {
    if (fieldByKey.has(field.key)) {
      throw new Error(`Duplicate filter field key: ${field.key}`)
    }
    fieldByKey.set(field.key, field)
  }

  const sortByKey = new Map<string, SortQueryDef>()
  for (const def of input.sort.fields) {
    if (sortByKey.has(def.key)) {
      throw new Error(`Duplicate sort key: ${def.key}`)
    }
    sortByKey.set(def.key, def)
  }

  if (!sortByKey.has(input.sort.defaultKey)) {
    throw new Error(`Default sort key not found: ${input.sort.defaultKey}`)
  }

  return {
    ...input,
    fieldByKey,
    sortByKey
  }
}
