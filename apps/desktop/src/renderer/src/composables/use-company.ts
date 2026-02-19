/**
 * Company data composable
 *
 * Provides company data with all related entities using Provider/Consumer pattern.
 * Replaces React's CompanyContext.
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
import type { Company, GameCompanyLink, CompanyTagLink, Game, Tag } from '@shared/db'
import * as schema from '@shared/db'

// =============================================================================
// Types
// =============================================================================

interface CompanyData {
  company: Company
  tags: (CompanyTagLink & { tag: Tag | null })[]
  games: (GameCompanyLink & { game: Game | null })[]
}

export interface CompanyContext {
  company: ComputedRef<Company | null>
  tags: ComputedRef<(CompanyTagLink & { tag: Tag | null })[]>
  games: ComputedRef<(GameCompanyLink & { game: Game | null })[]>
  isLoading: Ref<boolean>
  isFetching: Ref<boolean>
  error: Ref<string | null>
  refetch: () => Promise<void>
}

// =============================================================================
// Injection Key
// =============================================================================

export const CompanyKey: InjectionKey<CompanyContext> = Symbol('company')

// =============================================================================
// Data Fetcher
// =============================================================================

async function fetchCompanyData(
  companyId: string,
  spoilersRevealed: boolean,
  showNsfw: boolean
): Promise<CompanyData | null> {
  if (!companyId) return null

  const companyWhere = and(
    eq(schema.companies.id, companyId),
    showNsfw ? undefined : eq(schema.companies.isNsfw, false)
  )
  const [companyData] = await db.select().from(schema.companies).where(companyWhere).limit(1)

  if (!companyData) return null

  const companyTagLinksWhere = and(
    eq(schema.companyTagLinks.companyId, companyId),
    spoilersRevealed ? undefined : eq(schema.companyTagLinks.isSpoiler, false),
    showNsfw ? undefined : eq(schema.tags.isNsfw, false)
  )

  const gameCompanyLinksWhere = and(
    eq(schema.gameCompanyLinks.companyId, companyId),
    spoilersRevealed ? undefined : eq(schema.gameCompanyLinks.isSpoiler, false),
    showNsfw ? undefined : eq(schema.games.isNsfw, false)
  )

  // Parallel fetch all related data
  const [tagLinks, gameLinks] = await Promise.all([
    db
      .select()
      .from(schema.companyTagLinks)
      .leftJoin(schema.tags, eq(schema.companyTagLinks.tagId, schema.tags.id))
      .where(companyTagLinksWhere)
      .orderBy(asc(schema.companyTagLinks.orderInCompany)),
    db
      .select()
      .from(schema.gameCompanyLinks)
      .leftJoin(schema.games, eq(schema.gameCompanyLinks.gameId, schema.games.id))
      .where(gameCompanyLinksWhere)
      .orderBy(asc(schema.gameCompanyLinks.orderInCompany))
  ])

  return {
    company: companyData,
    tags: tagLinks.map((row) => ({ ...row.company_tag_links, tag: row.tags })),
    games: gameLinks.map((row) => ({ ...row.game_company_links, game: row.games }))
  }
}

// =============================================================================
// Provider Composable
// =============================================================================

export function useCompanyProvider(
  companyId: MaybeRefOrGetter<string>,
  spoilersRevealed: MaybeRefOrGetter<boolean> = false
): CompanyContext {
  const id = toRef(companyId)
  const revealed = computed(() => toValue(spoilersRevealed))
  const preferencesStore = usePreferencesStore()
  const { showNsfw } = storeToRefs(preferencesStore)

  const { data, isLoading, isFetching, error, refetch } = useAsyncData(
    () => fetchCompanyData(toValue(id), revealed.value, showNsfw.value),
    { watch: [id, revealed, showNsfw] }
  )

  const company = computed(() => data.value?.company ?? null)
  const tags = computed(() => data.value?.tags ?? [])
  const games = computed(() => data.value?.games ?? [])

  useEvent('db:updated', ({ table, id: entityId }) => {
    const currentId = toValue(id)
    if (table === 'companies' && entityId === currentId) {
      refetch()
    }
    if (table === 'company_tag_links' || table === 'game_company_links') {
      refetch()
    }
  })

  useEvent('db:inserted', ({ table }) => {
    if (table === 'company_tag_links' || table === 'game_company_links') {
      refetch()
    }
  })

  useEvent('db:deleted', ({ table, id: entityId }) => {
    const currentId = toValue(id)
    if (table === 'companies' && entityId === currentId) {
      refetch()
    }
  })

  const context: CompanyContext = {
    company,
    tags,
    games,
    isLoading,
    isFetching,
    error,
    refetch
  }

  provide(CompanyKey, context)

  return context
}

// =============================================================================
// Consumer Composable
// =============================================================================

export function useCompany(): CompanyContext {
  const context = inject(CompanyKey)
  if (!context) {
    throw new Error('useCompany() must be used within a component that called useCompanyProvider()')
  }
  return context
}
