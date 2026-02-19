import type { AllEntityType } from '@shared/common'
import type { FilterQuerySpec } from '../spec'

import { gameFilterQuerySpec } from './game'
import { characterFilterQuerySpec } from './character'
import { personFilterQuerySpec } from './person'
import { companyFilterQuerySpec } from './company'
import { collectionFilterQuerySpec } from './collection'
import { tagFilterQuerySpec } from './tag'

export {
  gameFilterQuerySpec,
  characterFilterQuerySpec,
  personFilterQuerySpec,
  companyFilterQuerySpec,
  collectionFilterQuerySpec,
  tagFilterQuerySpec
}

export function getFilterQuerySpec(entityType: AllEntityType): FilterQuerySpec {
  switch (entityType) {
    case 'game':
      return gameFilterQuerySpec
    case 'character':
      return characterFilterQuerySpec
    case 'person':
      return personFilterQuerySpec
    case 'company':
      return companyFilterQuerySpec
    case 'collection':
      return collectionFilterQuerySpec
    case 'tag':
      return tagFilterQuerySpec
  }
}
