/**
 * DB attachment shared types
 *
 * Shared between main (DbService.attachment) and renderer (IPC client).
 * Contains only pure types / serializable inputs.
 */

import type { SQLiteTable } from 'drizzle-orm/sqlite-core'

export type AttachmentInput =
  | { kind: 'buffer'; buffer: Uint8Array }
  | { kind: 'url'; url: string }
  | { kind: 'path'; path: string }

/** Extract column names from Drizzle table type */
export type ExtractColumns<T> =
  T extends SQLiteTable<infer Config> ? keyof Config['columns'] : never

/** Filter fields ending with 'File' */
export type FileColumns<T> = Extract<ExtractColumns<T>, `${string}File`>

/** Filter fields ending with 'Files' */
export type FilesColumns<T> = Extract<ExtractColumns<T>, `${string}Files`>
