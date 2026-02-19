/**
 * Tag data composable
 *
 * Provides tag data with related entities using Provider/Consumer pattern.
 * Supports all entity types (game, character, person, company).
 * Replaces React's TagContext.
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
import { eq, asc, count, and } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { useAsyncData } from './use-async-data'
import { useEvent } from './use-event'
import { usePreferencesStore } from '@renderer/stores'
import type { Tag, Game, Character, Person, Company } from '@shared/db'
import * as schema from '@shared/db'
import type { ContentEntityType } from '@shared/common'
import type { ContentEntityData, ContentEntityCounts } from './types'

export interface TagContext {
  /** Tag data */
  tag: ComputedRef<Tag | null>
  /** Entities with this tag for current entity type */
  entities: ComputedRef<ContentEntityData[]>
  /** Current entity type being viewed */
  entityType: ComputedRef<ContentEntityType>
  /** Entity counts for all types */
  entityCounts: ComputedRef<ContentEntityCounts>
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

export const TagKey: InjectionKey<TagContext> = Symbol('tag')

// =============================================================================
// Helper Functions
// =============================================================================

function getLinkTableName(type: ContentEntityType): string {
  switch (type) {
    case 'game':
      return 'gameTagLinks'
    case 'character':
      return 'characterTagLinks'
    case 'person':
      return 'personTagLinks'
    case 'company':
      return 'companyTagLinks'
  }
}

function getDefaultEntityType(counts: ContentEntityCounts): ContentEntityType {
  const entries = Object.entries(counts) as [ContentEntityType, number][]
  const sorted = entries.sort((a, b) => b[1] - a[1])
  return sorted[0][1] > 0 ? sorted[0][0] : 'game'
}

// =============================================================================
// Data Fetching Functions
// =============================================================================

async function fetchTagWithCounts(
  tagId: string,
  showNsfw: boolean
): Promise<{ tag: Tag | null; counts: ContentEntityCounts }> {
  const tagWhere = and(
    eq(schema.tags.id, tagId),
    showNsfw ? undefined : eq(schema.tags.isNsfw, false)
  )

  const [[tagData], [gameCountRow], [characterCountRow], [personCountRow], [companyCountRow]] =
    await Promise.all([
      db
        .select()
        .from(schema.tags)
        .where(tagWhere as never)
        .limit(1),
      db
        .select({ value: count() })
        .from(schema.gameTagLinks)
        .innerJoin(schema.games, eq(schema.gameTagLinks.gameId, schema.games.id))
        .where(
          and(
            eq(schema.gameTagLinks.tagId, tagId),
            showNsfw ? undefined : eq(schema.games.isNsfw, false)
          )
        ),
      db
        .select({ value: count() })
        .from(schema.characterTagLinks)
        .innerJoin(
          schema.characters,
          eq(schema.characterTagLinks.characterId, schema.characters.id)
        )
        .where(
          and(
            eq(schema.characterTagLinks.tagId, tagId),
            showNsfw ? undefined : eq(schema.characters.isNsfw, false)
          )
        ),
      db
        .select({ value: count() })
        .from(schema.personTagLinks)
        .innerJoin(schema.persons, eq(schema.personTagLinks.personId, schema.persons.id))
        .where(
          and(
            eq(schema.personTagLinks.tagId, tagId),
            showNsfw ? undefined : eq(schema.persons.isNsfw, false)
          )
        ),
      db
        .select({ value: count() })
        .from(schema.companyTagLinks)
        .innerJoin(schema.companies, eq(schema.companyTagLinks.companyId, schema.companies.id))
        .where(
          and(
            eq(schema.companyTagLinks.tagId, tagId),
            showNsfw ? undefined : eq(schema.companies.isNsfw, false)
          )
        )
    ])

  return {
    tag: tagData ?? null,
    counts: {
      game: Number(gameCountRow?.value ?? 0),
      character: Number(characterCountRow?.value ?? 0),
      person: Number(personCountRow?.value ?? 0),
      company: Number(companyCountRow?.value ?? 0)
    }
  }
}

