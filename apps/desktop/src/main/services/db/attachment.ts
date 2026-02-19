/**
 * Attachment Store
 *
 * Handles file attachment storage with mutex protection for concurrent access.
 */

import { Mutex } from 'async-mutex'
import { eq } from 'drizzle-orm'
import type { SQLiteTable } from 'drizzle-orm/sqlite-core'
import { getTableConfig } from 'drizzle-orm/sqlite-core'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { nanoid } from 'nanoid'
import { fileTypeFromBuffer } from 'file-type'
import fse from 'fs-extra'
import type { Stats } from 'node:fs'
import { open, rm } from 'node:fs/promises'
import path from 'path'
import log from 'electron-log/main'
import type { NetworkService } from '@main/services/network'
import type { ThumbnailStore } from './thumbnail'
import type { AttachmentInput, FileColumns, FilesColumns } from '@shared/db/attachment'
import * as schema from '@shared/db'

/**
 * Attachment storage manager.
 * Handles file operations with mutex protection for concurrent access.
 */
export class AttachmentStore {
  private mutexMap = new Map<string, Mutex>()
  private mutexLastUsed = new Map<string, number>()
  private cleanerInterval?: ReturnType<typeof setInterval>

  private readonly FILE_DELETE_DELAY_MS = 250
  private readonly FILE_DELETE_MAX_RETRIES = 10
  private readonly FILE_DELETE_RETRY_DELAY_MS = 100

  constructor(
    private readonly db: BetterSQLite3Database<typeof schema>,
    private readonly storageDir: string,
    private readonly thumbnailStore: ThumbnailStore,
    private readonly network: NetworkService
  ) {
    this.startMutexCleaner()
  }

  /**
   * Set a single-file attachment field (e.g. coverFile, photoFile).
   * Replaces the previous file (if any) and deletes it from disk.
   */
  async setFile<TTable extends SQLiteTable>(
    table: TTable,
    rowId: string,
    field: FileColumns<TTable>,
    input: AttachmentInput
  ): Promise<string> {
    const tableName = getTableConfig(table).name
    const lockKey = this.getRowLockKey(tableName, String(rowId))
    const mutex = this.getMutex(lockKey)

    return await mutex.runExclusive(async () => {
      try {
        const record = this.getRow(table, rowId)
        const fileDir = path.join(this.storageDir, tableName, String(rowId))

        const oldFileName = record[field as string] as string | null | undefined
        const { fileName, filePath } = await this.writeNewFile(fileDir, input)
        try {
          this.db
            .update(table)
            .set({ [field]: fileName } as any)
            .where(eq((table as any).id, rowId))
            .run()
        } catch (error) {
          await this.deleteFile(fileDir, fileName, { bestEffort: true })
          throw error
        }

        if (oldFileName && oldFileName !== fileName) {
          this.scheduleDeleteFile(fileDir, oldFileName, `setFile:${lockKey}`)
        }

        log.debug(`Saved file: ${filePath}`)
        return fileName
      } catch (error) {
        log.error(`Failed to setFile [${lockKey}]:`, error)
        throw error
      }
    })
  }

  /**
   * Clear a single-file attachment field and delete the file from disk.
   */
  async clearFile<TTable extends SQLiteTable>(
    table: TTable,
    rowId: string,
    field: FileColumns<TTable>
  ): Promise<void> {
    const tableName = getTableConfig(table).name
    const lockKey = this.getRowLockKey(tableName, String(rowId))
    const mutex = this.getMutex(lockKey)

    return await mutex.runExclusive(async () => {
      try {
        const record = this.getRow(table, rowId)
        const fileName = record[field as string] as string | null | undefined
        if (!fileName) return

        const fileDir = path.join(this.storageDir, tableName, String(rowId))
        this.db
          .update(table)
          .set({ [field]: null } as any)
          .where(eq((table as any).id, rowId))
          .run()

        this.scheduleDeleteFile(fileDir, fileName, `clearFile:${lockKey}`)
      } catch (error) {
        log.error(`Failed to clearFile [${lockKey}]:`, error)
        throw error
      }
    })
  }

