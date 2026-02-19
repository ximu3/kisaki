/**
 * Game Monitor Handler
 *
 * Uses @ximu3/process-list for process detection and foreground tracking.
 * Monitors game processes and records foreground playtime.
 *
 * Features:
 * - Process start/exit detection (polling-based)
 * - Window focus/blur tracking (via isForeground field)
 * - Foreground time recording
 * - Three monitoring modes: file, folder, process name
 */

import { getProcesses, type ProcessInfo } from '@ximu3/process-list'
import log from 'electron-log/main'
import { Game, gameSessions } from '@shared/db'
import type { GameRunningStatus } from '@shared/monitor'
import type { DbService } from '@main/services/db'
import { games } from '@shared/db'
import { eq, sql } from 'drizzle-orm'
import { normalize, dirname, basename } from 'path'
import type { IpcService } from '@main/services/ipc'
import type { EventService } from '@main/services/event'
import type { GameAttachmentHandler } from '@main/services/attachment/handlers/game'

/**
 * Game monitor info
 */
interface MonitorInfo {
  game: Game
  isRunning: boolean
  isForeground: boolean
  currentPid?: number
  currentProcessName?: string
  currentExePath?: string
  sessionStartTime?: number
  foregroundStartTime?: number
  backgroundTimer?: NodeJS.Timeout
}

/**
 * Game monitor handler
 */
export class GameMonitorHandler {
  private monitors: Map<string, MonitorInfo> = new Map()
  private pollingTimer?: NodeJS.Timeout
  private readonly POLLING_INTERVAL = 1000 // 1s polling interval
  private readonly BACKGROUND_BUFFER_TIME = 60000 // 60s background buffer time

  constructor(
    private dbService: DbService,
    private ipcService: IpcService,
    private eventService: EventService,
    private gameAttachment: GameAttachmentHandler
  ) {
    log.info('[Monitor] GameMonitorHandler initialized')
  }

  /**
   * Configuration input for computing effective monitor path.
   * Used by both internal methods and IPC handler.
   */
  static computeEffectiveMonitorPath(config: {
    monitorPath: string | null
    monitorMode: 'folder' | 'file' | 'process'
    gameDirPath: string | null
    launcherMode: 'file' | 'url' | 'exec'
    launcherPath: string | null
  }): string | null {
    // User explicitly set a value - use it
    if (config.monitorPath) {
      return config.monitorPath
    }

    // Derive based on mode
    switch (config.monitorMode) {
      case 'folder':
        // Fallback: gameDirPath -> dirname(launcherPath)
        return config.gameDirPath || (config.launcherPath ? dirname(config.launcherPath) : null)

      case 'file':
        // Only derive if launcher mode is also file
        return config.launcherMode === 'file' ? config.launcherPath : null

      case 'process':
        // Extract filename from launcher path
        return config.launcherPath ? basename(config.launcherPath) : null

      default:
        return null
    }
  }

  /**
   * Start monitoring a game
   */
  async startMonitoring(gameId: string): Promise<void> {
    // Check if already monitoring
    const existingInfo = this.monitors.get(gameId)
    if (existingInfo) {
      // If game is actively running, don't restart monitoring
      if (existingInfo.isRunning) {
        return
      }
      // Otherwise, clean up stale monitor entry
      log.info(`[Monitor] Cleaning up stale monitor entry for game: ${gameId}`)
      if (existingInfo.backgroundTimer) {
        clearTimeout(existingInfo.backgroundTimer)
      }
      this.monitors.delete(gameId)
    }

    // Query game info (sync for better-sqlite3)
    const gameList = this.dbService.db
      .select()
      .from(games)
      .where(eq(games.id, gameId))
      .limit(1)
      .all()
    const game = gameList[0]

    if (!game) {
      throw new Error('Game not found')
    }

    // Compute effective monitor path with fallback chain
    const effectiveMonitorPath = GameMonitorHandler.computeEffectiveMonitorPath(game)
    if (!effectiveMonitorPath) {
      throw new Error('Cannot determine monitor path: no valid configuration found')
    }

    // Create monitor info with computed path
    const monitorInfo: MonitorInfo = {
      game: { ...game, monitorPath: effectiveMonitorPath },
      isRunning: false,
      isForeground: false
    }

    this.monitors.set(gameId, monitorInfo)

    log.info(`[Monitor] Started monitoring game: ${game.name} (${gameId})`)
    log.info(`[Monitor] Target: ${game.monitorMode} -> ${effectiveMonitorPath}`)

    // Start global polling timer if not already running
    this.ensurePollingRunning()
  }

  /**
   * Stop monitoring a game
   */
  async stopMonitoring(gameId: string): Promise<void> {
    const info = this.monitors.get(gameId)
    if (!info) {
      return
    }

    // If game is running, save final time record
    if (info.isRunning) {
      await this.handleGameStop(gameId)
    }

    // Clear background buffer timer
    if (info.backgroundTimer) {
      clearTimeout(info.backgroundTimer)
    }

    this.monitors.delete(gameId)

    log.info(`[Monitor] Stopped monitoring game: ${gameId}`)

    // Stop polling if no more games are being monitored
    this.stopPollingIfEmpty()
  }

