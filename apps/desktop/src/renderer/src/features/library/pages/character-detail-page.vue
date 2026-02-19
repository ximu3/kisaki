<script setup lang="ts">
/**
 * Character Detail Page
 *
 * Full page view for character detail, used by routing.
 */

import { ref, computed, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { eq } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { SpoilerConfirmDialog } from '@renderer/components/ui/spoiler-confirm-dialog'
import {
  CharacterScoreFormDialog,
  CharacterDropdownMenu,
  CharacterDetailContent
} from '@renderer/components/shared/character'
import { useCharacterProvider, useEvent, useRenderState } from '@renderer/composables'
import { db } from '@renderer/core/db'
import { notify } from '@renderer/core/notify'
import { characters } from '@shared/db'
import { getEntityIcon } from '@renderer/utils'

// =============================================================================
// Route & Navigation
// =============================================================================

const route = useRoute()
const router = useRouter()

const characterId = computed(() => route.params.characterId as string | undefined)
const backTo = computed(() => (route.query.from as string) || '/library')

// Redirect if no characterId
if (!characterId.value) {
  router.push(backTo.value)
}

// =============================================================================
// Spoiler State
// =============================================================================

const spoilersRevealed = ref(false)
const spoilerConfirmOpen = ref(false)

watch(characterId, () => {
  spoilersRevealed.value = false
  spoilerConfirmOpen.value = false
})

// =============================================================================
// Provider
// =============================================================================

const { character, isLoading, error } = useCharacterProvider(
  () => characterId.value ?? '',
  spoilersRevealed
)
const state = useRenderState(isLoading, error, character)

useEvent('db:deleted', ({ table, id }) => {
  if (table === 'characters' && id === characterId.value) {
    router.push(backTo.value)
  }
})

// =============================================================================
// State
// =============================================================================

const scoreDialogOpen = ref(false)
const isPendingFavorite = ref(false)

// =============================================================================
// Actions
// =============================================================================

async function handleToggleFavorite() {
  if (isPendingFavorite.value || state.value !== 'success') return
  const current = character.value!
  isPendingFavorite.value = true
  try {
    await db
      .update(characters)
      .set({ isFavorite: !current.isFavorite })
      .where(eq(characters.id, current.id))
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
        :icon="getEntityIcon('character')"
        class="size-12 text-muted-foreground/30 mb-3 mx-auto"
      />
      <p class="text-sm text-muted-foreground">角色不存在</p>
    </div>
  </div>

  <!-- Content -->
  <div
    v-else-if="state === 'success' && character"
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

      <!-- Character info -->
      <div class="flex-1 min-w-0 flex items-center gap-3">
        <h1 class="text-base font-semibold truncate">{{ character.name }}</h1>
      </div>

      <!-- Quick action buttons -->
      <div class="flex items-center gap-1.5 shrink-0">
        <!-- Score button -->
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="secondary"
              :size="character.score !== null ? 'sm' : 'icon-sm'"
              class="flex items-center py-0"
              :class="[character.score !== null && 'text-warning']"
              @click="scoreDialogOpen = true"
            >
              <Icon
                icon="icon-[mdi--starburst-outline]"
                class="size-4"
              />
              <span
                v-if="character.score"
                class="text-xs"
              >
                {{ (character.score / 10).toFixed(1) }}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>评分</TooltipContent>
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
                :class="character.isFavorite ? 'size-4 text-destructive' : 'size-4'"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{{ character.isFavorite ? '取消喜欢' : '添加喜欢' }}</TooltipContent>
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

        <div class="h-4 w-px bg-border" />

        <!-- More menu -->
        <CharacterDropdownMenu :character-id="character.id" />
      </div>
    </header>

    <!-- Main content -->
    <div class="flex-1 overflow-auto p-4 scrollbar-thin">
      <CharacterDetailContent />
    </div>

    <!-- Score dialog -->
    <CharacterScoreFormDialog
      v-if="scoreDialogOpen"
      v-model:open="scoreDialogOpen"
      :character-id="character.id"
    />

    <SpoilerConfirmDialog
      v-if="spoilerConfirmOpen"
      v-model:open="spoilerConfirmOpen"
      @confirm="handleRevealSpoilersConfirm"
    />
  </div>
</template>
