/**
 * Normalize scraped descriptions before rendering with Markdown.
 *
 * This prevents accidental indented code blocks caused by sources that use
 * leading spaces for visual alignment.
 */
export function normalizeScrapedDescription(value: string | null | undefined): string | undefined {
  if (!value?.trim()) {
    return undefined
  }

  const lines = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const normalizedLines: string[] = []
  let previousLineBlank = true

  for (const rawLine of lines) {
    const line = rawLine.replace(/[ \t]+$/g, '')

    if (!line.trim()) {
      if (!previousLineBlank) {
        normalizedLines.push('')
      }
      previousLineBlank = true
      continue
    }

    const normalizedLine = previousLineBlank ? line.replace(/^[ \t]{4,}/, '') : line
    normalizedLines.push(normalizedLine)
    previousLineBlank = false
  }

  const normalized = normalizedLines.join('\n').trim()
  return normalized || undefined
}
