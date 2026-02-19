/**
 * IPC type definitions and result types
 *
 * Defines all IPC channels and their type contracts.
 *
 * Plugin type extension:
 * Plugins can extend IPC interfaces via module declaration merging:
 * @example
 * // In plugin's shared/ipc.ts
 * declare module '@kisaki/plugin-sdk/main' {
 *   interface IpcMainHandlers {
 *     'my-plugin:fetch-data': (id: string) => IpcResult<MyData>
 *   }
 *   interface IpcMainListeners {
 *     'my-plugin:notify': [message: string]
 *   }
 * }
 */

import type { CropRegion } from './attachment'
import type { AttachmentInput } from './db/attachment'
import type { TableName } from './db/table-names'
import type { NameExtractionRule, SaveBackup } from './db/json-types'
import type { CharacterMetadata, CompanyMetadata, GameMetadata, PersonMetadata } from './metadata'
import type { MainWindowCloseAction } from './db/enums'
import type {
  ScraperLookup,
  GameSearchResult,
  GameScraperProviderInfo,
  GameScraperOptions,
  PersonSearchResult,
  PersonScraperProviderInfo,
  PersonScraperOptions,
  CompanySearchResult,
  CompanyScraperProviderInfo,
  CompanyScraperOptions,
  CharacterSearchResult,
  CharacterScraperProviderInfo,
  CharacterScraperOptions,
  GameImageSlot
} from './scraper'
import type { ScanProgressData, ExtractionTestResult } from './scanner'
import type {
  AddCharacterOptions,
  AddCharacterResult,
  AddCompanyOptions,
  AddCompanyResult,
  AddGameOptions,
  AddGameResult,
  AddPersonOptions,
  AddPersonResult
} from './adder'
import type {
  CharacterMetadataUpdateInput,
  CompanyMetadataUpdateInput,
  GameMetadataUpdateInput,
  PersonMetadataUpdateInput,
  UpdateCharacterMetadataOptions,
  UpdateCharacterMetadataResult,
  UpdateCompanyMetadataOptions,
  UpdateCompanyMetadataResult,
  UpdateGameMetadataOptions,
  UpdateGameMetadataResult,
  UpdatePersonMetadataOptions,
  UpdatePersonMetadataResult
} from './metadata-updater'
import type { GameRunningStatus } from './monitor'
import type { PortableStatus, PortableSwitchTarget } from './portable'
import type {
  PluginRegistryEntry,
  PluginUpdateInfo,
  InstalledPluginInfo,
  RendererPluginEntry
} from './plugin'
import type { NotifyOptions } from './notify'
import type { AppEvents } from './events'
import type { OpenDialogOptions, OpenDialogReturnValue } from 'electron'
import type {
  DeeplinkResult,
  DeeplinkAction,
  DeeplinkNavigatePayload,
  DeeplinkAuthCallbackPayload,
  DeeplinkAuthErrorPayload
} from './deeplink'
import type { BootstrapArgs } from './bootstrap'

// =============================================================================
// IPC Result Types
// =============================================================================

/**
 * Successful IPC result with data
 */
export interface IpcSuccess<T = void> {
  success: true
  data: T
}

/**
 * Successful IPC result without data (for void operations)
 */
export interface IpcSuccessVoid {
  success: true
}

/**
 * Failed IPC result with error message
 */
export interface IpcError {
  success: false
  error: string
}

/**
 * Generic IPC result type
 */
export type IpcResult<T = void> = T extends void
  ? IpcSuccessVoid | IpcError
  : IpcSuccess<T> | IpcError

/**
 * Alias for IpcResult<void> for better readability
 */
export type IpcVoidResult = IpcResult<void>

/**
 * Extract the data type from an IpcResult
 */
export type ExtractIpcData<T> = T extends IpcSuccess<infer D> ? D : never

// =============================================================================
// IPC Interfaces (extensible via declaration merging)
// =============================================================================

/**
 * IPC listeners - main process receives, no response.
 *
 * This interface is exported and can be extended via declaration merging.
 * Each listener maps to a tuple of its argument types.
 */
