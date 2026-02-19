/**
 * Composable: useShowcaseSections
 *
 * Fetches and manages showcase sections from the database.
 */

import { computed } from 'vue'
import { eq, asc } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '@renderer/core/db'
import { useAsyncData, useEvent } from '@renderer/composables'
import { showcaseSections, type ShowcaseSection, type NewShowcaseSection } from '@shared/db'

// =============================================================================
// Composable
// =============================================================================

export function useShowcaseSections() {
  async function fetchSections(): Promise<ShowcaseSection[]> {
    return await db.query.showcaseSections.findMany({
      orderBy: asc(showcaseSections.order)
    })
  }

  const { data, isLoading, isFetching, refetch } = useAsyncData(fetchSections)

  // Listen for DB events
  useEvent('db:inserted', ({ table }) => {
    if (table === 'showcase_sections') refetch()
  })
  useEvent('db:updated', ({ table }) => {
    if (table === 'showcase_sections') refetch()
  })
  useEvent('db:deleted', ({ table }) => {
    if (table === 'showcase_sections') refetch()
  })

  return {
    sections: computed(() => data.value ?? []),
    isLoading,
    isFetching,
    refetch
  }
}

// =============================================================================
// Actions
// =============================================================================

/** Create a new showcase section */
export async function createSection(data: Omit<NewShowcaseSection, 'id'>): Promise<string> {
  const id = nanoid()
  await db.insert(showcaseSections).values({ ...data, id })
  return id
}

/** Update a showcase section */
export async function updateSection(id: string, data: Partial<NewShowcaseSection>): Promise<void> {
  await db.update(showcaseSections).set(data).where(eq(showcaseSections.id, id))
}

/** Delete a showcase section */
export async function deleteSection(id: string): Promise<void> {
  await db.delete(showcaseSections).where(eq(showcaseSections.id, id))
}

/** Reorder sections */
export async function reorderSections(sectionIds: string[]): Promise<void> {
  for (let i = 0; i < sectionIds.length; i++) {
    const id = sectionIds[i]
    if (id !== undefined) {
      await db.update(showcaseSections).set({ order: i }).where(eq(showcaseSections.id, id))
    }
  }
}
