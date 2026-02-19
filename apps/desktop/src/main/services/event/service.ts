/**
 * Event Service
 *
 * Type-safe event emitter that can forward events to renderer process.
 */

import log from 'electron-log/main'
import type { IService, ServiceInitContainer, ServiceName } from '@main/container'
import type { IpcService } from '@main/services/ipc'
import type {
  AppEvents,
  AppEventListener,
  EventUnsubscribe,
  EventEmitOptions
} from '@shared/events'

export class EventService implements IService {
  readonly id = 'event'
  readonly deps = ['ipc'] as const satisfies readonly ServiceName[]

  private listeners: Map<keyof AppEvents, Set<(...args: any[]) => void>> = new Map()
  private ipcService!: IpcService
  private isReady = false

  async init(container: ServiceInitContainer<this>): Promise<void> {
    this.ipcService = container.get('ipc')

    // Receive events from renderer process
    this.ipcService.on('event:forward', (_, event: keyof AppEvents, args: any[]) => {
      // Emit locally with local flag to prevent infinite loop
      this.emit(event, { local: true }, ...(args as [any]))
    })

    this.isReady = true
    log.info('[EventService] Initialized')
  }

  /**
   * Subscribe to an event
   */
  on<K extends keyof AppEvents>(event: K, listener: AppEventListener<K>): EventUnsubscribe {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    this.listeners.get(event)!.add(listener as any)

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(listener as any)
    }
  }

  /**
   * Subscribe to an event once
   */
  once<K extends keyof AppEvents>(event: K, listener: AppEventListener<K>): EventUnsubscribe {
    const wrappedListener = ((...args: AppEvents[K]) => {
      listener(...args)
      this.listeners.get(event)?.delete(wrappedListener as any)
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
  emit<K extends keyof AppEvents>(event: K, ...args: any[]): void {
    // Parse arguments
    let options: EventEmitOptions = { local: false }
    let eventArgs: AppEvents[K]

    if (args.length > 0 && typeof args[0] === 'object' && 'local' in args[0]) {
      options = args[0] as EventEmitOptions
      eventArgs = args.slice(1) as AppEvents[K]
    } else {
      eventArgs = args as AppEvents[K]
    }

    // Emit to local listeners
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      for (const listener of eventListeners) {
        try {
          listener(...eventArgs)
        } catch (error) {
          log.error(`[EventService] Error in listener for "${String(event)}":`, error)
        }
      }
    }

    // Forward to renderer process if not local-only
    if (!options.local && this.isReady) {
      try {
        this.ipcService.send('event:forward', event, eventArgs)
      } catch (error) {
        log.error(`[EventService] Failed to forward event "${String(event)}":`, error)
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
