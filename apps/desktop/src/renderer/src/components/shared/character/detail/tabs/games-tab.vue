<!--
  CharacterGamesTab
  Games tab content for character detail dialog.
  Shows full grid of related games grouped by character role.
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { useCharacter } from '@renderer/composables/use-character'
import { getEntityIcon } from '@renderer/utils'
import { Button } from '@renderer/components/ui/button'
import { GameCard, GameDetailDialog } from '@renderer/components/shared/game'
import { CharacterGamesFormDialog } from '../../forms'

// =============================================================================
// State
// =============================================================================

const { character, games } = useCharacter()

const editDialogOpen = ref(false)
const openGameId = ref<string | null>(null)

// =============================================================================
// Constants
// =============================================================================

const CHARACTER_ROLE_LABELS: Record<string, string> = {
  main: '主角',
  supporting: '配角',
  cameo: '客串',
  other: '其他'
}

const CHARACTER_ROLE_ORDER = ['main', 'supporting', 'cameo', 'other'] as const

// =============================================================================
// Computed
// =============================================================================

const hasGames = computed(() => games.value.length > 0)

const groupedGames = computed(() => {
  return games.value.reduce(
    (acc, link) => {
      const type = link.type || 'other'
      if (!acc[type]) acc[type] = []
      acc[type].push(link)
      return acc
    },
    {} as Record<string, typeof games.value>
  )
})

// =============================================================================
// Handlers
// =============================================================================

const gameDialogOpen = computed({
  get: () => openGameId.value !== null,
  set: (value) => {
    if (!value) openGameId.value = null
  }
})
</script>

<template>
  <template v-if="character">
    <!-- Empty state -->
    <div
      v-if="!hasGames"
      class="flex flex-col items-center justify-center py-12 text-center"
    >
      <Icon
        :icon="getEntityIcon('game')"
        class="size-12 text-muted-foreground/30 mb-3"
      />
      <p class="text-sm text-muted-foreground">暂无相关游戏</p>
      <Button
        variant="outline"
        size="sm"
        class="mt-4"
        @click="editDialogOpen = true"
      >
        <Icon
          icon="icon-[mdi--plus]"
          class="size-4 mr-1.5"
        />
        添加游戏
      </Button>
    </div>

    <!-- Content state -->
    <template v-else>
      <!-- Header with manage button -->
      <div class="flex items-center justify-start mb-4">
        <Button
          variant="outline"
          size="sm"
          @click="editDialogOpen = true"
        >
          <Icon
            icon="icon-[mdi--pencil-outline]"
            class="size-4 mr-1.5"
          />
          管理
        </Button>
      </div>

      <div class="space-y-4">
        <template
          v-for="type in CHARACTER_ROLE_ORDER"
          :key="type"
        >
          <div v-if="groupedGames[type]?.length">
            <h4 class="text-xs font-medium text-muted-foreground mb-2">
              {{ CHARACTER_ROLE_LABELS[type] || type }}
            </h4>
            <div class="grid grid-cols-[repeat(auto-fill,6rem)] gap-3 justify-between">
              <template
                v-for="link in groupedGames[type]"
                :key="link.id"
              >
                <GameCard
                  v-if="link.game"
                  :game="link.game"
                  size="sm"
                  align="left"
                  @click="openGameId = link.game!.id"
                />
              </template>
            </div>
          </div>
        </template>
      </div>
    </template>

    <!-- Edit Dialog -->
    <CharacterGamesFormDialog
      v-if="editDialogOpen"
      v-model:open="editDialogOpen"
      :character-id="character.id"
    />

    <!-- Game Detail Dialog -->
    <GameDetailDialog
      v-if="openGameId"
      v-model:open="gameDialogOpen"
      :game-id="openGameId"
    />
  </template>
</template>
