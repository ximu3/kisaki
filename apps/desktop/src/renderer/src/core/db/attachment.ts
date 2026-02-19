/**
 * DB Attachment Client (renderer)
 *
 * Mirrors DbService.attachment (AttachmentStore) via IPC.
 */

import { ipcManager } from '../ipc'
import type { AttachmentInput, FileColumns, FilesColumns } from '@shared/db/attachment'
import type { TableName } from '@shared/db/table-names'
import type { SQLiteTable } from 'drizzle-orm/sqlite-core'
import { getTableConfig } from 'drizzle-orm/sqlite-core'

function toTableName(table: SQLiteTable): TableName {
  return getTableConfig(table).name as TableName
}

export const attachment = {
  async setFile<TTable extends SQLiteTable>(
    table: TTable,
    rowId: string,
    field: FileColumns<TTable>,
    input: AttachmentInput
  ): Promise<string> {
    const result = await ipcManager.invoke(
      'db:attachment-set-file',
      toTableName(table),
      rowId,
      field as string,
      input
    )
    if (!result.success) throw new Error(result.error)
    return result.data
  },

  async clearFile<TTable extends SQLiteTable>(
    table: TTable,
    rowId: string,
    field: FileColumns<TTable>
  ): Promise<void> {
    const result = await ipcManager.invoke(
      'db:attachment-clear-file',
      toTableName(table),
      rowId,
      field as string
    )
    if (!result.success) throw new Error(result.error)
  },

  async addFile<TTable extends SQLiteTable>(
    table: TTable,
    rowId: string,
    field: FilesColumns<TTable>,
    input: AttachmentInput
  ): Promise<string> {
    const result = await ipcManager.invoke(
      'db:attachment-add-file',
      toTableName(table),
      rowId,
      field as string,
      input
    )
    if (!result.success) throw new Error(result.error)
    return result.data
  },

  async removeFile<TTable extends SQLiteTable>(
    table: TTable,
    rowId: string,
    field: FilesColumns<TTable>,
    fileName: string
  ): Promise<void> {
    const result = await ipcManager.invoke(
      'db:attachment-remove-file',
      toTableName(table),
      rowId,
      field as string,
      fileName
    )
    if (!result.success) throw new Error(result.error)
  },

  async listFiles<TTable extends SQLiteTable>(
    table: TTable,
    rowId: string,
    field: FilesColumns<TTable>
  ): Promise<string[]> {
    const result = await ipcManager.invoke(
      'db:attachment-list-files',
      toTableName(table),
      rowId,
      field as string
    )
    if (!result.success) throw new Error(result.error)
    return result.data
  },

  async clearFiles<TTable extends SQLiteTable>(
    table: TTable,
    rowId: string,
    field: FilesColumns<TTable>
  ): Promise<void> {
    const result = await ipcManager.invoke(
      'db:attachment-clear-files',
      toTableName(table),
      rowId,
      field as string
    )
    if (!result.success) throw new Error(result.error)
  },

  async cleanupRow(tableName: TableName, rowId: string): Promise<void> {
    const result = await ipcManager.invoke('db:attachment-cleanup-row', tableName, rowId)
    if (!result.success) throw new Error(result.error)
  },

  async getPath(tableName: TableName, rowId: string, fileName: string): Promise<string> {
    const result = await ipcManager.invoke('db:attachment-get-path', tableName, rowId, fileName)
    if (!result.success) throw new Error(result.error)
    return result.data
  }
} as const
