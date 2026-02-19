import { dirname } from 'path'
import type { DbService } from '@main/services/db'
import type { EventService } from '@main/services/event'
import { games } from '@shared/db'
import { eq } from 'drizzle-orm'
import log from 'electron-log/main'

/**
 * Apply default launch configuration based on selected file path.
 * Sets launcherPath, gameDirPath, and default modes.
 * @param dbService - The DbService instance
 * @param eventService - The EventService instance
 * @param gameId - The game ID
 * @param filePath - The selected executable file path
 */
export async function applyDefaultLaunchConfig(
  dbService: DbService,
  eventService: EventService,
  gameId: string,
  filePath: string
): Promise<void> {
  const gameDirPath = dirname(filePath)

  dbService.db
    .update(games)
    .set({
      launcherPath: filePath,
      launcherMode: 'file',
      gameDirPath,
      monitorMode: 'folder'
      // monitorPath left empty - fallback will derive from gameDirPath
    })
    .where(eq(games.id, gameId))
    .run()

  eventService.emit('db:updated', { table: 'games', id: gameId })
  log.info(`[Launcher] Applied default config for game ${gameId}: ${filePath}`)
}
