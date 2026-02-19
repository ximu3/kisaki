/**
 * Scanner Service
 *
 * Manages media scanning from disk.
 * Provides:
 * - Namespace-style access to media-specific handlers (game)
 * - Generic entity scanning utilities shared across all media types
 */

import log from 'electron-log/main'
import type { IMediaService, ServiceInitContainer, ServiceName } from '@main/container'
import type { MediaType } from '@shared/common'
import type { ExtractionTestResult } from '@shared/scanner'
import type { IpcService } from '@main/services/ipc'
import type { DbService } from '@main/services/db'
import { GameScannerHandler } from './handlers/game'
import { ScannerPhash } from './phash'
import { extractEntityName, scanForEntities } from './utils'

// =============================================================================
// Scanner Service
// =============================================================================

export class ScannerService implements IMediaService {
  readonly id = 'scanner'
  readonly deps = ['db', 'ipc', 'scraper', 'adder'] as const satisfies readonly ServiceName[]

  game!: GameScannerHandler
  phash!: ScannerPhash
  private dbService!: DbService

  async init(container: ServiceInitContainer<this>): Promise<void> {
    this.dbService = container.get('db')
    const ipcService = container.get('ipc')
    const scraperService = container.get('scraper')
    const adderService = container.get('adder')

    this.phash = new ScannerPhash()

    // Pass scanForEntities function to handler (not entire service)
    this.game = new GameScannerHandler(
      scanForEntities,
      this.phash,
      this.dbService,
      ipcService,
      scraperService,
      adderService
    )
    this.setupIpcHandlers(ipcService)
    log.info('[ScannerService] Initialized')
  }

  private setupIpcHandlers(ipc: IpcService): void {
    ipc.on('scanner:scan-game', async (_, scannerId) => {
      await this.game.scanScanner(scannerId)
    })

    ipc.on('scanner:scan-all-game', async () => {
      await this.game.scanAllScanners()
    })

    ipc.handle('scanner:test-extraction-rules', async (_, scannerPath, entityDepth, rules) => {
      try {
        const settingsData = this.dbService.helper.getAppSettings()
        // Scan without applying rules to get original names
        const entities = await scanForEntities(scannerPath, {
          entityDepth,
          ignoredNames: settingsData.scannerIgnoredNames,
          nameExtractionRules: [] // Don't apply rules during scan
        })

        // Apply rules to each entity and build test results
        const results: ExtractionTestResult[] = entities.map((entity) => {
          const { extractedName, matchedRuleId } = extractEntityName(entity.originalBaseName, rules)
          return {
            originalName: entity.originalName,
            extractedName,
            matchedRuleId
          }
        })

        return { success: true, data: results }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })

    ipc.handle('scanner:get-active-scans', () => {
      try {
        const activeScans = this.game.getActiveScans()
        return { success: true, data: activeScans }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    })
  }

  async dispose(): Promise<void> {
    this.game.cleanup()
    log.info('[ScannerService] Disposed')
  }

  getSupportedMedia(): MediaType[] {
    return ['game']
  }
}
