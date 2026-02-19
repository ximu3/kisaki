export interface VirtualizedComboboxEntity {
  /** Unique identifier */
  id: string
  /** Primary display name */
  name: string
  /** Secondary text (e.g., original name) */
  subText?: string
  /** Image URL for avatar display */
  imageUrl?: string | null
}
