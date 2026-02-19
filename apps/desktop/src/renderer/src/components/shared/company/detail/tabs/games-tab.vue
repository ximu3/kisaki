<!--
  CompanyDetailGamesTab
  Games tab content for company detail dialog.
  Shows full list of games by company role.
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { GameCard, GameDetailDialog } from '@renderer/components/shared/game'
import { useCompany } from '@renderer/composables'
import { getEntityIcon } from '@renderer/utils'
import { CompanyGamesFormDialog } from '../../forms'

const GAME_COMPANY_TYPE_LABELS: Record<string, string> = {
  developer: '开发',
  publisher: '发行',
  distributor: '分销',
  other: '其他'
}

const GAME_COMPANY_TYPE_ORDER = ['developer', 'publisher', 'distributor', 'other'] as const

const { company, games } = useCompany()

const openGameId = ref<string | null>(null)
const editDialogOpen = ref(false)

const hasGames = computed(() => games.value.length > 0)

const gameDialogOpen = computed({
  get: () => openGameId.value !== null,
  set: (value) => {
    if (!value) openGameId.value = null
  }
})

// Group games by company type
const groupedGames = computed(() => {
  const groups: Record<string, typeof games.value> = {}
  for (const link of games.value) {
    const type = link.type || 'other'
    if (!groups[type]) groups[type] = []
    groups[type].push(link)
  }
  return groups
})
</script>

<template>
  <template v-if="company">
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

    <!-- Games list -->
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
          v-for="type in GAME_COMPANY_TYPE_ORDER"
          :key="type"
        >
          <div v-if="groupedGames[type] && groupedGames[type].length > 0">
            <h4 class="text-xs font-medium text-muted-foreground mb-2">
              {{ GAME_COMPANY_TYPE_LABELS[type] || type }}
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
    <CompanyGamesFormDialog
      v-if="editDialogOpen"
      v-model:open="editDialogOpen"
      :company-id="company.id"
    />

    <!-- Game Detail Dialog -->
    <GameDetailDialog
      v-if="openGameId"
      v-model:open="gameDialogOpen"
      :game-id="openGameId"
    />
  </template>
</template>
