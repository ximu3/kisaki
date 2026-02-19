/**
 * Scanner progress and result types
 */

import type { MediaType } from './common'
import type { FailedScan } from './db'

export type { FailedScan }

/**
 * Represents a detected entity from directory scanning.
 * Used by all media types - the scanning layer is media-agnostic.
 */
export interface EntityEntry {
  /** Full path to the entity (file or folder) */
  path: string
  /** Original filesystem name (folder name or filename with extension, if any) */
  originalName: string
  /** Original name without extension (used as extraction input) */
  originalBaseName: string
  /** Extracted entity name after applying name extraction rules */
  extractedName: string
  /** Rule id that matched during extraction (null if none) */
  matchedRuleId: string | null
}

/** A scan that was skipped because the game already exists */
export interface SkippedScan {
  name: string
  path: string
  reason: 'path' | 'externalId'
  existingGameId: string
}

/**
 * Scanner progress data sent from main process to renderer.
 *
 * Each event contains the COMPLETE current state, not incremental changes.
 */
export interface ScanProgressData {
  scannerId: string
  total: number
  processedCount: number
  newCount: number
  skippedCount: number
  failedCount: number
  skippedScans: SkippedScan[]
  failedScans: FailedScan[]
  status: 'scanning' | 'completed'
}

/**
 * Final scan result returned when scan completes.
 */
export interface ScanCompletedData {
  scannerId: string
  scannerName: string
  mediaType: MediaType
  path: string
  total: number
  processedCount: number
  newCount: number
  skippedCount: number
  failedCount: number
  skippedScans: SkippedScan[]
  failedScans: FailedScan[]
}

// =============================================================================
// Name Extraction Types
// =============================================================================

/** Extraction test result */
export interface ExtractionTestResult {
  originalName: string
  extractedName: string
  matchedRuleId: string | null
}
