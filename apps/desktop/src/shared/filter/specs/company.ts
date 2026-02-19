import { companies } from '@shared/db'
import { defineQuerySpec } from '../spec'

export const companyFilterQuerySpec = defineQuerySpec({
  entityType: 'company',
  tableName: 'companies',
  fields: [
    { key: 'isFavorite', kind: 'boolean', column: companies.isFavorite },
    { key: 'isNsfw', kind: 'boolean', column: companies.isNsfw },

    { key: 'score', kind: 'numberRange', column: companies.score },

    { key: 'foundedDate', kind: 'dateRange', mode: 'partialDate', columnName: 'founded_date' },
    { key: 'createdAt', kind: 'dateRange', mode: 'timestampMs', column: companies.createdAt },

    {
      key: 'games',
      kind: 'relation',
      link: {
        linkTableName: 'game_company_links',
        mainIdColumn: 'company_id',
        relatedIdColumn: 'game_id'
      }
    },
    {
      key: 'tags',
      kind: 'relation',
      link: {
        linkTableName: 'company_tag_links',
        mainIdColumn: 'company_id',
        relatedIdColumn: 'tag_id'
      }
    },
    {
      key: 'collections',
      kind: 'relation',
      link: {
        linkTableName: 'collection_company_links',
        mainIdColumn: 'company_id',
        relatedIdColumn: 'collection_id'
      }
    }
  ],
  sort: {
    defaultKey: 'name',
    fields: [
      { key: 'name', column: companies.name },
      { key: 'sortName', column: companies.sortName },
      { key: 'originalName', column: companies.originalName },
      { key: 'createdAt', column: companies.createdAt },
      { key: 'score', column: companies.score },
      { key: 'foundedDate', kind: 'partialDate', columnName: 'founded_date' }
    ]
  }
})
