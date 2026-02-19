/**
 * Default From Store
 *
 * Precomputes and maintains the "canonical" from value for each entity.
 * This determines which collection an entity should highlight in the explorer
 * when navigating without explicit context.
 *
 * Design: Separated handling for static and dynamic collections
 *
 * Static collections (link-based):
 * - Precomputed from link tables
 * - Listen to: collection_*_links, collections (order changes)
 *
 * Dynamic collections (filter-based):
 * - Precomputed by evaluating filters
 * - Listen to: collections (dynamicConfig), entity tables (with debounce)
 *
 * Query: O(1) - compare both maps, return lower order
 */

import { defineStore } from 'pinia'
import { ref, readonly, watch, type Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { and, eq } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { eventManager } from '@renderer/core/event'
import { buildFilterConditions, buildOrderBy, getFilterQuerySpec } from '@shared/filter'
import type { ContentEntityType } from '@shared/common'
import type { Collection } from '@shared/db'
import * as schema from '@shared/db'
import { usePreferencesStore } from './preferences'

// Entry with order for comparison
interface FromEntry {
  collectionId: string
  order: number
}

type FromMap = Map<string, FromEntry>

// Simple debounce utility
function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  return ((...args: unknown[]) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }) as T
}

export const useDefaultFromStore = defineStore('defaultFrom', () => {
  const preferencesStore = usePreferencesStore()
  const { showNsfw } = storeToRefs(preferencesStore)

  // =========================================================================
  // State: Separated maps for static and dynamic collections
  // =========================================================================

  // Static: from link tables
  const staticGameFroms = ref<FromMap>(new Map())
  const staticCharacterFroms = ref<FromMap>(new Map())
  const staticPersonFroms = ref<FromMap>(new Map())
  const staticCompanyFroms = ref<FromMap>(new Map())

  // Dynamic: from filter evaluation
  const dynamicGameFroms = ref<FromMap>(new Map())
  const dynamicCharacterFroms = ref<FromMap>(new Map())
  const dynamicPersonFroms = ref<FromMap>(new Map())
  const dynamicCompanyFroms = ref<FromMap>(new Map())

  const isInitialized = ref(false)

  // Recompute maps when NSFW visibility changes
  watch(showNsfw, async () => {
    if (!isInitialized.value) return
    await Promise.all([refetchAllStatic(), refetchAllDynamic()])
  })

  // =========================================================================
  // Public API
  // =========================================================================

  /**
   * Get the default from value for an entity.
   * Compares static and dynamic entries, returns the one with lower order.
   */
  function getFrom(entityType: ContentEntityType, entityId: string): string {
    const staticMap = getStaticMapByType(entityType)
    const dynamicMap = getDynamicMapByType(entityType)

    const staticEntry = staticMap.value.get(entityId)
    const dynamicEntry = dynamicMap.value.get(entityId)

    // Both exist: compare orders
    if (staticEntry && dynamicEntry) {
      return staticEntry.order <= dynamicEntry.order
        ? `collection:${staticEntry.collectionId}`
        : `collection:${dynamicEntry.collectionId}`
    }

    // Only one exists
    if (staticEntry) return `collection:${staticEntry.collectionId}`
    if (dynamicEntry) return `collection:${dynamicEntry.collectionId}`

    // Neither: uncategorized
    return 'uncategorized'
  }

  /**
   * Initialize the store
   */
  async function init() {
    if (isInitialized.value) return
    await Promise.all([refetchAllStatic(), refetchAllDynamic()])
    isInitialized.value = true
    setupEventListeners()
  }

  // =========================================================================
  // Static collection handling
  // =========================================================================

  async function refetchAllStatic() {
    await Promise.all([
      refetchStaticType('game'),
      refetchStaticType('character'),
      refetchStaticType('person'),
      refetchStaticType('company')
    ])
  }

  async function refetchStaticType(entityType: ContentEntityType) {
    const target = getStaticMapByType(entityType)
    const newMap = new Map<string, FromEntry>()

    // Get all static collections ordered by order
    const collections = await db.query.collections.findMany({
      where: and(
        eq(schema.collections.isDynamic, false),
        showNsfw.value ? undefined : eq(schema.collections.isNsfw, false)
      ),
      orderBy: (c, { asc }) => asc(c.order)
    })

    // Create order lookup
    const orderMap = new Map(collections.map((c) => [c.id, c.order]))

    // Fetch links and assign by order
    const links = await fetchStaticLinks(entityType)

    // Sort by collection order
    links.sort((a, b) => {
      const orderA = orderMap.get(a.collectionId) ?? Infinity
      const orderB = orderMap.get(b.collectionId) ?? Infinity
      return orderA - orderB
    })

    // First collection wins for each entity
    for (const link of links) {
      if (!newMap.has(link.entityId)) {
        const order = orderMap.get(link.collectionId)
        if (order !== undefined) {
          newMap.set(link.entityId, { collectionId: link.collectionId, order })
        }
      }
    }

    target.value = newMap
  }

  async function fetchStaticLinks(
    entityType: ContentEntityType
  ): Promise<{ entityId: string; collectionId: string }[]> {
    switch (entityType) {
      case 'game': {
        const rows = await db
          .select({
            entityId: schema.collectionGameLinks.gameId,
            collectionId: schema.collectionGameLinks.collectionId
          })
          .from(schema.collectionGameLinks)
          .innerJoin(schema.games, eq(schema.collectionGameLinks.gameId, schema.games.id))
          .where(showNsfw.value ? undefined : eq(schema.games.isNsfw, false))
        return rows
      }
      case 'character': {
        const rows = await db
          .select({
            entityId: schema.collectionCharacterLinks.characterId,
            collectionId: schema.collectionCharacterLinks.collectionId
          })
          .from(schema.collectionCharacterLinks)
          .innerJoin(
            schema.characters,
            eq(schema.collectionCharacterLinks.characterId, schema.characters.id)
          )
          .where(showNsfw.value ? undefined : eq(schema.characters.isNsfw, false))
        return rows
      }
      case 'person': {
        const rows = await db
          .select({
            entityId: schema.collectionPersonLinks.personId,
            collectionId: schema.collectionPersonLinks.collectionId
          })
          .from(schema.collectionPersonLinks)
          .innerJoin(schema.persons, eq(schema.collectionPersonLinks.personId, schema.persons.id))
          .where(showNsfw.value ? undefined : eq(schema.persons.isNsfw, false))
        return rows
      }
      case 'company': {
        const rows = await db
          .select({
            entityId: schema.collectionCompanyLinks.companyId,
            collectionId: schema.collectionCompanyLinks.collectionId
          })
          .from(schema.collectionCompanyLinks)
          .innerJoin(
            schema.companies,
            eq(schema.collectionCompanyLinks.companyId, schema.companies.id)
          )
          .where(showNsfw.value ? undefined : eq(schema.companies.isNsfw, false))
        return rows
      }
    }
  }

  // =========================================================================
  // Dynamic collection handling
  // =========================================================================

  async function refetchAllDynamic() {
    await Promise.all([
      refetchDynamicType('game'),
      refetchDynamicType('character'),
      refetchDynamicType('person'),
      refetchDynamicType('company')
    ])
  }

  async function refetchDynamicType(entityType: ContentEntityType) {
    const target = getDynamicMapByType(entityType)
    const newMap = new Map<string, FromEntry>()

    // Get all dynamic collections ordered by order
    const collections = await db.query.collections.findMany({
      where: and(
        eq(schema.collections.isDynamic, true),
        showNsfw.value ? undefined : eq(schema.collections.isNsfw, false)
      ),
      orderBy: (c, { asc }) => asc(c.order)
    })

    // Process in order - first match wins
    for (const collection of collections) {
      const entityIds = await getDynamicCollectionEntities(collection, entityType)
      for (const entityId of entityIds) {
        if (!newMap.has(entityId)) {
          newMap.set(entityId, { collectionId: collection.id, order: collection.order })
        }
      }
    }

    target.value = newMap
  }

  async function getDynamicCollectionEntities(
    collection: Collection,
    entityType: ContentEntityType
  ): Promise<string[]> {
    const dynamicConfig = collection.dynamicConfig
    if (!dynamicConfig) return []

    const entityConfig = dynamicConfig[entityType]
    if (!entityConfig?.enabled) return []

    const querySpec = getQuerySpec(entityType)
    const whereCondition = buildFilterConditions(querySpec, entityConfig.filter)
    const orderBy = buildOrderBy(querySpec, entityConfig.sortField, entityConfig.sortDirection)

    const entities = await fetchEntitiesByType(entityType, whereCondition, orderBy)
    return entities.map((e) => e.id)
  }

  async function fetchEntitiesByType(
    entityType: ContentEntityType,
    whereCondition: unknown,
    orderBy: unknown
  ): Promise<{ id: string }[]> {
    switch (entityType) {
      case 'game':
        return (await db.query.games.findMany({
          where: and(
            whereCondition as never,
            showNsfw.value ? undefined : eq(schema.games.isNsfw, false)
          ) as never,
          orderBy,
          columns: { id: true }
        } as never)) as { id: string }[]
      case 'character':
        return (await db.query.characters.findMany({
          where: and(
            whereCondition as never,
            showNsfw.value ? undefined : eq(schema.characters.isNsfw, false)
          ) as never,
          orderBy,
          columns: { id: true }
        } as never)) as { id: string }[]
      case 'person':
        return (await db.query.persons.findMany({
          where: and(
            whereCondition as never,
            showNsfw.value ? undefined : eq(schema.persons.isNsfw, false)
          ) as never,
          orderBy,
          columns: { id: true }
        } as never)) as { id: string }[]
      case 'company':
        return (await db.query.companies.findMany({
          where: and(
            whereCondition as never,
            showNsfw.value ? undefined : eq(schema.companies.isNsfw, false)
          ) as never,
          orderBy,
          columns: { id: true }
        } as never)) as { id: string }[]
    }
  }

  // =========================================================================
  // Map helpers
  // =========================================================================

  function getStaticMapByType(entityType: ContentEntityType): Ref<FromMap> {
    switch (entityType) {
      case 'game':
        return staticGameFroms
      case 'character':
        return staticCharacterFroms
      case 'person':
        return staticPersonFroms
      case 'company':
        return staticCompanyFroms
    }
  }

  function getDynamicMapByType(entityType: ContentEntityType): Ref<FromMap> {
    switch (entityType) {
      case 'game':
        return dynamicGameFroms
      case 'character':
        return dynamicCharacterFroms
      case 'person':
        return dynamicPersonFroms
      case 'company':
        return dynamicCompanyFroms
    }
  }

  const getQuerySpec = getFilterQuerySpec

  // =========================================================================
  // Event listeners
  // =========================================================================

  function setupEventListeners() {
    // Debounced handlers for entity table changes (dynamic collections)
    const debouncedRefetchDynamicGame = debounce(() => refetchDynamicType('game'), 300)
    const debouncedRefetchDynamicCharacter = debounce(() => refetchDynamicType('character'), 300)
    const debouncedRefetchDynamicPerson = debounce(() => refetchDynamicType('person'), 300)
    const debouncedRefetchDynamicCompany = debounce(() => refetchDynamicType('company'), 300)

    const handleStaticChange = (table: string) => {
      switch (table) {
        case 'collection_game_links':
          refetchStaticType('game')
          break
        case 'collection_character_links':
          refetchStaticType('character')
          break
        case 'collection_person_links':
          refetchStaticType('person')
          break
        case 'collection_company_links':
          refetchStaticType('company')
          break
        case 'collections':
          // Order might have changed - refetch all static
          refetchAllStatic()
          break
      }
    }

    const handleDynamicChange = (table: string) => {
      switch (table) {
        case 'collections':
          // dynamicConfig might have changed - refetch all dynamic
          refetchAllDynamic()
          break
        case 'games':
          debouncedRefetchDynamicGame()
          break
        case 'characters':
          debouncedRefetchDynamicCharacter()
          break
        case 'persons':
          debouncedRefetchDynamicPerson()
          break
        case 'companies':
          debouncedRefetchDynamicCompany()
          break
      }
    }

    // Static collection listeners
    eventManager.on('db:inserted', ({ table }) => handleStaticChange(table))
    eventManager.on('db:updated', ({ table }) => {
      // Static: only collections table (order changes)
      if (table === 'collections') handleStaticChange(table)
    })
    eventManager.on('db:deleted', ({ table }) => handleStaticChange(table))

    // Dynamic collection listeners
    eventManager.on('db:inserted', ({ table }) => handleDynamicChange(table))
    eventManager.on('db:updated', ({ table }) => handleDynamicChange(table))
    eventManager.on('db:deleted', ({ table }) => handleDynamicChange(table))
  }

  return {
    isInitialized: readonly(isInitialized),
    getFrom,
    init,
    refetchAllStatic,
    refetchAllDynamic,
    refetchStaticType,
    refetchDynamicType
  }
})