  /**
   * Get status of all monitored games
   */
  getMonitoringStatus(): GameRunningStatus[] {
    const statuses: GameRunningStatus[] = []

    for (const [gameId, info] of this.monitors.entries()) {
      statuses.push({
        gameId,
        isRunning: info.isRunning,
        isForeground: info.isForeground,
        processName: info.currentProcessName,
        pid: info.currentPid,
        exePath: info.currentExePath,
        startTime: info.sessionStartTime
      })
    }

    return statuses
  }

  /**
   * Get status of a specific game
   */
  getGameStatus(gameId: string): GameRunningStatus | null {
    const info = this.monitors.get(gameId)
    if (!info) {
      return null
    }

    return {
      gameId,
      isRunning: info.isRunning,
      isForeground: info.isForeground,
      processName: info.currentProcessName,
      pid: info.currentPid,
      exePath: info.currentExePath,
      startTime: info.sessionStartTime
    }
  }

  /**
   * Cleanup all monitors
   */
  async cleanup(): Promise<void> {
    const gameIds = Array.from(this.monitors.keys())
    for (const gameId of gameIds) {
      await this.stopMonitoring(gameId)
    }

    if (this.pollingTimer) {
      clearInterval(this.pollingTimer)
      this.pollingTimer = undefined
    }

    log.info('[Monitor] GameMonitorHandler cleaned up')
  }

  /**
   * Ensure global polling timer is running
   */
  private ensurePollingRunning(): void {
    if (this.pollingTimer) {
      return
    }

    this.pollingTimer = setInterval(() => {
      this.pollAllGames().catch((err) => {
        log.error('[Monitor] Polling error:', err)
      })
    }, this.POLLING_INTERVAL)

    log.info(`[Monitor] Polling started (interval: ${this.POLLING_INTERVAL}ms)`)
  }

  /**
   * Stop polling if no games are being monitored
   */
  private stopPollingIfEmpty(): void {
    if (this.monitors.size === 0 && this.pollingTimer) {
      clearInterval(this.pollingTimer)
      this.pollingTimer = undefined
      log.info('[Monitor] Polling stopped (no games to monitor)')
    }
  }

  /**
   * Poll all games for process status
   */
  private async pollAllGames(): Promise<void> {
    if (this.monitors.size === 0) {
      return
    }

    // Get all running processes with isForeground info
    const allProcesses = getProcesses()

    // Check each monitored game
    for (const [gameId, info] of this.monitors.entries()) {
      const matchingProcess = this.findMatchingProcess(allProcesses, info.game)
      const wasRunning = info.isRunning
      const isRunning = matchingProcess !== undefined

      // Handle process start/exit
      if (!wasRunning && isRunning) {
        await this.handleGameStart(gameId, matchingProcess)
      } else if (wasRunning && !isRunning) {
        await this.handleGameStop(gameId)
      }

      // Handle focus/blur (only when game is running)
      if (isRunning && matchingProcess) {
        const isForeground = matchingProcess.isForeground
        const wasForeground = info.isForeground

        if (!wasForeground && isForeground) {
          this.handleForegroundChange(gameId, true)
        } else if (wasForeground && !isForeground) {
          this.handleForegroundChange(gameId, false)
        } else if (isForeground && info.backgroundTimer) {
          // Cancel pending background timer when foreground detected during pending period
          this.handleForegroundChange(gameId, true)
        }
      }
    }
  }

  /**
   * Find a matching process for the game
   */
  private findMatchingProcess(processes: ProcessInfo[], game: Game): ProcessInfo | undefined {
    const monitorPath = game.monitorPath
    if (!monitorPath) {
      return undefined
    }

    switch (game.monitorMode) {
      case 'file':
        // Match by executable path (exact match)
        return processes.find((p) => {
          if (!p.path) return false
          return this.normalizePath(p.path) === this.normalizePath(monitorPath)
        })

      case 'folder':
        // Match by path prefix (exe path starts with folder)
        return processes.find((p) => {
          if (!p.path) return false
          const normalizedPath = this.normalizePath(p.path)
          const normalizedFolder = this.normalizePath(monitorPath)
          // Check if exe's directory starts with the monitored folder
          const exeDir = dirname(normalizedPath)
          return exeDir.startsWith(normalizedFolder) || normalizedPath.startsWith(normalizedFolder)
        })

      case 'process':
        // Match by process name (case-insensitive)
        return processes.find((p) => p.name.toLowerCase() === monitorPath.toLowerCase())

      default:
        return undefined
    }
  }

  /**
   * Normalize path for comparison
   */
  private normalizePath(path: string): string {
    return normalize(path).toLowerCase()
  }

