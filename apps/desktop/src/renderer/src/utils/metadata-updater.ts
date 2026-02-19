import type { ExternalId } from '@shared/metadata'

function toExternalIdKey(externalId: ExternalId): string {
  return `${externalId.source}:${externalId.id}`
}

export function dedupeExternalIds(externalIds: ExternalId[]): ExternalId[] {
  const map = new Map<string, ExternalId>()
  for (const ext of externalIds) {
    map.set(toExternalIdKey(ext), ext)
  }
  return [...map.values()]
}

export function mergeExternalIds(a: ExternalId[], b: ExternalId[]): ExternalId[] {
  return dedupeExternalIds([...(a ?? []), ...(b ?? [])])
}

export function fieldsToOption<Field extends string>(
  selected: Field[],
  all: readonly Field[]
): Field[] | '#all' {
  if (selected.length === all.length) return '#all'
  return selected
}

export function pickFields<Field extends string>(
  obj: Record<string, unknown>,
  fields: readonly Field[]
): Partial<Record<Field, unknown>> {
  const out: Partial<Record<Field, unknown>> = {}
  for (const field of fields) {
    if (field in obj) {
      ;(out as Record<string, unknown>)[field] = obj[field]
    }
  }
  return out
}
