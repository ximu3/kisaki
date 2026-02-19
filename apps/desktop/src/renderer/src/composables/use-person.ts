/**
 * Person data composable
 *
 * Provides person data with all related entities using Provider/Consumer pattern.
 * Replaces React's PersonContext.
 */

import {
  provide,
  inject,
  toRef,
  toValue,
  computed,
  type InjectionKey,
  type Ref,
  type MaybeRefOrGetter,
  type ComputedRef
} from 'vue'
import { storeToRefs } from 'pinia'
import { eq, asc, and } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { useAsyncData } from './use-async-data'
import { useEvent } from './use-event'
import { usePreferencesStore } from '@renderer/stores'
import type {
  Person,
  GamePersonLink,
  CharacterPersonLink,
  PersonTagLink,
  Game,
  Character,
  Tag
} from '@shared/db'
import * as schema from '@shared/db'

// =============================================================================
// Types
// =============================================================================

interface PersonData {
  person: Person
  tags: (PersonTagLink & { tag: Tag | null })[]
  games: (GamePersonLink & { game: Game | null })[]
  characters: (CharacterPersonLink & { character: Character | null })[]
}

export interface PersonContext {
  person: ComputedRef<Person | null>
  tags: ComputedRef<(PersonTagLink & { tag: Tag | null })[]>
  games: ComputedRef<(GamePersonLink & { game: Game | null })[]>
  characters: ComputedRef<(CharacterPersonLink & { character: Character | null })[]>
  isLoading: Ref<boolean>
  isFetching: Ref<boolean>
  error: Ref<string | null>
  refetch: () => Promise<void>
}

// =============================================================================
// Injection Key
// =============================================================================

export const PersonKey: InjectionKey<PersonContext> = Symbol('person')

// =============================================================================
// Data Fetcher
// =============================================================================

async function fetchPersonData(
  personId: string,
  spoilersRevealed: boolean,
  showNsfw: boolean
): Promise<PersonData | null> {
  if (!personId) return null

  const personWhere = and(
    eq(schema.persons.id, personId),
    showNsfw ? undefined : eq(schema.persons.isNsfw, false)
  )
  const [personData] = await db.select().from(schema.persons).where(personWhere).limit(1)

  if (!personData) return null

  const personTagLinksWhere = and(
    eq(schema.personTagLinks.personId, personId),
    spoilersRevealed ? undefined : eq(schema.personTagLinks.isSpoiler, false),
    showNsfw ? undefined : eq(schema.tags.isNsfw, false)
  )

  const gamePersonLinksWhere = and(
    eq(schema.gamePersonLinks.personId, personId),
    spoilersRevealed ? undefined : eq(schema.gamePersonLinks.isSpoiler, false),
    showNsfw ? undefined : eq(schema.games.isNsfw, false)
  )

  const characterPersonLinksWhere = and(
    eq(schema.characterPersonLinks.personId, personId),
    spoilersRevealed ? undefined : eq(schema.characterPersonLinks.isSpoiler, false),
    showNsfw ? undefined : eq(schema.characters.isNsfw, false)
  )

  // Parallel fetch all related data
  const [tagLinks, gameLinks, charLinks] = await Promise.all([
    db
      .select()
      .from(schema.personTagLinks)
      .leftJoin(schema.tags, eq(schema.personTagLinks.tagId, schema.tags.id))
      .where(personTagLinksWhere)
      .orderBy(asc(schema.personTagLinks.orderInPerson)),
    db
      .select()
      .from(schema.gamePersonLinks)
      .leftJoin(schema.games, eq(schema.gamePersonLinks.gameId, schema.games.id))
      .where(gamePersonLinksWhere)
      .orderBy(asc(schema.gamePersonLinks.orderInPerson)),
    db
      .select()
      .from(schema.characterPersonLinks)
      .leftJoin(
        schema.characters,
        eq(schema.characterPersonLinks.characterId, schema.characters.id)
      )
      .where(characterPersonLinksWhere)
      .orderBy(asc(schema.characterPersonLinks.orderInPerson))
  ])

  return {
    person: personData,
    tags: tagLinks.map((row) => ({ ...row.person_tag_links, tag: row.tags })),
    games: gameLinks.map((row) => ({ ...row.game_person_links, game: row.games })),
    characters: charLinks.map((row) => ({
      ...row.character_person_links,
      character: row.characters
    }))
  }
}

// =============================================================================
// Provider Composable
// =============================================================================

export function usePersonProvider(
  personId: MaybeRefOrGetter<string>,
  spoilersRevealed: MaybeRefOrGetter<boolean> = false
): PersonContext {
  const id = toRef(personId)
  const revealed = computed(() => toValue(spoilersRevealed))
  const preferencesStore = usePreferencesStore()
  const { showNsfw } = storeToRefs(preferencesStore)

  const { data, isLoading, isFetching, error, refetch } = useAsyncData(
    () => fetchPersonData(toValue(id), revealed.value, showNsfw.value),
    { watch: [id, revealed, showNsfw] }
  )

  const person = computed(() => data.value?.person ?? null)
  const tags = computed(() => data.value?.tags ?? [])
  const games = computed(() => data.value?.games ?? [])
  const characters = computed(() => data.value?.characters ?? [])

  useEvent('db:updated', ({ table, id: entityId }) => {
    const currentId = toValue(id)
    if (table === 'persons' && entityId === currentId) {
      refetch()
    }
    if (
      table === 'person_tag_links' ||
      table === 'game_person_links' ||
      table === 'character_person_links'
    ) {
      refetch()
    }
  })

  useEvent('db:inserted', ({ table }) => {
    if (
      table === 'person_tag_links' ||
      table === 'game_person_links' ||
      table === 'character_person_links'
    ) {
      refetch()
    }
  })

  useEvent('db:deleted', ({ table, id: entityId }) => {
    const currentId = toValue(id)
    if (table === 'persons' && entityId === currentId) {
      refetch()
    }
  })

  const context: PersonContext = {
    person,
    tags,
    games,
    characters,
    isLoading,
    isFetching,
    error,
    refetch
  }

  provide(PersonKey, context)

  return context
}

// =============================================================================
// Consumer Composable
// =============================================================================

export function usePerson(): PersonContext {
  const context = inject(PersonKey)
  if (!context) {
    throw new Error('usePerson() must be used within a component that called usePersonProvider()')
  }
  return context
}
