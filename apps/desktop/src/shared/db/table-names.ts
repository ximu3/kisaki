/**
 * Table Names Type
 *
 * Provides type-safe SQL table names extracted from Drizzle schema.
 * This file is separate to avoid circular imports and keep schema.ts clean.
 */

import { type Table } from 'drizzle-orm'
import * as schema from './schema'

/**
 * Extract actual SQL table name from a Drizzle table object.
 * Uses Drizzle's internal `_` property which contains the table configuration.
 */
type ExtractTableName<T> = T extends Table ? T['_']['name'] : never

/**
 * Extract table names from all exports of a schema module.
 */
type ExtractTableNames<T> = {
  [K in keyof T]: ExtractTableName<T[K]>
}[keyof T]

/**
 * Union of all SQL table names in the database.
 * Automatically derived from schema exports using Drizzle's internal types.
 *
 * @example
 * // Results in: "games" | "persons" | "game_person_links" | ...
 */
export type TableName = ExtractTableNames<typeof schema>
