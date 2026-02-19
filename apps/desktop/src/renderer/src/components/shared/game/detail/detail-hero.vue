<!--
  Game Detail Hero

  Hero section for game detail page.
  Shows cover and game stats in a clean horizontal layout.
  Each field is editable on hover.
-->

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { useGame } from '@renderer/composables/use-game'
import { getAttachmentUrl } from '@renderer/utils/attachment'
import { formatDuration, formatRelativeTime, formatStatus, getEntityIcon } from '@renderer/utils'
import { Button } from '@renderer/components/ui/button'
import {
  GameNameFormDialog,
  GameOriginalNameFormDialog,
  GameLastActiveFormDialog,
  GameStatusFormDialog,
  GameDurationFormDialog,
  GameScoreFormDialog
} from '../forms'

// =============================================================================
// State
// =============================================================================

const { game } = useGame()

/** Dialog open states */
const editDialogs = ref({
  name: false,
  originalName: false,
  lastActive: false,
  status: false,
  duration: false,
  score: false
})

// =============================================================================
// Helpers
// =============================================================================

function openEditDialog(dialog: keyof typeof editDialogs.value) {
  editDialogs.value[dialog] = true
}
</script>

<template>
  <template v-if="game">
    <!-- Game info section -->
    <div class="flex gap-4 mb-4">
      <!-- Cover -->
      <div class="w-28 aspect-[3/4] rounded-lg overflow-hidden shrink-0 bg-muted border shadow-sm">
        <img
          v-if="game.coverFile"
          :src="
            getAttachmentUrl('games', game.id, game.coverFile, {
              width: 300,
              height: 400
            })
          "
          :alt="game.name"
          class="size-full object-cover"
        />
        <div
          v-else
          class="size-full flex items-center justify-center"
        >
          <Icon
            :icon="getEntityIcon('game')"
            class="size-8 text-muted-foreground/50"
          />
        </div>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0 flex flex-col justify-between">
        <!-- Name -->
        <div>
          <!-- Title (Editable) -->
          <div class="group/field relative flex items-center gap-3">
            <h2 class="text-xl font-bold truncate">{{ game.name }}</h2>
            <Button
              variant="ghost"
              size="icon-xs"
              class="opacity-0 group-hover/field:opacity-100 transition-opacity p-0.5 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-accent focus:opacity-100 focus:outline-none"
              aria-label="Edit"
              @click="openEditDialog('name')"
            >
              <Icon
                icon="icon-[mdi--pencil-outline]"
                class="size-3"
              />
            </Button>
          </div>
          <!-- Original Title (Editable) -->
          <div class="group/field relative flex items-center gap-3 mt-1">
            <p class="text-sm text-muted-foreground truncate">
              {{ game.originalName || game.name }}
            </p>
            <Button
              variant="ghost"
              size="icon-xs"
              class="opacity-0 group-hover/field:opacity-100 transition-opacity p-0.5 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-accent focus:opacity-100 focus:outline-none"
              aria-label="Edit"
              @click="openEditDialog('originalName')"
            >
              <Icon
                icon="icon-[mdi--pencil-outline]"
                class="size-3"
              />
            </Button>
          </div>
        </div>

        <!-- Stats grid - aligned labels and values -->
        <div class="grid grid-cols-2 gap-x-8 gap-y-1.5">
          <!-- Last played -->
          <div class="grid grid-cols-[auto_1fr] gap-3 items-center text-sm">
            <span class="flex items-center gap-1.5 text-muted-foreground">
              <button
                class="group/icon size-4 relative cursor-pointer"
                aria-label="Edit"
                @click="openEditDialog('lastActive')"
              >
                <Icon
                  icon="icon-[mdi--calendar-outline]"
                  class="size-4 absolute inset-0 transition-opacity group-hover/icon:opacity-0"
                />
                <Icon
                  icon="icon-[mdi--pencil-outline]"
                  class="size-4 absolute inset-0 opacity-0 transition-opacity group-hover/icon:opacity-100"
                />
              </button>
              <span class="text-xs">最近运行</span>
            </span>
            <span class="font-medium truncate text-xs">
              {{ formatRelativeTime(game.lastActiveAt, { emptyText: '-' }) }}
            </span>
          </div>

          <!-- Status -->
          <div class="grid grid-cols-[auto_1fr] gap-3 items-center text-sm">
            <span class="flex items-center gap-1.5 text-muted-foreground">
              <button
                class="group/icon size-4 relative cursor-pointer"
                aria-label="Edit"
                @click="openEditDialog('status')"
              >
                <Icon
                  icon="icon-[mdi--bookmark-outline]"
                  class="size-4 absolute inset-0 transition-opacity group-hover/icon:opacity-0"
                />
                <Icon
                  icon="icon-[mdi--pencil-outline]"
                  class="size-4 absolute inset-0 opacity-0 transition-opacity group-hover/icon:opacity-100"
                />
              </button>
              <span class="text-xs">游玩状态</span>
            </span>
            <span class="font-medium truncate text-xs">{{ formatStatus(game.status) }}</span>
          </div>

          <!-- Total Duration -->
          <div class="grid grid-cols-[auto_1fr] gap-3 items-center text-sm">
            <span class="flex items-center gap-1.5 text-muted-foreground">
              <button
                class="group/icon size-4 relative cursor-pointer"
                aria-label="Edit"
                @click="openEditDialog('duration')"
              >
                <Icon
                  icon="icon-[mdi--timer-outline]"
                  class="size-4 absolute inset-0 transition-opacity group-hover/icon:opacity-0"
                />
                <Icon
                  icon="icon-[mdi--pencil-outline]"
                  class="size-4 absolute inset-0 opacity-0 transition-opacity group-hover/icon:opacity-100"
                />
              </button>
              <span class="text-xs">游玩时间</span>
            </span>
            <span class="font-medium truncate text-xs">
              {{ formatDuration(game.totalDuration, { emptyText: '-' }) }}
            </span>
          </div>

          <!-- Score -->
          <div class="grid grid-cols-[auto_1fr] gap-3 items-center text-sm">
            <span class="flex items-center gap-1.5 text-muted-foreground">
              <button
                class="group/icon size-4 relative cursor-pointer"
                aria-label="Edit"
                @click="openEditDialog('score')"
              >
                <Icon
                  icon="icon-[mdi--starburst-outline]"
                  class="size-4 absolute inset-0 transition-opacity group-hover/icon:opacity-0"
                />
                <Icon
                  icon="icon-[mdi--pencil-outline]"
                  class="size-4 absolute inset-0 opacity-0 transition-opacity group-hover/icon:opacity-100"
                />
              </button>
              <span class="text-xs">我的评分</span>
            </span>
            <span class="font-medium truncate text-xs">
              <span v-if="game.score !== null">{{ (game.score / 10).toFixed(1) }}</span>
              <span v-else>-</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Dialogs - conditionally rendered with v-if -->
    <GameNameFormDialog
      v-if="editDialogs.name"
      v-model:open="editDialogs.name"
      :game-id="game.id"
    />
    <GameOriginalNameFormDialog
      v-if="editDialogs.originalName"
      v-model:open="editDialogs.originalName"
      :game-id="game.id"
    />
    <GameLastActiveFormDialog
      v-if="editDialogs.lastActive"
      v-model:open="editDialogs.lastActive"
      :game-id="game.id"
    />
    <GameStatusFormDialog
      v-if="editDialogs.status"
      v-model:open="editDialogs.status"
      :game-id="game.id"
    />
    <GameDurationFormDialog
      v-if="editDialogs.duration"
      v-model:open="editDialogs.duration"
      :game-id="game.id"
    />
    <GameScoreFormDialog
      v-if="editDialogs.score"
      v-model:open="editDialogs.score"
      :game-id="game.id"
    />
  </template>
</template>
