import type {
  AddCharacterResult,
  AddCompanyResult,
  AddGameResult,
  AddPersonResult
} from '@shared/adder'

export type PendingAssetTask =
  | {
      type: 'game'
      gameId: string
      field: 'coverFile' | 'backdropFile' | 'logoFile' | 'iconFile'
      url: string
    }
  | {
      type: 'person'
      personId: string
      url: string
    }
  | {
      type: 'company'
      companyId: string
      url: string
    }
  | {
      type: 'character'
      characterId: string
      url: string
    }

export interface AddGameInternalResult extends AddGameResult {
  pendingAssets: PendingAssetTask[]
}

export interface AddPersonInternalResult extends AddPersonResult {
  pendingAssets: PendingAssetTask[]
}

export interface AddCompanyInternalResult extends AddCompanyResult {
  pendingAssets: PendingAssetTask[]
}

export interface AddCharacterInternalResult extends AddCharacterResult {
  pendingAssets: PendingAssetTask[]
}
