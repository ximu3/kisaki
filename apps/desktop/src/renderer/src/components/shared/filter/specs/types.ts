import type { AllEntityType, ContentEntityType } from '@shared/common'

export type FilterUiCategory = 'toggle' | 'enum' | 'numeric' | 'date' | 'relation'

export type FilterUiControl =
  | 'boolean'
  | 'select'
  | 'multiSelect'
  | 'numberRange'
  | 'dateRange'
  | 'relation'

export type RelationTargetEntity = AllEntityType

export type FilterUiFieldDef =
  | {
      key: string
      label: string
      category: 'toggle'
      control: 'boolean'
    }
  | {
      key: string
      label: string
      category: 'enum'
      control: 'select'
      options: { value: string; label: string }[]
    }
  | {
      key: string
      label: string
      category: 'enum'
      control: 'multiSelect'
      options: { value: string; label: string }[]
    }
  | {
      key: string
      label: string
      category: 'numeric'
      control: 'numberRange'
      min?: number
      max?: number
      step?: number
      placeholder?: string
    }
  | {
      key: string
      label: string
      category: 'date'
      control: 'dateRange'
    }
  | {
      key: string
      label: string
      category: 'relation'
      control: 'relation'
      targetEntity: RelationTargetEntity
      multiple: boolean
    }

export interface FilterUiSortOption {
  key: string
  label: string
}

export interface FilterUiSpec {
  entityType: AllEntityType
  fields: readonly FilterUiFieldDef[]
  sortOptions: readonly FilterUiSortOption[]
}

export type ContentFilterUiSpec = Omit<FilterUiSpec, 'entityType'> & {
  entityType: ContentEntityType
}
