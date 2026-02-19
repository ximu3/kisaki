import { persons } from '@shared/db'
import { defineQuerySpec } from '../spec'

export const personFilterQuerySpec = defineQuerySpec({
  entityType: 'person',
  tableName: 'persons',
  fields: [
    { key: 'isFavorite', kind: 'boolean', column: persons.isFavorite },
    { key: 'isNsfw', kind: 'boolean', column: persons.isNsfw },

    { key: 'gender', kind: 'select', column: persons.gender },

    { key: 'score', kind: 'numberRange', column: persons.score },

    { key: 'birthDate', kind: 'dateRange', mode: 'partialDate', columnName: 'birth_date' },
    { key: 'deathDate', kind: 'dateRange', mode: 'partialDate', columnName: 'death_date' },
    { key: 'createdAt', kind: 'dateRange', mode: 'timestampMs', column: persons.createdAt },

    {
      key: 'games',
      kind: 'relation',
      link: {
        linkTableName: 'game_person_links',
        mainIdColumn: 'person_id',
        relatedIdColumn: 'game_id'
      }
    },
    {
      key: 'tags',
      kind: 'relation',
      link: {
        linkTableName: 'person_tag_links',
        mainIdColumn: 'person_id',
        relatedIdColumn: 'tag_id'
      }
    },
    {
      key: 'collections',
      kind: 'relation',
      link: {
        linkTableName: 'collection_person_links',
        mainIdColumn: 'person_id',
        relatedIdColumn: 'collection_id'
      }
    }
  ],
  sort: {
    defaultKey: 'name',
    fields: [
      { key: 'name', column: persons.name },
      { key: 'sortName', column: persons.sortName },
      { key: 'originalName', column: persons.originalName },
      { key: 'createdAt', column: persons.createdAt },
      { key: 'score', column: persons.score },
      { key: 'birthDate', kind: 'partialDate', columnName: 'birth_date' }
    ]
  }
})
