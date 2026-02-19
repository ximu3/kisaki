import { cva } from 'class-variance-authority'

export const collapsibleGroupVariants = cva('', {
  variants: {
    variant: {
      default: '',
      sidebar: ''
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

export const collapsibleGroupTriggerVariants = cva(
  'w-full flex items-center gap-1 text-xs transition-colors cursor-pointer',
  {
    variants: {
      variant: {
        default: 'h-7 px-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground',
        sidebar: 'h-6 px-2 rounded-r-md hover:bg-accent/70'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export const collapsibleGroupToggleVariants = cva(
  'shrink-0 flex items-center justify-center transition-colors cursor-pointer',
  {
    variants: {
      variant: {
        default: 'size-5 -ml-1 rounded hover:bg-accent/50',
        sidebar: 'size-4 -ml-0.5 rounded hover:text-accent-foreground'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export const collapsibleGroupContentVariants = cva('', {
  variants: {
    variant: {
      default: 'flex flex-col gap-1 mt-1',
      sidebar: 'flex flex-col gap-0.5'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})
