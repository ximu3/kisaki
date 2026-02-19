/**
 * Renderer process utilities module
 */

// CSS utilities
export { cn } from './cn'

// Non-time formatting utilities
export {
  formatStatus,
  getStatusVariant,
  getEntityIcon,
  dbScoreToDisplay,
  displayScoreToDb,
  formatGender,
  formatPercentage,
  type StatusVariant
} from './format'

// Date/time utilities (system local timezone)
export {
  toLocalDateKey,
  toLocalWeekKey,
  toLocalMonthKey,
  parseLocalDateKey,
  parseDateInputLocal,
  startOfLocalDay,
  endOfLocalDay,
  splitLocalByDay,
  splitLocalByHour,
  formatDuration,
  formatDurationCompact,
  formatRelativeTime,
  formatDate,
  formatPartialDate,
  formatDatetimeLocalInput,
  formatDateInput,
  formatDateRange,
  formatDateTimeRange,
  type TimeSlice
} from './datetime'

// Attachment URL utilities
export { getAttachmentUrl, type ThumbnailOptions } from './attachment'

// Reactive registry utilities (for extension points, theme registry, etc.)
export { createReactiveRegistry } from './registry'
export type { ReactiveRegistry } from './registry'

// Metadata updater UI helpers
export { dedupeExternalIds, mergeExternalIds, fieldsToOption, pickFields } from './metadata-updater'

// Statistics helper utilities
export {
  getDateKey,
  aggregateByTime,
  aggregateByLocalHour,
  aggregateByLocalWeekdayMondayFirst,
  aggregateByLocalDayOfMonth,
  computeStreaks,
  computeGameRanking,
  computeTagRanking,
  computeCollectionRanking,
  computeStats,
  countActiveDays,
  getMostActiveMonth,
  getMostActiveWeekdayMondayFirst,
  getMostActiveWeek,
  type TimeGranularity,
  type RankingSort,
  type TimeAggregation,
  type RankingItem,
  type GlobalStatisticsStats
} from './statistics'
