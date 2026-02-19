/**
 * Statistics Composable
 *
 * Provider/Consumer pattern for statistics data.
 * Handles report type switching (via route) and period navigation.
 * Date range is computed based on report type and current period.
 */

import {
  provide,
  inject,
  ref,
  computed,
  watch,
  type InjectionKey,
  type ComputedRef,
  type Ref
} from 'vue'
import { useRoute } from 'vue-router'
import { desc, gte, lte, and, inArray, eq, type SQL } from 'drizzle-orm'
import { storeToRefs } from 'pinia'
import { db } from '@renderer/core/db'
import { useAsyncData } from '@renderer/composables/use-async-data'
import { useEvent } from '@renderer/composables/use-event'
import type { Game, GameSession, Tag, Collection } from '@shared/db'
import * as schema from '@shared/db'
import { usePreferencesStore } from '@renderer/stores'
import {
  computeStats,
  getCurrentPeriod,
  type GlobalStatisticsStats
} from '@renderer/utils/statistics'
import { formatDateRange, getWeekStartDate } from '@renderer/utils/datetime'
import type { ReportType, Period, PeriodDisplay } from '../types'

// =============================================================================
// Context Type
// =============================================================================

export interface StatisticsContext {
  // Report type (derived from route)
  reportType: ComputedRef<ReportType>

  // Period state (for weekly/monthly/yearly)
  currentPeriod: Ref<Period>
  setCurrentPeriod: (period: Period) => void
  periodDisplay: ComputedRef<PeriodDisplay>

  // Computed date range based on report type and period
  dateRange: ComputedRef<{ start: Date; end: Date }>

  // For overview: separate date range for time-based visualizations (past year)
  timeBasedDateRange: ComputedRef<{ start: Date; end: Date }>

  // Data - filtered by dateRange
  sessions: ComputedRef<GameSession[]>
  games: ComputedRef<Map<string, Game>>
  tags: ComputedRef<Map<string, Tag>>
  collections: ComputedRef<Map<string, Collection>>
  stats: ComputedRef<GlobalStatisticsStats>

  // For overview: all-time data for stats/distributions/rankings
  allTimeSessions: ComputedRef<GameSession[]>
  allTimeStats: ComputedRef<GlobalStatisticsStats>

  // Link data for local computation
  gameTagLinks: ComputedRef<{ gameId: string; tagId: string }[]>
  gameCollectionLinks: ComputedRef<{ gameId: string; collectionId: string }[]>

  // State
  isLoading: Ref<boolean>
  isFetching: Ref<boolean>
  error: Ref<string | null>
  refetch: () => Promise<void>
}

// =============================================================================
// Injection Key
// =============================================================================

export const StatisticsKey: InjectionKey<StatisticsContext> = Symbol('statistics')

// =============================================================================
// Date Range Calculation Helpers
// =============================================================================

