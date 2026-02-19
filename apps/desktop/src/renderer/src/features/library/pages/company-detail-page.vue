<script setup lang="ts">
/**
 * Company Detail Page
 *
 * Full page view for company detail, used by routing.
 */

import { ref, computed, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { eq } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { SpoilerConfirmDialog } from '@renderer/components/ui/spoiler-confirm-dialog'
import {
  CompanyScoreFormDialog,
  CompanyDropdownMenu,
  CompanyDetailContent
} from '@renderer/components/shared/company'
import { useCompanyProvider, useEvent, useRenderState } from '@renderer/composables'
import { db } from '@renderer/core/db'
import { notify } from '@renderer/core/notify'
import { companies } from '@shared/db'
import { getEntityIcon } from '@renderer/utils'

// =============================================================================
// Route & Navigation
// =============================================================================

const route = useRoute()
const router = useRouter()

const companyId = computed(() => route.params.companyId as string | undefined)
const backTo = computed(() => (route.query.from as string) || '/library')

// Redirect if no companyId
if (!companyId.value) {
  router.push(backTo.value)
}

// =============================================================================
// Spoiler State
// =============================================================================

const spoilersRevealed = ref(false)
const spoilerConfirmOpen = ref(false)

watch(companyId, () => {
  spoilersRevealed.value = false
  spoilerConfirmOpen.value = false
})

// =============================================================================
// Provider
// =============================================================================

const { company, isLoading, error } = useCompanyProvider(
  () => companyId.value ?? '',
  spoilersRevealed
)
const state = useRenderState(isLoading, error, company)

useEvent('db:deleted', ({ table, id }) => {
  if (table === 'companies' && id === companyId.value) {
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
  const current = company.value!
  isPendingFavorite.value = true
  try {
    await db
      .update(companies)
      .set({ isFavorite: !current.isFavorite })
      .where(eq(companies.id, current.id))
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
        :icon="getEntityIcon('company')"
        class="size-12 text-muted-foreground/30 mb-3 mx-auto"
      />
      <p class="text-sm text-muted-foreground">公司不存在</p>
    </div>
  </div>

  <!-- Content -->
  <div
    v-else-if="state === 'success' && company"
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

      <!-- Company info -->
      <div class="flex-1 min-w-0 flex items-center gap-3">
        <h1 class="text-base font-semibold truncate">{{ company.name }}</h1>
      </div>

      <!-- Quick action buttons -->
      <div class="flex items-center gap-1.5 shrink-0">
        <!-- Score button -->
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="secondary"
              :size="company.score !== null ? 'sm' : 'icon-sm'"
              class="flex items-center py-0"
              :class="[company.score !== null && 'text-warning']"
              @click="scoreDialogOpen = true"
            >
              <Icon
                icon="icon-[mdi--starburst-outline]"
                class="size-4"
              />
              <span
                v-if="company.score"
                class="text-xs"
              >
                {{ (company.score / 10).toFixed(1) }}
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
                :class="company.isFavorite ? 'size-4 text-destructive' : 'size-4'"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{{ company.isFavorite ? '取消喜欢' : '添加喜欢' }}</TooltipContent>
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
        <CompanyDropdownMenu :company-id="company.id" />
      </div>
    </header>

    <!-- Main content -->
    <div class="flex-1 overflow-auto p-4 scrollbar-thin">
      <CompanyDetailContent />
    </div>

    <!-- Score dialog -->
    <CompanyScoreFormDialog
      v-if="scoreDialogOpen"
      v-model:open="scoreDialogOpen"
      :company-id="company.id"
    />

    <SpoilerConfirmDialog
      v-if="spoilerConfirmOpen"
      v-model:open="spoilerConfirmOpen"
      @confirm="handleRevealSpoilersConfirm"
    />
  </div>
</template>
