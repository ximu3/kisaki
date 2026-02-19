/**
 * Statistics Helper Functions
 *
 * Shared utility functions for statistics data processing.
 * Used by both global statistics pages and game detail activity tab.
 */

import type { Game, GameSession, Tag, Collection } from '@shared/db'
import {
  parseLocalDateKey,
  splitLocalByDay,
  splitLocalByHour,
  toLocalDateKey,
  getYearWeek
} from './datetime'

// =============================================================================
// Types
// =============================================================================

export type TimeGranularity = 'daily' | 'weekly' | 'monthly'
export type RankingSort = 'time' | 'count'

export interface TimeAggregation {
  date: string
  totalDuration: number
  sessionCount: number
}

export interface RankingItem {
  id: string
  name: string
  totalDuration: number // milliseconds
  sessionCount: number
}

export interface GlobalStatisticsStats {
  totalDuration: number
  totalSessions: number
  averageSessionDuration: number
  longestSession: number
  currentStreak: number
  longestStreak: number
  mostPlayedGame: RankingItem | null
  firstSessionDate: Date | null
  lastSessionDate: Date | null
  uniqueGamesPlayed: number
}

// =============================================================================
// Date Key Functions
// =============================================================================

function sessionDurationMs(session: GameSession): number {
  return Math.max(0, session.endedAt.getTime() - session.startedAt.getTime())
}

/** Get date key based on granularity */
export function getDateKey(date: Date, granularity: TimeGranularity): string {
  switch (granularity) {
    case 'daily':
      return toLocalDateKey(date)
    case 'weekly': {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      // Monday as week start (Monday-first).
      const jsDay = d.getDay() // 0=Sun ... 6=Sat
      const diff = d.getDate() - jsDay + (jsDay === 0 ? -6 : 1)
      d.setDate(diff)
      return toLocalDateKey(d)
    }
    case 'monthly':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
  }
}

// =============================================================================
// Aggregation Functions
// =============================================================================

