/**
 * Kisaki Plugin SDK - Drizzle ORM Re-exports (Renderer)
 *
 * Provides Drizzle query operators from host application.
 */

import type { KisakiRendererAPI } from '../types/renderer.plugin'

const w = (typeof window !== 'undefined' ? window : globalThis) as unknown as {
  kisaki: KisakiRendererAPI
}

const drizzle = w.kisaki.__deps.drizzle

// Comparison operators
export const eq: typeof drizzle.eq = drizzle.eq
export const ne: typeof drizzle.ne = drizzle.ne
export const gt: typeof drizzle.gt = drizzle.gt
export const gte: typeof drizzle.gte = drizzle.gte
export const lt: typeof drizzle.lt = drizzle.lt
export const lte: typeof drizzle.lte = drizzle.lte

// Null checks
export const isNull: typeof drizzle.isNull = drizzle.isNull
export const isNotNull: typeof drizzle.isNotNull = drizzle.isNotNull

// Array operators
export const inArray: typeof drizzle.inArray = drizzle.inArray
export const notInArray: typeof drizzle.notInArray = drizzle.notInArray

// Existence
export const exists: typeof drizzle.exists = drizzle.exists
export const notExists: typeof drizzle.notExists = drizzle.notExists

// Range
export const between: typeof drizzle.between = drizzle.between
export const notBetween: typeof drizzle.notBetween = drizzle.notBetween

// Pattern matching
export const like: typeof drizzle.like = drizzle.like
export const notLike: typeof drizzle.notLike = drizzle.notLike
export const ilike: typeof drizzle.ilike = drizzle.ilike
export const notIlike: typeof drizzle.notIlike = drizzle.notIlike

// Logical
export const not: typeof drizzle.not = drizzle.not
export const and: typeof drizzle.and = drizzle.and
export const or: typeof drizzle.or = drizzle.or

// Ordering
export const asc: typeof drizzle.asc = drizzle.asc
export const desc: typeof drizzle.desc = drizzle.desc

// SQL
export const sql: typeof drizzle.sql = drizzle.sql

// Aggregates
export const count: typeof drizzle.count = drizzle.count
export const countDistinct: typeof drizzle.countDistinct = drizzle.countDistinct
export const sum: typeof drizzle.sum = drizzle.sum
export const sumDistinct: typeof drizzle.sumDistinct = drizzle.sumDistinct
export const avg: typeof drizzle.avg = drizzle.avg
export const avgDistinct: typeof drizzle.avgDistinct = drizzle.avgDistinct
export const min: typeof drizzle.min = drizzle.min
export const max: typeof drizzle.max = drizzle.max

// Re-export all types
export type * from 'drizzle-orm'
