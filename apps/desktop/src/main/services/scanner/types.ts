import type { MediaType } from '@shared/common'

export type FileIconSize = 'small' | 'normal' | 'large'

export type PhashInputSpec = {
  kind: 'file-icon'
  iconSize: FileIconSize
}

export interface PhashIndexSpec {
  mediaType: MediaType
  selectSql: string
  defaultMaxDistance: number
  input: PhashInputSpec
}

export const GAME_PHASH_INDEX: PhashIndexSpec = {
  mediaType: 'game',
  selectSql: 'SELECT id, name, external_ids, phash FROM games',
  defaultMaxDistance: 5,
  input: { kind: 'file-icon', iconSize: 'large' }
}
