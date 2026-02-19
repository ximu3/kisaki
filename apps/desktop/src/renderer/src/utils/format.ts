/**
 * Formatting utilities for display (non-time related)
 *
 * Time-related formatting functions are in datetime.ts
 */

import type { Status, Gender } from '@shared/db'
import type { AllEntityType } from '@shared/common'

// =============================================================================
// Status Formatting
// =============================================================================

/** Badge variant type for status display */
export type StatusVariant = 'default' | 'secondary' | 'success' | 'warning' | 'destructive'

const STATUS_LABELS: Record<Status, string> = {
  notStarted: '未开始',
  inProgress: '进行中',
  partial: '部分完成',
  completed: '已通关',
  multiple: '多周目',
  shelved: '已搁置'
}

const STATUS_VARIANTS: Record<Status, StatusVariant> = {
  notStarted: 'secondary',
  inProgress: 'default',
  partial: 'warning',
  completed: 'success',
  multiple: 'success',
  shelved: 'destructive'
}

/**
 * Format game status to Chinese label
 */
export function formatStatus(status: Status): string {
  return STATUS_LABELS[status] ?? '未知'
}

/**
 * Map status to badge variant for UI display
 */
export function getStatusVariant(status: Status): StatusVariant {
  return STATUS_VARIANTS[status] ?? 'secondary'
}

// =============================================================================
// Score Conversion
// =============================================================================

/**
 * Convert database score (0-100 integer) to display score (0-10 with one decimal)
 *
 * @example
 * dbScoreToDisplay(85) // "8.5"
 * dbScoreToDisplay(null) // ""
 */
export function dbScoreToDisplay(dbScore: number | null): string {
  if (dbScore === null || dbScore === undefined) return ''
  return (dbScore / 10).toFixed(1)
}

/**
 * Convert display score (0-10 with one decimal) to database score (0-100 integer)
 *
 * @example
 * displayScoreToDb("8.5") // 85
 * displayScoreToDb("") // null
 */
export function displayScoreToDb(displayScore: string): number | null {
  const trimmed = displayScore.trim()
  if (trimmed === '') return null
  const num = parseFloat(trimmed)
  if (isNaN(num)) return null
  const clamped = Math.max(0, Math.min(10, num))
  return Math.round(clamped * 10)
}

// =============================================================================
// Gender Formatting
// =============================================================================

/** Format gender label */
export function formatGender(gender: Gender): string {
  switch (gender) {
    case 'male':
      return '男'
    case 'female':
      return '女'
    case 'other':
      return '其他'
    default:
      return '未知'
  }
}

// =============================================================================
// Number Formatting
// =============================================================================

/**
 * Format percentage value.
 *
 * @example
 * formatPercentage(45.678)    // "45.7%"
 * formatPercentage(100, 0)    // "100%"
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

// =============================================================================
// Entity Icon Mapping
// =============================================================================

const ENTITY_ICONS: Record<AllEntityType, string> = {
  game: 'icon-[mdi--gamepad-variant-outline]',
  character: 'icon-[mdi--ghost-outline]',
  person: 'icon-[mdi--account-circle-outline]',
  company: 'icon-[mdi--company]',
  collection: 'icon-[mdi--folder-outline]',
  tag: 'icon-[mdi--tag-outline]'
}

export function getEntityIcon(entityType: AllEntityType): string {
  return ENTITY_ICONS[entityType]
}
