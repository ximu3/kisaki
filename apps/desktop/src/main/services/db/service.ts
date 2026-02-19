/**
 * Database Service
 *
 * Unified database service that provides:
 * - Database connection and lifecycle management
 * - Query helpers for finding existing entities
 * - Attachment storage (via attachment sub-store)
 * - Thumbnail generation (via thumbnail sub-store)
 */

import Database from 'better-sqlite3'
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { protocol, net } from 'electron'
import { pathToFileURL } from 'url'
import fse from 'fs-extra'
import { app } from 'electron'
import path from 'path'
import log from 'electron-log/main'
import { getTableName, is } from 'drizzle-orm'
import { SQLiteTable } from 'drizzle-orm/sqlite-core'
import * as schema from '@shared/db'
import { settings } from '@shared/db'
import type { AttachmentInput } from '@shared/db/attachment'
import type { TableName } from '@shared/db/table-names'
import type { IService, ServiceInitContainer, ServiceName } from '@main/container'
import type { IpcService } from '@main/services/ipc'
import { AttachmentStore } from './attachment'
import { ThumbnailStore } from './thumbnail'
import { HelperStore } from './helper'
import { FtsStore } from './fts'
import { TriggerStore } from './trigger'

// Re-export types
export type { ThumbnailOptions, ThumbnailFit, FileColumns, FilesColumns } from './types'

/** Image extensions that support thumbnails */
const THUMBNAIL_SUPPORTED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.avif',
  '.tiff',
  '.tif'
])

function getSchemaTableByName(tableName: TableName): SQLiteTable {
  for (const value of Object.values(schema)) {
    if (is(value, SQLiteTable) && getTableName(value) === tableName) {
      return value
    }
  }
  throw new Error(`Unknown table: ${tableName}`)
}

export class DbService implements IService {
  readonly id = 'db'
  readonly deps = ['event', 'ipc', 'network'] as const satisfies readonly ServiceName[]

  // Database infrastructure
  sqlite!: Database.Database
  db!: BetterSQLite3Database<typeof schema>
  dbPath!: string
  storageDir!: string

  // Sub-stores (namespace-style API)
  attachment!: AttachmentStore
  thumbnail!: ThumbnailStore
  helper!: HelperStore
  fts!: FtsStore
  trigger!: TriggerStore

  // ==================== Lifecycle ====================

  async init(container: ServiceInitContainer<this>): Promise<void> {
    this.dbPath = path.join(app.getPath('userData'), 'database/kisaki.db')
    this.storageDir = path.join(app.getPath('userData'), 'database/storage')

    await fse.mkdir(path.dirname(this.dbPath), { recursive: true })
    await fse.mkdir(this.storageDir, { recursive: true })

    this.sqlite = new Database(this.dbPath)
    this.sqlite.pragma('journal_mode = WAL')
    this.db = drizzle(this.sqlite, { schema })

    // Run migrations
    migrate(this.db, { migrationsFolder: path.join(__dirname, '../../drizzle') })

    // Initialize SQLite triggers for automatic event emission
    // IMPORTANT: Must register emit_db_change function BEFORE any DB writes
    // because triggers persist in SQLite and may already exist from previous runs
    const event = container.get('event')
    this.trigger = new TriggerStore(this.sqlite, event)
    this.trigger.init()

    // Initialize settings singleton table (after triggers are set up)
    this.db.insert(settings).values({ id: 0 }).onConflictDoNothing().run()

    const network = container.get('network')

    // Initialize sub-stores
    this.thumbnail = new ThumbnailStore()
    this.attachment = new AttachmentStore(this.db, this.storageDir, this.thumbnail, network)
    this.helper = new HelperStore(this.db)
    this.fts = new FtsStore(this.sqlite)

    // Initialize FTS5 tables and triggers
    this.fts.init()

    // Cleanup attachment storage on row deletion (applies to all tables)
    event.on('db:deleted', ({ table, id }) => {
      this.attachment.cleanupRow(table, id).catch((error) => {
        log.warn(`[DbService] Failed to cleanup attachment storage for ${table}:${id}`, error)
      })
    })

    // Setup attachment:// protocol handler
    this.setupAttachmentProtocol()

    // Register IPC handlers
    const ipc = container.get('ipc')
    this.setupIpcHandlers(ipc)

    log.info(`[DbService] Database initialized at ${this.dbPath}`)
  }