  /**
   * Add a file to an array attachment field (e.g. descriptionInlineFiles).
   * Returns the generated fileName.
   */
  async addFile<TTable extends SQLiteTable>(
    table: TTable,
    rowId: string,
    field: FilesColumns<TTable>,
    input: AttachmentInput
  ): Promise<string> {
    const tableName = getTableConfig(table).name
    const lockKey = this.getRowLockKey(tableName, String(rowId))
    const mutex = this.getMutex(lockKey)

    return await mutex.runExclusive(async () => {
      try {
        const record = this.getRow(table, rowId)
        const fileDir = path.join(this.storageDir, tableName, String(rowId))

        const { fileName, filePath } = await this.writeNewFile(fileDir, input)
        const current = this.coerceStringArray(record[field as string])
        const updated = [...current, fileName]

        this.db
          .update(table)
          .set({ [field]: updated } as any)
          .where(eq((table as any).id, rowId))
          .run()

        log.debug(`Added file: ${filePath}`)
        return fileName
      } catch (error) {
        log.error(`Failed to addFile [${lockKey}]:`, error)
        throw error
      }
    })
  }

  /**
   * Remove all occurrences of a fileName from an array attachment field
   * and delete the file from disk.
   */
  async removeFile<TTable extends SQLiteTable>(
    table: TTable,
    rowId: string,
    field: FilesColumns<TTable>,
    fileName: string
  ): Promise<void> {
    const tableName = getTableConfig(table).name
    const lockKey = this.getRowLockKey(tableName, String(rowId))
    const mutex = this.getMutex(lockKey)

    return await mutex.runExclusive(async () => {
      try {
        const record = this.getRow(table, rowId)
        const current = this.coerceStringArray(record[field as string])
        const updated = current.filter((f) => f !== fileName)
        if (updated.length === current.length) return

        const fileDir = path.join(this.storageDir, tableName, String(rowId))
        this.db
          .update(table)
          .set({ [field]: updated } as any)
          .where(eq((table as any).id, rowId))
          .run()

        this.scheduleDeleteFile(fileDir, fileName, `removeFile:${lockKey}`)
      } catch (error) {
        log.error(`Failed to removeFile [${lockKey}]:`, error)
        throw error
      }
    })
  }

  /**
   * List files from an array attachment field.
   */
  async listFiles<TTable extends SQLiteTable>(
    table: TTable,
    rowId: string,
    field: FilesColumns<TTable>
  ): Promise<string[]> {
    const tableName = getTableConfig(table).name
    const lockKey = this.getRowLockKey(tableName, String(rowId))
    const mutex = this.getMutex(lockKey)

    return await mutex.runExclusive(async () => {
      const record = this.getRow(table, rowId)
      return this.coerceStringArray(record[field as string])
    })
  }

  /**
   * Clear an array attachment field and delete all files from disk.
   */
  async clearFiles<TTable extends SQLiteTable>(
    table: TTable,
    rowId: string,
    field: FilesColumns<TTable>
  ): Promise<void> {
    const tableName = getTableConfig(table).name
    const lockKey = this.getRowLockKey(tableName, String(rowId))
    const mutex = this.getMutex(lockKey)

    return await mutex.runExclusive(async () => {
      try {
        const record = this.getRow(table, rowId)
        const fileDir = path.join(this.storageDir, tableName, String(rowId))
        const current = this.coerceStringArray(record[field as string])

        this.db
          .update(table)
          .set({ [field]: [] } as any)
          .where(eq((table as any).id, rowId))
          .run()

        for (const fileName of current) {
          this.scheduleDeleteFile(fileDir, fileName, `clearFiles:${lockKey}`)
        }
      } catch (error) {
        log.error(`Failed to clearFiles [${lockKey}]:`, error)
        throw error
      }
    })
  }

