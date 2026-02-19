import { games } from '@shared/db'
import { defineQuerySpec } from '../spec'

export const gameFilterQuerySpec = defineQuerySpec({
  entityType: 'game',
  tableName: 'games',
  fields: [
    { key: 'isFavorite', kind: 'boolean', column: games.isFavorite },
    { key: 'isNsfw', kind: 'boolean', column: games.isNsfw },

    { key: 'status', kind: 'multiSelect', column: games.status },

    { key: 'score', kind: 'numberRange', column: games.score },
    { key: 'totalDuration', kind: 'numberRange', column: games.totalDuration },

    { key: 'releaseDate', kind: 'dateRange', mode: 'partialDate', columnName: 'release_date' },
    { key: 'lastActiveAt', kind: 'dateRange', mode: 'timestampMs', column: games.lastActiveAt },
    { key: 'createdAt', kind: 'dateRange', mode: 'timestampMs', column: games.createdAt },

    {
      key: 'tags',
      kind: 'relation',
      link: { linkTableName: 'game_tag_links', mainIdColumn: 'game_id', relatedIdColumn: 'tag_id' }
    },
    {
      key: 'collections',
      kind: 'relation',
      link: {
        linkTableName: 'collection_game_links',
        mainIdColumn: 'game_id',
        relatedIdColumn: 'collection_id'
      }
    },
    {
      key: 'persons',
      kind: 'relation',
      link: {
        linkTableName: 'game_person_links',
        mainIdColumn: 'game_id',
        relatedIdColumn: 'person_id'
      }
    },
    {
      key: 'companies',
      kind: 'relation',
      link: {
        linkTableName: 'game_company_links',
        mainIdColumn: 'game_id',
        relatedIdColumn: 'company_id'
      }
    },
    {
      key: 'characters',
      kind: 'relation',
      link: {
        linkTableName: 'game_character_links',
        mainIdColumn: 'game_id',
        relatedIdColumn: 'character_id'
      }
    }
  ],
  sort: {
    defaultKey: 'name',
    fields: [
      { key: 'name', column: games.name },
      { key: 'sortName', column: games.sortName },
      { key: 'originalName', column: games.originalName },
      { key: 'lastActiveAt', column: games.lastActiveAt },
      { key: 'totalDuration', column: games.totalDuration },
      { key: 'createdAt', column: games.createdAt },
      { key: 'releaseDate', kind: 'partialDate', columnName: 'release_date' },
      { key: 'score', column: games.score }
    ]
  }
})
