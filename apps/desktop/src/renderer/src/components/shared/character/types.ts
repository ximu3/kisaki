import type { ExternalId } from '@shared/metadata'

/** Current selection state for parent component */
export interface CharacterSearcherSelection {
  profileId: string
  characterId: string
  characterName: string
  originalName?: string
  knownIds: ExternalId[]
  canSubmit: boolean
}