  /**
   * Cleanup storage directory for a deleted row.
   * Intended to be called from db:deleted event listeners.
   */
  async cleanupRow(tableName: string, rowId: string): Promise<void> {
    const lockKey = this.getRowLockKey(tableName, String(rowId))
    const mutex = this.getMutex(lockKey)

    return await mutex.runExclusive(async () => {
      const fileDir = path.join(this.storageDir, tableName, String(rowId))
      if (!(await fse.pathExists(fileDir))) return

      try {
        await fse.remove(fileDir)
        log.debug(`[AttachmentStore] Cleaned row dir: ${fileDir}`)
      } catch (error) {
        log.warn(`[AttachmentStore] Failed to cleanup row dir: ${fileDir}`, error)
      }
    })
  }

  /**
   * Get absolute path to attachment file.
   */
  getPath(tableName: string, rowId: string, fileName: string): string {
    return path.join(this.storageDir, tableName, rowId, fileName)
  }

  /**
   * Cleanup resources.
   */
  dispose(): void {
    if (this.cleanerInterval) {
      clearInterval(this.cleanerInterval)
    }
    this.mutexMap.clear()
    this.mutexLastUsed.clear()
  }

  private getMutex(key: string): Mutex {
    if (!this.mutexMap.has(key)) {
      this.mutexMap.set(key, new Mutex())
    }
    this.mutexLastUsed.set(key, Date.now())
    return this.mutexMap.get(key)!
  }

  private getRowLockKey(tableName: string, rowId: string): string {
    return `${tableName}:${rowId}`
  }

  private startMutexCleaner(): void {
    const CLEANUP_INTERVAL = 60 * 60 * 1000 // 1 hour
    const MAX_IDLE_TIME = 30 * 60 * 1000 // 30 minutes

    this.cleanerInterval = setInterval(() => {
      const now = Date.now()
      const keysToDelete: string[] = []

      this.mutexLastUsed.forEach((lastUsed, key) => {
        if (now - lastUsed > MAX_IDLE_TIME) {
          const mutex = this.mutexMap.get(key)
          if (mutex && !mutex.isLocked()) {
            keysToDelete.push(key)
          }
        }
      })

      keysToDelete.forEach((key) => {
        this.mutexMap.delete(key)
        this.mutexLastUsed.delete(key)
      })

      if (keysToDelete.length > 0) {
        log.debug(`[AttachmentStore] Cleaned up ${keysToDelete.length} unused mutexes`)
      }
    }, CLEANUP_INTERVAL)
  }

  private getRow<TTable extends SQLiteTable>(
    table: TTable,
    rowId: string
  ): Record<string, unknown> {
    const record = this.db
      .select()
      .from(table)
      .where(eq((table as any).id, rowId))
      .get()

    if (!record) {
      throw new Error(`Row not found: ${getTableConfig(table).name}:${rowId}`)
    }
    return record as unknown as Record<string, unknown>
  }

  private async writeNewFile(
    fileDir: string,
    input: AttachmentInput
  ): Promise<{ fileName: string; filePath: string }> {
    await fse.ensureDir(fileDir)

    switch (input.kind) {
      case 'buffer': {
        const fileBuffer = Buffer.from(input.buffer)
        const fileName = await this.createFileName(fileBuffer, this.getExtHint(input))
        const filePath = path.join(fileDir, fileName)
        await fse.writeFile(filePath, fileBuffer)
        return { fileName, filePath }
      }
      case 'path': {
        const sourcePath = input.path
        if (!path.isAbsolute(sourcePath)) {
          throw new Error(`Attachment path must be absolute: ${sourcePath}`)
        }

        let stats: Stats
        try {
          stats = await fse.stat(sourcePath)
        } catch {
          throw new Error(`Attachment path not found: ${sourcePath}`)
        }

        if (!stats.isFile()) {
          throw new Error(`Attachment path is not a file: ${sourcePath}`)
        }

        const header = await this.readFileHeader(sourcePath)
        const fileName = await this.createFileName(header, this.getExtHint(input))
        const filePath = path.join(fileDir, fileName)

        await fse.copy(sourcePath, filePath)
        return { fileName, filePath }
      }
      case 'url': {
        const fileId = nanoid()
        const tempPath = path.join(fileDir, `${fileId}.tmp`)

        try {
          await this.network.downloadToFile(input.url, tempPath)
          const header = await this.readFileHeader(tempPath)
          const fileName = await this.createFileNameWithId(fileId, header, this.getExtHint(input))
          const filePath = path.join(fileDir, fileName)

          await fse.move(tempPath, filePath, { overwrite: true })
          return { fileName, filePath }
        } catch (error) {
          try {
            await fse.remove(tempPath)
          } catch {
            // ignore cleanup errors
          }
          throw error
        }
      }
    }
  }

