/**
 * SQLite Trigger Store
 *
 * Automatically emits db:inserted/updated/deleted events via SQLite triggers.
 * Uses better-sqlite3's custom function registration to bridge SQL triggers
 * with the JavaScript event system.
 *
 * Table names are automatically inferred from the Drizzle schema.
 */

import type Database from 'better-sqlite3'
import { getTableName, is } from 'drizzle-orm'
import { SQLiteTable } from 'drizzle-orm/sqlite-core'
import log from 'electron-log/main'
import type { EventService } from '@main/services/event'
import * as schema from '@shared/db'
import type { TableName } from '@shared/db/table-names'

/**
 * Extract all table names from Drizzle schema.
 * This iterates over all exports and finds SQLiteTable instances.
 */
function getTrackedTables(): string[] {
  const tables: string[] = []
  for (const value of Object.values(schema)) {
    if (is(value, SQLiteTable)) {
      tables.push(getTableName(value))
    }
  }
  return tables
}

export class TriggerStore {
  private trackedTables: string[]

  constructor(
    private sqlite: Database.Database,
    private event: EventService
  ) {
    this.trackedTables = getTrackedTables()
  }

  init(): void {
    this.registerEmitFunction()
    this.createTriggers()
    log.info('[TriggerStore] Initialized with triggers for', this.trackedTables.length, 'tables')
  }

  /**
   * Register the emit_db_change function that triggers can call.
   * This bridges SQLite triggers with the JavaScript event system.
   */
  private registerEmitFunction(): void {
    this.sqlite.function('emit_db_change', { deterministic: false }, (operation, table, id) => {
      const eventName = `db:${operation}` as 'db:inserted' | 'db:updated' | 'db:deleted'
      // Defer event emission until the current SQL statement completes.
      // This prevents "connection is busy" errors when listeners try to access the DB.
      queueMicrotask(() => {
        this.event.emit(eventName, { table: table as TableName, id: id as string })
      })
    })
  }

  /**
   * Create INSERT/UPDATE/DELETE triggers for all tracked tables.
   */
  private createTriggers(): void {
    for (const table of this.trackedTables) {
      this.createTriggersForTable(table)
    }
  }

  /**
   * Create all three triggers for a specific table.
   */
  private createTriggersForTable(table: string): void {
    const idColumn = 'id'

    // Drop existing triggers first (for idempotent initialization)
    this.sqlite.exec(`DROP TRIGGER IF EXISTS ${table}_after_insert`)
    this.sqlite.exec(`DROP TRIGGER IF EXISTS ${table}_after_update`)
    this.sqlite.exec(`DROP TRIGGER IF EXISTS ${table}_after_delete`)

    // Create AFTER INSERT trigger
    this.sqlite.exec(`
      CREATE TRIGGER ${table}_after_insert AFTER INSERT ON ${table}
      BEGIN
        SELECT emit_db_change('inserted', '${table}', NEW.${idColumn});
      END
    `)

    // Create AFTER UPDATE trigger
    this.sqlite.exec(`
      CREATE TRIGGER ${table}_after_update AFTER UPDATE ON ${table}
      BEGIN
        SELECT emit_db_change('updated', '${table}', NEW.${idColumn});
      END
    `)

    // Create AFTER DELETE trigger
    this.sqlite.exec(`
      CREATE TRIGGER ${table}_after_delete AFTER DELETE ON ${table}
      BEGIN
        SELECT emit_db_change('deleted', '${table}', OLD.${idColumn});
      END
    `)
  }
}
