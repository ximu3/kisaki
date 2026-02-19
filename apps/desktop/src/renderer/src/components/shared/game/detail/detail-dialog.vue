<!--
  Game Detail Dialog

  Dialog view for game details.
  Used when viewing a game outside the library context.
-->

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { getEntityIcon } from '@renderer/utils'
import { notify } from '@renderer/core/notify'
import { db } from '@renderer/core/db'
import { ipcManager } from '@renderer/core/ipc'
import { games } from '@shared/db'
import { eq } from 'drizzle-orm'
import { useGameProvider } from '@renderer/composables/use-game'
import { useRenderState } from '@renderer/composables'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Spinner } from '@renderer/components/ui/spinner'
import { Button } from '@renderer/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { SpoilerConfirmDialog } from '@renderer/components/ui/spoiler-confirm-dialog'
import GameDetailContent from './detail-content.vue'
import GamePlayButton from '../game-play-button.vue'
import { GameScoreFormDialog } from '../forms'
import { GameDropdownMenu } from '../menus'

// =============================================================================
// Props & Model
// =============================================================================

const props = defineProps<{
  gameId: string
}>()

const open = defineModel<boolean>('open', { default: false })

// =============================================================================
// Spoiler State
// =============================================================================

const spoilersRevealed = ref(false)
const spoilerConfirmOpen = ref(false)

watch(open, (isOpen) => {
  if (isOpen) return
  spoilersRevealed.value = false
  spoilerConfirmOpen.value = false
})

// =============================================================================
// Game Context (Provider)
// =============================================================================

const gameId = computed(() => props.gameId)
const { game, isLoading, error } = useGameProvider(gameId, spoilersRevealed)
const state = useRenderState(isLoading, error, game)

// =============================================================================
// Local State
// =============================================================================

const isScoreOpen = ref(false)
const isPendingFavorite = ref(false)

// =============================================================================
// Handlers
// =============================================================================

async function handleToggleFavorite() {
  if (state.value !== 'success' || isPendingFavorite.value) return
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

async function handleOpenFolder() {
  if (state.value !== 'success') return
  const current = game.value!
  const pathToOpen =
    current.gameDirPath || (current.launcherMode === 'file' ? current.launcherPath : null)
  if (!pathToOpen) {
    notify.error('未设置游戏目录')
    return
  }
  await ipcManager.invoke('native:open-path', { path: pathToOpen, ensure: 'folder' })
}

const canOpenGameDir = computed(() => {
  if (state.value !== 'success') return false
  const current = game.value
  if (!current) return false
  return !!(current.gameDirPath || (current.launcherMode === 'file' && current.launcherPath))
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-4xl max-h-[90vh] flex flex-col">
      <!-- Loading State -->
      <template v-if="state === 'loading'">
        <DialogBody class="flex items-center justify-center py-12">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

      <!-- Error State -->
      <template v-else-if="state === 'error'">
        <DialogBody class="flex items-center justify-center py-12">
          <div class="text-center">
            <Icon
              icon="icon-[mdi--alert-circle-outline]"
              class="size-12 text-destructive/50 mb-3 block mx-auto"
            />
            <p class="text-lg font-medium">加载失败</p>
            <p class="text-sm text-muted-foreground mt-1">{{ error }}</p>
          </div>
        </DialogBody>
      </template>

      <!-- Not Found State -->
      <template v-else-if="state === 'not-found'">
        <DialogBody class="flex items-center justify-center py-12">
          <div class="text-center">
            <Icon
              :icon="getEntityIcon('game')"
              class="size-12 text-muted-foreground/50 mb-3 block mx-auto"
            />
            <p class="text-lg font-medium">游戏不存在</p>
            <p class="text-sm text-muted-foreground mt-1">该游戏可能已被删除</p>
          </div>
        </DialogBody>
      </template>

      <!-- Loaded Content -->
      <template v-else-if="state === 'success' && game">
        <DialogHeader>
          <DialogTitle>{{ game.name }}</DialogTitle>
        </DialogHeader>
        <DialogBody class="flex-1 min-h-0 overflow-auto scrollbar-thin p-4">
          <GameDetailContent />
        </DialogBody>
        <DialogFooter>
          <div class="flex items-center justify-between w-full">
            <!-- Left: Play button and stats -->
            <GamePlayButton
              :game-id="game.id"
              size="sm"
            />

            <!-- Right: Score, Favorite, Open folder, More -->
            <div class="flex items-center gap-1.5">
              <!-- Score button -->
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    @click="isScoreOpen = true"
                  >
                    <Icon
                      icon="icon-[mdi--starburst-outline]"
                      class="size-4"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>评分</TooltipContent>
              </Tooltip>

              <!-- Open folder button -->
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    :disabled="!canOpenGameDir"
                    @click="handleOpenFolder"
                  >
                    <Icon
                      icon="icon-[mdi--folder-open-outline]"
                      class="size-4"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>打开目录</TooltipContent>
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
                      class="size-4"
                      :class="game.isFavorite ? 'text-destructive' : ''"
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
                      :icon="
                        spoilersRevealed ? 'icon-[mdi--eye-outline]' : 'icon-[mdi--eye-off-outline]'
                      "
                      class="size-4"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{{ spoilersRevealed ? '隐藏剧透' : '显示剧透' }}</TooltipContent>
              </Tooltip>

              <div class="h-4 w-px bg-border" />

              <GameDropdownMenu :game-id="game.id" />
            </div>
          </div>
        </DialogFooter>

        <!-- Score Dialog -->
        <GameScoreFormDialog
          v-if="isScoreOpen"
          v-model:open="isScoreOpen"
          :game-id="game.id"
        />

        <SpoilerConfirmDialog
          v-if="spoilerConfirmOpen"
          v-model:open="spoilerConfirmOpen"
          @confirm="handleRevealSpoilersConfirm"
        />
      </template>
    </DialogContent>
  </Dialog>
</template>
