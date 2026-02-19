import { app, BrowserWindow, screen, Tray } from 'electron'
import { join } from 'path'
import log from 'electron-log/main'
import type { IpcService } from '@main/services/ipc'
import type { WindowService } from '@main/services/window'

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function getTrayIconPath(): string {
  return app.isPackaged
    ? join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'icon.ico')
    : join(app.getAppPath(), 'resources', 'icon.ico')
}

export class NativeTray {
  private readonly ipcService: IpcService
  private readonly windowService: WindowService

  private tray: Tray | null = null
  private lastMenuAnchorPoint: Electron.Point | null = null

  constructor(deps: { ipcService: IpcService; windowService: WindowService }) {
    this.ipcService = deps.ipcService
    this.windowService = deps.windowService
  }

  init(): void {
    const iconPath = getTrayIconPath()
    this.tray = new Tray(iconPath)
    this.tray.setToolTip('Kisaki')

    this.ipcService.on('native:set-tray-menu-height', (_e, height) => {
      this.updateTrayMenuHeight(height)
    })

    this.tray.on('click', () => {
      try {
        this.windowService.focusMainWindow()
      } catch (error) {
        log.error('[NativeTray] Tray click failed:', error)
      }
    })

    this.tray.on('right-click', (_event, _bounds) => {
      try {
        this.openTrayMenuWindow(screen.getCursorScreenPoint())
      } catch (error) {
        log.error('[NativeTray] Open tray menu failed:', error)
      }
    })

    log.info('[NativeTray] Initialized')
  }

  dispose(): void {
    try {
      this.tray?.destroy()
    } finally {
      this.tray = null
      this.lastMenuAnchorPoint = null
    }
    log.info('[NativeTray] Disposed')
  }

  private getMenuAnchorPoint(): Electron.Point {
    return this.lastMenuAnchorPoint ?? screen.getCursorScreenPoint()
  }

  private positionTrayMenuWindow(win: BrowserWindow, anchor: Electron.Point): void {
    const display = screen.getDisplayNearestPoint(anchor)
    const workArea = display.workArea

    const [winWidth, winHeight] = win.getSize()

    const workAreaRight = workArea.x + workArea.width
    const workAreaBottom = workArea.y + workArea.height
    let targetX = anchor.x
    let targetY = anchor.y - winHeight

    if (targetX + winWidth > workAreaRight) {
      targetX = anchor.x - winWidth
    }
    if (targetY < workArea.y) {
      targetY = anchor.y
    }
    if (targetY + winHeight > workAreaBottom) {
      targetY = anchor.y - winHeight
    }

    const minX = workArea.x
    const minY = workArea.y
    const maxX = Math.max(workArea.x, workAreaRight - winWidth)
    const maxY = Math.max(workArea.y, workAreaBottom - winHeight)

    targetX = clamp(targetX, minX, maxX)
    targetY = clamp(targetY, minY, maxY)

    win.setPosition(Math.round(targetX), Math.round(targetY), false)
  }

  private openTrayMenuWindow(anchorPoint: Electron.Point): void {
    const win = this.windowService.getTrayMenuWindow()
    if (!win) {
      log.warn('[NativeTray] Tray menu window not available')
      return
    }

    this.lastMenuAnchorPoint = { x: Math.round(anchorPoint.x), y: Math.round(anchorPoint.y) }

    this.positionTrayMenuWindow(win, this.lastMenuAnchorPoint)
    win.show()
    win.focus()
  }

  private updateTrayMenuHeight(height: number): void {
    const win = this.windowService.getTrayMenuWindow()
    if (!win) return
    if (!Number.isFinite(height) || height <= 0) return

    const [currentWidth, currentHeight] = win.getContentSize()
    if (currentHeight === height) return

    win.setContentSize(currentWidth, height, false)
    if (win.isVisible()) {
      this.positionTrayMenuWindow(win, this.getMenuAnchorPoint())
    }
  }
}
