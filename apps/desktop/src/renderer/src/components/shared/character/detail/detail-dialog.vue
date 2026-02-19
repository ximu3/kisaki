<!--
  CharacterDetailDialog

  Dialog view for character details.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { notify } from '@renderer/core/notify'
import { db } from '@renderer/core/db'
import { characters } from '@shared/db'
import { useCharacterProvider } from '@renderer/composables/use-character'
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
import CharacterDetailContent from './detail-content.vue'
import { CharacterScoreFormDialog } from '../forms'
import { CharacterDropdownMenu } from '../menus'

// =============================================================================
// Props
// =============================================================================

interface Props {
  characterId: string
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

// =============================================================================
// Provider
// =============================================================================

const { character, isLoading, error } = useCharacterProvider(
  () => props.characterId,
  spoilersRevealed
)
const state = useRenderState(isLoading, error, character)

const isScoreOpen = ref(false)
const isPendingFavorite = ref(false)

// =============================================================================
// Computed
// =============================================================================

const displayScore = computed(() => {
  if (state.value !== 'success') return null
  const score = character.value?.score
  return score !== null && score !== undefined ? (score / 10).toFixed(1) : null
})

// =============================================================================
// Actions
// =============================================================================

async function handleToggleFavorite() {
  if (state.value !== 'success' || isPendingFavorite.value) return
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
            <Icon
              icon="icon-[mdi--alert-circle-outline]"
              class="size-12 text-destructive/50 mb-3 mx-auto"
            />
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
            <Icon
              icon="icon-[mdi--alert-circle-outline]"
              class="size-12 text-destructive/50 mb-3 mx-auto"
            />
            <p class="text-lg font-medium">角色不存在</p>
            <p class="text-sm text-muted-foreground mt-1">该角色可能已被删除</p>
          </div>
        </DialogBody>
      </template>

      <!-- Content state -->
      <template v-else-if="state === 'success' && character">
        <DialogHeader>
          <DialogTitle>{{ character.name }}</DialogTitle>
        </DialogHeader>

        <DialogBody class="flex-1 min-h-0 overflow-auto scrollbar-thin p-4">
          <CharacterDetailContent />
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
                    >
                      {{ displayScore }}
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
                <TooltipContent>{{
                  character.isFavorite ? '取消喜欢' : '添加喜欢'
                }}</TooltipContent>
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
              <CharacterDropdownMenu :character-id="character.id" />
            </div>
          </div>
        </DialogFooter>
      </template>
    </DialogContent>
  </Dialog>

  <!-- Score Dialog -->
  <CharacterScoreFormDialog
    v-if="isScoreOpen && state === 'success' && character"
    v-model:open="isScoreOpen"
    :character-id="character.id"
  />

  <SpoilerConfirmDialog
    v-if="spoilerConfirmOpen"
    v-model:open="spoilerConfirmOpen"
    @confirm="handleRevealSpoilersConfirm"
  />
</template>