/** Aggregate sessions by time granularity */
export function aggregateByTime(
  sessions: GameSession[],
  granularity: TimeGranularity
): TimeAggregation[] {
  const aggregated = new Map<
    string,
    { date: string; totalDuration: number; sessionIds: Set<string> }
  >()

  for (const session of sessions) {
    for (const slice of splitLocalByDay(session.startedAt, session.endedAt)) {
      const dateKey = getDateKey(slice.start, granularity)
      const existing = aggregated.get(dateKey) ?? {
        date: dateKey,
        totalDuration: 0,
        sessionIds: new Set()
      }
      existing.totalDuration += slice.durationMs
      existing.sessionIds.add(session.id)
      aggregated.set(dateKey, existing)
    }
  }

  return [...aggregated.values()]
    .map((v) => ({ date: v.date, totalDuration: v.totalDuration, sessionCount: v.sessionIds.size }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

// =============================================================================
// Streak Functions
// =============================================================================

/** Compute play streaks (consecutive days with activity) */
export function computeStreaks(sessions: GameSession[]): {
  currentStreak: number
  longestStreak: number
} {
  const activeDates = new Set<string>()
  for (const session of sessions) {
    for (const slice of splitLocalByDay(session.startedAt, session.endedAt)) {
      activeDates.add(toLocalDateKey(slice.start))
    }
  }

  const sortedDates = [...activeDates].sort()
  if (sortedDates.length === 0) return { currentStreak: 0, longestStreak: 0 }

  function isNextDay(prevKey: string, nextKey: string): boolean {
    const prev = parseLocalDateKey(prevKey)
    if (!prev) return false
    prev.setDate(prev.getDate() + 1)
    return toLocalDateKey(prev) === nextKey
  }

  let longestStreak = 1
  let streak = 1

  for (let i = 1; i < sortedDates.length; i++) {
    if (isNextDay(sortedDates[i - 1], sortedDates[i])) {
      streak++
      longestStreak = Math.max(longestStreak, streak)
    } else {
      streak = 1
    }
  }

  const todayDate = new Date()
  const today = toLocalDateKey(todayDate)
  const yesterdayDate = new Date(todayDate)
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = toLocalDateKey(yesterdayDate)
  const lastDate = sortedDates[sortedDates.length - 1]

  let currentStreak = 0
  if (lastDate === today || lastDate === yesterday) {
    currentStreak = 1
    for (let i = sortedDates.length - 2; i >= 0; i--) {
      if (isNextDay(sortedDates[i], sortedDates[i + 1])) {
        currentStreak++
      } else {
        break
      }
    }
  }

  return { currentStreak, longestStreak }
}

// =============================================================================
// Ranking Functions
// =============================================================================

/** Compute game ranking */
export function computeGameRanking(
  sessions: GameSession[],
  games: Map<string, Game>,
  sort: RankingSort
): RankingItem[] {
  const gamePlaytime = new Map<string, { duration: number; count: number }>()

  for (const session of sessions) {
    const duration = sessionDurationMs(session)
    const existing = gamePlaytime.get(session.gameId) ?? { duration: 0, count: 0 }
    existing.duration += duration
    existing.count++
    gamePlaytime.set(session.gameId, existing)
  }

  const ranking = [...gamePlaytime.entries()].map(([id, { duration, count }]) => ({
    id,
    name: games.get(id)?.name ?? 'Unknown',
    totalDuration: duration,
    sessionCount: count
  }))

  return ranking.sort((a, b) =>
    sort === 'time' ? b.totalDuration - a.totalDuration : b.sessionCount - a.sessionCount
  )
}

/** Compute tag ranking */
export function computeTagRanking(
  sessions: GameSession[],
  gameTagLinks: { gameId: string; tagId: string }[],
  tags: Map<string, Tag>,
  sort: RankingSort
): RankingItem[] {
  const tagPlaytime = new Map<string, { duration: number; count: number }>()

  // Build game -> tags map
  const gameTagsMap = new Map<string, string[]>()
  for (const link of gameTagLinks) {
    const existing = gameTagsMap.get(link.gameId) ?? []
    existing.push(link.tagId)
    gameTagsMap.set(link.gameId, existing)
  }

  for (const session of sessions) {
    const duration = sessionDurationMs(session)
    const tagIds = gameTagsMap.get(session.gameId) ?? []

    for (const tagId of tagIds) {
      const existing = tagPlaytime.get(tagId) ?? { duration: 0, count: 0 }
      existing.duration += duration
      existing.count++
      tagPlaytime.set(tagId, existing)
    }
  }

  const ranking = [...tagPlaytime.entries()].map(([id, { duration, count }]) => ({
    id,
    name: tags.get(id)?.name ?? 'Unknown',
    totalDuration: duration,
    sessionCount: count
  }))

  return ranking.sort((a, b) =>
    sort === 'time' ? b.totalDuration - a.totalDuration : b.sessionCount - a.sessionCount
  )
}

/** Compute collection ranking */
export function computeCollectionRanking(
  sessions: GameSession[],
  gameCollectionLinks: { gameId: string; collectionId: string }[],
  collections: Map<string, Collection>,
  sort: RankingSort
): RankingItem[] {
  const collectionPlaytime = new Map<string, { duration: number; count: number }>()

  // Build game -> collections map
  const gameCollectionsMap = new Map<string, string[]>()
  for (const link of gameCollectionLinks) {
    const existing = gameCollectionsMap.get(link.gameId) ?? []
    existing.push(link.collectionId)
    gameCollectionsMap.set(link.gameId, existing)
  }

  for (const session of sessions) {
    const duration = sessionDurationMs(session)
    const collectionIds = gameCollectionsMap.get(session.gameId) ?? []

    for (const collectionId of collectionIds) {
      const existing = collectionPlaytime.get(collectionId) ?? { duration: 0, count: 0 }
      existing.duration += duration
      existing.count++
      collectionPlaytime.set(collectionId, existing)
    }
  }

  const ranking = [...collectionPlaytime.entries()].map(([id, { duration, count }]) => ({
    id,
    name: collections.get(id)?.name ?? 'Unknown',
    totalDuration: duration,
    sessionCount: count
  }))

  return ranking.sort((a, b) =>
    sort === 'time' ? b.totalDuration - a.totalDuration : b.sessionCount - a.sessionCount
  )
}

// =============================================================================
// Statistics Functions
// =============================================================================

/** Compute global statistics */
export function computeStats(
  sessions: GameSession[],
  games: Map<string, Game>
): GlobalStatisticsStats {
  if (sessions.length === 0) {
    return {
      totalDuration: 0,
      totalSessions: 0,
      averageSessionDuration: 0,
      longestSession: 0,
      currentStreak: 0,
      longestStreak: 0,
      mostPlayedGame: null,
      firstSessionDate: null,
      lastSessionDate: null,
      uniqueGamesPlayed: 0
    }
  }

  const durations = sessions.map((s) => sessionDurationMs(s))
  const totalDuration = durations.reduce((sum, d) => sum + d, 0)
  const totalSessions = sessions.length
  const averageSessionDuration = totalDuration / totalSessions
  const longestSession = Math.max(...durations)

  const sortedByDate = [...sessions].sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime())
  const firstSessionDate = sortedByDate[0].startedAt
  const lastSessionDate = sortedByDate[sortedByDate.length - 1].endedAt

  const { currentStreak, longestStreak } = computeStreaks(sessions)

  // Find most played game
  const gamePlaytime = new Map<string, number>()
  for (const session of sessions) {
    const duration = sessionDurationMs(session)
    gamePlaytime.set(session.gameId, (gamePlaytime.get(session.gameId) ?? 0) + duration)
  }

  let mostPlayedGame: RankingItem | null = null
  let maxDuration = 0
  for (const [gameId, duration] of gamePlaytime) {
    if (duration > maxDuration) {
      maxDuration = duration
      const game = games.get(gameId)
      mostPlayedGame = {
        id: gameId,
        name: game?.name ?? 'Unknown',
        totalDuration: duration,
        sessionCount: sessions.filter((s) => s.gameId === gameId).length
      }
    }
  }

  const uniqueGamesPlayed = new Set(sessions.map((s) => s.gameId)).size

  return {
    totalDuration,
    totalSessions,
    averageSessionDuration,
    longestSession,
    currentStreak,
    longestStreak,
    mostPlayedGame,
    firstSessionDate,
    lastSessionDate,
    uniqueGamesPlayed
  }
}

// =============================================================================
// Active Days Functions
// =============================================================================

/** Count unique active days from sessions */
export function countActiveDays(sessions: GameSession[]): number {
  const activeDates = new Set<string>()
  for (const session of sessions) {
    for (const slice of splitLocalByDay(session.startedAt, session.endedAt)) {
      activeDates.add(toLocalDateKey(slice.start))
    }
  }
  return activeDates.size
}

/** Get the most active month from sessions */
export function getMostActiveMonth(
  sessions: GameSession[]
): { month: string; duration: number } | null {
  if (sessions.length === 0) return null

  const monthPlaytime = new Map<string, number>()
  for (const session of sessions) {
    for (const slice of splitLocalByDay(session.startedAt, session.endedAt)) {
      const monthKey = `${slice.start.getFullYear()}-${String(slice.start.getMonth() + 1).padStart(2, '0')}`
      monthPlaytime.set(monthKey, (monthPlaytime.get(monthKey) ?? 0) + slice.durationMs)
    }
  }

  let mostActive: { month: string; duration: number } | null = null
  for (const [month, duration] of monthPlaytime) {
    if (!mostActive || duration > mostActive.duration) {
      mostActive = { month, duration }
    }
  }

  return mostActive
}

/**
 * Get the most active weekday (Monday-first 0..6) from sessions.
 * Returns total duration in milliseconds for that weekday.
 */
export function getMostActiveWeekdayMondayFirst(
  sessions: GameSession[]
): { weekday: number; duration: number } | null {
  if (sessions.length === 0) return null

  const buckets = Array.from({ length: 7 }, () => 0)
  for (const session of sessions) {
    for (const slice of splitLocalByDay(session.startedAt, session.endedAt)) {
      const jsDay = slice.start.getDay() // 0=Sun
      const mondayFirst = jsDay === 0 ? 6 : jsDay - 1
      buckets[mondayFirst] += slice.durationMs
    }
  }

  let bestWeekday = -1
  let bestDuration = 0
  for (let i = 0; i < buckets.length; i++) {
    const duration = buckets[i]
    if (duration > bestDuration) {
      bestDuration = duration
      bestWeekday = i
    }
  }

  if (bestWeekday < 0) return null
  return { weekday: bestWeekday, duration: bestDuration }
}

/**
 * Get the most active week (by Monday start date key: YYYY-MM-DD) from sessions.
 * Week totals are computed in milliseconds and split across day boundaries.
 */
export function getMostActiveWeek(
  sessions: GameSession[]
): { weekStart: string; duration: number } | null {
  const weekly = aggregateByTime(sessions, 'weekly')
  if (weekly.length === 0) return null

  let best = weekly[0]
  for (const item of weekly) {
    if (item.totalDuration > best.totalDuration) best = item
  }

  return { weekStart: best.date, duration: best.totalDuration }
}

// =============================================================================
// Time Distribution Functions (system local timezone)
// =============================================================================

/**
 * Aggregate session duration by hour-of-day (0..23), splitting sessions across hour boundaries.
 * Result values are in hours (float).
 */
export function aggregateByLocalHour(sessions: GameSession[]): number[] {
  const buckets = Array.from({ length: 24 }, () => 0)
  for (const session of sessions) {
    for (const slice of splitLocalByHour(session.startedAt, session.endedAt)) {
      const hour = slice.start.getHours()
      buckets[hour] += slice.durationMs / 3600000
    }
  }
  return buckets
}

/**
 * Aggregate session duration by weekday (Monday-first 0..6), splitting sessions across day boundaries.
 * Result values are in hours (float).
 */
export function aggregateByLocalWeekdayMondayFirst(sessions: GameSession[]): number[] {
  const buckets = Array.from({ length: 7 }, () => 0)
  for (const session of sessions) {
    for (const slice of splitLocalByDay(session.startedAt, session.endedAt)) {
      const jsDay = slice.start.getDay() // 0=Sun
      const mondayFirst = jsDay === 0 ? 6 : jsDay - 1
      buckets[mondayFirst] += slice.durationMs / 3600000
    }
  }
  return buckets
}

/**
 * Aggregate session duration by day-of-month (1..31), splitting sessions across day boundaries.
 * Result values are in hours (float).
 */
export function aggregateByLocalDayOfMonth(sessions: GameSession[]): number[] {
  const buckets = Array.from({ length: 31 }, () => 0)
  for (const session of sessions) {
    for (const slice of splitLocalByDay(session.startedAt, session.endedAt)) {
      const dayOfMonth = slice.start.getDate() // 1..31
      const idx = dayOfMonth - 1
      if (idx >= 0 && idx < buckets.length) {
        buckets[idx] += slice.durationMs / 3600000
      }
    }
  }
  return buckets
}

// =============================================================================
// Period Functions
// =============================================================================

/** Period identifier for navigation */
export interface StatisticsPeriod {
  year: number
  week?: number
  month?: number
}

/** Report type for statistics */
export type StatisticsReportType = 'overview' | 'weekly' | 'monthly' | 'yearly'

/** Get current period based on report type */
export function getCurrentPeriod(reportType: StatisticsReportType): StatisticsPeriod {
  const now = new Date()

  switch (reportType) {
    case 'weekly': {
      const { year, week } = getYearWeek(now)
      return { year, week }
    }
    case 'monthly':
      return { year: now.getFullYear(), month: now.getMonth() + 1 }
    case 'yearly':
    case 'overview':
    default:
      return { year: now.getFullYear() }
  }
}
