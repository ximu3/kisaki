/**
 * CSS class name utility
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class names with Tailwind CSS support
 *
 * @remarks
 * Combines clsx for conditional classes and tailwind-merge
 * for proper Tailwind CSS class precedence.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
