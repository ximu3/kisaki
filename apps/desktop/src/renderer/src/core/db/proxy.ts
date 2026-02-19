/**
 * Database Proxy
 *
 * Drizzle ORM instance that proxies queries through IPC.
 */

import { drizzle } from 'drizzle-orm/sqlite-proxy'
import { ipcManager } from '../ipc'
import * as schema from '@shared/db'

export const db = drizzle(
  async (...args) => {
    const result = await ipcManager.invoke('db:execute', ...args)

    if (!result.success) {
      console.error('DB execution error:', result.error)
      throw new Error(result.error || 'Unknown DB execution error')
    }

    return { rows: result.data ?? [] }
  },
  { schema }
)
