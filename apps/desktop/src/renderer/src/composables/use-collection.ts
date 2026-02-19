/**
 * Collection data composable
 *
 * Provides collection data with entities using Provider/Consumer pattern.
 * Supports both static and dynamic collections.
 * Replaces React's CollectionContext.
 */

import {
  provide,
  inject,
  toRef,
  toValue,
  computed,
  ref,
  type InjectionKey,
  type Ref,
  type MaybeRefOrGetter,
  type ComputedRef
} from 'vue'
import { storeToRefs } from 'pinia'
import { eq, count, asc, and } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { useAsyncData } from './use-async-data'
import { useEvent } from './use-event'
import { usePreferencesStore } from '@renderer/stores'
import { buildFilterConditions, buildOrderBy, getFilterQuerySpec } from '@shared/filter'
import type {
  Collection,
  Game,
  Character,
  Person,
  Company,
  DynamicCollectionConfig,
  DynamicEntityConfig
} from '@shared/db'
import * as schema from '@shared/db'
import type { ContentEntityType, SortDirection } from '@shared/common'
import { CONTENT_ENTITY_TYPES } from '@shared/common'
import type { ContentEntityData, ContentEntityCounts } from './types'

// =============================================================================
// Types
// =============================================================================

interface CollectionData {
  collection: Collection | null
  counts: ContentEntityCounts
  configuredTypes: ContentEntityType[]
}

export interface CollectionContext {
  /** Collection data */
  collection: ComputedRef<Collection | null>
  /** Entities in the collection for current entity type */
  entities: ComputedRef<ContentEntityData[]>
  /** Current entity type being viewed */
  entityType: ComputedRef<ContentEntityType>
  /** Entity counts for all types */
  entityCounts: ComputedRef<ContentEntityCounts>
  /** For dynamic collections, which entity types have config */
  configuredEntityTypes: ComputedRef<ContentEntityType[]>
  /** Change the current entity type */
  setEntityType: (type: ContentEntityType) => void
  /** Initial loading state */
  isLoading: Ref<boolean>
  /** Background refetching state */
  isFetching: ComputedRef<boolean>
  /** Error if any */
  error: ComputedRef<Error | null>
  /** Manually refetch data */
  refetch: () => Promise<void>
}

// =============================================================================
// Injection Key
// =============================================================================

export const CollectionKey: InjectionKey<CollectionContext> = Symbol('collection')

// =============================================================================
// Helper Functions
// =============================================================================

function getLinkTableName(type: ContentEntityType): string {
  switch (type) {
    case 'game':
      return 'collectionGameLinks'
    case 'character':
      return 'collectionCharacterLinks'
    case 'person':
      return 'collectionPersonLinks'
    case 'company':
      return 'collectionCompanyLinks'
  }
}

function getConfiguredEntityTypes(config: DynamicCollectionConfig | null): ContentEntityType[] {
  if (!config) return []
  const types: ContentEntityType[] = []
  if (config.game?.enabled) types.push('game')
  if (config.character?.enabled) types.push('character')
  if (config.person?.enabled) types.push('person')
  if (config.company?.enabled) types.push('company')
  return types
}

function getDefaultEntityType(
  counts: ContentEntityCounts,
  configured: ContentEntityType[]
): ContentEntityType {
  // For dynamic collections, pick first configured type with items
  if (configured.length > 0 && configured.length < 4) {
    const firstConfigured = configured[0]
    return counts[firstConfigured] > 0 ? firstConfigured : configured[0]
  }
  // For static collections, pick type with most items
  const entries = Object.entries(counts) as [ContentEntityType, number][]
  const sorted = entries.sort((a, b) => b[1] - a[1])
  return sorted[0][1] > 0 ? sorted[0][0] : 'game'
}

// =============================================================================
// Data Fetching Functions
// =============================================================================