export interface IpcMainListeners {
  ping: [string]
  'event:forward': [event: keyof AppEvents, args: unknown[]]
  'scanner:scan-game': [scannerId: string]
  'scanner:scan-all-game': []
  'notify:native': [NotifyOptions]
  'notify:auto': [NotifyOptions]
  'native:set-tray-menu-height': [height: number]
  'window:set-main-window-close-action': [action: MainWindowCloseAction]
}

/**
 * IPC handlers - main process receives, returns response.
 *
 * This interface is exported and can be extended via declaration merging.
 * Each handler maps to its function signature.
 */
export interface IpcMainHandlers {
  // App bootstrap
  'app:get-bootstrap-args': () => IpcResult<BootstrapArgs>
  'app:quit': () => IpcVoidResult

  // Debug mode
  'debug:get-mode': () => IpcResult<boolean>
  'debug:is-inspector-active': () => IpcResult<boolean>
  'debug:get-ports': () => IpcResult<{ main: number; renderer: number }>

  // Main window management
  'window:minimize-main-window': () => IpcVoidResult
  'window:toggle-main-window-maximize': () => IpcVoidResult
  'window:close-main-window': () => IpcVoidResult

  // Database proxy
  'db:execute': (
    sqlstr: string,
    params: unknown[],
    method: 'run' | 'all' | 'values' | 'get'
  ) => IpcResult<unknown[]>
  'db:rebuild-fts': (entityType?: 'game' | 'character' | 'person' | 'company') => IpcVoidResult

  // DB attachment (DbService.attachment)
  /**
   * NOTE (typing / IPC limitation):
   * - IPC payloads must be serializable, so we cannot pass a Drizzle `table` object here.
   *   We pass `TableName` and resolve to the real table in the main process.
   * - `field` cannot be expressed as `FileColumns<TTable>` / `FilesColumns<TTable>` at this layer
   *   because `IpcMainHandlers` has no generic context to tie `table` -> `field` for TS inference.
   *   Renderer-side clients should expose precise, table-aware APIs (and they do).
   */
  'db:attachment-set-file': (
    table: TableName,
    rowId: string,
    field: string,
    input: AttachmentInput
  ) => IpcResult<string>
  'db:attachment-clear-file': (table: TableName, rowId: string, field: string) => IpcVoidResult
  'db:attachment-add-file': (
    table: TableName,
    rowId: string,
    field: string,
    input: AttachmentInput
  ) => IpcResult<string>
  'db:attachment-remove-file': (
    table: TableName,
    rowId: string,
    field: string,
    fileName: string
  ) => IpcVoidResult
  'db:attachment-list-files': (
    table: TableName,
    rowId: string,
    field: string
  ) => IpcResult<string[]>
  'db:attachment-clear-files': (table: TableName, rowId: string, field: string) => IpcVoidResult
  'db:attachment-cleanup-row': (table: TableName, rowId: string) => IpcVoidResult
  'db:attachment-get-path': (table: TableName, rowId: string, fileName: string) => IpcResult<string>

  // Adder
  'adder:add-game': (metadata: GameMetadata, options?: AddGameOptions) => IpcResult<AddGameResult>
  'adder:add-person': (
    metadata: PersonMetadata,
    options?: AddPersonOptions
  ) => IpcResult<AddPersonResult>
  'adder:add-company': (
    metadata: CompanyMetadata,
    options?: AddCompanyOptions
  ) => IpcResult<AddCompanyResult>
  'adder:add-character': (
    metadata: CharacterMetadata,
    options?: AddCharacterOptions
  ) => IpcResult<AddCharacterResult>

  // Metadata updater
  'metadata-updater:update-game': (
    gameId: string,
    metadata: GameMetadataUpdateInput,
    options?: UpdateGameMetadataOptions
  ) => IpcResult<UpdateGameMetadataResult>
  'metadata-updater:update-person': (
    personId: string,
    metadata: PersonMetadataUpdateInput,
    options?: UpdatePersonMetadataOptions
  ) => IpcResult<UpdatePersonMetadataResult>
  'metadata-updater:update-company': (
    companyId: string,
    metadata: CompanyMetadataUpdateInput,
    options?: UpdateCompanyMetadataOptions
  ) => IpcResult<UpdateCompanyMetadataResult>
  'metadata-updater:update-character': (
    characterId: string,
    metadata: CharacterMetadataUpdateInput,
    options?: UpdateCharacterMetadataOptions
  ) => IpcResult<UpdateCharacterMetadataResult>

