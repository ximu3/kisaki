/**
 * Database Service Types
 *
 * Shared type definitions for database service modules.
 */

import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type { ExtractTablesWithRelations } from 'drizzle-orm'
import type { SQLiteTable, SQLiteTransaction } from 'drizzle-orm/sqlite-core'
import type * as schema from '@shared/db'

/** Extract column names from Drizzle table type */
export type ExtractColumns<T> =
  T extends SQLiteTable<infer Config> ? keyof Config['columns'] : never

/** Filter fields ending with 'File' */
export type FileColumns<T> = Extract<ExtractColumns<T>, `${string}File`>

/** Filter fields ending with 'Files' */
export type FilesColumns<T> = Extract<ExtractColumns<T>, `${string}Files`>

/** Thumbnail fit mode */
export type ThumbnailFit = 'cover' | 'contain' | 'fill' | 'inside' | 'outside' | 'smart'

/** Thumbnail size options */
export interface ThumbnailOptions {
  width?: number
  height?: number
  fit?: ThumbnailFit
  quality?: number
}

/**
 * Database context - either a database connection or a transaction.
 * Used for functions that can work within an existing transaction.
 */
export type DbContext =
  | BetterSQLite3Database<typeof schema>
  | SQLiteTransaction<'sync', any, typeof schema, ExtractTablesWithRelations<typeof schema>>