async function fetchCollectionWithCounts(
  collectionId: string,
  showNsfw: boolean
): Promise<CollectionData> {
  // Fetch collection first
  const collectionWhere = and(
    eq(schema.collections.id, collectionId),
    showNsfw ? undefined : eq(schema.collections.isNsfw, false)
  )
  const [collectionData] = await db
    .select()
    .from(schema.collections)
    .where(collectionWhere)
    .limit(1)

  if (!collectionData) {
    return {
      collection: null,
      counts: { game: 0, character: 0, person: 0, company: 0 },
      configuredTypes: [...CONTENT_ENTITY_TYPES]
    }
  }

  const isDynamic = collectionData.isDynamic
  const dynamicConfig = collectionData.dynamicConfig

  // Determine configured entity types
  const configuredTypes = isDynamic
    ? getConfiguredEntityTypes(dynamicConfig)
    : [...CONTENT_ENTITY_TYPES]

  // Fetch counts based on collection type
  let counts: ContentEntityCounts

  if (isDynamic && dynamicConfig) {
    counts = { game: 0, character: 0, person: 0, company: 0 }
    const promises: Promise<void>[] = []

    if (dynamicConfig.game?.enabled) {
      promises.push(
        (async () => {
          const whereCondition = buildFilterConditions(
            getQuerySpec('game'),
            dynamicConfig.game.filter
          )
          const result = await db
            .select({ count: count() })
            .from(schema.games)
            .where(
              and(
                whereCondition as never,
                showNsfw ? undefined : eq(schema.games.isNsfw, false)
              ) as never
            )
          counts.game = Number(result[0]?.count ?? 0)
        })()
      )
    }

    if (dynamicConfig.character?.enabled) {
      promises.push(
        (async () => {
          const whereCondition = buildFilterConditions(
            getQuerySpec('character'),
            dynamicConfig.character.filter
          )
          const result = await db
            .select({ count: count() })
            .from(schema.characters)
            .where(
              and(
                whereCondition as never,
                showNsfw ? undefined : eq(schema.characters.isNsfw, false)
              ) as never
            )
          counts.character = Number(result[0]?.count ?? 0)
        })()
      )
    }

    if (dynamicConfig.person?.enabled) {
      promises.push(
        (async () => {
          const whereCondition = buildFilterConditions(
            getQuerySpec('person'),
            dynamicConfig.person.filter
          )
          const result = await db
            .select({ count: count() })
            .from(schema.persons)
            .where(
              and(
                whereCondition as never,
                showNsfw ? undefined : eq(schema.persons.isNsfw, false)
              ) as never
            )
          counts.person = Number(result[0]?.count ?? 0)
        })()
      )
    }

    if (dynamicConfig.company?.enabled) {
      promises.push(
        (async () => {
          const whereCondition = buildFilterConditions(
            getQuerySpec('company'),
            dynamicConfig.company.filter
          )
          const result = await db
            .select({ count: count() })
            .from(schema.companies)
            .where(
              and(
                whereCondition as never,
                showNsfw ? undefined : eq(schema.companies.isNsfw, false)
              ) as never
            )
          counts.company = Number(result[0]?.count ?? 0)
        })()
      )
    }

    await Promise.all(promises)
  } else {
    // Static collection - count via link tables
    const [[gameCountRow], [characterCountRow], [personCountRow], [companyCountRow]] =
      await Promise.all([
        db
          .select({ value: count() })
          .from(schema.collectionGameLinks)
          .innerJoin(schema.games, eq(schema.collectionGameLinks.gameId, schema.games.id))
          .where(
            and(
              eq(schema.collectionGameLinks.collectionId, collectionId),
              showNsfw ? undefined : eq(schema.games.isNsfw, false)
            )
          ),
        db
          .select({ value: count() })
          .from(schema.collectionCharacterLinks)
          .innerJoin(
            schema.characters,
            eq(schema.collectionCharacterLinks.characterId, schema.characters.id)
          )
          .where(
            and(
              eq(schema.collectionCharacterLinks.collectionId, collectionId),
              showNsfw ? undefined : eq(schema.characters.isNsfw, false)
            )
          ),
        db
          .select({ value: count() })
          .from(schema.collectionPersonLinks)
          .innerJoin(schema.persons, eq(schema.collectionPersonLinks.personId, schema.persons.id))
          .where(
            and(
              eq(schema.collectionPersonLinks.collectionId, collectionId),
              showNsfw ? undefined : eq(schema.persons.isNsfw, false)
            )
          ),
        db
          .select({ value: count() })
          .from(schema.collectionCompanyLinks)
          .innerJoin(
            schema.companies,
            eq(schema.collectionCompanyLinks.companyId, schema.companies.id)
          )
          .where(
            and(
              eq(schema.collectionCompanyLinks.collectionId, collectionId),
              showNsfw ? undefined : eq(schema.companies.isNsfw, false)
            )
          )
      ])

    counts = {
      game: Number(gameCountRow?.value ?? 0),
      character: Number(characterCountRow?.value ?? 0),
      person: Number(personCountRow?.value ?? 0),
      company: Number(companyCountRow?.value ?? 0)
    }
  }

  return { collection: collectionData, counts, configuredTypes }
}

