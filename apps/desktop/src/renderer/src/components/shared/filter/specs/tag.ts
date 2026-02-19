import type { FilterUiSpec } from './types'

export const tagFilterUiSpec: FilterUiSpec = {
  entityType: 'tag',
  fields: [
    { key: 'isNsfw', label: 'NSFW', category: 'toggle', control: 'boolean' },
    { key: 'createdAt', label: '添加时间', category: 'date', control: 'dateRange' }
  ],
  sortOptions: [
    { key: 'name', label: '名称' },
    { key: 'createdAt', label: '添加时间' }
  ]
}
