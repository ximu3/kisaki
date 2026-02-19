/**
 * Composable: useExplorerList
 *
 * Fetches entity list data for the LibraryExplorer component.
 * Applies search and filter from the explorer store.
 * Supports both static collections (link-based) and dynamic collections (filter-based).
 */

import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { and, eq } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { useAsyncData, useEvent } from '@renderer/composables'
import { useLibraryExplorerStore } from '../stores'
import { usePreferencesStore } from '@renderer/stores'
import { buildFilterConditions, buildOrderBy, getFilterQuerySpec } from '@shared/filter'
import { buildSearchCondition, getSearchQuerySpec } from '@shared/search'
import type { Game, Character, Person, Company } from '@shared/db'
import * as schema from '@shared/db'
import type { ContentEntityType } from '@shared/common'

// =============================================================================
// Types
// =============================================================================

export type EntityData = Game | Character | Person | Company

export interface CollectionGroup {
  id: string
  name: string
  coverFile: string | null
  isDynamic: boolean
  entities: EntityData[]
}

export interface ExplorerListData {
  collections: CollectionGroup[]
  uncategorized: EntityData[]
  totalCount: number
}

// =============================================================================
// Composable
// =============================================================================

export function useExplorerList() {
  const store = useLibraryExplorerStore()
  const { activeEntityType, search, filter, sortField, sortDirection, overrideCollectionOrder } =
    storeToRefs(store)

  const preferencesStore = usePreferencesStore()
  const { showNsfw } = storeToRefs(preferencesStore)

  async function fetchExplorerData(): Promise<ExplorerListData> {
    const entityType = activeEntityType.value
    const filterSpec = getFilterQuerySpec(entityType)
    const searchSpec = getSearchQuerySpec(entityType)
    const filterWhere = buildFilterConditions(filterSpec, filter.value)
    const searchWhere = buildSearchCondition(searchSpec, search.value)
    const whereCondition =
      filterWhere && searchWhere
        ? (and(filterWhere, searchWhere) ?? undefined)
        : (filterWhere ?? searchWhere)
    const orderBy = buildOrderBy(filterSpec, sortField.value, sortDirection.value)

    // Fetch entities based on type
    const entities = await fetchEntitiesByType(entityType, whereCondition, orderBy, showNsfw.value)

    // Fetch all collections (both static and dynamic)
    const allCollections = await db.query.collections.findMany({
      ...(showNsfw.value ? {} : { where: (c, { eq }) => eq(c.isNsfw, false) }),
      orderBy: (c, { asc }) => asc(c.order)
    })

    // Fetch entity-collection links with order info (for static collections)
    const links = await fetchEntityCollectionLinks(entityType)
    // Map: collectionId -> { entityId -> orderInCollection }
    const linkMap = new Map<string, Map<string, number>>()
    for (const link of links) {
      const existing = linkMap.get(link.collectionId) || new Map()
      existing.set(link.entityId, link.orderInCollection)
      linkMap.set(link.collectionId, existing)
    }

    // Build entity map for quick lookup
    const entityMap = new Map(entities.map((e) => [e.id, e]))

    // Group entities by collection
    const linkedEntityIds = new Set<string>()
    const collectionGroups: CollectionGroup[] = []

    for (const collection of allCollections) {
      if (collection.isDynamic) {
        // Dynamic collection: query entities based on filter config
        const dynamicConfig = collection.dynamicConfig
        if (!dynamicConfig) continue

        const entityConfig = dynamicConfig[entityType]
        if (!entityConfig?.enabled) continue

        // Query entities matching the dynamic filter
        const dynamicQuerySpec = getFilterQuerySpec(entityType)
        const dynamicWhere = buildFilterConditions(dynamicQuerySpec, entityConfig.filter)
        const dynamicOrder = buildOrderBy(
          dynamicQuerySpec,
          entityConfig.sortField,
          entityConfig.sortDirection
        )
        const dynamicEntities = await fetchEntitiesByType(
          entityType,
          dynamicWhere,
          dynamicOrder,
          showNsfw.value
        )

        // Filter to only entities that match the current search/filter
        const filteredEntities = dynamicEntities.filter((e) => entityMap.has(e.id))

        if (filteredEntities.length > 0) {
          collectionGroups.push({
            id: collection.id,
            name: collection.name,
            coverFile: collection.coverFile,
            isDynamic: true,
            entities: filteredEntities
          })
          filteredEntities.forEach((e) => linkedEntityIds.add(e.id))
        }
      } else {
        // Static collection: use link tables
        const entityOrderMap = linkMap.get(collection.id)
        if (!entityOrderMap || entityOrderMap.size === 0) continue

        // Get entities that belong to this collection
        const collectionEntities: EntityData[] = []
        for (const entityId of entityOrderMap.keys()) {
          const entity = entityMap.get(entityId)
          if (entity) collectionEntities.push(entity)
        }

        // Sort based on override preference
        if (overrideCollectionOrder.value) {
          // Use global sort order: maintain order from entities array (already sorted by DB)
          collectionEntities.sort((a, b) => {
            const indexA = entities.findIndex((e) => e.id === a.id)
            const indexB = entities.findIndex((e) => e.id === b.id)
            return indexA - indexB
          })
        } else {
          // Use collection internal order (orderInCollection)
          collectionEntities.sort((a, b) => {
            const orderA = entityOrderMap.get(a.id) ?? 0
            const orderB = entityOrderMap.get(b.id) ?? 0
            return orderA - orderB
          })
        }

        if (collectionEntities.length > 0) {
          collectionGroups.push({
            id: collection.id,
            name: collection.name,
            coverFile: collection.coverFile,
            isDynamic: false,
            entities: collectionEntities
          })
          collectionEntities.forEach((e) => linkedEntityIds.add(e.id))
        }
      }
    }

    // Find uncategorized entities
    const uncategorized = entities.filter((e) => !linkedEntityIds.has(e.id))

    return {
      collections: collectionGroups,
      uncategorized,
      totalCount: entities.length
    }
  }

  // Fetch on mount and when filter/sort changes
  const { data, isLoading, isFetching, refetch } = useAsyncData(fetchExplorerData, {
    watch: [
      activeEntityType,
      search,
      filter,
      sortField,
      sortDirection,
      overrideCollectionOrder,
      showNsfw
    ]
  })

  // Listen for DB events
  useEvent('db:inserted', ({ table }) => {
    if (isRelevantTable(table, activeEntityType.value)) refetch()
  })
  useEvent('db:updated', ({ table }) => {
    if (isRelevantTable(table, activeEntityType.value)) refetch()
  })
  useEvent('db:deleted', ({ table }) => {
    if (isRelevantTable(table, activeEntityType.value)) refetch()
  })

  // Computed data with default for UI rendering
  const explorerData = computed<ExplorerListData>(
    () => data.value ?? { collections: [], uncategorized: [], totalCount: 0 }
  )

  return {
    data: explorerData,
    rawData: data,
    isLoading,
    isFetching,
    refetch
  }
}

