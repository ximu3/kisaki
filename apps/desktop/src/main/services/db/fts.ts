/**
 * FTS Store
 *
 * Manages FTS5 virtual tables for full-text search.
 * Handles initialization, synchronization triggers, and rebuild operations.
 *
 * Design:
 * - Uses SQLite FTS5 with content table mode (no data duplication)
 * - SQLite triggers automatically sync data changes
 * - unicode61 tokenizer for CJK character support
 */

import type Database from 'better-sqlite3'
import log from 'electron-log/main'

// =============================================================================
// Types
// =============================================================================

/** Entity types that support FTS */
export type FtsEntityType = 'game' | 'character' | 'person' | 'company'

/** FTS table configuration */
interface FtsTableConfig {
  /** Source table name */
  tableName: string
  /** FTS virtual table name */
  ftsTableName: string
  /** Columns to index (must match source table column names) */
  columns: string[]
}

// =============================================================================
// Configuration
// =============================================================================

/** FTS table definitions for each entity type */
const FTS_TABLES: Record<FtsEntityType, FtsTableConfig> = {
  game: {
    tableName: 'games',
    ftsTableName: 'games_fts',
    columns: ['name', 'original_name', 'sort_name', 'description']
  },
  character: {
    tableName: 'characters',
    ftsTableName: 'characters_fts',
    columns: ['name', 'original_name', 'sort_name', 'description']
  },
  person: {
    tableName: 'persons',
    ftsTableName: 'persons_fts',
    columns: ['name', 'original_name', 'sort_name', 'description']
  },
  company: {
    tableName: 'companies',
    ftsTableName: 'companies_fts',
    columns: ['name', 'original_name', 'sort_name', 'description']
  }
}

// =============================================================================
// FtsStore
// =============================================================================

export class FtsStore {
  constructor(private sqlite: Database.Database) {}

  // ==================== Public API ====================

  /**
   * Initialize FTS tables and triggers
   * Called during DbService.init()
   */
  init(): void {
    for (const [entityType, config] of Object.entries(FTS_TABLES)) {
      const wasCreated = this.createFtsTable(config)
      this.createTriggers(config)

      // Populate FTS with existing data if table was just created
      // FTS5 content tables don't auto-sync existing rows
      if (wasCreated) {
        this.populateFromSource(config)
        log.info(`[FtsStore] Populated FTS index for ${entityType}`)
      }
    }
    log.info('[FtsStore] FTS5 tables initialized')
  }

  /**
   * Rebuild FTS index for a specific entity type
   * Use for recovery or after bulk imports
   */
  rebuild(entityType: FtsEntityType): void {
    const config = FTS_TABLES[entityType]
    if (!config) throw new Error(`Unknown entity type: ${entityType}`)

    const { tableName, ftsTableName, columns } = config
    const columnList = columns.join(', ')

    // Use transaction for atomicity
    this.sqlite.transaction(() => {
      // Delete all FTS content using special 'delete-all' command
      this.sqlite.exec(`INSERT INTO ${ftsTableName}(${ftsTableName}) VALUES('delete-all')`)

      // Repopulate from source table
      this.sqlite.exec(`
        INSERT INTO ${ftsTableName}(rowid, ${columnList})
        SELECT rowid, ${columnList} FROM ${tableName}
      `)
    })()

    log.info(`[FtsStore] Rebuilt FTS index for ${entityType}`)
  }

  /**
   * Rebuild all FTS indexes
   */
  rebuildAll(): void {
    for (const entityType of Object.keys(FTS_TABLES) as FtsEntityType[]) {
      this.rebuild(entityType)
    }
    log.info('[FtsStore] All FTS indexes rebuilt')
  }

  /**
   * Check if FTS is available for an entity type
   */
  isSupported(entityType: string): entityType is FtsEntityType {
    return entityType in FTS_TABLES
  }

  /**
   * Get FTS table name for an entity type
   */
  getFtsTableName(entityType: FtsEntityType): string {
    return FTS_TABLES[entityType].ftsTableName
  }

  /**
   * Get source table name for an entity type
   */
  getSourceTableName(entityType: FtsEntityType): string {
    return FTS_TABLES[entityType].tableName
  }

  // ==================== Private Methods ====================

  /**
   * Create FTS table if it doesn't exist
   * @returns true if table was newly created, false if it already existed
   */
  private createFtsTable(config: FtsTableConfig): boolean {
    const { tableName, ftsTableName, columns } = config
    const columnList = columns.join(', ')

    // Check if table already exists
    const exists = this.sqlite
      .prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?")
      .get(ftsTableName)

    if (exists) {
      return false
    }

    // Create FTS5 virtual table with content sync
    // - content: points to source table for contentless FTS
    // - content_rowid: use source table's rowid for syncing
    // - tokenize: unicode61 handles CJK characters well
    // - remove_diacritics: normalize accented characters
    this.sqlite.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS ${ftsTableName} USING fts5(
        ${columnList},
        content='${tableName}',
        content_rowid='rowid',
        tokenize='unicode61 remove_diacritics 2'
      )
    `)

    return true
  }

  /**
   * Populate FTS table with existing data from source table
   * Called after creating a new FTS table
   */
  private populateFromSource(config: FtsTableConfig): void {
    const { tableName, ftsTableName, columns } = config
    const columnList = columns.join(', ')

    this.sqlite.exec(`
      INSERT INTO ${ftsTableName}(rowid, ${columnList})
      SELECT rowid, ${columnList} FROM ${tableName}
    `)
  }

  private createTriggers(config: FtsTableConfig): void {
    const { tableName, ftsTableName, columns } = config
    const columnList = columns.join(', ')
    const newValues = columns.map((c) => `NEW.${c}`).join(', ')
    const oldValues = columns.map((c) => `OLD.${c}`).join(', ')

    // Insert trigger: add new row to FTS
    this.sqlite.exec(`
      CREATE TRIGGER IF NOT EXISTS ${ftsTableName}_insert
      AFTER INSERT ON ${tableName} BEGIN
        INSERT INTO ${ftsTableName}(rowid, ${columnList})
        VALUES (NEW.rowid, ${newValues});
      END
    `)

    // Update trigger: delete old, insert new
    // FTS5 requires special 'delete' command for content tables
    this.sqlite.exec(`
      CREATE TRIGGER IF NOT EXISTS ${ftsTableName}_update
      AFTER UPDATE ON ${tableName} BEGIN
        INSERT INTO ${ftsTableName}(${ftsTableName}, rowid, ${columnList})
        VALUES ('delete', OLD.rowid, ${oldValues});
        INSERT INTO ${ftsTableName}(rowid, ${columnList})
        VALUES (NEW.rowid, ${newValues});
      END
    `)

    // Delete trigger: remove from FTS
    this.sqlite.exec(`
      CREATE TRIGGER IF NOT EXISTS ${ftsTableName}_delete
      AFTER DELETE ON ${tableName} BEGIN
        INSERT INTO ${ftsTableName}(${ftsTableName}, rowid, ${columnList})
        VALUES ('delete', OLD.rowid, ${oldValues});
      END
    `)
  }
}