async function fetchCollectionEntities(
  collection: Collection | null,
  collectionId: string,
  entityType: ContentEntityType,
  showNsfw: boolean
): Promise<ContentEntityData[]> {
  if (!collection) return []

  const isDynamic = collection.isDynamic
  const dynamicConfig = collection.dynamicConfig

  if (isDynamic && dynamicConfig) {
    const entityConfig = dynamicConfig[entityType] as DynamicEntityConfig | undefined
    if (!entityConfig?.enabled) return []

    const querySpec = getQuerySpec(entityType)
    const whereCondition = buildFilterConditions(querySpec, entityConfig.filter)
    const orderBy = buildOrderBy(
      querySpec,
      entityConfig.sortField,
      entityConfig.sortDirection as SortDirection
    )

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
    }
  }

  // Static collection - fetch via link tables
  switch (entityType) {
    case 'game': {
      const whereCondition = and(
        eq(schema.collectionGameLinks.collectionId, collectionId),
        showNsfw ? undefined : eq(schema.games.isNsfw, false)
      )
      const rows = await db
        .select()
        .from(schema.collectionGameLinks)
        .innerJoin(schema.games, eq(schema.collectionGameLinks.gameId, schema.games.id))
        .where(whereCondition)
        .orderBy(asc(schema.collectionGameLinks.orderInCollection))

      return rows.map((row) => row.games) as Game[]
    }
    case 'character': {
      const whereCondition = and(
        eq(schema.collectionCharacterLinks.collectionId, collectionId),
        showNsfw ? undefined : eq(schema.characters.isNsfw, false)
      )
      const rows = await db
        .select()
        .from(schema.collectionCharacterLinks)
        .innerJoin(
          schema.characters,
          eq(schema.collectionCharacterLinks.characterId, schema.characters.id)
        )
        .where(whereCondition)
        .orderBy(asc(schema.collectionCharacterLinks.orderInCollection))

      return rows.map((row) => row.characters) as Character[]
    }
    case 'person': {
      const whereCondition = and(
        eq(schema.collectionPersonLinks.collectionId, collectionId),
        showNsfw ? undefined : eq(schema.persons.isNsfw, false)
      )
      const rows = await db
        .select()
        .from(schema.collectionPersonLinks)
        .innerJoin(schema.persons, eq(schema.collectionPersonLinks.personId, schema.persons.id))
        .where(whereCondition)
        .orderBy(asc(schema.collectionPersonLinks.orderInCollection))

      return rows.map((row) => row.persons) as Person[]
    }
    case 'company': {
      const whereCondition = and(
        eq(schema.collectionCompanyLinks.collectionId, collectionId),
        showNsfw ? undefined : eq(schema.companies.isNsfw, false)
      )
      const rows = await db
        .select()
        .from(schema.collectionCompanyLinks)
        .innerJoin(
          schema.companies,
          eq(schema.collectionCompanyLinks.companyId, schema.companies.id)
        )
        .where(whereCondition)
        .orderBy(asc(schema.collectionCompanyLinks.orderInCollection))

      return rows.map((row) => row.companies) as Company[]
    }
  }
}

const getQuerySpec = getFilterQuerySpec

// =============================================================================
// Provider Composable
// =============================================================================

