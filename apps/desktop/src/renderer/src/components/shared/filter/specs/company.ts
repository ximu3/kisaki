import type { FilterUiSpec } from './types'

export const companyFilterUiSpec: FilterUiSpec = {
  entityType: 'company',
  fields: [
    { key: 'isFavorite', label: '我喜欢', category: 'toggle', control: 'boolean' },
    { key: 'isNsfw', label: 'NSFW', category: 'toggle', control: 'boolean' },

    { key: 'score', label: '评分', category: 'numeric', control: 'numberRange', min: 0, max: 100 },

    { key: 'foundedDate', label: '成立日期', category: 'date', control: 'dateRange' },
    { key: 'createdAt', label: '添加时间', category: 'date', control: 'dateRange' },

    {
      key: 'games',
      label: '相关游戏',
      category: 'relation',
      control: 'relation',
      targetEntity: 'game',
      multiple: true
    },
    {
      key: 'tags',
      label: '标签',
      category: 'relation',
      control: 'relation',
      targetEntity: 'tag',
      multiple: true
    },
    {
      key: 'collections',
      label: '合集',
      category: 'relation',
      control: 'relation',
      targetEntity: 'collection',
      multiple: true
    }
  ],
  sortOptions: [
    { key: 'name', label: '名称' },
    { key: 'sortName', label: '排序名' },
    { key: 'originalName', label: '原名' },
    { key: 'createdAt', label: '添加时间' },
    { key: 'score', label: '评分' },
    { key: 'foundedDate', label: '成立日期' }
  ]
}
