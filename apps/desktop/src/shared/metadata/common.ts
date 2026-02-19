/**
 * Common Metadata Types
 *
 * Shared type definitions used across entity metadata.
 */

/**
 * External ID reference for cross-provider entity matching.
 */
export interface ExternalId {
  source: string
  id: string
}

/**
 * Tag data for any entity.
 */
export interface Tag {
  name: string
  isSpoiler?: boolean
  note?: string
  isNsfw?: boolean
}