  // Scraper
  'scraper:list-game-providers': () => IpcResult<GameScraperProviderInfo[]>
  'scraper:get-game-provider': (providerId: string) => IpcResult<GameScraperProviderInfo>
  'scraper:search-game': (profileId: string, query: string) => IpcResult<GameSearchResult[]>
  'scraper:get-game-metadata': (
    profileId: string,
    lookup: ScraperLookup,
    options?: GameScraperOptions
  ) => IpcResult<GameMetadata | null>
  'scraper:get-game-provider-images': (
    providerId: string,
    lookup: ScraperLookup,
    imageType: GameImageSlot
  ) => IpcResult<string[]>

  'scraper:list-person-providers': () => IpcResult<PersonScraperProviderInfo[]>
  'scraper:get-person-provider': (providerId: string) => IpcResult<PersonScraperProviderInfo>
  'scraper:search-person': (profileId: string, query: string) => IpcResult<PersonSearchResult[]>
  'scraper:get-person-metadata': (
    profileId: string,
    lookup: ScraperLookup,
    options?: PersonScraperOptions
  ) => IpcResult<PersonMetadata | null>
  'scraper:get-person-provider-images': (
    providerId: string,
    lookup: ScraperLookup,
    imageType: 'photos'
  ) => IpcResult<string[]>

  'scraper:list-company-providers': () => IpcResult<CompanyScraperProviderInfo[]>
  'scraper:get-company-provider': (providerId: string) => IpcResult<CompanyScraperProviderInfo>
  'scraper:search-company': (profileId: string, query: string) => IpcResult<CompanySearchResult[]>
  'scraper:get-company-metadata': (
    profileId: string,
    lookup: ScraperLookup,
    options?: CompanyScraperOptions
  ) => IpcResult<CompanyMetadata | null>
  'scraper:get-company-provider-images': (
    providerId: string,
    lookup: ScraperLookup,
    imageType: 'logos'
  ) => IpcResult<string[]>

  'scraper:list-character-providers': () => IpcResult<CharacterScraperProviderInfo[]>
  'scraper:get-character-provider': (providerId: string) => IpcResult<CharacterScraperProviderInfo>
  'scraper:search-character': (
    profileId: string,
    query: string
  ) => IpcResult<CharacterSearchResult[]>
  'scraper:get-character-metadata': (
    profileId: string,
    lookup: ScraperLookup,
    options?: CharacterScraperOptions
  ) => IpcResult<CharacterMetadata | null>
  'scraper:get-character-provider-images': (
    providerId: string,
    lookup: ScraperLookup,
    imageType: 'photos'
  ) => IpcResult<string[]>

  // Monitor
  'monitor:start-game': (gameId: string) => IpcVoidResult
  'monitor:stop-game': (gameId: string) => IpcVoidResult
  'monitor:get-game-status': (gameId?: string) => IpcResult<GameRunningStatus | GameRunningStatus[]>
  'monitor:compute-effective-path': (config: {
    monitorPath: string | null
    monitorMode: 'folder' | 'file' | 'process'
    gameDirPath: string | null
    launcherMode: 'file' | 'url' | 'exec'
    launcherPath: string | null
  }) => IpcResult<string | null>

  // Launcher
  'launcher:kill-game': (gameId: string) => IpcVoidResult
  'launcher:launch-game': (gameId: string) => IpcVoidResult
  'launcher:apply-default-config': (gameId: string, filePath: string) => IpcVoidResult

  // Native dialogs
  'native:open-dialog': (options?: OpenDialogOptions) => IpcResult<OpenDialogReturnValue>
  'native:open-path': (
    input:
      | string
      | {
          path: string
          /** Ensure system opens a folder (never launches an .exe). */
          ensure?: 'auto' | 'folder' | 'file'
        }
  ) => IpcVoidResult
  'native:get-auto-launch': () => IpcResult<boolean>
  'native:set-auto-launch': (enabled: boolean) => IpcVoidResult

  // Attachment
  'attachment:crop-to-temp': (
    input: AttachmentInput,
    cropRegion: CropRegion,
    options?: {
      format?: 'keep' | 'png' | 'jpeg' | 'webp'
      quality?: number
    }
  ) => IpcResult<string>

