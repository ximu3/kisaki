/**
 * IPC Service
 *
 * Type-safe IPC communication layer between main and renderer processes.
 * Uses native Electron IPC with custom type wrappers for full type safety.
 */

import { app, BrowserWindow, ipcMain, type IpcMainEvent, type IpcMainInvokeEvent } from 'electron'
import log from 'electron-log/main'
import type { IService, ServiceInitContainer, ServiceName } from '@main/container'
import type { IpcMainListeners, IpcMainHandlers, IpcRendererEvents } from '@shared/ipc'

export class IpcService implements IService {
  readonly id = 'ipc'
  readonly deps = [] as const satisfies readonly ServiceName[]

  private registeredListeners: string[] = []
  private registeredHandlers: string[] = []
  private pendingRendererMessages: Array<{ channel: string; args: unknown[] }> = []
  private hasEverHadWindow = false
  private readonly maxPendingRendererMessages = 200
  private onBrowserWindowCreated?: (event: Electron.Event, window: BrowserWindow) => void

  async init(_container: ServiceInitContainer<this>): Promise<void> {
    this.onBrowserWindowCreated = (_event, _window) => {
      this.flushPendingRendererMessages()
    }
    app.on('browser-window-created', this.onBrowserWindowCreated)
    log.info('[IpcService] Initialized')
  }

  async dispose(): Promise<void> {
    if (this.onBrowserWindowCreated) {
      app.off('browser-window-created', this.onBrowserWindowCreated)
      this.onBrowserWindowCreated = undefined
    }
    // Remove all registered listeners
    for (const channel of this.registeredListeners) {
      ipcMain.removeAllListeners(channel)
    }
    // Remove all registered handlers
    for (const channel of this.registeredHandlers) {
      ipcMain.removeHandler(channel)
    }
    this.registeredListeners = []
    this.registeredHandlers = []
    this.pendingRendererMessages = []
    this.hasEverHadWindow = false
    log.info('[IpcService] Disposed')
  }

  /**
   * Register a one-way listener (no response)
   */
  on<K extends keyof IpcMainListeners>(
    channel: K,
    listener: (e: IpcMainEvent, ...args: IpcMainListeners[K]) => void | Promise<void>
  ): void {
    ipcMain.on(channel as string, listener as Parameters<typeof ipcMain.on>[1])
    this.registeredListeners.push(channel as string)
  }

  /**
   * Register a request-response handler
   */
  handle<K extends keyof IpcMainHandlers>(
    channel: K,
    handler: (
      e: IpcMainInvokeEvent,
      ...args: Parameters<IpcMainHandlers[K]>
    ) => ReturnType<IpcMainHandlers[K]> | Promise<Awaited<ReturnType<IpcMainHandlers[K]>>>
  ): void {
    ipcMain.handle(channel as string, handler as Parameters<typeof ipcMain.handle>[1])
    this.registeredHandlers.push(channel as string)
  }

  /**
   * Send a message to all renderer windows
   */
  send<K extends keyof IpcRendererEvents>(channel: K, ...args: IpcRendererEvents[K]): void {
    const channelString = channel as string
    const targets = this.getSendTargets()

    if (targets.length === 0) {
      if (!this.hasEverHadWindow) {
        if (this.pendingRendererMessages.length >= this.maxPendingRendererMessages) {
          this.pendingRendererMessages.shift()
        }
        this.pendingRendererMessages.push({ channel: channelString, args })
        log.debug(`[IpcService] Buffered IPC message until window exists: "${channelString}"`)
        return
      }

      log.debug(`[IpcService] Dropped IPC message (no windows): "${channelString}"`)
      return
    }

    this.hasEverHadWindow = true

    if (this.pendingRendererMessages.length > 0) {
      this.flushPendingRendererMessages()
    }

    for (const win of targets) {
      try {
        win.webContents.send(channelString, ...(args as unknown[]))
      } catch (error) {
        log.error(
          `[IpcService] Failed to send IPC message "${channelString}" to window ${win.id}:`,
          error
        )
      }
    }
  }

  private getSendTargets(): BrowserWindow[] {
    const windows = BrowserWindow.getAllWindows()
    if (windows.length === 0) return []

    const targets: BrowserWindow[] = []
    for (const win of windows) {
      if (win.isDestroyed()) continue
      if (win.webContents.isDestroyed()) continue
      targets.push(win)
    }
    return targets
  }

  private flushPendingRendererMessages(): void {
    if (this.pendingRendererMessages.length === 0) return

    const targets = this.getSendTargets()
    if (targets.length === 0) return

    this.hasEverHadWindow = true

    const pending = this.pendingRendererMessages
    this.pendingRendererMessages = []

    for (const { channel, args } of pending) {
      for (const win of targets) {
        try {
          win.webContents.send(channel, ...(args as unknown[]))
        } catch (error) {
          log.error(
            `[IpcService] Failed to flush buffered IPC message "${channel}" to window ${win.id}:`,
            error
          )
        }
      }
    }
  }

  /**
   * Remove a handler by channel name
   */
  removeHandler<K extends keyof IpcMainHandlers>(channel: K): void {
    ipcMain.removeHandler(channel as string)
    this.registeredHandlers = this.registeredHandlers.filter((c) => c !== channel)
  }
}
