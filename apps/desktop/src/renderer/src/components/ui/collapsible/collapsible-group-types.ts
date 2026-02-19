import type { VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'vue'
import {
  collapsibleGroupContentVariants,
  collapsibleGroupToggleVariants,
  collapsibleGroupTriggerVariants,
  collapsibleGroupVariants
} from './collapsible-group-variants'

type CollapsibleGroupVariants = VariantProps<typeof collapsibleGroupVariants>
type CollapsibleGroupTriggerVariants = VariantProps<typeof collapsibleGroupTriggerVariants>
type CollapsibleGroupToggleVariants = VariantProps<typeof collapsibleGroupToggleVariants>
type CollapsibleGroupContentVariants = VariantProps<typeof collapsibleGroupContentVariants>

export interface CollapsibleGroupProps {
  variant?: CollapsibleGroupVariants['variant']
  class?: HTMLAttributes['class']
}

export interface CollapsibleGroupTriggerProps {
  variant?: CollapsibleGroupTriggerVariants['variant']
  collapsed?: boolean
  class?: HTMLAttributes['class']
}

export interface CollapsibleGroupToggleProps {
  variant?: CollapsibleGroupToggleVariants['variant']
  collapsed?: boolean
  class?: HTMLAttributes['class']
}

export interface CollapsibleGroupContentProps {
  variant?: CollapsibleGroupContentVariants['variant']
  collapsed?: boolean
  class?: HTMLAttributes['class']
}