  // Save backup
  'attachment:create-game-backup': (gameId: string, note?: string) => IpcResult<SaveBackup>
  'attachment:delete-game-backup': (gameId: string, backupAt: number) => IpcVoidResult
  'attachment:restore-game-backup': (gameId: string, backupAt: number) => IpcVoidResult
  'attachment:update-game-backup': (
    gameId: string,
    backupAt: number,
    updates: Partial<Pick<SaveBackup, 'note' | 'locked'>>
  ) => IpcVoidResult
  'attachment:open-backup-folder': (gameId: string) => IpcVoidResult
  'attachment:open-save-folder': (gameId: string) => IpcVoidResult

  // Portable mode
  'portable:get-status': () => IpcResult<PortableStatus>
  'portable:get-pending-switch': () => IpcResult<PortableSwitchTarget | null>
  'portable:switch-to-portable': () => IpcVoidResult
  'portable:switch-to-normal': () => IpcVoidResult
  'portable:cancel-pending-switch': () => IpcVoidResult

  // Plugin system
  'plugin:dev-is-continued': () => IpcResult<boolean>
  'plugin:disable': (pluginId: string) => IpcVoidResult
  'plugin:enable': (pluginId: string) => IpcVoidResult
  'plugin:is-disabled': (pluginId: string) => IpcResult<boolean>
  'plugin:install': (source: string) => IpcVoidResult
  'plugin:install-from-file': (filePath: string) => IpcVoidResult
  'plugin:uninstall': (pluginId: string) => IpcVoidResult
  'plugin:check-updates': () => IpcResult<PluginUpdateInfo[]>
  'plugin:update': (pluginId: string) => IpcVoidResult
  'plugin:get-installed': () => IpcResult<InstalledPluginInfo[]>
  'plugin:get-registries': () => IpcResult<
    Array<{ name: string; displayName: string; searchable: boolean }>
  >
  'plugin:search': (
    registryName: string,
    query: string,
    options?: { page?: number; limit?: number }
  ) => IpcResult<{
    entries: PluginRegistryEntry[]
    total: number
    hasMore: boolean
  }>
  'plugin:get-loaded-entries': () => IpcResult<RendererPluginEntry[]>

  // Scanner
  'scanner:get-active-scans': () => IpcResult<ScanProgressData[]>
  'scanner:test-extraction-rules': (
    scannerPath: string,
    entityDepth: number,
    rules: NameExtractionRule[]
  ) => IpcResult<ExtractionTestResult[]>

  // Deeplink
  'deeplink:handle': (url: string) => IpcResult<DeeplinkResult>
  'deeplink:get-actions': () => IpcResult<DeeplinkAction[]>
}

/**
 * IPC events sent from main to renderer.
 *
 * This interface is exported and can be extended via declaration merging.
 * Each event maps to a tuple of its argument types.
 */
export interface IpcRendererEvents {
  ready: [boolean]
  'event:forward': [event: keyof AppEvents, args: unknown[]]
  'native:main-window-maximized': []
  'native:main-window-unmaximized': []
  'monitor:game-started': [string]
  'monitor:game-stopped': [string]
  'monitor:game-foreground': [string]
  'monitor:game-background': [string]
  'scanner:scan-progress': [ScanProgressData]

  'notify:show': [NotifyOptions & { toastId?: string }]
  'notify:loading': [{ toastId: string; title: string; message?: string }]
  'notify:update': [{ toastId: string } & NotifyOptions]
  'notify:dismiss': [{ toastId?: string }]

  // Plugin lifecycle (main → renderer)
  // loaded/unloaded: runtime lifecycle for renderer plugin loading
  'plugin:loaded': [pluginId: string, entry: RendererPluginEntry | null]
  'plugin:unloaded': [pluginId: string]
  'plugin:reloaded': [pluginId: string, entry: RendererPluginEntry | null]
  'plugin:dev-continued': []

  // Deeplink events (main → renderer)
  'deeplink:navigate': [DeeplinkNavigatePayload]
  'deeplink:auth-callback': [DeeplinkAuthCallbackPayload]
  'deeplink:auth-error': [DeeplinkAuthErrorPayload]
}
