import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

/**
 * Desktop-style Button
 * - Flat design with subtle borders
 * - Compact sizing for information density
 * - Minimal animations for professional feel
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-1 focus-visible:ring-primary",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground border border-primary hover:bg-primary/90 active:bg-primary/80',
        destructive:
          'bg-destructive text-destructive-foreground border border-destructive hover:bg-destructive/90 active:bg-destructive/80',
        outline:
          'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        secondary:
          'bg-secondary text-secondary-foreground border border-border hover:bg-accent active:bg-accent/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        link: 'text-primary hover:underline',
        text: 'text-muted-foreground hover:text-foreground'
      },
      size: {
        default: 'h-7 px-3 py-1 rounded-md',
        sm: 'h-6 px-2 py-0.5 text-xs rounded-md',
        xs: 'h-5 px-1.5 py-0 text-xs rounded-md',
        lg: 'h-8 px-4 py-1.5 rounded-md',
        icon: 'size-7 rounded-md',
        'icon-sm': 'size-6 rounded-md',
        'icon-xs': 'size-5 rounded-md',
        'icon-lg': 'size-8 rounded-md'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
