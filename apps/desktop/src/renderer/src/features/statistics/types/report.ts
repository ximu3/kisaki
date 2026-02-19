/**
 * Report Types
 *
 * Types for statistics report navigation and period management.
 */

/** Available report types - corresponds to route names */
export type ReportType = 'overview' | 'weekly' | 'monthly' | 'yearly'

/** Period identifier for navigation */
export interface Period {
  /** Year number (e.g., 2026) */
  year: number
  /** Week number (1-53) for weekly reports */
  week?: number
  /** Month number (1-12) for monthly reports */
  month?: number
}

/** Period display info */
export interface PeriodDisplay {
  /** Display label (e.g., "2026年第5周", "2026年1月", "2025年") */
  label: string
  /** Short label for compact display */
  shortLabel: string
}
