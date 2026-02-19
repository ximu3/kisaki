import type { MergeStrategy, RelatedSite } from '@shared/db'
import type {
  CharacterMetadata,
  CharacterPerson,
  CompanyMetadata,
  ExternalId,
  PersonMetadata,
  Tag
} from '@shared/metadata'

export type MergeKeySource = 'externalId' | 'originalName' | 'name'

interface MergeIdentityEntityBase {
  name: string
  originalName?: string
  externalIds?: ExternalId[]
}

export interface MergeIdentityEntity extends MergeIdentityEntityBase {
  type: string
}

interface EntityGroup<T> {
  id: number
  order: number
  item: T
  keys: Set<string>
  active: boolean
}

type KeyBuilder<T> = (item: T) => string[]

type EntityMerger<T> = (existing: T, incoming: T) => T

function deduplicate<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = keyFn(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Sort results by provider priority (ascending).
 */
export function sortByPriority<T extends { priority: number }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => a.priority - b.priority)
}

/**
 * Filter a discriminated-union result array by slot.
 */
export function filterBySlot<R extends { slot: string }, S extends R['slot']>(
  results: readonly R[],
  slot: S
): Extract<R, { slot: S }>[] {
  return results.filter((r): r is Extract<R, { slot: S }> => r.slot === slot)
}

function mergeArrays<T>(existing: T[], incoming: T[], keyFn: (item: T) => string): T[] {
  return deduplicate([...existing, ...incoming], keyFn)
}

function registerGroupKeys<T>(group: EntityGroup<T>, keyToGroupId: Map<string, number>): void {
  for (const key of group.keys) {
    keyToGroupId.set(key, group.id)
  }
}

function getMatchedGroupIds<T>(
  keys: string[],
  keyToGroupId: Map<string, number>,
  groups: EntityGroup<T>[]
): number[] {
  const ids = new Set<number>()

  for (const key of keys) {
    const groupId = keyToGroupId.get(key)
    if (groupId === undefined) continue

    const group = groups[groupId]
    if (group?.active) {
      ids.add(groupId)
    }
  }

  return [...ids].sort((a, b) => groups[a].order - groups[b].order)
}

function createGroup<T>(
  groups: EntityGroup<T>[],
  keyToGroupId: Map<string, number>,
  item: T,
  keys: string[]
): EntityGroup<T> {
  const group: EntityGroup<T> = {
    id: groups.length,
    order: groups.length,
    item,
    keys: new Set(keys),
    active: true
  }

  groups.push(group)
  registerGroupKeys(group, keyToGroupId)
  return group
}

export function normalizeMergeText(value: string): string {
  return value.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ')
}

function compactNormalizedMergeText(value: string): string {
  return value.replace(/\s+/g, '')
}

export function buildEntityMergeKeys(entity: MergeIdentityEntityBase): string[] {
  const keys: string[] = []

  for (const extId of entity.externalIds ?? []) {
    const source = normalizeMergeText(extId.source)
    const id = normalizeMergeText(extId.id)
    if (source && id) {
      keys.push(`ext:${source}:${id}`)
    }
  }

  const normalizedOriginalName = entity.originalName
    ? normalizeMergeText(entity.originalName)
    : undefined
  if (normalizedOriginalName) {
    keys.push(`on:${normalizedOriginalName}`)
    keys.push(`onc:${compactNormalizedMergeText(normalizedOriginalName)}`)
  }

  const normalizedName = normalizeMergeText(entity.name)
  if (normalizedName) {
    keys.push(`nm:${normalizedName}`)
    keys.push(`nmc:${compactNormalizedMergeText(normalizedName)}`)
  }

  return [...new Set(keys)]
}

export function buildEntityMergeKeysWithType(entity: MergeIdentityEntity): string[] {
  const normalizedType = normalizeMergeText(entity.type)
  return buildEntityMergeKeys(entity).map((key) => `${key}|tp:${normalizedType}`)
}

/**
 * Merge entities by multiple keys.
 *
 * When one entity matches multiple groups, all matched groups are folded in first-appearance order,
 * then the current entity is merged into the folded group.
 */
