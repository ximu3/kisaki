/**
 * Character data composable
 *
 * Provides character data with all related entities using Provider/Consumer pattern.
 * Replaces React's CharacterContext.
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
  Character,
  CharacterTagLink,
  GameCharacterLink,
  CharacterPersonLink,
  Game,
  Person,
  Tag
} from '@shared/db'
import * as schema from '@shared/db'

// =============================================================================
// Types
// =============================================================================

interface CharacterData {
  character: Character
  tags: (CharacterTagLink & { tag: Tag | null })[]
  games: (GameCharacterLink & { game: Game | null })[]
  persons: (CharacterPersonLink & { person: Person | null })[]
}

export interface CharacterContext {
  character: ComputedRef<Character | null>
  tags: ComputedRef<(CharacterTagLink & { tag: Tag | null })[]>
  games: ComputedRef<(GameCharacterLink & { game: Game | null })[]>
  persons: ComputedRef<(CharacterPersonLink & { person: Person | null })[]>
  isLoading: Ref<boolean>
  isFetching: Ref<boolean>
  error: Ref<string | null>
  refetch: () => Promise<void>
}

// =============================================================================
// Injection Key
// =============================================================================

export const CharacterKey: InjectionKey<CharacterContext> = Symbol('character')

// =============================================================================
// Data Fetcher
// =============================================================================

async function fetchCharacterData(
  characterId: string,
  spoilersRevealed: boolean,
  showNsfw: boolean
): Promise<CharacterData | null> {
  if (!characterId) return null

  const characterWhere = and(
    eq(schema.characters.id, characterId),
    showNsfw ? undefined : eq(schema.characters.isNsfw, false)
  )
  const [charData] = await db.select().from(schema.characters).where(characterWhere).limit(1)

  if (!charData) return null

  const characterTagLinksWhere = and(
    eq(schema.characterTagLinks.characterId, characterId),
    spoilersRevealed ? undefined : eq(schema.characterTagLinks.isSpoiler, false),
    showNsfw ? undefined : eq(schema.tags.isNsfw, false)
  )

  const gameCharacterLinksWhere = and(
    eq(schema.gameCharacterLinks.characterId, characterId),
    spoilersRevealed ? undefined : eq(schema.gameCharacterLinks.isSpoiler, false),
    showNsfw ? undefined : eq(schema.games.isNsfw, false)
  )

  const characterPersonLinksWhere = and(
    eq(schema.characterPersonLinks.characterId, characterId),
    spoilersRevealed ? undefined : eq(schema.characterPersonLinks.isSpoiler, false),
    showNsfw ? undefined : eq(schema.persons.isNsfw, false)
  )

  // Parallel fetch all related data
  const [tagLinks, gameLinks, personLinks] = await Promise.all([
    db
      .select()
      .from(schema.characterTagLinks)
      .leftJoin(schema.tags, eq(schema.characterTagLinks.tagId, schema.tags.id))
      .where(characterTagLinksWhere)
      .orderBy(asc(schema.characterTagLinks.orderInCharacter)),
    db
      .select()
      .from(schema.gameCharacterLinks)
      .leftJoin(schema.games, eq(schema.gameCharacterLinks.gameId, schema.games.id))
      .where(gameCharacterLinksWhere)
      .orderBy(asc(schema.gameCharacterLinks.orderInCharacter)),
    db
      .select()
      .from(schema.characterPersonLinks)
      .leftJoin(schema.persons, eq(schema.characterPersonLinks.personId, schema.persons.id))
      .where(characterPersonLinksWhere)
      .orderBy(asc(schema.characterPersonLinks.orderInCharacter))
  ])

  return {
    character: charData,
    tags: tagLinks.map((row) => ({ ...row.character_tag_links, tag: row.tags })),
    games: gameLinks.map((row) => ({ ...row.game_character_links, game: row.games })),
    persons: personLinks.map((row) => ({ ...row.character_person_links, person: row.persons }))
  }
}

// =============================================================================
// Provider Composable
// =============================================================================

export function useCharacterProvider(
  characterId: MaybeRefOrGetter<string>,
  spoilersRevealed: MaybeRefOrGetter<boolean> = false
): CharacterContext {
  const id = toRef(characterId)
  const revealed = computed(() => toValue(spoilersRevealed))
  const preferencesStore = usePreferencesStore()
  const { showNsfw } = storeToRefs(preferencesStore)

  const { data, isLoading, isFetching, error, refetch } = useAsyncData(
    () => fetchCharacterData(toValue(id), revealed.value, showNsfw.value),
    { watch: [id, revealed, showNsfw] }
  )

  const character = computed(() => data.value?.character ?? null)
  const tags = computed(() => data.value?.tags ?? [])
  const games = computed(() => data.value?.games ?? [])
  const persons = computed(() => data.value?.persons ?? [])

  useEvent('db:updated', ({ table, id: entityId }) => {
    const currentId = toValue(id)
    if (table === 'characters' && entityId === currentId) {
      refetch()
    }
    if (
      table === 'character_tag_links' ||
      table === 'game_character_links' ||
      table === 'character_person_links'
    ) {
      refetch()
    }
  })

  useEvent('db:inserted', ({ table }) => {
    if (
      table === 'character_tag_links' ||
      table === 'game_character_links' ||
      table === 'character_person_links'
    ) {
      refetch()
    }
  })

  useEvent('db:deleted', ({ table, id: entityId }) => {
    const currentId = toValue(id)
    if (table === 'characters' && entityId === currentId) {
      refetch()
    }
  })

  const context: CharacterContext = {
    character,
    tags,
    games,
    persons,
    isLoading,
    isFetching,
    error,
    refetch
  }

  provide(CharacterKey, context)

  return context
}

// =============================================================================
// Consumer Composable
// =============================================================================

export function useCharacter(): CharacterContext {
  const context = inject(CharacterKey)
  if (!context) {
    throw new Error(
      'useCharacter() must be used within a component that called useCharacterProvider()'
    )
  }
  return context
}