/** Calculate date range based on report type and period */
function calculateDateRange(reportType: ReportType, period: Period): { start: Date; end: Date } {
  const now = new Date()

  switch (reportType) {
    case 'overview': {
      // Past year from today
      const end = new Date(now)
      end.setHours(23, 59, 59, 999)
      const start = new Date(now)
      start.setFullYear(start.getFullYear() - 1)
      start.setDate(start.getDate() + 1)
      start.setHours(0, 0, 0, 0)
      return { start, end }
    }

    case 'weekly': {
      // Specific week
      const start = getWeekStartDate(period.year, period.week!)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }

    case 'monthly': {
      // Specific month
      const start = new Date(period.year, period.month! - 1, 1)
      start.setHours(0, 0, 0, 0)
      const end = new Date(period.year, period.month!, 0) // Last day of month
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }

    case 'yearly': {
      // Specific year
      const start = new Date(period.year, 0, 1)
      start.setHours(0, 0, 0, 0)
      const end = new Date(period.year, 11, 31)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
  }
}

/** Format period for display */
function formatPeriodDisplay(reportType: ReportType, period: Period): PeriodDisplay {
  switch (reportType) {
    case 'weekly': {
      const start = getWeekStartDate(period.year, period.week!)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      end.setHours(23, 59, 59, 999)

      // Use date range instead of week number to avoid cross-year ambiguity.
      const label = formatDateRange(start, end).replace(' - ', '-')
      const shortLabel = `${start.getMonth() + 1}/${start.getDate()}-${end.getMonth() + 1}/${end.getDate()}`

      return { label, shortLabel }
    }
    case 'monthly': {
      const monthNames = [
        '1月',
        '2月',
        '3月',
        '4月',
        '5月',
        '6月',
        '7月',
        '8月',
        '9月',
        '10月',
        '11月',
        '12月'
      ]
      return {
        label: `${period.year}年${monthNames[period.month! - 1]}`,
        shortLabel: monthNames[period.month! - 1]
      }
    }
    case 'yearly':
      return {
        label: `${period.year}年`,
        shortLabel: `${period.year}`
      }
    default:
      return { label: '过去一年', shortLabel: '总览' }
  }
}

/** Get report type from route name */
function getReportTypeFromRoute(routeName: string | symbol | null | undefined): ReportType {
  if (!routeName || typeof routeName !== 'string') return 'overview'

  if (routeName.includes('weekly')) return 'weekly'
  if (routeName.includes('monthly')) return 'monthly'
  if (routeName.includes('yearly')) return 'yearly'
  return 'overview'
}

// =============================================================================
// Data Fetcher
// =============================================================================

interface FetchedData {
  sessions: GameSession[]
  games: Game[]
  tags: Tag[]
  collections: Collection[]
  gameTagLinks: { gameId: string; tagId: string }[]
  gameCollectionLinks: { gameId: string; collectionId: string }[]
}

async function fetchStatisticsData(
  dateRange: { start: Date; end: Date } | null,
  showNsfw: boolean
): Promise<FetchedData> {
  // Build conditions for sessions query
  const conditions: SQL[] = []
  if (dateRange) {
    conditions.push(
      gte(schema.gameSessions.startedAt, dateRange.start),
      lte(schema.gameSessions.endedAt, dateRange.end)
    )
  }

  const sessionWhere = conditions.length ? and(...conditions) : undefined

  // Fetch sessions (optionally filtered by game NSFW)
  const sessions = showNsfw
    ? await db
        .select()
        .from(schema.gameSessions)
        .where(sessionWhere)
        .orderBy(desc(schema.gameSessions.startedAt))
    : (
        await db
          .select()
          .from(schema.gameSessions)
          .innerJoin(schema.games, eq(schema.gameSessions.gameId, schema.games.id))
          .where(and(sessionWhere, eq(schema.games.isNsfw, false)))
          .orderBy(desc(schema.gameSessions.startedAt))
      ).map((row) => row.game_sessions)

  if (sessions.length === 0) {
    return {
      sessions: [],
      games: [],
      tags: [],
      collections: [],
      gameTagLinks: [],
      gameCollectionLinks: []
    }
  }

  // Get unique game IDs
  const gameIds = [...new Set(sessions.map((s) => s.gameId))]

  // Parallel fetch all related data
  const [games, tags, collections, gameTagLinks, gameCollectionLinks] = await Promise.all([
    db
      .select()
      .from(schema.games)
      .where(
        and(
          inArray(schema.games.id, gameIds),
          showNsfw ? undefined : eq(schema.games.isNsfw, false)
        )
      ),
    db
      .select()
      .from(schema.tags)
      .where(showNsfw ? undefined : eq(schema.tags.isNsfw, false)),
    db
      .select()
      .from(schema.collections)
      .where(showNsfw ? undefined : eq(schema.collections.isNsfw, false)),
    showNsfw
      ? db
          .select({
            gameId: schema.gameTagLinks.gameId,
            tagId: schema.gameTagLinks.tagId
          })
          .from(schema.gameTagLinks)
          .where(inArray(schema.gameTagLinks.gameId, gameIds))
      : db
          .select({
            gameId: schema.gameTagLinks.gameId,
            tagId: schema.gameTagLinks.tagId
          })
          .from(schema.gameTagLinks)
          .innerJoin(schema.tags, eq(schema.gameTagLinks.tagId, schema.tags.id))
          .where(and(inArray(schema.gameTagLinks.gameId, gameIds), eq(schema.tags.isNsfw, false))),
    showNsfw
      ? db
          .select({
            gameId: schema.collectionGameLinks.gameId,
            collectionId: schema.collectionGameLinks.collectionId
          })
          .from(schema.collectionGameLinks)
          .where(inArray(schema.collectionGameLinks.gameId, gameIds))
      : db
          .select({
            gameId: schema.collectionGameLinks.gameId,
            collectionId: schema.collectionGameLinks.collectionId
          })
          .from(schema.collectionGameLinks)
          .innerJoin(
            schema.collections,
            eq(schema.collectionGameLinks.collectionId, schema.collections.id)
          )
          .where(
            and(
              inArray(schema.collectionGameLinks.gameId, gameIds),
              eq(schema.collections.isNsfw, false)
            )
          )
  ])

  return {
    sessions,
    games,
    tags,
    collections,
    gameTagLinks,
    gameCollectionLinks
  }
}

// =============================================================================
// Provider Composable
// =============================================================================

/**
 * Provide statistics data context
 *
 * @example
 * ```ts
 * const { sessions, stats, reportType } = useStatisticsProvider()
 * ```
 */
export function useStatisticsProvider(): StatisticsContext {
  const route = useRoute()
  const preferencesStore = usePreferencesStore()
  const { showNsfw } = storeToRefs(preferencesStore)

  // Report type derived from route
  const reportType = computed<ReportType>(() => getReportTypeFromRoute(route.name))

  // Period state - initialized based on report type
  const currentPeriod = ref<Period>(getCurrentPeriod(reportType.value))

  // Reset period when report type changes
  watch(reportType, (newType) => {
    currentPeriod.value = getCurrentPeriod(newType)
  })

  // Computed date range
  const dateRange = computed(() => calculateDateRange(reportType.value, currentPeriod.value))

  // For overview: time-based visualizations use past year
  const timeBasedDateRange = computed(() => {
    if (reportType.value === 'overview') {
      return calculateDateRange('overview', currentPeriod.value)
    }
    return dateRange.value
  })

  // Period display
  const periodDisplay = computed(() => formatPeriodDisplay(reportType.value, currentPeriod.value))

  // Fetch data based on computed date range
  const { data, isLoading, isFetching, error, refetch } = useAsyncData(
    () => fetchStatisticsData(dateRange.value, showNsfw.value),
    { watch: [dateRange, showNsfw] }
  )

  // For overview: fetch all-time data separately
  const { data: allTimeData, refetch: refetchAllTime } = useAsyncData(
    () => fetchStatisticsData(null, showNsfw.value),
    { enabled: () => reportType.value === 'overview', watch: [showNsfw] }
  )

  // Computed data maps
  const sessions = computed(() => data.value?.sessions ?? [])

  const games = computed(() => {
    const map = new Map<string, Game>()
    // Merge games from both data sources for overview
    for (const game of data.value?.games ?? []) {
      map.set(game.id, game)
    }
    if (reportType.value === 'overview') {
      for (const game of allTimeData.value?.games ?? []) {
        map.set(game.id, game)
      }
    }
    return map
  })

  const tags = computed(() => {
    const map = new Map<string, Tag>()
    for (const tag of data.value?.tags ?? []) {
      map.set(tag.id, tag)
    }
    return map
  })

  const collections = computed(() => {
    const map = new Map<string, Collection>()
    for (const collection of data.value?.collections ?? []) {
      map.set(collection.id, collection)
    }
    return map
  })

  // Expose link data for local computation in components
  const gameTagLinks = computed(() => {
    if (reportType.value === 'overview') {
      return allTimeData.value?.gameTagLinks ?? []
    }
    return data.value?.gameTagLinks ?? []
  })

  const gameCollectionLinks = computed(() => {
    if (reportType.value === 'overview') {
      return allTimeData.value?.gameCollectionLinks ?? []
    }
    return data.value?.gameCollectionLinks ?? []
  })

  // Computed stats
  const stats = computed(() => computeStats(sessions.value, games.value))

  // All-time data for overview
  const allTimeSessions = computed(() => allTimeData.value?.sessions ?? [])
  const allTimeStats = computed(() => computeStats(allTimeSessions.value, games.value))

  // Event listeners for auto-refresh
  useEvent('db:inserted', ({ table }) => {
    if (table === 'game_sessions') {
      refetch()
      if (reportType.value === 'overview') refetchAllTime()
    }
  })

  useEvent('db:updated', ({ table }) => {
    if (table === 'game_sessions' || table === 'games') {
      refetch()
      if (reportType.value === 'overview') refetchAllTime()
    }
  })

  useEvent('db:deleted', ({ table }) => {
    if (table === 'game_sessions') {
      refetch()
      if (reportType.value === 'overview') refetchAllTime()
    }
  })

  const context: StatisticsContext = {
    reportType,
    currentPeriod,
    setCurrentPeriod: (period) => {
      currentPeriod.value = period
    },
    periodDisplay,
    dateRange,
    timeBasedDateRange,
    sessions,
    games,
    tags,
    collections,
    stats,
    allTimeSessions,
    allTimeStats,
    gameTagLinks,
    gameCollectionLinks,
    isLoading,
    isFetching,
    error,
    refetch
  }

  provide(StatisticsKey, context)
  return context
}

// =============================================================================
// Consumer Composable
// =============================================================================

/**
 * Consume statistics data context
 *
 * @example
 * ```ts
 * const { sessions, stats, reportType } = useStatistics()
 * ```
 */
export function useStatistics(): StatisticsContext {
  const context = inject(StatisticsKey)
  if (!context) {
    throw new Error(
      'useStatistics() must be used within a component that called useStatisticsProvider()'
    )
  }
  return context
}
