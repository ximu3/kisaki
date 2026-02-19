import { app } from 'electron'
import path from 'path'
import fse from 'fs-extra'
import log from 'electron-log/main'
import { is } from '@electron-toolkit/utils'
import type { EventService } from '@main/services/event'
import type { IpcService } from '@main/services/ipc'

/** Portable mode status */
export interface PortableStatus {
  /** Whether the app is running in portable mode */
  isPortable: boolean
  /** Path to the portable folder (if exists) */
  portablePath: string
  /** Path to the default userData folder */
  defaultUserDataPath: string
  /** Current userData path being used */
  currentUserDataPath: string
}

/** Migration pending status stored in a marker file */
interface MigrationPending {
  /** Target mode to switch to */
  targetMode: 'portable' | 'normal'
  /** Timestamp when the switch was requested */
  requestedAt: number
}

const PORTABLE_FOLDER_NAME = 'portable'
const MIGRATION_MARKER_FILE = '.migration-pending'

let portableStatus: PortableStatus | null = null

/**
 * Gets the app's executable directory.
 * In development, returns the project root.
 * In production, returns the directory containing the exe.
 */
function getAppRootPath(): string {
  if (is.dev) {
    return process.cwd()
  }
  // In production, app.getPath('exe') returns the path to the executable
  return path.dirname(app.getPath('exe'))
}

/**
 * Gets the path to the portable folder.
 */
function getPortablePath(): string {
  return path.join(getAppRootPath(), PORTABLE_FOLDER_NAME)
}

/**
 * Gets the path to the migration marker file.
 * Stored in app root so it persists across mode changes.
 */
function getMigrationMarkerPath(): string {
  return path.join(getAppRootPath(), MIGRATION_MARKER_FILE)
}

/**
 * Checks if a migration is pending.
 */
async function checkMigrationPending(): Promise<MigrationPending | null> {
  const markerPath = getMigrationMarkerPath()
  try {
    if (await fse.pathExists(markerPath)) {
      const content = await fse.readJson(markerPath)
      return content as MigrationPending
    }
  } catch {
    // Invalid marker file, remove it
    await fse.remove(markerPath).catch(() => {})
  }
  return null
}

/**
 * Sets the migration pending marker.
 */
async function setMigrationPending(targetMode: 'portable' | 'normal'): Promise<void> {
  const markerPath = getMigrationMarkerPath()
  const pending: MigrationPending = {
    targetMode,
    requestedAt: Date.now()
  }
  await fse.writeJson(markerPath, pending)
}

/**
 * Clears the migration pending marker.
 */
async function clearMigrationPending(): Promise<void> {
  const markerPath = getMigrationMarkerPath()
  await fse.remove(markerPath).catch(() => {})
}

/**
 * Performs the data migration between modes.
 * @param from Source directory
 * @param to Target directory
 */
async function migrateData(from: string, to: string): Promise<void> {
  // Ensure target directory exists
  await fse.ensureDir(to)

  // Check if source has any content
  const sourceExists = await fse.pathExists(from)
  if (!sourceExists) {
    return
  }

  const items = await fse.readdir(from)
  if (items.length === 0) {
    return
  }

  // Move all items from source to target
  for (const item of items) {
    const sourcePath = path.join(from, item)
    const targetPath = path.join(to, item)

    // Skip if it's the migration marker
    if (item === MIGRATION_MARKER_FILE) {
      continue
    }

    // Remove existing target if exists
    if (await fse.pathExists(targetPath)) {
      await fse.remove(targetPath)
    }

    // Move the item
    await fse.move(sourcePath, targetPath)
  }
}

/**
 * Detects and initializes portable mode.
 * MUST be called before app.whenReady() for setPath to work.
 */
export async function detectPortableMode(): Promise<void> {
  const portablePath = getPortablePath()
  const defaultUserDataPath = app.getPath('userData')

  // Check for pending migration
  const pending = await checkMigrationPending()

  if (pending) {
    if (pending.targetMode === 'portable') {
      // Migrate from normal to portable
      await fse.ensureDir(portablePath)
      await migrateData(defaultUserDataPath, portablePath)
      await clearMigrationPending()
    } else {
      // Migrate from portable to normal
      await migrateData(portablePath, defaultUserDataPath)
      // Remove the empty portable folder
      await fse.remove(portablePath).catch(() => {})
      await clearMigrationPending()
    }
  }

  // Check if portable folder exists
  const isPortable = await fse.pathExists(portablePath)

  if (isPortable) {
    // Set userData path to portable folder
    app.setPath('userData', portablePath)
  }

  // Store the status
  portableStatus = {
    isPortable,
    portablePath,
    defaultUserDataPath,
    currentUserDataPath: isPortable ? portablePath : defaultUserDataPath
  }
}

/**
 * Gets the current portable status.
 */
export function getPortableStatus(): PortableStatus {
  if (!portableStatus) {
    throw new Error('Portable mode not initialized. Call detectPortableMode() first.')
  }
  return portableStatus
}

/**
 * Checks if the app is running in portable mode.
 */
export function isPortableMode(): boolean {
  return portableStatus?.isPortable ?? false
}

/**
 * Requests a switch to portable mode.
 * The actual migration will happen on next app restart.
 */
export async function requestSwitchToPortable(eventService: EventService): Promise<void> {
  if (portableStatus?.isPortable) {
    throw new Error('Already in portable mode')
  }
  await setMigrationPending('portable')
  eventService.emit('app:portable-mode-change-pending', { targetMode: 'portable' })
}

/**
 * Requests a switch to normal mode.
 * The actual migration will happen on next app restart.
 */
export async function requestSwitchToNormal(eventService: EventService): Promise<void> {
  if (!portableStatus?.isPortable) {
    throw new Error('Already in normal mode')
  }
  await setMigrationPending('normal')
  eventService.emit('app:portable-mode-change-pending', { targetMode: 'normal' })
}

/**
 * Cancels a pending mode switch.
 */
export async function cancelPendingSwitch(eventService: EventService): Promise<void> {
  await clearMigrationPending()
  eventService.emit('app:portable-mode-change-cancelled', {})
}

/**
 * Checks if there's a pending mode switch.
 */
export async function getPendingSwitch(): Promise<'portable' | 'normal' | null> {
  const pending = await checkMigrationPending()
  return pending?.targetMode ?? null
}

/**
 * Setup IPC handlers for portable mode.
 * Should be called after app.whenReady() with initialized services.
 */
export function setupPortableIpc(ipc: IpcService, event: EventService): void {
  ipc.handle('portable:get-status', async () => {
    try {
      return { success: true, data: getPortableStatus() }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  ipc.handle('portable:get-pending-switch', async () => {
    try {
      const pending = await getPendingSwitch()
      return { success: true, data: pending }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  ipc.handle('portable:switch-to-portable', async () => {
    try {
      await requestSwitchToPortable(event)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  ipc.handle('portable:switch-to-normal', async () => {
    try {
      await requestSwitchToNormal(event)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  ipc.handle('portable:cancel-pending-switch', async () => {
    try {
      await cancelPendingSwitch(event)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  log.info('[Portable] IPC handlers registered')
}