  /**
   * Handle game start
   */
  private async handleGameStart(gameId: string, process: ProcessInfo): Promise<void> {
    const info = this.monitors.get(gameId)
    if (!info) return

    const now = Date.now()
    info.isRunning = true
    info.currentPid = process.pid
    info.currentProcessName = process.name
    info.currentExePath = process.path
    info.sessionStartTime = now

    // Use actual foreground status from process info
    info.isForeground = process.isForeground
    if (process.isForeground) {
      info.foregroundStartTime = now
    }

    // Update database (sync for better-sqlite3)
    this.dbService.db
      .update(games)
      .set({ lastActiveAt: new Date(now) })
      .where(eq(games.id, gameId))
      .run()

    log.info(`[Monitor] Game started: ${info.game.name} (PID: ${process.pid})`)

    // Send IPC event
    this.ipcService.send('monitor:game-started', gameId)

    // Emit entity event for plugin system
    this.eventService.emit('game:launched', { gameId, pid: process.pid })
  }

  /**
   * Handle game stop
   */
  private async handleGameStop(gameId: string): Promise<void> {
    const info = this.monitors.get(gameId)
    if (!info || !info.sessionStartTime) return

    const now = Date.now()

    // If in foreground, record foreground time first
    if (info.isForeground && info.foregroundStartTime) {
      const foregroundDuration = now - info.foregroundStartTime
      await this.saveForegroundTime(gameId, foregroundDuration)
    }

    // Clear background timer if pending
    if (info.backgroundTimer) {
      clearTimeout(info.backgroundTimer)
      info.backgroundTimer = undefined
    }

    // Calculate session duration
    const sessionDuration = Math.floor((now - info.sessionStartTime) / 1000)

    // Reset state
    info.isRunning = false
    info.isForeground = false
    info.currentPid = undefined
    info.currentProcessName = undefined
    info.currentExePath = undefined
    info.sessionStartTime = undefined
    info.foregroundStartTime = undefined

    // Update database (sync for better-sqlite3)
    this.dbService.db
      .update(games)
      .set({ lastActiveAt: new Date(now) })
      .where(eq(games.id, gameId))
      .run()

    log.info(`[Monitor] Game stopped: ${info.game.name}`)

    // Trigger auto-backup
    this.gameAttachment.tryAutoBackup(gameId).catch((err) => {
      log.error(`[Monitor] Auto-backup error:`, err)
    })

    // Send IPC event
    this.ipcService.send('monitor:game-stopped', gameId)

    // Emit entity event for plugin system
    this.eventService.emit('game:closed', { gameId, playTime: sessionDuration })
  }

  /**
   * Handle foreground/background switch
   */
  private handleForegroundChange(gameId: string, isForeground: boolean): void {
    const info = this.monitors.get(gameId)
    if (!info || !info.isRunning) return

    const now = Date.now()

    if (isForeground) {
      // Switching to foreground (or cancelling pending background)

      // FIRST: Cancel any pending background timer
      if (info.backgroundTimer) {
        clearTimeout(info.backgroundTimer)
        info.backgroundTimer = undefined
        log.info(`[Monitor] Background pending cancelled: ${info.game.name}`)
      }

      // THEN: If not already in foreground, switch to foreground
      if (!info.isForeground) {
        info.isForeground = true
        info.foregroundStartTime = now
        log.info(`[Monitor] Game foreground: ${info.game.name}`)
        this.ipcService.send('monitor:game-foreground', gameId)
      }
    } else if (info.isForeground && !info.backgroundTimer) {
      // Switching to background - start buffer timer (only if not already pending)
      info.backgroundTimer = setTimeout(async () => {
        const currentInfo = this.monitors.get(gameId)
        if (!currentInfo || !currentInfo.isForeground) return

        // Buffer time ended, confirm switch to background
        if (currentInfo.foregroundStartTime) {
          const foregroundDuration = Date.now() - currentInfo.foregroundStartTime
          await this.saveForegroundTime(gameId, foregroundDuration)
        }
        currentInfo.isForeground = false
        currentInfo.foregroundStartTime = undefined
        currentInfo.backgroundTimer = undefined
        log.info(`[Monitor] Game background (after buffer): ${currentInfo.game.name}`)
        this.ipcService.send('monitor:game-background', gameId)
      }, this.BACKGROUND_BUFFER_TIME)

      log.info(
        `[Monitor] Game background pending (${this.BACKGROUND_BUFFER_TIME / 1000}s buffer): ${info.game.name}`
      )
    }
  }

  /**
   * Save foreground running time as a new session record
   */
  private async saveForegroundTime(gameId: string, duration: number): Promise<void> {
    const now = Date.now()

    // Insert new session record (sync for better-sqlite3)
    this.dbService.db
      .insert(gameSessions)
      .values({
        gameId,
        startedAt: new Date(now - duration),
        endedAt: new Date(now)
      })
      .run()

    // Update lastActiveAt and increment totalDuration on the game (sync for better-sqlite3)
    this.dbService.db
      .update(games)
      .set({
        lastActiveAt: new Date(now),
        totalDuration: sql`${games.totalDuration} + ${duration}`
      })
      .where(eq(games.id, gameId))
      .run()

    log.info(`[Monitor] Session saved: ${Math.round(duration / 1000)}s`)
  }
}
