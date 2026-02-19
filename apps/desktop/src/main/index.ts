import { app } from 'electron'
import { electronApp, optimizer, platform, is } from '@electron-toolkit/utils'
import path from 'path'
import log from 'electron-log/main'

// Services
import { container } from './container'
import { DbService } from './services/db'
import { IpcService } from './services/ipc'
import { EventService } from './services/event'
import { WindowService } from './services/window'
import { NativeService } from './services/native'
import { I18nService } from './services/i18n'
import { ScraperService } from './services/scraper'
import { MonitorService } from './services/monitor'
import { LauncherService } from './services/launcher'
import { AdderService } from './services/adder'
import { ScannerService } from './services/scanner'
import { AttachmentService } from './services/attachment'
import { PluginService } from './services/plugin'
import { NetworkService } from './services/network'
import { NotifyService } from './services/notify'
import { DeeplinkService } from './services/deeplink'
import { MetadataUpdaterService } from './services/metadata-updater'

// Bootstrap (pre-ready modules)
import { registerAttachmentScheme, DEEPLINK_SCHEME } from './bootstrap/protocol'
import { detectPortableMode, setupPortableIpc } from './bootstrap/portable'
import { getBootstrapArgs, setupBootstrapArgsIpc } from './bootstrap/args'

function printCliHelp(): void {
  console.log('Kisaki - Multimedia Library Manager')
  console.log('')
  console.log('Usage:')
  console.log('  kisaki [options]')
  console.log('')
  console.log('Options:')
  console.log('  -h, --help                 Show this help and exit')
  console.log('  -V, --version              Print version and exit')
  console.log('      --dev-plugin=<path>    Load a local plugin (dev mode)')
  console.log('')
  console.log('Examples:')
  console.log('  kisaki --version')
  console.log('  kisaki --help')
  console.log('  kisaki --dev-plugin="C:\\\\path\\\\to\\\\plugin"')
}

const bootstrapArgs = getBootstrapArgs()
if (bootstrapArgs.help) {
  printCliHelp()
  process.exit(0)
}

if (bootstrapArgs.version) {
  console.log(app.getVersion())
  process.exit(0)
}

// Register custom protocols before app is ready
registerAttachmentScheme()

// Initialize electron-log for main process
log.initialize()

// Register as default protocol handler for kisaki://
// This must be done before app.whenReady()
if (process.defaultApp) {
  // Development: need to pass the script path
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(DEEPLINK_SCHEME, process.execPath, [
      path.resolve(process.argv[1])
    ])
  }
} else {
  // Production: just register the protocol
  app.setAsDefaultProtocolClient(DEEPLINK_SCHEME)
}

// Request single instance lock to handle deeplinks properly
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}

// Setup userData path before app is ready
// In dev build: use local dev/app folder
// In production: detect portable mode or use default userData
if (is.dev) {
  app.setPath('userData', path.join(process.cwd(), 'dev/app'))
} else {
  // Detect and setup portable mode before app is ready
  // This must be done early to properly set userData path
  detectPortableMode().catch((err) => {
    console.error('Failed to detect portable mode:', err)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
async function onAppReady(): Promise<void> {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Services (register first, then initialize via container.initAll())
  await container.register(new IpcService())
  await container.register(new EventService())
  await container.register(new WindowService())
  await container.register(new NotifyService())
  await container.register(new DbService())
  await container.register(new NetworkService())
  await container.register(new NativeService())
  await container.register(new I18nService())
  await container.register(new ScraperService())
  await container.register(new AdderService())
  await container.register(new MetadataUpdaterService())
  await container.register(new ScannerService())
  await container.register(new AttachmentService())
  await container.register(new MonitorService())
  await container.register(new LauncherService())
  await container.register(new PluginService())
  await container.register(new DeeplinkService())

  await container.initAll()
  log.info('[Main] All services initialized')

  // Setup portable IPC handlers (after services are ready)
  const ipcService = container.get<IpcService>('ipc')
  const eventService = container.get<EventService>('event')
  setupBootstrapArgsIpc(ipcService)
  setupPortableIpc(ipcService, eventService)

  ipcService.handle('app:quit', () => {
    setImmediate(() => app.quit())
    return { success: true }
  })

  // Create main window first (so renderer IPC listeners are ready)
  const windowService = container.get<WindowService>('window')
  windowService.createMainWindow()
  windowService.createTrayMenuWindow()

  // Load user plugins (after window is created, so renderer receives IPC events)
  const pluginService = container.get('plugin')
  await pluginService.loadAllPlugins()

  // Mark deeplink service as ready and process any pending deeplinks
  const deeplinkService = container.get<DeeplinkService>('deeplink')
  deeplinkService.markReady()

  // Handle deeplink from startup arguments (Windows/Linux)
  const startupDeeplink = process.argv.find((arg) => arg.startsWith(`${DEEPLINK_SCHEME}://`))
  if (startupDeeplink) {
    deeplinkService.handleDeeplink(startupDeeplink).catch((error) => {
      log.error('[Main] Failed to handle startup deeplink:', error)
    })
  }

  // Setup scanners after services are ready
  const scannerService = container.get<ScannerService>('scanner')
  // const dbService = container.get<DbService>('db')

  // Schedule all scanners for periodic scanning
  await scannerService.game.scheduleAllScanners()

  // Check if we should scan all scanners on app start
  // const settings = await dbService.helper.getAppSettings()
  // if (settings.scannerStartAtOpen) {
  //   scannerService.game.scanAllScanners().catch((error) => {
  //     log.error('[Main] Failed to scan all scanners on startup:', error)
  //   })
  // }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (windowService.getAllWindows().length === 0) {
      windowService.createMainWindow()
      windowService.createTrayMenuWindow()
    }
  })
}

void (async () => {
  try {
    await app.whenReady()
    await onAppReady()
  } catch (error) {
    log.error('[Main] Failed during app ready bootstrap:', error)
    app.exit(1)
  }
})()

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (!platform.isMacOS) {
    app.quit()
  }
})

// Cleanup before app quits
let shutdownInProgress = false

app.on('before-quit', (event) => {
  if (shutdownInProgress) return
  shutdownInProgress = true
  event.preventDefault()

  const forceExitTimer = setTimeout(() => {
    log.warn('[Main] Force exiting after shutdown timeout')
    app.exit(1)
  }, 5000)

  ;(async () => {
    try {
      log.info('[Main] Disposing all services...')
      await container.disposeAll()
      log.info('[Main] All services disposed')
    } catch (error) {
      log.error('[Main] Shutdown error:', error)
    } finally {
      clearTimeout(forceExitTimer)
      app.exit(0)
    }
  })()
})
