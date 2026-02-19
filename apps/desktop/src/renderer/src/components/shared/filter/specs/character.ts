import type { FilterUiSpec } from './types'
import { BLOOD_TYPE_OPTIONS, CUP_SIZE_OPTIONS, GENDER_OPTIONS } from './shared-options'

export const characterFilterUiSpec: FilterUiSpec = {
  entityType: 'character',
  fields: [
    { key: 'isFavorite', label: '我喜欢', category: 'toggle', control: 'boolean' },
    { key: 'isNsfw', label: 'NSFW', category: 'toggle', control: 'boolean' },

    {
      key: 'gender',
      label: '性别',
      category: 'enum',
      control: 'select',
      options: [...GENDER_OPTIONS]
    },
    {
      key: 'bloodType',
      label: '血型',
      category: 'enum',
      control: 'select',
      options: [...BLOOD_TYPE_OPTIONS]
    },
    {
      key: 'cup',
      label: '罩杯',
      category: 'enum',
      control: 'select',
      options: [...CUP_SIZE_OPTIONS]
    },

    { key: 'score', label: '评分', category: 'numeric', control: 'numberRange', min: 0, max: 100 },
    { key: 'age', label: '年龄', category: 'numeric', control: 'numberRange', min: 0, max: 999 },
    {
      key: 'height',
      label: '身高',
      category: 'numeric',
      control: 'numberRange',
      min: 0,
      max: 300,
      placeholder: 'cm'
    },
    {
      key: 'weight',
      label: '体重',
      category: 'numeric',
      control: 'numberRange',
      min: 0,
      max: 500,
      placeholder: 'kg'
    },
    {
      key: 'bust',
      label: '胸围',
      category: 'numeric',
      control: 'numberRange',
      min: 0,
      max: 300,
      placeholder: 'cm'
    },
    {
      key: 'waist',
      label: '腰围',
      category: 'numeric',
      control: 'numberRange',
      min: 0,
      max: 300,
      placeholder: 'cm'
    },
    {
      key: 'hips',
      label: '臀围',
      category: 'numeric',
      control: 'numberRange',
      min: 0,
      max: 300,
      placeholder: 'cm'
    },

    { key: 'birthDate', label: '生日', category: 'date', control: 'dateRange' },
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
    { key: 'age', label: '年龄' },
    { key: 'height', label: '身高' },
    { key: 'birthDate', label: '生日' }
  ]
}