  private getExtHint(input: AttachmentInput): string | undefined {
    let ext = ''
    if (input.kind === 'path') {
      ext = path.extname(input.path)
    } else if (input.kind === 'url') {
      try {
        const url = new URL(input.url)
        ext = path.posix.extname(url.pathname)
      } catch {
        ext = ''
      }
    }

    if (!ext) return undefined
    if (!/^\.[a-z0-9]{1,10}$/i.test(ext)) return undefined
    return ext
  }

  private async createFileName(fileHeader: Buffer, extHint?: string): Promise<string> {
    return await this.createFileNameWithId(nanoid(), fileHeader, extHint)
  }

  private async createFileNameWithId(
    fileId: string,
    fileHeader: Buffer,
    extHint?: string
  ): Promise<string> {
    const ext = await this.detectExt(fileHeader, extHint)
    return `${fileId}${ext}`
  }

  private async detectExt(fileHeader: Buffer, extHint?: string): Promise<string> {
    const fileType = await fileTypeFromBuffer(fileHeader)
    return fileType?.ext ? `.${fileType.ext}` : (extHint ?? '')
  }

  private async readFileHeader(filePath: string, maxBytes = 4100): Promise<Buffer> {
    const handle = await open(filePath, 'r')
    try {
      const buffer = Buffer.alloc(maxBytes)
      const { bytesRead } = await handle.read(buffer, 0, maxBytes, 0)
      return buffer.subarray(0, bytesRead)
    } finally {
      await handle.close()
    }
  }

  private scheduleDeleteFile(fileDir: string, fileName: string, reason: string): void {
    setTimeout(() => {
      this.deleteFile(fileDir, fileName, {
        bestEffort: true,
        maxRetries: this.FILE_DELETE_MAX_RETRIES,
        retryDelayMs: this.FILE_DELETE_RETRY_DELAY_MS
      }).catch((error) => {
        log.warn(`[AttachmentStore] Failed to delete file (scheduled) [${reason}]`, error)
      })
    }, this.FILE_DELETE_DELAY_MS)
  }

  private async deleteFile(
    fileDir: string,
    fileName: string,
    options?: { bestEffort?: boolean; maxRetries?: number; retryDelayMs?: number }
  ): Promise<boolean> {
    this.assertSafeFileName(fileName)
    const filePath = path.join(fileDir, fileName)

    const maxRetries = options?.maxRetries ?? 0
    const retryDelay = options?.retryDelayMs ?? 0
    const bestEffort = options?.bestEffort ?? false

    const existed = await fse.pathExists(filePath)
    if (!existed) return false

    try {
      await rm(filePath, { force: true, maxRetries, retryDelay })
      log.debug(`Deleted file: ${filePath}`)
    } catch (error) {
      if (!bestEffort) throw error
      log.warn(`[AttachmentStore] Failed to delete file: ${filePath}`, error)
      return false
    }

    await this.thumbnailStore.delete(filePath, fileDir)
    return true
  }

  private assertSafeFileName(fileName: string): void {
    if (fileName !== path.basename(fileName) || fileName.includes('/') || fileName.includes('\\')) {
      throw new Error(`Invalid fileName: ${fileName}`)
    }
  }

  private coerceStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return []
    return value.filter((v) => typeof v === 'string') as string[]
  }
}
