import type { ExternalId } from '@shared/metadata'

/** Current selection state for parent component */
export interface GameSearcherSelection {
  profileId: string
  gameId: string
  gameName: string
  originalName?: string
  knownIds: ExternalId[]
  canSubmit: boolean
}
