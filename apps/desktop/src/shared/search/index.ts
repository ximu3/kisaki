/**
 * Search System
 *
 * Shared search query contracts and SQL builders.
 *
 * This module intentionally contains no UI metadata.
 */

export type { SearchQuerySpec } from './spec'

export {
  normalizeSearchText,
  hasActiveSearch,
  buildFtsMatchText,
  buildSearchCondition
} from './builder'

export {
  getSearchQuerySpec,
  gameSearchQuerySpec,
  characterSearchQuerySpec,
  personSearchQuerySpec,
  companySearchQuerySpec,
  collectionSearchQuerySpec,
  tagSearchQuerySpec
} from './specs'
