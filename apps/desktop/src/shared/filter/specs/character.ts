import { characters } from '@shared/db'
import { defineQuerySpec } from '../spec'

export const characterFilterQuerySpec = defineQuerySpec({
  entityType: 'character',
  tableName: 'characters',
  fields: [
    { key: 'isFavorite', kind: 'boolean', column: characters.isFavorite },
    { key: 'isNsfw', kind: 'boolean', column: characters.isNsfw },

    { key: 'gender', kind: 'select', column: characters.gender },
    { key: 'bloodType', kind: 'select', column: characters.bloodType },
    { key: 'cup', kind: 'select', column: characters.cup },

    { key: 'score', kind: 'numberRange', column: characters.score },
    { key: 'age', kind: 'numberRange', column: characters.age },
    { key: 'height', kind: 'numberRange', column: characters.height },
    { key: 'weight', kind: 'numberRange', column: characters.weight },
    { key: 'bust', kind: 'numberRange', column: characters.bust },
    { key: 'waist', kind: 'numberRange', column: characters.waist },
    { key: 'hips', kind: 'numberRange', column: characters.hips },

    { key: 'birthDate', kind: 'dateRange', mode: 'partialDate', columnName: 'birth_date' },
    { key: 'createdAt', kind: 'dateRange', mode: 'timestampMs', column: characters.createdAt },

    {
      key: 'games',
      kind: 'relation',
      link: {
        linkTableName: 'game_character_links',
        mainIdColumn: 'character_id',
        relatedIdColumn: 'game_id'
      }
    },
    {
      key: 'tags',
      kind: 'relation',
      link: {
        linkTableName: 'character_tag_links',
        mainIdColumn: 'character_id',
        relatedIdColumn: 'tag_id'
      }
    },
    {
      key: 'collections',
      kind: 'relation',
      link: {
        linkTableName: 'collection_character_links',
        mainIdColumn: 'character_id',
        relatedIdColumn: 'collection_id'
      }
    }
  ],
  sort: {
    defaultKey: 'name',
    fields: [
      { key: 'name', column: characters.name },
      { key: 'sortName', column: characters.sortName },
      { key: 'originalName', column: characters.originalName },
      { key: 'createdAt', column: characters.createdAt },
      { key: 'score', column: characters.score },
      { key: 'age', column: characters.age },
      { key: 'height', column: characters.height },
      { key: 'birthDate', kind: 'partialDate', columnName: 'birth_date' }
    ]
  }
})
