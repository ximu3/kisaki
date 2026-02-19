/**
 * Composable: useSectionData
 *
 * Fetches data for a single showcase section.
 * Uses FilterState directly to build query conditions.
 */

import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { and, eq } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { useAsyncData, useEvent } from '@renderer/composables'
import { buildFilterConditions, buildOrderBy, getFilterQuerySpec } from '@shared/filter'
import type { ShowcaseSection, Game, Character, Person, Company, Collection, Tag } from '@shared/db'
import * as schema from '@shared/db'
import type { AllEntityType } from '@shared/common'
import { storeToRefs } from 'pinia'
import { usePreferencesStore } from '@renderer/stores'

// =============================================================================
// Types
// =============================================================================

export type SectionEntityData = Game | Character | Person | Company | Collection | Tag

// =============================================================================
// Composable
// =============================================================================

export function useSectionData(section: MaybeRefOrGetter<ShowcaseSection>) {
  const preferencesStore = usePreferencesStore()
  const { showNsfw } = storeToRefs(preferencesStore)

  async function fetchData(): Promise<SectionEntityData[]> {
    const s = toValue(section)
    const entityType = s.entityType as AllEntityType
    const querySpec = getFilterQuerySpec(entityType)
    const whereCondition = buildFilterConditions(querySpec, s.filter)
    const orderBy = buildOrderBy(querySpec, s.sortField, s.sortDirection)

    return await fetchEntitiesByType(
      entityType,
      whereCondition,
      orderBy,
      s.limit || undefined,
      showNsfw.value
    )
  }

  // Create computed getters for watch dependencies
  const sectionId = computed(() => toValue(section).id)
  const sectionFilter = computed(() => toValue(section).filter)
  const sectionSortField = computed(() => toValue(section).sortField)
  const sectionSortDirection = computed(() => toValue(section).sortDirection)
  const sectionLimit = computed(() => toValue(section).limit)
  const sectionEntityType = computed(() => toValue(section).entityType)

  const { data, isLoading, isFetching, refetch } = useAsyncData(fetchData, {
    watch: [
      sectionId,
      sectionFilter,
      sectionSortField,
      sectionSortDirection,
      sectionLimit,
      showNsfw
    ]
  })

  // Listen for entity changes
  useEvent('db:inserted', ({ table }) => {
    if (isRelevantTable(table, sectionEntityType.value)) refetch()
  })
  useEvent('db:updated', ({ table }) => {
    if (isRelevantTable(table, sectionEntityType.value)) refetch()
  })
  useEvent('db:deleted', ({ table }) => {
    if (isRelevantTable(table, sectionEntityType.value)) refetch()
  })

  return {
    data: computed(() => data.value ?? []),
    isLoading,
    isFetching,
    refetch
  }
}

// =============================================================================
// Helpers
// =============================================================================

async function fetchEntitiesByType(
  entityType: AllEntityType,
  whereCondition: unknown,
  orderBy: unknown,
  limit: number | undefined,
  showNsfw: boolean
): Promise<SectionEntityData[]> {
  // Use type assertion to bypass complex Drizzle types
  // The filter system guarantees correct types for each entity
  switch (entityType) {
    case 'game':
      return (await db.query.games.findMany({
        where: and(
          whereCondition as never,
          showNsfw ? undefined : eq(schema.games.isNsfw, false)
        ) as never,
        orderBy,
        limit
      } as never)) as Game[]
    case 'character':
      return (await db.query.characters.findMany({
        where: and(
          whereCondition as never,
          showNsfw ? undefined : eq(schema.characters.isNsfw, false)
        ) as never,
        orderBy,
        limit
      } as never)) as Character[]
    case 'person':
      return (await db.query.persons.findMany({
        where: and(
          whereCondition as never,
          showNsfw ? undefined : eq(schema.persons.isNsfw, false)
        ) as never,
        orderBy,
        limit
      } as never)) as Person[]
    case 'company':
      return (await db.query.companies.findMany({
        where: and(
          whereCondition as never,
          showNsfw ? undefined : eq(schema.companies.isNsfw, false)
        ) as never,
        orderBy,
        limit
      } as never)) as Company[]
    case 'collection':
      return (await db.query.collections.findMany({
        where: and(
          whereCondition as never,
          showNsfw ? undefined : eq(schema.collections.isNsfw, false)
        ) as never,
        orderBy,
        limit
      } as never)) as Collection[]
    case 'tag':
      return (await db.query.tags.findMany({
        where: and(
          whereCondition as never,
          showNsfw ? undefined : eq(schema.tags.isNsfw, false)
        ) as never,
        orderBy,
        limit
      } as never)) as Tag[]
    default:
      return []
  }
}

function isRelevantTable(table: string, entityType: string): boolean {
  return table === getFilterQuerySpec(entityType as AllEntityType).tableName
}
