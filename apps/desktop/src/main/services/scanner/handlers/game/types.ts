import type { EntityEntry, ScanCompletedData } from '@shared/scanner'
import type { ExternalId } from '@shared/metadata'

export interface ScanQueueItem {
  scannerId: string
  resolve: (value: ScanCompletedData) => void
  reject: (reason: unknown) => void
}

export type GameMatchSource = 'phash' | 'folder-name'

export interface MatchedGame {
  gameName: string
  externalIds: ExternalId[]
  matchSource: GameMatchSource
}

/** Game entity with additional game-specific data */
export interface GameEntity extends EntityEntry {
  matchedGame: MatchedGame
}
