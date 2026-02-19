export const EXPLORER_SELECTION_SEPARATOR = '\u0000'

export function toExplorerSelectionKey(from: string, id: string) {
  return `${from}${EXPLORER_SELECTION_SEPARATOR}${id}`
}

export function parseExplorerSelectionKey(key: string) {
  const separatorIndex = key.indexOf(EXPLORER_SELECTION_SEPARATOR)
  if (separatorIndex === -1) {
    return { from: '', id: key }
  }

  return {
    from: key.slice(0, separatorIndex),
    id: key.slice(separatorIndex + EXPLORER_SELECTION_SEPARATOR.length)
  }
}
