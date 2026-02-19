<script setup lang="ts">
/**
 * Person Detail Page
 *
 * Full page view for person detail, used by routing.
 */

import { ref, computed, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { eq } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { SpoilerConfirmDialog } from '@renderer/components/ui/spoiler-confirm-dialog'
import {
  PersonScoreFormDialog,
  PersonDropdownMenu,
  PersonDetailContent
} from '@renderer/components/shared/person'
import { useEvent, usePersonProvider, useRenderState } from '@renderer/composables'
import { db } from '@renderer/core/db'
import { notify } from '@renderer/core/notify'
import { persons } from '@shared/db'
import { getEntityIcon } from '@renderer/utils'

// =============================================================================
// Route & Navigation
// =============================================================================

const route = useRoute()
const router = useRouter()

const personId = computed(() => route.params.personId as string | undefined)
const backTo = computed(() => (route.query.from as string) || '/library')

// Redirect if no personId
if (!personId.value) {
  router.push(backTo.value)
}

// =============================================================================
// Spoiler State
// =============================================================================

const spoilersRevealed = ref(false)
const spoilerConfirmOpen = ref(false)

watch(personId, () => {
  spoilersRevealed.value = false
  spoilerConfirmOpen.value = false
})

// =============================================================================
// Provider
// =============================================================================

const { person, isLoading, error } = usePersonProvider(() => personId.value ?? '', spoilersRevealed)
const state = useRenderState(isLoading, error, person)

useEvent('db:deleted', ({ table, id }) => {
  if (table === 'persons' && id === personId.value) {
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
  const current = person.value!
  isPendingFavorite.value = true
  try {
    await db
      .update(persons)
      .set({ isFavorite: !current.isFavorite })
      .where(eq(persons.id, current.id))
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
        :icon="getEntityIcon('person')"
        class="size-12 text-muted-foreground/30 mb-3 mx-auto"
      />
      <p class="text-sm text-muted-foreground">人员不存在</p>
    </div>
  </div>

  <!-- Content -->
  <div
    v-else-if="state === 'success' && person"
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

      <!-- Person info -->
      <div class="flex-1 min-w-0 flex items-center gap-3">
        <h1 class="text-base font-semibold truncate">{{ person!.name }}</h1>
      </div>

      <!-- Quick action buttons -->
      <div class="flex items-center gap-1.5 shrink-0">
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
                :class="person!.isFavorite ? 'size-4 text-destructive' : 'size-4'"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{{ person!.isFavorite ? '取消喜欢' : '添加喜欢' }}</TooltipContent>
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
        <PersonDropdownMenu :person-id="person!.id" />
      </div>
    </header>

    <!-- Main content -->
    <div class="flex-1 overflow-auto p-4 scrollbar-thin">
      <PersonDetailContent />
    </div>

    <!-- Score dialog -->
    <PersonScoreFormDialog
      v-if="scoreDialogOpen"
      v-model:open="scoreDialogOpen"
      :person-id="person!.id"
    />

    <SpoilerConfirmDialog
      v-if="spoilerConfirmOpen"
      v-model:open="spoilerConfirmOpen"
      @confirm="handleRevealSpoilersConfirm"
    />
  </div>
</template>
