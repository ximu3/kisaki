<!--
  CompanyDetailDialog
  Dialog view for company details.
-->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { eq } from 'drizzle-orm'
import { notify } from '@renderer/core/notify'
import { db } from '@renderer/core/db'
import { companies } from '@shared/db'
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
import { useCompanyProvider, useRenderState } from '@renderer/composables'
import CompanyDetailContent from './detail-content.vue'
import { CompanyScoreFormDialog } from '../forms'
import { CompanyDropdownMenu } from '../menus'

interface Props {
  companyId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

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

const { company, isLoading, error } = useCompanyProvider(() => props.companyId, spoilersRevealed)
const state = useRenderState(isLoading, error, company)

const isScoreOpen = ref(false)
const isPendingFavorite = ref(false)

async function handleToggleFavorite() {
  if (state.value !== 'success' || isPendingFavorite.value) return
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
  <Dialog v-model:open="open">
    <DialogContent class="max-w-4xl max-h-[90vh] flex flex-col">
      <!-- Loading state -->
      <template v-if="state === 'loading'">
        <DialogBody class="flex items-center justify-center py-12">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

      <!-- Error state -->
      <template v-else-if="state === 'error'">
        <DialogBody class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="size-12 text-destructive/50 mb-3 mx-auto flex items-center justify-center">
              <span class="text-4xl">!</span>
            </div>
            <p class="text-lg font-medium">加载失败</p>
            <p class="text-sm text-muted-foreground mt-1">
              {{ error }}
            </p>
          </div>
        </DialogBody>
      </template>

      <!-- Not found state -->
      <template v-else-if="state === 'not-found'">
        <DialogBody class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="size-12 text-destructive/50 mb-3 mx-auto flex items-center justify-center">
              <span class="text-4xl">!</span>
            </div>
            <p class="text-lg font-medium">公司不存在</p>
            <p class="text-sm text-muted-foreground mt-1">该公司可能已被删除</p>
          </div>
        </DialogBody>
      </template>

      <!-- Content -->
      <template v-else-if="state === 'success' && company">
        <DialogHeader>
          <DialogTitle>{{ company.name }}</DialogTitle>
        </DialogHeader>
        <DialogBody class="flex-1 min-h-0 overflow-auto scrollbar-thin p-4">
          <CompanyDetailContent />
        </DialogBody>
        <DialogFooter>
          <div class="flex items-center justify-end w-full">
            <!-- Right: Score, Favorite, More -->
            <div class="flex items-center gap-1.5">
              <!-- Score button -->
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button
                    variant="secondary"
                    :size="company!.score !== null ? 'sm' : 'icon-sm'"
                    :class="company!.score !== null ? 'text-warning' : ''"
                    @click="isScoreOpen = true"
                  >
                    <Icon
                      icon="icon-[mdi--starburst-outline]"
                      class="size-4"
                    />
                    <span
                      v-if="company!.score !== null"
                      class="text-xs"
                    >
                      {{ (company!.score / 10).toFixed(1) }}
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
                      class="size-4"
                      :class="company!.isFavorite ? 'fill-destructive text-destructive' : ''"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{{ company!.isFavorite ? '取消喜欢' : '添加喜欢' }}</TooltipContent>
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

              <!-- More menu -->
              <CompanyDropdownMenu :company-id="company!.id" />
            </div>
          </div>
        </DialogFooter>

        <!-- Score Dialog -->
        <CompanyScoreFormDialog
          v-if="isScoreOpen"
          v-model:open="isScoreOpen"
          :company-id="company!.id"
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
