import type { FilterUiSpec } from './types'

export const collectionFilterUiSpec: FilterUiSpec = {
  entityType: 'collection',
  fields: [
    { key: 'isNsfw', label: 'NSFW', category: 'toggle', control: 'boolean' },
    { key: 'createdAt', label: '添加时间', category: 'date', control: 'dateRange' }
  ],
  sortOptions: [
    { key: 'name', label: '名称' },
    { key: 'order', label: '排序' },
    { key: 'createdAt', label: '添加时间' }
  ]
}