// =============================================================================
// Helpers
// =============================================================================

async function fetchEntitiesByType(
  entityType: ContentEntityType,
  whereCondition: unknown,
  orderBy: unknown,
  showNsfw: boolean
): Promise<EntityData[]> {
  // Use type assertion to bypass complex Drizzle types
  // The filter system guarantees correct types for each entity
  switch (entityType) {
    case 'game':
      return (await db.query.games.findMany({
        where: and(
          whereCondition as never,
          showNsfw ? undefined : eq(schema.games.isNsfw, false)
        ) as never,
        orderBy
      } as never)) as Game[]
    case 'character':
      return (await db.query.characters.findMany({
        where: and(
          whereCondition as never,
          showNsfw ? undefined : eq(schema.characters.isNsfw, false)
        ) as never,
        orderBy
      } as never)) as Character[]
    case 'person':
      return (await db.query.persons.findMany({
        where: and(
          whereCondition as never,
          showNsfw ? undefined : eq(schema.persons.isNsfw, false)
        ) as never,
        orderBy
      } as never)) as Person[]
    case 'company':
      return (await db.query.companies.findMany({
        where: and(
          whereCondition as never,
          showNsfw ? undefined : eq(schema.companies.isNsfw, false)
        ) as never,
        orderBy
      } as never)) as Company[]
    default:
      return []
  }
}

async function fetchEntityCollectionLinks(
  entityType: string
): Promise<{ collectionId: string; entityId: string; orderInCollection: number }[]> {
  switch (entityType) {
    case 'game': {
      const links = await db.query.collectionGameLinks.findMany()
      return links.map((l) => ({
        collectionId: l.collectionId,
        entityId: l.gameId,
        orderInCollection: l.orderInCollection
      }))
    }
    case 'character': {
      const links = await db.query.collectionCharacterLinks.findMany()
      return links.map((l) => ({
        collectionId: l.collectionId,
        entityId: l.characterId,
        orderInCollection: l.orderInCollection
      }))
    }
    case 'person': {
      const links = await db.query.collectionPersonLinks.findMany()
      return links.map((l) => ({
        collectionId: l.collectionId,
        entityId: l.personId,
        orderInCollection: l.orderInCollection
      }))
    }
    case 'company': {
      const links = await db.query.collectionCompanyLinks.findMany()
      return links.map((l) => ({
        collectionId: l.collectionId,
        entityId: l.companyId,
        orderInCollection: l.orderInCollection
      }))
    }
    default:
      return []
  }
}

function isRelevantTable(table: string, entityType: string): boolean {
  const entityTable = getFilterQuerySpec(entityType as ContentEntityType).tableName
  const linkTable = `collection_${entityType}_links`
  return table === entityTable || table === 'collections' || table === linkTable
}
