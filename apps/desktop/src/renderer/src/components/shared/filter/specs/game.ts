import type { FilterUiSpec } from './types'
import { GAME_STATUS_OPTIONS } from './shared-options'

export const gameFilterUiSpec: FilterUiSpec = {
  entityType: 'game',
  fields: [
    { key: 'isFavorite', label: '我喜欢', category: 'toggle', control: 'boolean' },
    { key: 'isNsfw', label: 'NSFW', category: 'toggle', control: 'boolean' },

    {
      key: 'status',
      label: '状态',
      category: 'enum',
      control: 'multiSelect',
      options: [...GAME_STATUS_OPTIONS]
    },

    {
      key: 'score',
      label: '评分',
      category: 'numeric',
      control: 'numberRange',
      min: 0,
      max: 100,
      step: 1
    },
    {
      key: 'totalDuration',
      label: '游玩时长',
      category: 'numeric',
      control: 'numberRange',
      min: 0,
      placeholder: '秒'
    },

    { key: 'releaseDate', label: '发行日期', category: 'date', control: 'dateRange' },
    { key: 'lastActiveAt', label: '最近游玩', category: 'date', control: 'dateRange' },
    { key: 'createdAt', label: '添加时间', category: 'date', control: 'dateRange' },

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
    },
    {
      key: 'persons',
      label: '相关人员',
      category: 'relation',
      control: 'relation',
      targetEntity: 'person',
      multiple: true
    },
    {
      key: 'companies',
      label: '相关公司',
      category: 'relation',
      control: 'relation',
      targetEntity: 'company',
      multiple: true
    },
    {
      key: 'characters',
      label: '相关角色',
      category: 'relation',
      control: 'relation',
      targetEntity: 'character',
      multiple: true
    }
  ],
  sortOptions: [
    { key: 'name', label: '名称' },
    { key: 'sortName', label: '排序名' },
    { key: 'originalName', label: '原名' },
    { key: 'lastActiveAt', label: '最近游玩' },
    { key: 'totalDuration', label: '游玩时长' },
    { key: 'createdAt', label: '添加时间' },
    { key: 'releaseDate', label: '发行日期' },
    { key: 'score', label: '评分' }
  ]
}