  private setupIpcHandlers(ipc: IpcService): void {
    ipc.handle('db:execute', async (_, sqlstr, params, method) => {
      try {
        const data = this.execute(sqlstr, params, method)
        return { success: true, data }
      } catch (error) {
        log.error('[DbService] Error executing DB command:', error, 'SQL:', sqlstr)
        return { success: false, error: String(error) }
      }
    })

    ipc.handle('db:rebuild-fts', async (_, entityType) => {
      try {
        if (entityType) {
          this.fts.rebuild(entityType)
        } else {
          this.fts.rebuildAll()
        }
        return { success: true }
      } catch (error) {
        log.error('[DbService] Error rebuilding FTS:', error)
        return { success: false, error: String(error) }
      }
    })

    ipc.handle(
      'db:attachment-set-file',
      async (_, tableName, rowId, field, input: AttachmentInput) => {
        try {
          // NOTE: `field` is intentionally `string` at IPC boundary.
          // Renderer client is table-aware (FileColumns/FilesColumns) and provides exact typing.
          const table = getSchemaTableByName(tableName as TableName)
          const data = await (this.attachment as any).setFile(table, rowId, field, input)
          return { success: true, data }
        } catch (error) {
          return { success: false, error: (error as Error).message }
        }
      }
    )

    ipc.handle('db:attachment-clear-file', async (_, tableName, rowId, field) => {
      try {
        const table = getSchemaTableByName(tableName as TableName)
        await (this.attachment as any).clearFile(table, rowId, field)
        return { success: true }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    ipc.handle(
      'db:attachment-add-file',
      async (_, tableName, rowId, field, input: AttachmentInput) => {
        try {
          const table = getSchemaTableByName(tableName as TableName)
          const data = await (this.attachment as any).addFile(table, rowId, field, input)
          return { success: true, data }
        } catch (error) {
          return { success: false, error: (error as Error).message }
        }
      }
    )

    ipc.handle(
      'db:attachment-remove-file',
      async (_, tableName, rowId, field, fileName: string) => {
        try {
          const table = getSchemaTableByName(tableName as TableName)
          await (this.attachment as any).removeFile(table, rowId, field, fileName)
          return { success: true }
        } catch (error) {
          return { success: false, error: (error as Error).message }
        }
      }
    )

    ipc.handle('db:attachment-list-files', async (_, tableName, rowId, field) => {
      try {
        const table = getSchemaTableByName(tableName as TableName)
        const data = await (this.attachment as any).listFiles(table, rowId, field)
        return { success: true, data }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    ipc.handle('db:attachment-clear-files', async (_, tableName, rowId, field) => {
      try {
        const table = getSchemaTableByName(tableName as TableName)
        await (this.attachment as any).clearFiles(table, rowId, field)
        return { success: true }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    ipc.handle('db:attachment-cleanup-row', async (_, tableName, rowId) => {
      try {
        await this.attachment.cleanupRow(tableName as string, rowId)
        return { success: true }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    ipc.handle('db:attachment-get-path', async (_, tableName, rowId, fileName) => {
      try {
        const data = this.attachment.getPath(tableName as string, rowId, fileName)
        return { success: true, data }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })
  }

  private setupAttachmentProtocol(): void {
    protocol.handle('attachment', async (request) => {
      try {
        // Parse URL: attachment://tableName/rowId/fileName?w=240&h=320
        const url = new URL(request.url)
        const tableName = url.hostname
        const pathParts = url.pathname.split('/').filter(Boolean)

        if (pathParts.length < 2) {
          return new Response('Invalid attachment path', { status: 400 })
        }

        const rowId = pathParts[0]
        const fileName = pathParts.slice(1).join('/')

        // Build file path
        const fileDir = path.join(this.storageDir, tableName, rowId)
        const filePath = path.join(fileDir, fileName)

        if (!(await fse.pathExists(filePath))) {
          return new Response('Attachment not found', { status: 404 })
        }

        // Check for thumbnail request
        const thumbnailOptions = this.thumbnail.parseOptions(url.searchParams)
        const fileExt = path.extname(fileName).toLowerCase()

        if (thumbnailOptions && THUMBNAIL_SUPPORTED_EXTENSIONS.has(fileExt)) {
          try {
            const thumbnailPath = await this.thumbnail.getOrCreate(
              filePath,
              fileDir,
              thumbnailOptions
            )
            const thumbnailUrl = pathToFileURL(thumbnailPath).toString()
            return await net.fetch(thumbnailUrl)
          } catch (error) {
            console.error('Thumbnail generation failed, falling back to original:', error)
          }
        }

        const fileUrl = pathToFileURL(filePath).toString()
        return await net.fetch(fileUrl)
      } catch (error) {
        console.error('Attachment protocol error:', error)
        return new Response('Failed to load attachment', { status: 500 })
      }
    })
  }

  async dispose(): Promise<void> {
    this.attachment?.dispose()
    this.thumbnail?.dispose()
    if (this.sqlite) {
      this.sqlite.close()
      log.info('[DbService] Database connection closed')
    }
  }

  // ==================== Raw SQL Execution ====================

  execute(sqlstr: string, params: unknown[], method: 'run' | 'all' | 'values' | 'get') {
    const stmt = this.sqlite.prepare(sqlstr)
    type StatementMethod = (typeof stmt)['run'] | (typeof stmt)['all'] | (typeof stmt)['get']
    const fn = stmt[method as keyof typeof stmt] as StatementMethod
    const ret = fn.call(stmt, ...params)
    return this.toDrizzleResult(ret, method, stmt)
  }

  private toDrizzleResult(
    ret: any,
    method: 'run' | 'all' | 'values' | 'get',
    stmt: Database.Statement
  ) {
    if (method === 'run') return ret
    if (method === 'get') {
      if (ret === undefined) return []
      const columns = stmt.columns().map((c) => c.name)
      return columns.map((col) => ret[col])
    }
    if (Array.isArray(ret)) {
      if (ret.length === 0) return []
      const columns = stmt.columns().map((c) => c.name)
      return ret.map((row) => columns.map((col) => row[col]))
    }
    return ret
  }
}
