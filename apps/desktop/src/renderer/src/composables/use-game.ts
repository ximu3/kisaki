/**
 * Game data composable
 *
 * Provides game data with all related entities using Provider/Consumer pattern.
 * Replaces React's GameContext.
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
import { eq, asc, desc, and } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { useAsyncData } from './use-async-data'
import { useEvent } from './use-event'
import { usePreferencesStore } from '@renderer/stores'
import type {
  Game,
  GameNote,
  GameCharacterLink,
  GamePersonLink,
  GameCompanyLink,
  GameTagLink,
  GameSession,
  Character,
  Person,
  Company,
  Tag
} from '@shared/db'
import * as schema from '@shared/db'

// =============================================================================
// Types
// =============================================================================

interface GameData {
  game: Game | null
  notes: GameNote[]
  tags: (GameTagLink & { tag: Tag | null })[]
  characters: (GameCharacterLink & { character: Character | null })[]
  persons: (GamePersonLink & { person: Person | null })[]
  companies: (GameCompanyLink & { company: Company | null })[]
  sessions: GameSession[]
}

export interface GameContext {
  /** Game data */
  game: ComputedRef<Game | null>
  /** Game notes (from gameNotes) */
  notes: ComputedRef<GameNote[]>
  /** Game tags (from gameTagLinks) */
  tags: ComputedRef<(GameTagLink & { tag: Tag | null })[]>
  /** Character links with character data */
  characters: ComputedRef<(GameCharacterLink & { character: Character | null })[]>
  /** Person links with person data */
  persons: ComputedRef<(GamePersonLink & { person: Person | null })[]>
  /** Company links with company data */
  companies: ComputedRef<(GameCompanyLink & { company: Company | null })[]>
  /** Game sessions (play history) */
  sessions: ComputedRef<GameSession[]>
  /** Initial loading state */
  isLoading: Ref<boolean>
  /** Background refetching state */
  isFetching: Ref<boolean>
  /** Error if any */
  error: Ref<string | null>
  /** Manually refetch data */
  refetch: () => Promise<void>
}

// =============================================================================
// Injection Key
// =============================================================================

export const GameKey: InjectionKey<GameContext> = Symbol('game')

// =============================================================================
// Data Fetcher
// =============================================================================

async function fetchGameData(
  gameId: string,
  spoilersRevealed: boolean,
  showNsfw: boolean
): Promise<GameData | null> {
  if (!gameId) return null

  // First check if game exists
  const gameWhere = and(
    eq(schema.games.id, gameId),
    showNsfw ? undefined : eq(schema.games.isNsfw, false)
  )
  const [gameData] = await db.select().from(schema.games).where(gameWhere).limit(1)

  if (!gameData) return null

  const gameTagLinksWhere = and(
    eq(schema.gameTagLinks.gameId, gameId),
    spoilersRevealed ? undefined : eq(schema.gameTagLinks.isSpoiler, false),
    showNsfw ? undefined : eq(schema.tags.isNsfw, false)
  )

  const gameCharacterLinksWhere = and(
    eq(schema.gameCharacterLinks.gameId, gameId),
    spoilersRevealed ? undefined : eq(schema.gameCharacterLinks.isSpoiler, false),
    showNsfw ? undefined : eq(schema.characters.isNsfw, false)
  )

  const gamePersonLinksWhere = and(
    eq(schema.gamePersonLinks.gameId, gameId),
    spoilersRevealed ? undefined : eq(schema.gamePersonLinks.isSpoiler, false),
    showNsfw ? undefined : eq(schema.persons.isNsfw, false)
  )

  const gameCompanyLinksWhere = and(
    eq(schema.gameCompanyLinks.gameId, gameId),
    spoilersRevealed ? undefined : eq(schema.gameCompanyLinks.isSpoiler, false),
    showNsfw ? undefined : eq(schema.companies.isNsfw, false)
  )

  // Parallel fetch all related data
  const [notes, tagLinks, charLinks, personLinks, companyLinks, sessions] = await Promise.all([
    db
      .select()
      .from(schema.gameNotes)
      .where(eq(schema.gameNotes.gameId, gameId))
      .orderBy(asc(schema.gameNotes.orderInGame), asc(schema.gameNotes.name)),
    db
      .select()
      .from(schema.gameTagLinks)
      .leftJoin(schema.tags, eq(schema.gameTagLinks.tagId, schema.tags.id))
      .where(gameTagLinksWhere)
      .orderBy(asc(schema.gameTagLinks.orderInGame)),
    db
      .select()
      .from(schema.gameCharacterLinks)
      .leftJoin(schema.characters, eq(schema.gameCharacterLinks.characterId, schema.characters.id))
      .where(gameCharacterLinksWhere)
      .orderBy(asc(schema.gameCharacterLinks.orderInGame)),
    db
      .select()
      .from(schema.gamePersonLinks)
      .leftJoin(schema.persons, eq(schema.gamePersonLinks.personId, schema.persons.id))
      .where(gamePersonLinksWhere)
      .orderBy(asc(schema.gamePersonLinks.orderInGame)),
    db
      .select()
      .from(schema.gameCompanyLinks)
      .leftJoin(schema.companies, eq(schema.gameCompanyLinks.companyId, schema.companies.id))
      .where(gameCompanyLinksWhere)
      .orderBy(asc(schema.gameCompanyLinks.orderInGame)),
    db
      .select()
      .from(schema.gameSessions)
      .where(eq(schema.gameSessions.gameId, gameId))
      .orderBy(desc(schema.gameSessions.startedAt))
  ])

  return {
    game: gameData,
    notes,
    tags: tagLinks.map((row) => ({ ...row.game_tag_links, tag: row.tags })),
    characters: charLinks.map((row) => ({
      ...row.game_character_links,
      character: row.characters
    })),
    persons: personLinks.map((row) => ({ ...row.game_person_links, person: row.persons })),
    companies: companyLinks.map((row) => ({
      ...row.game_company_links,
      company: row.companies
    })),
    sessions
  }
}

