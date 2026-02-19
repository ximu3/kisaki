<script setup lang="ts">
/**
 * Game Detail Page
 *
 * Full page view for game detail, used by routing.
 */

import { ref, computed, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { eq } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { SpoilerConfirmDialog } from '@renderer/components/ui/spoiler-confirm-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import {
  GamePlayButton,
  GameDropdownMenu,
  GameScoreFormDialog,
  GameDetailContent
} from '@renderer/components/shared/game'
import { useEvent, useGameProvider, useRenderState } from '@renderer/composables'
import { db } from '@renderer/core/db'
import { ipcManager } from '@renderer/core/ipc'
import { notify } from '@renderer/core/notify'
import { games, type Status } from '@shared/db'
import { formatStatus, getStatusVariant, getEntityIcon } from '@renderer/utils'

// =============================================================================
// Constants
// =============================================================================

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'notStarted', label: '未开始' },
  { value: 'inProgress', label: '进行中' },
  { value: 'partial', label: '部分完成' },
  { value: 'completed', label: '已完成' },
  { value: 'multiple', label: '多周目' },
  { value: 'shelved', label: '已搁置' }
]

// =============================================================================
// Route & Navigation
// =============================================================================

const route = useRoute()
const router = useRouter()

const gameId = computed(() => route.params.gameId as string | undefined)
const backTo = computed(() => (route.query.from as string) || '/library')

// Redirect if no gameId
if (!gameId.value) {
  router.push(backTo.value)
}

// =============================================================================
// Spoiler State
// =============================================================================

const spoilersRevealed = ref(false)
const spoilerConfirmOpen = ref(false)

watch(gameId, () => {
  spoilersRevealed.value = false
  spoilerConfirmOpen.value = false
})

// =============================================================================
// Provider
// =============================================================================

const { game, isLoading, error } = useGameProvider(() => gameId.value ?? '', spoilersRevealed)
const state = useRenderState(isLoading, error, game)

useEvent('db:deleted', ({ table, id }) => {
  if (table === 'games' && id === gameId.value) {
    router.push(backTo.value)
  }
})

// =============================================================================
// State
// =============================================================================

const scoreDialogOpen = ref(false)
const isPendingFavorite = ref(false)
const isPendingStatus = ref(false)

// =============================================================================
// Actions
// =============================================================================

async function handleToggleFavorite() {
  if (isPendingFavorite.value || state.value !== 'success') return
  const current = game.value!
  isPendingFavorite.value = true
  try {
    await db.update(games).set({ isFavorite: !current.isFavorite }).where(eq(games.id, current.id))
    notify.success(current.isFavorite ? '已取消喜欢' : '已添加至喜欢')
  } catch {
    notify.error('操作失败')
  } finally {
    isPendingFavorite.value = false
  }
}

function handleToggleSpoilers() {
  if (spoilersRevealed.value) {
    spoilersRevealed.value = false
    return
  }
  spoilerConfirmOpen.value = true
}

function handleRevealSpoilersConfirm() {
  spoilersRevealed.value = true
}

// Status as a computed to track dropdown value
const selectedStatus = computed({
  get: () => (state.value === 'success' ? game.value?.status : undefined),
  set: async (status: Status | undefined) => {
    if (isPendingStatus.value || state.value !== 'success' || !status) return
    const current = game.value!
    isPendingStatus.value = true
    try {
      await db.update(games).set({ status }).where(eq(games.id, current.id))
      notify.success('状态已更新')
    } catch {
      notify.error('更新失败')
    } finally {
      isPendingStatus.value = false
    }
  }
})

async function handleOpenGameDir() {
  if (state.value !== 'success') return
  const current = game.value!
  const pathToOpen =
    current.gameDirPath || (current.launcherMode === 'file' ? current.launcherPath : null)
  if (!pathToOpen) {
    notify.error('游戏目录未设置')
    return
  }
  const result = await ipcManager.invoke('native:open-path', { path: pathToOpen, ensure: 'folder' })
  if (!result.success) {
    notify.error('无法打开游戏目录')
  }
}

const canOpenGameDir = computed(() => {
  if (state.value !== 'success') return false
  const current = game.value
  if (!current) return false
  return !!(current.gameDirPath || (current.launcherMode === 'file' && current.launcherPath))
})
</script>