export function mergeEntitiesByKeys<T>(
  existing: T[],
  incoming: T[],
  keyBuilder: KeyBuilder<T>,
  mergeFn: EntityMerger<T>
): T[] {
  const groups: EntityGroup<T>[] = []
  const keyToGroupId = new Map<string, number>()

  for (const item of [...existing, ...incoming]) {
    const keys = keyBuilder(item)
    const matchedGroupIds = getMatchedGroupIds(keys, keyToGroupId, groups)

    if (matchedGroupIds.length === 0) {
      createGroup(groups, keyToGroupId, item, keys)
      continue
    }

    const baseGroup = groups[matchedGroupIds[0]]

    for (const groupId of matchedGroupIds.slice(1)) {
      const otherGroup = groups[groupId]
      if (!otherGroup.active) continue

      baseGroup.item = mergeFn(baseGroup.item, otherGroup.item)
      for (const key of otherGroup.keys) {
        baseGroup.keys.add(key)
      }
      otherGroup.active = false
    }

    baseGroup.item = mergeFn(baseGroup.item, item)

    for (const key of keys) {
      baseGroup.keys.add(key)
    }

    for (const key of keyBuilder(baseGroup.item)) {
      baseGroup.keys.add(key)
    }

    registerGroupKeys(baseGroup, keyToGroupId)
  }

  return groups.filter((group) => group.active).map((group) => group.item)
}

/**
 * Append entities and deduplicate by keys.
 *
 * Duplicates keep the first entity in appearance order and do not perform field-level merge.
 */
export function appendAndDeduplicateEntitiesByKeys<T>(
  existing: T[],
  incoming: T[],
  keyBuilder: KeyBuilder<T>
): T[] {
  const groups: EntityGroup<T>[] = []
  const keyToGroupId = new Map<string, number>()

  for (const item of [...existing, ...incoming]) {
    const keys = keyBuilder(item)
    const matchedGroupIds = getMatchedGroupIds(keys, keyToGroupId, groups)

    if (matchedGroupIds.length === 0) {
      createGroup(groups, keyToGroupId, item, keys)
      continue
    }

    const baseGroup = groups[matchedGroupIds[0]]

    for (const groupId of matchedGroupIds.slice(1)) {
      const otherGroup = groups[groupId]
      if (!otherGroup.active) continue

      for (const key of otherGroup.keys) {
        baseGroup.keys.add(key)
      }
      otherGroup.active = false
    }

    for (const key of keys) {
      baseGroup.keys.add(key)
    }

    for (const key of keyBuilder(baseGroup.item)) {
      baseGroup.keys.add(key)
    }

    registerGroupKeys(baseGroup, keyToGroupId)
  }

  return groups.filter((group) => group.active).map((group) => group.item)
}

/**
 * Merge scalar fields from incoming to existing (fill-in-the-blanks).
 * Existing values take priority, only fills undefined/null/empty fields.
 */
export function mergeScalarFields<T extends object>(
  existing: T,
  incoming: T,
  excludeKeys: (keyof T)[]
): T {
  const result = { ...existing }
  const exclude = new Set(excludeKeys)

  for (const key of Object.keys(incoming) as (keyof T)[]) {
    if (exclude.has(key)) continue

    const existingVal = existing[key]
    const incomingVal = incoming[key]

    if (existingVal === undefined || existingVal === null || existingVal === '') {
      result[key] = incomingVal
    }
  }

  return result
}

/**
 * Merge ExternalId arrays with deduplication by source:id.
 */
export function mergeExternalIds(
  existing: ExternalId[] | undefined,
  incoming: ExternalId[] | undefined
): ExternalId[] {
  if (!existing?.length && !incoming?.length) return []
  return mergeArrays(existing ?? [], incoming ?? [], (e) => `${e.source}:${e.id}`)
}

/**
 * Merge RelatedSite arrays with deduplication by url.
 */
export function mergeRelatedSites(
  existing: RelatedSite[] | undefined,
  incoming: RelatedSite[] | undefined
): RelatedSite[] | undefined {
  if (!existing?.length && !incoming?.length) return undefined
  return mergeArrays(existing ?? [], incoming ?? [], (s) => s.url)
}

/**
 * Merge Tag arrays with deduplication by name.
 */
export function mergeTagsArray(
  existing: Tag[] | undefined,
  incoming: Tag[] | undefined
): Tag[] | undefined {
  if (!existing?.length && !incoming?.length) return undefined
  return mergeArrays(existing ?? [], incoming ?? [], (t) => t.name)
}

/**
 * Merge image URL arrays with deduplication by URL.
 */
export function mergeImageUrls(
  existing: string[] | undefined,
  incoming: string[] | undefined
): string[] | undefined {
  if (!existing?.length && !incoming?.length) return undefined
  return [...new Set([...(existing ?? []), ...(incoming ?? [])])]
}

/**
 * Apply strategy for simple arrays (tags, etc.) - dedup by key only.
 */
