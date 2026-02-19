/**
 * Library Search Composable
 *
 * Provides FTS-backed search across all entity types in the library.
 * Uses SQLite FTS5 with prefix matching for responsive search.
 */

import { ref, watch, computed, toValue, onUnmounted, type MaybeRefOrGetter } from 'vue'
import { sql, and, eq } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { games, characters, persons, companies } from '@shared/db'
import type { Game, Character, Person, Company } from '@shared/db'
import { buildFtsMatchText, normalizeSearchText } from '@shared/search'
import { storeToRefs } from 'pinia'
import { usePreferencesStore } from '@renderer/stores'

// =============================================================================
// Types
// =============================================================================

export interface LibrarySearchResult {
  games: Game[]
  characters: Character[]
  persons: Person[]
  companies: Company[]
}

const EMPTY_RESULT: LibrarySearchResult = {
  games: [],
  characters: [],
  persons: [],
  companies: []
}

// =============================================================================
// Composable
// =============================================================================

/**
 * Composable for searching across all entity types using FTS5
 *
 * @param query - Search query string (reactive)
 * @param debounceMs - Debounce delay in milliseconds (default: 300)
 * @returns Search results grouped by entity type and loading state
 */
export function useLibrarySearch(query: MaybeRefOrGetter<string>, debounceMs = 300) {
  const results = ref<LibrarySearchResult>(EMPTY_RESULT)
  const isLoading = ref(false)
  const preferencesStore = usePreferencesStore()
  const { showNsfw } = storeToRefs(preferencesStore)

  // Debounced query
  const debouncedQuery = ref('')
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  // Track fetch version to handle race conditions
  let fetchVersion = 0

  // Watch query and debounce
  watch(
    () => toValue(query),
    (newQuery) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      debounceTimer = setTimeout(() => {
        debouncedQuery.value = normalizeSearchText(newQuery) ?? ''
      }, debounceMs)
    },
    { immediate: true }
  )

  // Perform search when debounced query changes
  watch(
    [debouncedQuery, showNsfw],
    async ([searchQuery]) => {
      if (!searchQuery) {
        results.value = EMPTY_RESULT
        isLoading.value = false
        return
      }

      const currentVersion = ++fetchVersion
      const searchTerm = buildFtsMatchText(searchQuery)
      if (!searchTerm) {
        results.value = EMPTY_RESULT
        isLoading.value = false
        return
      }
      isLoading.value = true

      try {
        // Parallel FTS queries for all entity types
        const [gamesResult, charactersResult, personsResult, companiesResult] = await Promise.all([
          // Games search
          db
            .select()
            .from(games)
            .where(
              and(
                sql`${games}.rowid IN (SELECT rowid FROM games_fts WHERE games_fts MATCH ${searchTerm})`,
                showNsfw.value ? undefined : eq(games.isNsfw, false)
              )
            ),

          // Characters search
          db
            .select()
            .from(characters)
            .where(
              and(
                sql`${characters}.rowid IN (SELECT rowid FROM characters_fts WHERE characters_fts MATCH ${searchTerm})`,
                showNsfw.value ? undefined : eq(characters.isNsfw, false)
              )
            ),

          // Persons search
          db
            .select()
            .from(persons)
            .where(
              and(
                sql`${persons}.rowid IN (SELECT rowid FROM persons_fts WHERE persons_fts MATCH ${searchTerm})`,
                showNsfw.value ? undefined : eq(persons.isNsfw, false)
              )
            ),

          // Companies search
          db
            .select()
            .from(companies)
            .where(
              and(
                sql`${companies}.rowid IN (SELECT rowid FROM companies_fts WHERE companies_fts MATCH ${searchTerm})`,
                showNsfw.value ? undefined : eq(companies.isNsfw, false)
              )
            )
        ])

        // Only update if this is still the latest search
        if (currentVersion === fetchVersion) {
          results.value = {
            games: gamesResult,
            characters: charactersResult,
            persons: personsResult,
            companies: companiesResult
          }
        }
      } catch (error) {
        console.error('[useLibrarySearch] Search failed:', error)
        if (currentVersion === fetchVersion) {
          results.value = EMPTY_RESULT
        }
      } finally {
        if (currentVersion === fetchVersion) {
          isLoading.value = false
        }
      }
    },
    { immediate: true }
  )

  // Cleanup on unmount
  onUnmounted(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
  })

  const hasResults = computed(
    () =>
      results.value.games.length > 0 ||
      results.value.characters.length > 0 ||
      results.value.persons.length > 0 ||
      results.value.companies.length > 0
  )

  return {
    results,
    isLoading,
    hasResults,
    query: debouncedQuery
  }
}
