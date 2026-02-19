/**
 * Kisaki Plugin SDK - Electron Re-exports
 *
 * Provides Electron APIs from host application.
 */

import type { KisakiMainAPI } from '../types/main.plugin'

const g = globalThis as unknown as { kisaki: KisakiMainAPI }

const electron = g.kisaki.__deps.electron

// App
export const app: typeof electron.app = electron.app

// IPC
export const ipcMain: typeof electron.ipcMain = electron.ipcMain
export const ipcRenderer: typeof electron.ipcRenderer = electron.ipcRenderer

// Window
export const BrowserWindow: typeof electron.BrowserWindow = electron.BrowserWindow
export const BaseWindow: typeof electron.BaseWindow = electron.BaseWindow

// Dialog
export const dialog: typeof electron.dialog = electron.dialog

// Menu
export const Menu: typeof electron.Menu = electron.Menu
export const MenuItem: typeof electron.MenuItem = electron.MenuItem

// Tray
export const Tray: typeof electron.Tray = electron.Tray

// Notification
export const Notification: typeof electron.Notification = electron.Notification

// Shell
export const shell: typeof electron.shell = electron.shell

// Clipboard
export const clipboard: typeof electron.clipboard = electron.clipboard

// Native image
export const nativeImage: typeof electron.nativeImage = electron.nativeImage

// Screen
export const screen: typeof electron.screen = electron.screen

// Global shortcut
export const globalShortcut: typeof electron.globalShortcut = electron.globalShortcut

// Protocol
export const protocol: typeof electron.protocol = electron.protocol

// Net
export const net: typeof electron.net = electron.net

// Session
export const session: typeof electron.session = electron.session

// Web contents
export const webContents: typeof electron.webContents = electron.webContents

// Context bridge
export const contextBridge: typeof electron.contextBridge = electron.contextBridge

// Power
export const powerMonitor: typeof electron.powerMonitor = electron.powerMonitor
export const powerSaveBlocker: typeof electron.powerSaveBlocker = electron.powerSaveBlocker

// Native theme
export const nativeTheme: typeof electron.nativeTheme = electron.nativeTheme

// System preferences
export const systemPreferences: typeof electron.systemPreferences = electron.systemPreferences

// Safe storage
export const safeStorage: typeof electron.safeStorage = electron.safeStorage

// Desktop capturer
export const desktopCapturer: typeof electron.desktopCapturer = electron.desktopCapturer

// Note: electron uses 'export =' pattern, types are available via named exports above