// =============================================================================
// Provider Composable
// =============================================================================

/**
 * Provide game data context
 *
 * Call this in the parent component (page or provider component).
 *
 * @example
 * ```ts
 * // In game-detail-page.vue
 * const gameId = computed(() => route.params.gameId as string)
 * const { game, isLoading } = useGameProvider(gameId)
 * ```
 */
export function useGameProvider(
  gameId: MaybeRefOrGetter<string>,
  spoilersRevealed: MaybeRefOrGetter<boolean> = false
): GameContext {
  const id = toRef(gameId)
  const revealed = computed(() => toValue(spoilersRevealed))
  const preferencesStore = usePreferencesStore()
  const { showNsfw } = storeToRefs(preferencesStore)

  const { data, isLoading, isFetching, error, refetch } = useAsyncData(
    () => fetchGameData(toValue(id), revealed.value, showNsfw.value),
    { watch: [id, revealed, showNsfw] }
  )

  // Computed properties for individual fields
  const game = computed(() => data.value?.game ?? null)
  const notes = computed(() => data.value?.notes ?? [])
  const tags = computed(() => data.value?.tags ?? [])
  const characters = computed(() => data.value?.characters ?? [])
  const persons = computed(() => data.value?.persons ?? [])
  const companies = computed(() => data.value?.companies ?? [])
  const sessions = computed(() => data.value?.sessions ?? [])

  // Listen for DB updates
  useEvent('db:updated', ({ table, id: entityId }) => {
    const currentId = toValue(id)
    if (table === 'games' && entityId === currentId) {
      refetch()
    }
    if (
      table === 'game_notes' ||
      table === 'game_tag_links' ||
      table === 'game_character_links' ||
      table === 'game_person_links' ||
      table === 'game_company_links' ||
      table === 'game_sessions'
    ) {
      refetch()
    }
  })

  useEvent('db:inserted', ({ table }) => {
    if (
      table === 'game_notes' ||
      table === 'game_tag_links' ||
      table === 'game_character_links' ||
      table === 'game_person_links' ||
      table === 'game_company_links' ||
      table === 'game_sessions'
    ) {
      refetch()
    }
  })

  useEvent('db:deleted', ({ table, id: entityId }) => {
    const currentId = toValue(id)
    if (table === 'games' && entityId === currentId) {
      refetch()
    }
    if (table === 'game_notes' || table === 'game_sessions') {
      refetch()
    }
  })

  const context: GameContext = {
    game,
    notes,
    tags,
    characters,
    persons,
    companies,
    sessions,
    isLoading,
    isFetching,
    error,
    refetch
  }

  provide(GameKey, context)

  return context
}

// =============================================================================
// Consumer Composable
// =============================================================================

/**
 * Consume game data context
 *
 * Call this in child components to access game data.
 *
 * @example
 * ```ts
 * // In game-header.vue (child component)
 * const { game } = useGame()
 * ```
 */
export function useGame(): GameContext {
  const context = inject(GameKey)
  if (!context) {
    throw new Error('useGame() must be used within a component that called useGameProvider()')
  }
  return context
}
