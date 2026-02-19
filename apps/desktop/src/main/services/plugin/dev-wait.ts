/**
 * Plugin Development Wait Gate
 *
 * In debug mode, pauses plugin activation until a debugger is attached.
 * Automatically detects debugger connection and continues.
 */

import inspector from 'node:inspector'
import log from 'electron-log/main'

/**
 * Check if Node inspector is active (i.e. process started with --inspect/--inspect-brk).
 *
 * Note: inspector.url() indicates the inspector server is listening, not that a debugger is connected.
 */
function isInspectorActive(): boolean {
  return inspector.url() !== undefined
}

/**
 * Plugin development wait gate.
 * Manages a shared promise that blocks plugin activation in debug mode.
 * Automatically continues when a debugger is attached.
 */
export class PluginDevWait {
  private waiting = false
  private continued = false
  private onContinue?: () => void

  /**
   * Set callback to be called when continue() is triggered.
   * Used to notify renderer process.
   */
  setOnContinue(callback: () => void): void {
    this.onContinue = callback
  }

  /**
   * Wait for debugger to be attached.
   * Creates a shared promise that blocks until a debugger connects.
   * Multiple callers will await the same promise.
   */
  async wait(context?: string): Promise<void> {
    if (this.continued) return

    // If inspector isn't active, we can't reliably wait for an external debugger.
    if (!isInspectorActive()) {
      log.info(
        `[PluginDevWait] Inspector not active, skipping wait${context ? ` (${context})` : ''}`
      )
      return
    }

    // Only block once (inspector.waitForDebugger() is synchronous).
    if (this.waiting) return
    this.waiting = true

    log.info(
      `[PluginDevWait] Waiting for debugger${context ? ` (${context})` : ''} - attach debugger to continue`
    )

    try {
      // Blocks until a debugger attaches to the inspector.
      // This matches the intended behavior; inspector.url() only indicates listening.
      inspector.waitForDebugger()
      log.info('[PluginDevWait] Debugger attached, continuing...')
    } catch (error) {
      log.warn(
        `[PluginDevWait] Failed to wait for debugger${context ? ` (${context})` : ''}:`,
        error
      )
    } finally {
      this.continue()
    }
  }

  /**
   * Release the wait gate.
   * All callers awaiting wait() will be unblocked.
   */
  continue(): void {
    if (this.continued) return
    this.waiting = false
    this.continued = true
    this.onContinue?.()
    log.info('[PluginDevWait] Continued')
  }

  /**
   * Check if currently waiting.
   */
  isWaiting(): boolean {
    return this.waiting
  }

  /**
   * Check if continue has been triggered.
   * Used by renderer to check state during initialization.
   */
  isContinued(): boolean {
    return this.continued
  }
}