export function useCollectionProvider(
  collectionId: MaybeRefOrGetter<string>,
  initialEntityType?: ContentEntityType
): CollectionContext {
  const id = toRef(collectionId)
  const preferencesStore = usePreferencesStore()
  const { showNsfw } = storeToRefs(preferencesStore)

  // User-selected entity type
  const userSelectedType = ref<ContentEntityType | null>(null)

  // Fetch collection and counts
  const collectionQuery = useAsyncData(
    () => fetchCollectionWithCounts(toValue(id), showNsfw.value),
    {
      watch: [id, showNsfw]
    }
  )

  const collection = computed(() => collectionQuery.data.value?.collection ?? null)
  const counts = computed(
    () => collectionQuery.data.value?.counts ?? { game: 0, character: 0, person: 0, company: 0 }
  )
  const configuredTypes = computed(
    () => collectionQuery.data.value?.configuredTypes ?? [...CONTENT_ENTITY_TYPES]
  )

  // Determine effective entity type
  const effectiveEntityType = computed(() => {
    const coll = collection.value
    if (!coll) return 'game' as ContentEntityType
    return initialEntityType ?? getDefaultEntityType(counts.value, configuredTypes.value)
  })

  // Current entity type (user override or effective)
  const entityType = computed(() => {
    let type = userSelectedType.value ?? effectiveEntityType.value
    // Ensure user-selected type is valid for dynamic collections
    if (
      collection.value?.isDynamic &&
      configuredTypes.value.length > 0 &&
      !configuredTypes.value.includes(type)
    ) {
      type = configuredTypes.value[0]
    }
    return type
  })

  const setEntityType = (type: ContentEntityType) => {
    userSelectedType.value = type
  }

  // Fetch entities for current type
  const entitiesQuery = useAsyncData(
    () => fetchCollectionEntities(collection.value, toValue(id), entityType.value, showNsfw.value),
    {
      watch: [
        id,
        entityType,
        () => collection.value?.id,
        () => collection.value?.isDynamic,
        showNsfw
      ]
    }
  )

  const entities = computed(() => entitiesQuery.data.value ?? [])

  // Listen for database changes
  const isDynamic = computed(() => collection.value?.isDynamic ?? false)

  useEvent('db:updated', ({ table, id: entityId }) => {
    const currentId = toValue(id)
    if (table === 'collections' && entityId === currentId) {
      collectionQuery.refetch()
      entitiesQuery.refetch()
    }
    // For dynamic collections, refetch when source entities change
    if (isDynamic.value) {
      const entityTables = ['games', 'characters', 'persons', 'companies']
      if (entityTables.includes(table)) {
        collectionQuery.refetch()
        entitiesQuery.refetch()
      }
    }
  })

  useEvent('db:inserted', ({ table }) => {
    const linkTableName = getLinkTableName(entityType.value)
    if (table === linkTableName || table === 'collections') {
      collectionQuery.refetch()
      entitiesQuery.refetch()
    }
    if (isDynamic.value) {
      const entityTables = ['games', 'characters', 'persons', 'companies']
      if (entityTables.includes(table)) {
        collectionQuery.refetch()
        entitiesQuery.refetch()
      }
    }
  })

  useEvent('db:deleted', ({ table }) => {
    const linkTableName = getLinkTableName(entityType.value)
    if (table === linkTableName) {
      collectionQuery.refetch()
      entitiesQuery.refetch()
    }
    if (isDynamic.value) {
      const entityTables = ['games', 'characters', 'persons', 'companies']
      if (entityTables.includes(table)) {
        collectionQuery.refetch()
        entitiesQuery.refetch()
      }
    }
  })

  const refetch = async () => {
    await Promise.all([collectionQuery.refetch(), entitiesQuery.refetch()])
  }

  const error = computed(() =>
    collectionQuery.error.value || entitiesQuery.error.value
      ? new Error(collectionQuery.error.value || entitiesQuery.error.value || '')
      : null
  )

  const context: CollectionContext = {
    collection,
    entities,
    entityType,
    entityCounts: counts,
    configuredEntityTypes: configuredTypes,
    setEntityType,
    isLoading: collectionQuery.isLoading,
    isFetching: computed(() => collectionQuery.isFetching.value || entitiesQuery.isFetching.value),
    error,
    refetch
  }

  provide(CollectionKey, context)

  return context
}

// =============================================================================
// Consumer Composable
// =============================================================================

export function useCollection(): CollectionContext {
  const context = inject(CollectionKey)
  if (!context) {
    throw new Error(
      'useCollection() must be used within a component that called useCollectionProvider()'
    )
  }
  return context
}
