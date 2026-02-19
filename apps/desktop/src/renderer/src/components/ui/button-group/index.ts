import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as ButtonGroup } from './button-group.vue'
export { default as ButtonGroupSeparator } from './button-group-separator.vue'
export { default as ButtonGroupText } from './button-group-text.vue'

export const buttonGroupVariants = cva(
  "flex w-fit items-stretch [&>*:not(:first-child)]:border-l-0 [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r",
  {
    variants: {
      orientation: {
        horizontal: '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none',
        vertical:
          'flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:first-child)]:border-l [&>*:not(:last-child)]:rounded-b-none'
      }
    },
    defaultVariants: {
      orientation: 'horizontal'
    }
  }
)

export type ButtonGroupVariants = VariantProps<typeof buttonGroupVariants>
