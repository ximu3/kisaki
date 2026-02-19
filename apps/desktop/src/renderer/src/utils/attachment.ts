/** Thumbnail options for URL generation */
export interface ThumbnailOptions {
  /** Target width */
  width?: number
  /** Target height */
  height?: number
  /** Resize fit mode */
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside' | 'smart'
  /** Output quality (1-100) */
  quality?: number
}

const DEFAULT_THUMBNAIL_OPTIONS = {
  fit: 'smart',
  quality: 100
} as const satisfies Partial<ThumbnailOptions>

/**
 * Build thumbnail query string from options
 */
function buildThumbnailQuery(options: ThumbnailOptions): string {
  const params = new URLSearchParams()

  const { width, height, fit, quality } = {
    ...DEFAULT_THUMBNAIL_OPTIONS,
    ...options
  }

  if (width) params.set('w', String(width))
  if (height) params.set('h', String(height))
  if (fit) params.set('fit', fit)
  if (quality) params.set('q', String(quality))

  return params.toString()
}

/**
 * Get attachment URL for media files
 * @param tableName - Database table name (e.g., 'games', 'characters')
 * @param rowId - Row ID in the table
 * @param fileName - File name stored in the database
 * @param thumbnail - Optional thumbnail options
 */
export function getAttachmentUrl(
  tableName: string,
  rowId: string,
  fileName: string,
  thumbnail?: ThumbnailOptions
): string {
  let url = `attachment://${tableName}/${rowId}/${fileName}`

  if (thumbnail) {
    const query = buildThumbnailQuery(thumbnail)
    if (query) {
      url += `?${query}`
    }
  }

  return url
}
