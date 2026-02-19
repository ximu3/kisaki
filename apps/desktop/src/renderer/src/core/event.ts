/**
 * Renderer process event manager
 *
 * Provides a type-safe event emitter that can forward events to main process.
 * Identical to React version - no framework dependencies.
 */

import { ipcManager } from './ipc'
import type {
  AppEvents,
  AppEventListener,
  EventUnsubscribe,
  EventEmitOptions
} from '@shared/events'

class EventManager {
  private listeners: Map<keyof AppEvents, Set<(...args: unknown[]) => void>> = new Map()
  private isReady = false

  /**
   * Initialize the event manager
   * Sets up IPC listeners for cross-process events
   */
  init(): void {
    if (this.isReady) return

    // Receive events forwarded from main process
    ipcManager.on('event:forward', (_, event: keyof AppEvents, args: unknown[]) => {
      // Emit locally without forwarding back to prevent infinite loop
      this.emitLocal(event, ...(args as AppEvents[typeof event]))
    })

    this.isReady = true
  }

  /**
   * Subscribe to an event
   */
  on<K extends keyof AppEvents>(event: K, listener: AppEventListener<K>): EventUnsubscribe {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    this.listeners.get(event)!.add(listener as (...args: unknown[]) => void)

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(listener as (...args: unknown[]) => void)
    }
  }

  /**
   * Subscribe to an event once
   */
  once<K extends keyof AppEvents>(event: K, listener: AppEventListener<K>): EventUnsubscribe {
    const wrappedListener = ((...args: AppEvents[K]) => {
      listener(...args)
      this.listeners.get(event)?.delete(wrappedListener as (...args: unknown[]) => void)
    }) as AppEventListener<K>

    return this.on(event, wrappedListener)
  }

  /**
   * Emit an event
   */
  emit<K extends keyof AppEvents>(
    event: K,
    ...args: AppEvents[K] extends [] ? [] : [AppEvents[K][0]]
  ): void
  emit<K extends keyof AppEvents>(
    event: K,
    options: EventEmitOptions,
    ...args: AppEvents[K] extends [] ? [] : [AppEvents[K][0]]
  ): void
  emit<K extends keyof AppEvents>(event: K, ...args: unknown[]): void {
    // Parse arguments
    let options: EventEmitOptions = { local: false }
    let eventArgs: AppEvents[K]

    if (args.length > 0 && typeof args[0] === 'object' && args[0] !== null && 'local' in args[0]) {
      options = args[0] as EventEmitOptions
      eventArgs = args.slice(1) as AppEvents[K]
    } else {
      eventArgs = args as AppEvents[K]
    }

    // Emit to local listeners
    this.emitLocal(event, ...eventArgs)

    // Forward to main process if not local-only
    if (!options.local && this.isReady) {
      try {
        ipcManager.send('event:forward', event, eventArgs)
      } catch (error) {
        console.error(`Failed to forward event "${String(event)}" to main:`, error)
      }
    }
  }

  /**
   * Emit event only to local listeners (no IPC forwarding)
   */
  private emitLocal<K extends keyof AppEvents>(event: K, ...args: AppEvents[K]): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      for (const listener of eventListeners) {
        try {
          listener(...args)
        } catch (error) {
          console.error(`Error in event listener for "${String(event)}":`, error)
        }
      }
    }
  }

  /**
   * Remove all listeners for an event
   */
  off<K extends keyof AppEvents>(event: K): void {
    this.listeners.delete(event)
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this.listeners.clear()
  }

  /**
   * Get the number of listeners for an event
   */
  listenerCount<K extends keyof AppEvents>(event: K): number {
    return this.listeners.get(event)?.size ?? 0
  }
}

export const eventManager = new EventManager()

// Auto-initialize when module is loaded
eventManager.init()
