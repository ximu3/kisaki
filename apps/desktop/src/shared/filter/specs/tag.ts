import { tags } from '@shared/db'
import { defineQuerySpec } from '../spec'

export const tagFilterQuerySpec = defineQuerySpec({
  entityType: 'tag',
  tableName: 'tags',
  fields: [
    { key: 'isNsfw', kind: 'boolean', column: tags.isNsfw },
    { key: 'createdAt', kind: 'dateRange', mode: 'timestampMs', column: tags.createdAt }
  ],
  sort: {
    defaultKey: 'name',
    fields: [
      { key: 'name', column: tags.name },
      { key: 'createdAt', column: tags.createdAt }
    ]
  }
})
