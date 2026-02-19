/**
 * Demo Plugin - Main Process Entry Point
 *
 * Main process plugins can access:
 * - container: Service container for all services
 * - schema: Database schema definitions
 * - log: electron-log logger
 */

import { container, schema, log } from '@kisaki/plugin-sdk/main'
import { PLUGIN_ID } from '../shared/manifest'

export async function activate(): Promise<void> {
  log.info(`[${PLUGIN_ID}] Plugin activated`)

  const ipc = container.get('ipc')
  const events = container.get('event')
  const dbService = container.get('db')

  // Register a simple IPC handler
  ipc.handle('demo-plugin:ping', async () => {
    return { success: true as const }
  })

  // Listen for renderer logs
  ipc.on('demo-plugin:log', (_, message) => {
    log.info(`[${PLUGIN_ID}]`, message)
  })

  // Listen for app events
  events.on('game:added', ({ gameId, name }) => {
    log.info(`[${PLUGIN_ID}] Game added: ${gameId} ${name}`)
  })

  // Example: Query database in main process (use .db for Drizzle ORM)
  const games = dbService.db.select().from(schema.games).all()
  log.info(`[${PLUGIN_ID}] Total games: ${games.length}`)

  // Emit ready event
  events.emit('demo-plugin:ready')
}

export function deactivate(): void {
  log.info(`[${PLUGIN_ID}] Plugin deactivated`)

  const ipc = container.get('ipc')
  ipc.removeHandler('demo-plugin:ping')
}
