<!--
  PersonGamesTab
  Full grid of related games grouped by person role.
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { usePerson } from '@renderer/composables/use-person'
import { getEntityIcon } from '@renderer/utils'
import { Button } from '@renderer/components/ui/button'
import { GameCard, GameDetailDialog } from '@renderer/components/shared/game'
import { PersonGamesFormDialog } from '../../forms'

const GAME_PERSON_TYPE_LABELS: Record<string, string> = {
  director: '导演',
  scenario: '剧本',
  illustration: '原画',
  music: '音乐',
  programmer: '程序',
  actor: '声优',
  other: '其他'
}

const GAME_PERSON_TYPE_ORDER = [
  'director',
  'scenario',
  'illustration',
  'music',
  'programmer',
  'actor',
  'other'
] as const

const { person, games } = usePerson()

const editDialogOpen = ref(false)
const openGameId = ref<string | null>(null)

const hasGames = computed(() => games.value && games.value.length > 0)

const groupedGames = computed(() => {
  if (!hasGames.value) return {}
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

const gameDialogOpen = computed({
  get: () => openGameId.value !== null,
  set: (value) => {
    if (!value) openGameId.value = null
  }
})
</script>

<template>
  <template v-if="person">
    <!-- Empty state -->
    <template v-if="!hasGames">
      <div class="flex flex-col items-center justify-center py-12 text-center">
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
    </template>

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
          v-for="type in GAME_PERSON_TYPE_ORDER"
          :key="type"
        >
          <div v-if="groupedGames[type]?.length">
            <h4 class="text-xs font-medium text-muted-foreground mb-2">
              {{ GAME_PERSON_TYPE_LABELS[type] || type }}
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
                  @click="openGameId = link.game.id"
                />
              </template>
            </div>
          </div>
        </template>
      </div>
    </template>

    <!-- Edit Dialog -->
    <PersonGamesFormDialog
      v-if="editDialogOpen"
      v-model:open="editDialogOpen"
      :person-id="person.id"
    />

    <!-- Game Detail Dialog -->
    <GameDetailDialog
      v-if="openGameId"
      v-model:open="gameDialogOpen"
      :game-id="openGameId"
    />
  </template>
</template>
