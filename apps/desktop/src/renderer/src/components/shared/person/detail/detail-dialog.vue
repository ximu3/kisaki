<!--
  PersonDetailDialog
  Dialog view for person details.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { cn } from '@renderer/utils'
import { notify } from '@renderer/core/notify'
import { db } from '@renderer/core/db'
import { persons } from '@shared/db'
import { eq } from 'drizzle-orm'
import { usePersonProvider } from '@renderer/composables/use-person'
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
import PersonDetailContent from './detail-content.vue'
import { PersonScoreFormDialog } from '../forms'
import { PersonDropdownMenu } from '../menus'

// =============================================================================
// Props & Model
// =============================================================================

const props = defineProps<{
  personId: string
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
// Person Context (Provider)
// =============================================================================

const personId = computed(() => props.personId)
const { person, isLoading, error } = usePersonProvider(personId, spoilersRevealed)
const state = useRenderState(isLoading, error, person)

// =============================================================================
// Local State
// =============================================================================

const isScoreOpen = ref(false)
const isPendingFavorite = ref(false)

// =============================================================================
// Computed
// =============================================================================

const displayScore = computed(() => {
  if (state.value !== 'success') return null
  const score = person.value!.score
  return score !== null && score !== undefined ? (score / 10).toFixed(1) : null
})

// =============================================================================
// Handlers
// =============================================================================

async function handleToggleFavorite() {
  if (state.value !== 'success' || isPendingFavorite.value) return
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
              icon="icon-[mdi--account-off-outline]"
              class="size-12 text-muted-foreground/50 mb-3 block mx-auto"
            />
            <p class="text-lg font-medium">人物不存在</p>
            <p class="text-sm text-muted-foreground mt-1">该人物可能已被删除</p>
          </div>
        </DialogBody>
      </template>

      <!-- Loaded Content -->
      <template v-else-if="state === 'success' && person">
        <DialogHeader>
          <DialogTitle>{{ person.name }}</DialogTitle>
        </DialogHeader>
        <DialogBody class="flex-1 min-h-0 overflow-auto scrollbar-thin p-4">
          <PersonDetailContent />
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
                    :size="displayScore ? 'sm' : 'icon-sm'"
                    :class="displayScore ? 'text-warning' : ''"
                    @click="isScoreOpen = true"
                  >
                    <Icon
                      icon="icon-[mdi--starburst-outline]"
                      class="size-4"
                    />
                    <span
                      v-if="displayScore"
                      class="text-xs"
                      >{{ displayScore }}</span
                    >
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
                      :class="cn('size-4', person.isFavorite && 'text-destructive')"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{{ person.isFavorite ? '取消喜欢' : '添加喜欢' }}</TooltipContent>
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
              <PersonDropdownMenu :person-id="person.id" />
            </div>
          </div>
        </DialogFooter>

        <!-- Score Dialog -->
        <PersonScoreFormDialog
          v-if="isScoreOpen"
          v-model:open="isScoreOpen"
          :person-id="person.id"
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
