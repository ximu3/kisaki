/**
 * Renderer process notify manager
 *
 * Provides unified notification API with toast rendering.
 * Adapted for vue-sonner.
 */

import { toast } from 'vue-sonner'
import { nanoid } from 'nanoid'
import { ipcManager } from './ipc'
import type { NotifyOptions, NotifyType, NotifyFunction } from '@shared/notify'

function getToastFn(type?: NotifyType) {
  switch (type) {
    case 'success':
      return toast.success
    case 'error':
      return toast.error
    case 'warning':
      return toast.warning
    case 'loading':
      return toast.loading
    default:
      return toast.info
  }
}

function createNotify(): NotifyFunction {
  // Initialize IPC listeners for notifications from main process
  ipcManager.on('notify:show', (_, options) => {
    const toastFn = getToastFn(options.type)
    toastFn(options.title, {
      id: options.toastId,
      description: options.message,
      duration: options.duration
    })
  })

  ipcManager.on('notify:loading', (_, { toastId, title, message }) => {
    toast.loading(title, { id: toastId, description: message })
  })

  ipcManager.on('notify:update', (_, { toastId, ...options }) => {
    const toastFn = getToastFn(options.type)
    toastFn(options.title, {
      id: toastId,
      description: options.message,
      duration: options.duration
    })
  })

  ipcManager.on('notify:dismiss', (_, { toastId }) => {
    toast.dismiss(toastId)
  })

  // Create notify function
  const notifyFn = ((options: NotifyOptions) => {
    const target = options.target ?? 'toast'

    if (target === 'native' || target === 'auto') {
      // Forward to main process for native/auto handling
      ipcManager.send(target === 'native' ? 'notify:native' : 'notify:auto', options)
    } else {
      // Show toast directly
      const toastFn = getToastFn(options.type)
      toastFn(options.title, {
        description: options.message,
        duration: options.duration
      })
    }
  }) as NotifyFunction

  notifyFn.success = (title, message?) => notifyFn({ title, message, type: 'success' })
  notifyFn.error = (title, message?) => notifyFn({ title, message, type: 'error' })
  notifyFn.warning = (title, message?) => notifyFn({ title, message, type: 'warning' })
  notifyFn.info = (title, message?) => notifyFn({ title, message, type: 'info' })

  notifyFn.loading = (title, message?) => {
    const toastId = nanoid()
    toast.loading(title, { id: toastId, description: message })
    return toastId
  }

  notifyFn.update = (toastId, options) => {
    const toastFn = getToastFn(options.type)
    toastFn(options.title, {
      id: toastId,
      description: options.message,
      duration: options.duration
    })
  }

  notifyFn.dismiss = (toastId?) => {
    toast.dismiss(toastId)
  }

  return notifyFn
}

export const notify = createNotify()
