/**
 * Unified notification type definitions
 *
 * Cross-process notification API with identical interface for main and renderer.
 */

export type NotifyType = 'info' | 'success' | 'warning' | 'error' | 'loading'
export type NotifyTarget = 'toast' | 'native' | 'auto'

export interface NotifyOptions {
  title: string
  message?: string
  type?: NotifyType
  target?: NotifyTarget // Default: 'toast'
  duration?: number // Toast duration in ms
}

/**
 * Notify function interface
 *
 * Can be called directly or use shortcut methods:
 * - `notify({ title: '...', type: 'success' })` - full options
 * - `notify.success('...', 'message')` - shortcut
 * - `notify.loading('...')` - returns toastId for updating
 */
export interface NotifyFunction {
  (options: NotifyOptions): void

  success(title: string, message?: string): void
  error(title: string, message?: string): void
  warning(title: string, message?: string): void
  info(title: string, message?: string): void

  loading(title: string, message?: string): string
  update(toastId: string, options: NotifyOptions): void
  dismiss(toastId?: string): void
}