export function applyStrategy<T>(
  existing: T[] | undefined,
  incoming: T[],
  strategy: MergeStrategy,
  keyFn: (item: T) => string
): T[] {
  const existingArr = existing ?? []

  switch (strategy) {
    case 'first':
      return existingArr.length ? existingArr : incoming
    case 'append':
      return deduplicate([...existingArr, ...incoming], keyFn)
    case 'merge':
      return deduplicate([...existingArr, ...incoming], keyFn)
  }
}

/**
 * Apply strategy for image arrays.
 */
export function applyImageStrategy(
  existing: string[] | undefined,
  incoming: string[],
  strategy: MergeStrategy
): string[] {
  const existingArr = existing ?? []

  switch (strategy) {
    case 'first':
      return existingArr.length ? existingArr : incoming
    case 'append':
      return [...new Set([...existingArr, ...incoming])]
    case 'merge':
      return [...new Set([...existingArr, ...incoming])]
  }
}

/**
 * Apply strategy for entity arrays (characters, persons, companies).
 * Uses field-level merge for 'merge' strategy.
 */
export function applyEntityStrategy<T>(
  existing: T[] | undefined,
  incoming: T[],
  strategy: MergeStrategy,
  keyBuilder: (item: T) => string[],
  mergeFn: (existing: T, incoming: T) => T
): T[] {
  const existingArr = existing ?? []

  switch (strategy) {
    case 'first':
      return existingArr.length ? existingArr : incoming

    case 'append':
      return appendAndDeduplicateEntitiesByKeys(existingArr, incoming, keyBuilder)

    case 'merge':
      return mergeEntitiesByKeys(existingArr, incoming, keyBuilder, mergeFn)
  }
}

// =============================================================================
// Field-Level Metadata Mergers (shared across handler mergers)
// =============================================================================

/**
 * Merge PersonMetadata fields (fill-in-the-blanks + array merge).
 */
export function mergePersonMetadataFields(
  existing: PersonMetadata,
  incoming: PersonMetadata
): PersonMetadata {
  const merged = mergeScalarFields(existing, incoming, [
    'externalIds',
    'relatedSites',
    'tags',
    'photos'
  ])

  return {
    ...merged,
    externalIds: mergeExternalIds(existing.externalIds, incoming.externalIds),
    relatedSites: mergeRelatedSites(existing.relatedSites, incoming.relatedSites),
    tags: mergeTagsArray(existing.tags, incoming.tags),
    photos: mergeImageUrls(existing.photos, incoming.photos)
  }
}

/**
 * Merge CompanyMetadata fields (fill-in-the-blanks + array merge).
 */
export function mergeCompanyMetadataFields(
  existing: CompanyMetadata,
  incoming: CompanyMetadata
): CompanyMetadata {
  const merged = mergeScalarFields(existing, incoming, [
    'externalIds',
    'relatedSites',
    'tags',
    'logos'
  ])

  return {
    ...merged,
    externalIds: mergeExternalIds(existing.externalIds, incoming.externalIds),
    relatedSites: mergeRelatedSites(existing.relatedSites, incoming.relatedSites),
    tags: mergeTagsArray(existing.tags, incoming.tags),
    logos: mergeImageUrls(existing.logos, incoming.logos)
  }
}

/**
 * Merge CharacterPerson arrays using the specified strategy.
 */
export function mergeCharacterPersons(
  existing: CharacterPerson[] | undefined,
  incoming: CharacterPerson[] | undefined,
  strategy: MergeStrategy
): CharacterPerson[] | undefined {
  if (!existing?.length && !incoming?.length) return undefined

  return applyEntityStrategy(
    existing,
    incoming ?? [],
    strategy,
    buildEntityMergeKeysWithType,
    (existingPerson, incomingPerson) => ({
      ...mergePersonMetadataFields(existingPerson, incomingPerson),
      type: existingPerson.type,
      note: existingPerson.note || incomingPerson.note
    })
  )
}

/**
 * Merge CharacterMetadata fields (fill-in-the-blanks + array merge + nested persons).
 */
export function mergeCharacterMetadataFields(
  existing: CharacterMetadata,
  incoming: CharacterMetadata,
  personStrategy: MergeStrategy
): CharacterMetadata {
  const merged = mergeScalarFields(existing, incoming, [
    'externalIds',
    'relatedSites',
    'tags',
    'persons',
    'photos'
  ])

  return {
    ...merged,
    externalIds: mergeExternalIds(existing.externalIds, incoming.externalIds),
    relatedSites: mergeRelatedSites(existing.relatedSites, incoming.relatedSites),
    tags: mergeTagsArray(existing.tags, incoming.tags),
    persons: mergeCharacterPersons(existing.persons, incoming.persons, personStrategy),
    photos: mergeImageUrls(existing.photos, incoming.photos)
  }
}