async function fetchEntitiesByType(
  tagId: string,
  type: ContentEntityType,
  showNsfw: boolean
): Promise<ContentEntityData[]> {
  switch (type) {
    case 'game': {
      const whereCondition = and(
        eq(schema.gameTagLinks.tagId, tagId),
        showNsfw ? undefined : eq(schema.games.isNsfw, false)
      )
      const rows = await db
        .select()
        .from(schema.gameTagLinks)
        .innerJoin(schema.games, eq(schema.gameTagLinks.gameId, schema.games.id))
        .where(whereCondition)
        .orderBy(asc(schema.gameTagLinks.orderInTag))

      return rows.map((row) => row.games) as Game[]
    }
    case 'character': {
      const whereCondition = and(
        eq(schema.characterTagLinks.tagId, tagId),
        showNsfw ? undefined : eq(schema.characters.isNsfw, false)
      )
      const rows = await db
        .select()
        .from(schema.characterTagLinks)
        .innerJoin(
          schema.characters,
          eq(schema.characterTagLinks.characterId, schema.characters.id)
        )
        .where(whereCondition)
        .orderBy(asc(schema.characterTagLinks.orderInTag))

      return rows.map((row) => row.characters) as Character[]
    }
    case 'person': {
      const whereCondition = and(
        eq(schema.personTagLinks.tagId, tagId),
        showNsfw ? undefined : eq(schema.persons.isNsfw, false)
      )
      const rows = await db
        .select()
        .from(schema.personTagLinks)
        .innerJoin(schema.persons, eq(schema.personTagLinks.personId, schema.persons.id))
        .where(whereCondition)
        .orderBy(asc(schema.personTagLinks.orderInTag))

      return rows.map((row) => row.persons) as Person[]
    }
    case 'company': {
      const whereCondition = and(
        eq(schema.companyTagLinks.tagId, tagId),
        showNsfw ? undefined : eq(schema.companies.isNsfw, false)
      )
      const rows = await db
        .select()
        .from(schema.companyTagLinks)
        .innerJoin(schema.companies, eq(schema.companyTagLinks.companyId, schema.companies.id))
        .where(whereCondition)
        .orderBy(asc(schema.companyTagLinks.orderInTag))

      return rows.map((row) => row.companies) as Company[]
    }
  }
}

// =============================================================================
// Provider Composable
// =============================================================================

export function useTagProvider(
  tagId: MaybeRefOrGetter<string>,
  initialEntityType?: ContentEntityType
): TagContext {
  const id = toRef(tagId)
  const preferencesStore = usePreferencesStore()
  const { showNsfw } = storeToRefs(preferencesStore)

  // User-selected entity type
  const userSelectedType = ref<ContentEntityType | null>(null)

  // Fetch tag and counts first
  const tagQuery = useAsyncData(() => fetchTagWithCounts(toValue(id), showNsfw.value), {
    watch: [id, showNsfw]
  })

  const tag = computed(() => tagQuery.data.value?.tag ?? null)
  const counts = computed(
    () => tagQuery.data.value?.counts ?? { game: 0, character: 0, person: 0, company: 0 }
  )

  // Determine effective entity type
  const effectiveEntityType = computed(() =>
    tag.value ? getDefaultEntityType(counts.value) : 'game'
  )

  // Current entity type (user override or effective)
  const entityType = computed(
    () => userSelectedType.value ?? initialEntityType ?? effectiveEntityType.value
  )

  const setEntityType = (type: ContentEntityType) => {
    userSelectedType.value = type
  }

  // Fetch entities for current type
  const entitiesQuery = useAsyncData(
    () => fetchEntitiesByType(toValue(id), entityType.value, showNsfw.value),
    {
      watch: [id, entityType, showNsfw]
    }
  )

  const entities = computed(() => entitiesQuery.data.value ?? [])

  // Listen for database changes
  useEvent('db:updated', ({ table, id: entityId }) => {
    const currentId = toValue(id)
    const linkTableName = getLinkTableName(entityType.value)
    if (table === 'tags' && entityId === currentId) {
      tagQuery.refetch()
      entitiesQuery.refetch()
    }
    if (table === linkTableName) {
      tagQuery.refetch()
      entitiesQuery.refetch()
    }
  })

  useEvent('db:inserted', ({ table }) => {
    const linkTableName = getLinkTableName(entityType.value)
    if (table === linkTableName) {
      tagQuery.refetch()
      entitiesQuery.refetch()
    }
  })

  useEvent('db:deleted', ({ table }) => {
    const linkTableName = getLinkTableName(entityType.value)
    if (table === linkTableName) {
      tagQuery.refetch()
      entitiesQuery.refetch()
    }
  })

  const refetch = async () => {
    await Promise.all([tagQuery.refetch(), entitiesQuery.refetch()])
  }

  const error = computed(() =>
    tagQuery.error.value || entitiesQuery.error.value
      ? new Error(tagQuery.error.value || entitiesQuery.error.value || '')
      : null
  )

  const context: TagContext = {
    tag,
    entities,
    entityType,
    entityCounts: counts,
    setEntityType,
    isLoading: tagQuery.isLoading,
    isFetching: computed(() => tagQuery.isFetching.value || entitiesQuery.isFetching.value),
    error,
    refetch
  }

  provide(TagKey, context)

  return context
}

// =============================================================================
// Consumer Composable
// =============================================================================

export function useTag(): TagContext {
  const context = inject(TagKey)
  if (!context) {
    throw new Error('useTag() must be used within a component that called useTagProvider()')
  }
  return context
}