<template>
  <!-- Loading state -->
  <div
    v-if="state === 'loading'"
    class="flex-1 flex items-center justify-center h-full"
  >
    <Icon
      icon="icon-[mdi--loading]"
      class="size-8 text-muted-foreground animate-spin"
    />
  </div>

  <!-- Error state -->
  <div
    v-else-if="state === 'error'"
    class="flex-1 flex items-center justify-center h-full"
  >
    <div class="text-center">
      <Icon
        icon="icon-[mdi--alert-circle-outline]"
        class="size-12 text-destructive/30 mb-3 mx-auto"
      />
      <p class="text-sm text-muted-foreground">{{ error }}</p>
    </div>
  </div>

  <!-- Not found state -->
  <div
    v-else-if="state === 'not-found'"
    class="flex-1 flex items-center justify-center h-full"
  >
    <div class="text-center">
      <Icon
        :icon="getEntityIcon('game')"
        class="size-12 text-muted-foreground/30 mb-3 mx-auto"
      />
      <p class="text-sm text-muted-foreground">游戏不存在</p>
    </div>
  </div>

  <!-- Content -->
  <div
    v-else-if="state === 'success' && game"
    class="h-full flex flex-col"
  >
    <!-- Header -->
    <header class="shrink-0 flex items-center gap-3 px-4 h-12 border-b border-border bg-surface">
      <!-- Back button -->
      <RouterLink to="/library">
        <Button
          variant="ghost"
          size="icon-sm"
        >
          <Icon
            icon="icon-[mdi--arrow-left]"
            class="size-4"
          />
        </Button>
      </RouterLink>

      <!-- Game info -->
      <div class="flex-1 min-w-0 flex items-center gap-3">
        <h1 class="text-base font-semibold truncate">{{ game.name }}</h1>

        <!-- Status dropdown -->
        <Tooltip>
          <DropdownMenu>
            <TooltipTrigger as-child>
              <DropdownMenuTrigger as-child>
                <Badge
                  :variant="getStatusVariant(game.status)"
                  class="shrink-0 cursor-pointer"
                >
                  {{ formatStatus(game.status) }}
                </Badge>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>游玩状态</TooltipContent>

            <DropdownMenuContent
              align="end"
              class="w-36"
            >
              <DropdownMenuRadioGroup v-model="selectedStatus">
                <DropdownMenuRadioItem
                  v-for="option in STATUS_OPTIONS"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </Tooltip>
      </div>

      <!-- Quick action buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Score button -->
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="secondary"
              size="icon-sm"
              class="flex items-center py-0"
              @click="scoreDialogOpen = true"
            >
              <Icon
                icon="icon-[mdi--starburst-outline]"
                class="size-4"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>评分</TooltipContent>
        </Tooltip>

        <!-- Open game directory -->
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="secondary"
              size="icon-sm"
              :disabled="!canOpenGameDir"
              @click="handleOpenGameDir"
            >
              <Icon
                icon="icon-[mdi--folder-open-outline]"
                class="size-4"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>打开游戏目录</TooltipContent>
        </Tooltip>

        <div class="h-4 w-px bg-border" />

        <!-- Favorite toggle -->
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="secondary"
              size="icon-sm"
              :disabled="isPendingFavorite"
              @click="handleToggleFavorite"
            >
              <Icon
                icon="icon-[mdi--heart-outline]"
                :class="game.isFavorite ? 'size-4 text-destructive' : 'size-4'"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{{ game.isFavorite ? '取消喜欢' : '添加喜欢' }}</TooltipContent>
        </Tooltip>

        <!-- Spoiler toggle -->
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="secondary"
              size="icon-sm"
              @click="handleToggleSpoilers"
            >
              <Icon
                :icon="spoilersRevealed ? 'icon-[mdi--eye-outline]' : 'icon-[mdi--eye-off-outline]'"
                class="size-4"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{{ spoilersRevealed ? '隐藏剧透' : '显示剧透' }}</TooltipContent>
        </Tooltip>

        <!-- TODO: Plugin detail actions - requires itemComponent prop -->
      </div>

      <!-- Separator -->
      <div class="h-4 w-px bg-border" />

      <!-- Primary action buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <GamePlayButton
          :game-id="game.id"
          size="sm"
        />
        <GameDropdownMenu :game-id="game.id">
          <Button
            variant="secondary"
            size="icon-sm"
          >
            <Icon
              icon="icon-[mdi--dots-horizontal]"
              class="size-4"
            />
          </Button>
        </GameDropdownMenu>
      </div>
    </header>

    <!-- Main content -->
    <div class="flex-1 overflow-auto p-4 scrollbar-thin">
      <GameDetailContent />
    </div>

    <!-- Score dialog -->
    <GameScoreFormDialog
      v-if="scoreDialogOpen"
      v-model:open="scoreDialogOpen"
      :game-id="game.id"
    />

    <SpoilerConfirmDialog
      v-if="spoilerConfirmOpen"
      v-model:open="spoilerConfirmOpen"
      @confirm="handleRevealSpoilersConfirm"
    />
  </div>
</template>
