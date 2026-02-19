<script setup lang="ts">
/**
 * Scanner Skipped Scan Item
 *
 * Single skipped scan item that fetches existing game name by ID.
 */

import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { eq, and } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { Icon } from '@renderer/components/ui/icon'
import { games, type Game } from '@shared/db'
import { getEntityIcon } from '@renderer/utils'
import { useAsyncData } from '@renderer/composables/use-async-data'
import { useEvent } from '@renderer/composables/use-event'
import { Badge } from '@renderer/components/ui/badge'
import type { SkippedScan } from '@shared/scanner'
import { usePreferencesStore } from '@renderer/stores'

// =============================================================================
// Props
// =============================================================================

interface Props {
  skipped: SkippedScan
}

const props = defineProps<Props>()

// =============================================================================
// Data Fetching
// =============================================================================

const preferencesStore = usePreferencesStore()
const { showNsfw } = storeToRefs(preferencesStore)

async function fetchGame(): Promise<Game | null> {
  if (!props.skipped.existingGameId) return null
  const result = await db.query.games.findFirst({
    where: showNsfw.value
      ? eq(games.id, props.skipped.existingGameId)
      : and(eq(games.id, props.skipped.existingGameId), eq(games.isNsfw, false))
  })
  return result ?? null
}

const { data: game, refetch } = useAsyncData(fetchGame, {
  watch: [() => props.skipped.existingGameId, showNsfw]
})

useEvent('db:updated', (payload) => {
  if (payload.table === 'games') {
    refetch()
  }
})

// =============================================================================
// Computed
// =============================================================================

const reasonText = computed(() => {
  return props.skipped.reason === 'path' ? '路径重复' : '游戏重复'
})
</script>

<template>
  <div class="border rounded-lg p-4 space-y-2">
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <Icon
            icon="icon-[mdi--folder-open-outline]"
            class="size-4 text-muted-foreground"
          />
          <span class="font-medium truncate">{{ props.skipped.name }}</span>
        </div>
        <div
          class="text-sm text-muted-foreground truncate"
          :title="props.skipped.path"
        >
          {{ props.skipped.path }}
        </div>
      </div>
      <Badge variant="secondary">{{ reasonText }}</Badge>
    </div>
    <div
      v-if="props.skipped.existingGameId"
      class="text-sm bg-muted/50 p-2 rounded-md flex items-center gap-2"
    >
      <Icon
        :icon="getEntityIcon('game')"
        class="size-4 text-muted-foreground"
      />
      <span class="text-muted-foreground">已存在游戏:</span>
      <span class="font-medium">{{ game?.name || '加载中...' }}</span>
    </div>
  </div>
</template>
