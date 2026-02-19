/**
 * Game Monitor Store
 *
 * Tracks game running status synced from main process.
 * Used for showing running indicators on game cards.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ipcManager } from '@renderer/core/ipc'

export interface GameMonitorStatus {
  isRunning: boolean
  isForeground: boolean
  pid?: number
  startTime?: number
}

export const useGameMonitorStore = defineStore('gameMonitor', () => {
  // ==========================================================================
  // State
  // ==========================================================================

  const statuses = ref(new Map<string, GameMonitorStatus>())
  const initialized = ref(false)

  // ==========================================================================
  // Getters
  // ==========================================================================

  const runningGameIds = computed(() => {
    const ids: string[] = []
    for (const [gameId, status] of statuses.value) {
      if (status.isRunning) ids.push(gameId)
    }
    return ids
  })

  const runningCount = computed(() => runningGameIds.value.length)

  // ==========================================================================
  // Actions
  // ==========================================================================

  function setGameStatus(gameId: string, status: Partial<GameMonitorStatus>) {
    const existing = statuses.value.get(gameId) ?? {
      isRunning: false,
      isForeground: false
    }
    // Create new Map to trigger reactivity
    const newStatuses = new Map(statuses.value)
    newStatuses.set(gameId, { ...existing, ...status })
    statuses.value = newStatuses
  }

  function removeGameStatus(gameId: string) {
    const newStatuses = new Map(statuses.value)
    newStatuses.delete(gameId)
    statuses.value = newStatuses
  }

  function clearAllStatuses() {
    statuses.value = new Map()
  }

  function isGameRunning(gameId: string): boolean {
    return statuses.value.get(gameId)?.isRunning ?? false
  }

  function isGameForeground(gameId: string): boolean {
    return statuses.value.get(gameId)?.isForeground ?? false
  }

  function getGameStatus(gameId: string): GameMonitorStatus | undefined {
    return statuses.value.get(gameId)
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================

  async function init() {
    if (initialized.value) return

    // Listen for game started events
    ipcManager.on('monitor:game-started', (_, gameId: string) => {
      setGameStatus(gameId, {
        isRunning: true,
        isForeground: true,
        startTime: Date.now()
      })
    })

    // Listen for game stopped events
    ipcManager.on('monitor:game-stopped', (_, gameId: string) => {
      setGameStatus(gameId, {
        isRunning: false,
        isForeground: false,
        pid: undefined,
        startTime: undefined
      })
    })

    // Listen for foreground change events
    ipcManager.on('monitor:game-foreground', (_, gameId: string) => {
      setGameStatus(gameId, { isForeground: true })
    })

    ipcManager.on('monitor:game-background', (_, gameId: string) => {
      setGameStatus(gameId, { isForeground: false })
    })

    // Fetch initial status from main process
    try {
      const result = await ipcManager.invoke('monitor:get-game-status')
      if (result.success && result.data) {
        const statusList = Array.isArray(result.data) ? result.data : [result.data]
        for (const status of statusList) {
          setGameStatus(status.gameId, {
            isRunning: status.isRunning,
            isForeground: status.isForeground,
            pid: status.pid,
            startTime: status.startTime
          })
        }
      }
    } catch (error) {
      console.error('[GameMonitorStore] Failed to fetch initial status:', error)
    }

    initialized.value = true
  }

  return {
    // State
    statuses,
    initialized,
    // Getters
    runningGameIds,
    runningCount,
    // Actions
    setGameStatus,
    removeGameStatus,
    clearAllStatuses,
    isGameRunning,
    isGameForeground,
    getGameStatus,
    init
  }
})
