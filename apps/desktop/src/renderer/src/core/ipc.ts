/**
 * IPC Manager
 *
 * Type-safe IPC communication with main process.
 * Uses native Electron IPC with custom type wrappers for full type safety.
 */

import type { IpcMainListeners, IpcMainHandlers, IpcRendererEvents } from '@shared/ipc'

export class IpcManager {
  /**
   * Listen for messages from main process
   */
  on<K extends keyof IpcRendererEvents>(
    channel: K,
    listener: (e: Electron.IpcRendererEvent, ...args: IpcRendererEvents[K]) => void
  ): () => void {
    const wrappedListener = ((_e: Electron.IpcRendererEvent, ...args: unknown[]) => {
      listener(_e, ...(args as IpcRendererEvents[K]))
    }) as Parameters<typeof window.electron.ipcRenderer.on>[1]

    return window.electron.ipcRenderer.on(channel as string, wrappedListener)
  }

  /**
   * Listen for a message from main process (once)
   */
  once<K extends keyof IpcRendererEvents>(
    channel: K,
    listener: (e: Electron.IpcRendererEvent, ...args: IpcRendererEvents[K]) => void | Promise<void>
  ): () => void {
    const wrappedListener = ((_e: Electron.IpcRendererEvent, ...args: unknown[]) => {
      listener(_e, ...(args as IpcRendererEvents[K]))
    }) as Parameters<typeof window.electron.ipcRenderer.once>[1]

    return window.electron.ipcRenderer.once(channel as string, wrappedListener)
  }

  /**
   * Send a one-way message to main process
   */
  send<K extends keyof IpcMainListeners>(channel: K, ...args: IpcMainListeners[K]): void {
    window.electron.ipcRenderer.send(channel as string, ...args)
  }

  /**
   * Invoke a handler in main process and wait for response
   */
  invoke<K extends keyof IpcMainHandlers>(
    channel: K,
    ...args: Parameters<IpcMainHandlers[K]>
  ): Promise<Awaited<ReturnType<IpcMainHandlers[K]>>> {
    return window.electron.ipcRenderer.invoke(channel as string, ...args) as Promise<
      Awaited<ReturnType<IpcMainHandlers[K]>>
    >
  }
}

export const ipcManager = new IpcManager()
