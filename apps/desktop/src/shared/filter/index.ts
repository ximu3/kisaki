/**
 * Filter System
 *
 * Shared filter contracts and query utilities.
 *
 * This module intentionally contains no UI metadata.
 */

export type {
  FilterState,
  FilterValue,
  RelationValue,
  DateRangeValue,
  NumberRangeValue,
  SectionLayout,
  SectionItemSize
} from '@shared/db/json-types'

export { createEmptyFilter, hasActiveFilters, countActiveFilters } from './state'
export { getFilterValue, setFilterValue, removeFilterValue } from './state'

export type {
  DateRangeMode,
  FieldQueryDef,
  FilterQuerySpec,
  FilterQuerySpecInput,
  SortQueryDef
} from './spec'
export { defineQuerySpec } from './spec'

export { buildFilterConditions, buildOrderBy } from './builder'

export {
  getFilterQuerySpec,
  gameFilterQuerySpec,
  characterFilterQuerySpec,
  personFilterQuerySpec,
  companyFilterQuerySpec,
  collectionFilterQuerySpec,
  tagFilterQuerySpec
} from './specs'
