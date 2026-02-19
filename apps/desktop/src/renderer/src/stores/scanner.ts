/**
 * Scanner Store
 *
 * Tracks scanner progress states received from main process.
 * Main process is the single source of truth - we simply store the complete state.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ScanProgressData } from '@shared/scanner'
import { ipcManager } from '@renderer/core/ipc'

export const useScannerStore = defineStore('scanner', () => {
  // ==========================================================================
  // State
  // ==========================================================================

  const scannerStates = ref(new Map<string, ScanProgressData>())
  const initialized = ref(false)

  // ==========================================================================
  // Getters
  // ==========================================================================

  const activeScanners = computed(() => {
    const active: ScanProgressData[] = []
    for (const state of scannerStates.value.values()) {
      if (state.status === 'scanning') active.push(state)
    }
    return active
  })

  const hasActiveScans = computed(() => activeScanners.value.length > 0)

  // ==========================================================================
  // Actions
  // ==========================================================================

  function updateScannerState(id: string, progress: ScanProgressData) {
    const newStates = new Map(scannerStates.value)
    newStates.set(id, progress)
    scannerStates.value = newStates
  }

  function resetScannerState(id: string) {
    const newStates = new Map(scannerStates.value)
    newStates.delete(id)
    scannerStates.value = newStates
  }

  function resetAllScannerStates() {
    scannerStates.value = new Map()
  }

  function getScannerState(id: string): ScanProgressData | undefined {
    return scannerStates.value.get(id)
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================

  async function init() {
    if (initialized.value) return

    // Listen for scanner progress events from main process
    ipcManager.on('scanner:scan-progress', (_e, data) => {
      updateScannerState(data.scannerId, data)
    })

    // Fetch initial status
    try {
      const result = await ipcManager.invoke('scanner:get-active-scans')
      if (result.success && result.data) {
        for (const scan of result.data) {
          updateScannerState(scan.scannerId, scan)
        }
      }
    } catch (error) {
      console.error('[ScannerStore] Failed to fetch initial status:', error)
    }

    initialized.value = true
  }

  return {
    // State
    scannerStates,
    initialized,
    // Getters
    activeScanners,
    hasActiveScans,
    // Actions
    updateScannerState,
    resetScannerState,
    resetAllScannerStates,
    getScannerState,
    init
  }
})
