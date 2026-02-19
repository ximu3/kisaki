import type { ExternalId } from '@shared/metadata'

/** Current selection state for parent component */
export interface PersonSearcherSelection {
  profileId: string
  personId: string
  personName: string
  originalName?: string
  knownIds: ExternalId[]
  canSubmit: boolean
}
