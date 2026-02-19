import type { ExternalId } from '@shared/metadata'

/** Current selection state for parent component */
export interface CompanySearcherSelection {
  profileId: string
  companyId: string
  companyName: string
  originalName?: string
  knownIds: ExternalId[]
  canSubmit: boolean
}
