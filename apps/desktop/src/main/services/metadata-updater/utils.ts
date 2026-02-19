import type { RelatedSite } from '@shared/db'
import type {
  BaseMetadataUpdateOptions,
  CharacterMetadataUpdateField,
  CompanyMetadataUpdateField,
  GameMetadataUpdateField,
  PersonMetadataUpdateField
} from '@shared/metadata-updater'
import type { ExternalId, Tag } from '@shared/metadata'
import type { ResolvedUpdateOptions } from './types'

function unique<T>(items: T[]): T[] {
  return [...new Set(items)]
}

function deduplicateBy<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const item of items) {
    const key = keyFn(item)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

function normalizeText(value: string): string {
  return value.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ')
}

export function isMissingValue(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.length === 0
  if (Array.isArray(value)) return value.length === 0
  return false
}

export function shouldApplyUpdate(
  currentValue: unknown,
  incomingValue: unknown,
  apply: 'always' | 'ifMissing'
): boolean {
  if (isMissingValue(incomingValue)) return false
  if (apply === 'always') return true
  return isMissingValue(currentValue)
}

function resolveFields<Field extends string>(
  fields: Field[] | '#all' | undefined,
  allFields: readonly Field[]
): Field[] {
  if (fields === '#all' || fields === undefined) {
    return [...allFields]
  }

  const allowed = new Set(allFields)
  return unique(fields.filter((field): field is Field => allowed.has(field as Field)))
}

export function resolveUpdateOptions<Field extends string>(
  options: (BaseMetadataUpdateOptions & { fields?: Field[] | '#all' }) | undefined,
  allFields: readonly Field[]
): ResolvedUpdateOptions<Field> {
  return {
    fields: resolveFields(options?.fields, allFields),
    apply: options?.apply ?? 'ifMissing',
    strategy: options?.strategy ?? 'merge'
  }
}

export function toTagKey(tag: Tag): string {
  return normalizeText(tag.name)
}

export function mergeTags(
  existing: Tag[] | undefined,
  incoming: Tag[] | undefined,
  strategy: 'replace' | 'merge'
): Tag[] {
  const incomingSafe = incoming ?? []
  if (strategy === 'replace') {
    return deduplicateBy(incomingSafe, toTagKey)
  }

  const existingSafe = existing ?? []
  const byKey = new Map<string, Tag>()

  for (const item of existingSafe) {
    byKey.set(toTagKey(item), item)
  }

  for (const item of incomingSafe) {
    const key = toTagKey(item)
    const current = byKey.get(key)
    if (!current) {
      byKey.set(key, item)
      continue
    }

    byKey.set(key, {
      ...current,
      isNsfw: current.isNsfw ?? item.isNsfw,
      isSpoiler: current.isSpoiler ?? item.isSpoiler,
      note: current.note ?? item.note
    })
  }

  return [...byKey.values()]
}

export function toExternalIdKey(externalId: ExternalId): string {
  return `${normalizeText(externalId.source)}:${normalizeText(externalId.id)}`
}

export function mergeExternalIds(
  existing: ExternalId[] | undefined,
  incoming: ExternalId[] | undefined,
  strategy: 'replace' | 'merge'
): ExternalId[] {
  const incomingSafe = incoming ?? []
  if (strategy === 'replace') {
    return deduplicateBy(incomingSafe, toExternalIdKey)
  }

  const existingSafe = existing ?? []
  return deduplicateBy([...existingSafe, ...incomingSafe], toExternalIdKey)
}

function toRelatedSiteKey(site: RelatedSite): string {
  return normalizeText(site.url)
}

export function mergeRelatedSites(
  existing: RelatedSite[] | undefined,
  incoming: RelatedSite[] | undefined,
  strategy: 'replace' | 'merge'
): RelatedSite[] {
  const incomingSafe = incoming ?? []
  if (strategy === 'replace') {
    return deduplicateBy(incomingSafe, toRelatedSiteKey)
  }

  const existingSafe = existing ?? []
  return deduplicateBy([...existingSafe, ...incomingSafe], toRelatedSiteKey)
}

export type ImageMode = 'replace' | 'missingOnly'

export function toImageMode(strategy: 'replace' | 'merge'): ImageMode {
  return strategy === 'replace' ? 'replace' : 'missingOnly'
}

export type MetadataUpdatableField =
  | GameMetadataUpdateField
  | PersonMetadataUpdateField
  | CompanyMetadataUpdateField
  | CharacterMetadataUpdateField
