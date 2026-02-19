import { collections } from '@shared/db'
import { defineQuerySpec } from '../spec'

export const collectionFilterQuerySpec = defineQuerySpec({
  entityType: 'collection',
  tableName: 'collections',
  fields: [
    { key: 'isNsfw', kind: 'boolean', column: collections.isNsfw },
    { key: 'createdAt', kind: 'dateRange', mode: 'timestampMs', column: collections.createdAt }
  ],
  sort: {
    defaultKey: 'name',
    fields: [
      { key: 'name', column: collections.name },
      { key: 'order', column: collections.order },
      { key: 'createdAt', column: collections.createdAt }
    ]
  }
})
