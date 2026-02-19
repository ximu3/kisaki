/**
 * Showcase Section Presets
 *
 * Predefined section configurations for quick showcase setup.
 */

import type { AllEntityType } from '@shared/common'
import type { FilterState, SectionLayout, SectionItemSize } from '@shared/filter'

// =============================================================================
// Types
// =============================================================================

export interface ShowcaseSectionPreset {
  id: string
  name: string
  description: string
  entityType: AllEntityType
  layout: SectionLayout
  itemSize: SectionItemSize
  limit: number | null
  filter: FilterState
  sortField: string
  sortDirection: 'asc' | 'desc'
}

// =============================================================================
// Presets
// =============================================================================

export const SHOWCASE_SECTION_PRESETS: ShowcaseSectionPreset[] = [
  // Game presets
  {
    id: 'recently-played',
    name: '最近游玩',
    description: '按最后活跃时间排序的游戏',
    entityType: 'game',
    layout: 'horizontal',
    itemSize: 'md',
    limit: 20,
    filter: {},
    sortField: 'lastActiveAt',
    sortDirection: 'desc'
  },
  {
    id: 'top-rated',
    name: '高分游戏',
    description: '按评分排序的游戏',
    entityType: 'game',
    layout: 'horizontal',
    itemSize: 'md',
    limit: 20,
    filter: {},
    sortField: 'score',
    sortDirection: 'desc'
  },
  {
    id: 'recently-added',
    name: '最新添加',
    description: '按添加时间排序的游戏',
    entityType: 'game',
    layout: 'horizontal',
    itemSize: 'md',
    limit: 20,
    filter: {},
    sortField: 'createdAt',
    sortDirection: 'desc'
  },
  {
    id: 'all-games',
    name: '全部游戏',
    description: '库中的全部游戏',
    entityType: 'game',
    layout: 'grid',
    itemSize: 'md',
    limit: null,
    filter: {},
    sortField: 'name',
    sortDirection: 'asc'
  },
  {
    id: 'favorite-games',
    name: '喜欢的游戏',
    description: '已红心的游戏',
    entityType: 'game',
    layout: 'horizontal',
    itemSize: 'md',
    limit: null,
    filter: { isFavorite: true },
    sortField: 'name',
    sortDirection: 'asc'
  },

  // Character presets
  {
    id: 'favorite-characters',
    name: '喜欢的角色',
    description: '已红心的角色',
    entityType: 'character',
    layout: 'horizontal',
    itemSize: 'md',
    limit: null,
    filter: { isFavorite: true },
    sortField: 'name',
    sortDirection: 'asc'
  },

  // Person presets
  {
    id: 'favorite-persons',
    name: '喜欢的人物',
    description: '已红心的人物',
    entityType: 'person',
    layout: 'horizontal',
    itemSize: 'md',
    limit: null,
    filter: { isFavorite: true },
    sortField: 'name',
    sortDirection: 'asc'
  },

  // Company presets
  {
    id: 'favorite-companies',
    name: '喜欢的公司',
    description: '已红心的公司',
    entityType: 'company',
    layout: 'horizontal',
    itemSize: 'md',
    limit: null,
    filter: { isFavorite: true },
    sortField: 'name',
    sortDirection: 'asc'
  },

  // Collection presets
  {
    id: 'all-collections',
    name: '全部合集',
    description: '库中的全部合集',
    entityType: 'collection',
    layout: 'horizontal',
    itemSize: 'md',
    limit: 20,
    filter: {},
    sortField: 'order',
    sortDirection: 'asc'
  },

  // Tag presets
  {
    id: 'all-tags',
    name: '全部标签',
    description: '库中的全部标签',
    entityType: 'tag',
    layout: 'horizontal',
    itemSize: 'md',
    limit: 20,
    filter: {},
    sortField: 'name',
    sortDirection: 'asc'
  }
]
