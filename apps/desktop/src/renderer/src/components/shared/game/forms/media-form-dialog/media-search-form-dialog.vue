<!--
  GameMediaSearchFormDialog
  Dialog for searching game images from scraper providers.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { db, attachment } from '@renderer/core/db'
import { ipcManager } from '@renderer/core/ipc'
import { games, type Game } from '@shared/db'
import type { GameMediaType } from '@shared/attachment'
import { GAME_MEDIA_TYPE_TO_FIELD } from '@shared/attachment'
import type { GameImageSlot } from '@shared/scraper'
import { useAsyncData } from '@renderer/composables'
import { cn } from '@renderer/utils'
import { notify } from '@renderer/core/notify'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Spinner } from '@renderer/components/ui/spinner'
import { ScraperProviderSelect } from '@renderer/components/shared/scraper'

interface Props {
  gameId: string
  mediaType: GameMediaType
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

// Map GameMediaType to GameImageSlot
const MEDIA_TYPE_TO_IMAGE_SLOT: Record<GameMediaType, GameImageSlot> = {
  cover: 'covers',
  backdrop: 'backdrops',
  logo: 'logos',
  icon: 'icons'
}

const MEDIA_TYPE_LABEL: Record<GameMediaType, string> = {
  cover: '封面',
  backdrop: '背景',
  logo: 'Logo',
  icon: '图标'
}

// Content state
const game = ref<Game | null>(null)

// Selection state
const selectedUrl = ref<string | null>(null)
const selectedProviderId = ref('')
const isImporting = ref(false)

// Search state
const searchQuery = ref('')
const images = ref<string[]>([])
const isLoadingImages = ref(false)
const imagesError = ref<Error | null>(null)
const hasSearched = ref(false)

// Fetch game when dialog opens
const { data: fetchedGame, isLoading } = useAsyncData(
  () => db.query.games.findFirst({ where: eq(games.id, props.gameId) }),
  {
    watch: [() => props.gameId],
    enabled: () => open.value
  }
)

// Initialize form state when data loads
watch(fetchedGame, (data) => {
  if (data) {
    game.value = data
    searchQuery.value = data.originalName ?? data.name
  }
})

const gridCols = computed(() => {
  if (props.mediaType === 'cover') return 'grid-cols-4'
  if (props.mediaType === 'backdrop') return 'grid-cols-2'
  if (props.mediaType === 'logo') return 'grid-cols-2'
  if (props.mediaType === 'icon') return 'grid-cols-6'
  return 'grid-cols-4'
})

async function handleSearch() {
  if (!selectedProviderId.value || !game.value) return

  isLoadingImages.value = true
  imagesError.value = null
  hasSearched.value = true
  selectedUrl.value = null

  const lookup = {
    name: searchQuery.value.trim() || game.value.originalName || game.value.name,
    knownIds: []
  }

  try {
    const result = await ipcManager.invoke(
      'scraper:get-game-provider-images',
      selectedProviderId.value,
      lookup,
      MEDIA_TYPE_TO_IMAGE_SLOT[props.mediaType]
    )
    if (result.success) {
      images.value = result.data
    } else {
      imagesError.value = new Error(result.error)
    }
  } catch (error) {
    imagesError.value = error as Error
  } finally {
    isLoadingImages.value = false
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleSearch()
  }
}

async function handleConfirm() {
  if (!selectedUrl.value) return

  isImporting.value = true
  try {
    await attachment.setFile(games, props.gameId, GAME_MEDIA_TYPE_TO_FIELD[props.mediaType], {
      kind: 'url',
      url: selectedUrl.value
    })

    notify.success('媒体已更新')
    open.value = false
  } finally {
    isImporting.value = false
  }
}

function handleClose() {
  open.value = false
}

// Watch provider change to reset search state
watch(selectedProviderId, () => {
  hasSearched.value = false
  images.value = []
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-3xl">
      <DialogHeader>
        <DialogTitle>搜索{{ MEDIA_TYPE_LABEL[props.mediaType] }}</DialogTitle>
      </DialogHeader>

      <!-- Loading state -->
      <template v-if="isLoading || !game">
        <DialogBody>
          <div class="flex items-center justify-center py-8">
            <Spinner class="size-8" />
          </div>
        </DialogBody>
      </template>

      <!-- Content -->
      <template v-else>
        <DialogBody class="flex flex-col gap-4">
          <!-- Search controls row -->
          <div class="flex items-center gap-3">
            <!-- Provider select -->
            <ScraperProviderSelect
              v-model="selectedProviderId"
              :required-capabilities="[MEDIA_TYPE_TO_IMAGE_SLOT[props.mediaType]]"
              class="w-[140px]"
            />

            <!-- Search input -->
            <Input
              v-model="searchQuery"
              placeholder="输入搜索关键词..."
              class="flex-1"
              :disabled="isLoadingImages"
              @keydown="handleKeyDown"
            />

            <!-- Search button -->
            <Button
              type="button"
              :disabled="!selectedProviderId || isLoadingImages"
              @click="handleSearch"
            >
              <Icon
                v-if="isLoadingImages"
                icon="icon-[mdi--loading]"
                class="size-4 animate-spin"
              />
              <Icon
                v-else
                icon="icon-[mdi--magnify]"
                class="size-4"
              />
              搜索
            </Button>
          </div>

          <!-- Image grid -->
          <div class="overflow-auto max-h-[60vh] scrollbar-thin">
            <div
              v-if="!hasSearched"
              class="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground"
            >
              <Icon
                icon="icon-[mdi--image-plus-outline]"
                class="size-10"
              />
              <p class="text-sm">点击搜索开始</p>
            </div>
            <div
              v-else-if="isLoadingImages"
              class="flex items-center justify-center py-8"
            >
              <Spinner class="size-8" />
            </div>
            <div
              v-else-if="imagesError"
              class="flex flex-col items-center justify-center gap-2 py-12 text-destructive"
            >
              <Icon
                icon="icon-[mdi--alert-circle-outline]"
                class="size-10"
              />
              <p class="text-sm">搜索失败</p>
              <p class="text-xs text-muted-foreground">{{ imagesError.message }}</p>
            </div>
            <div
              v-else-if="images.length === 0"
              class="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground"
            >
              <Icon
                icon="icon-[mdi--image-off-outline]"
                class="size-10"
              />
              <p class="text-sm">未找到相关图片</p>
            </div>
            <div
              v-else
              :class="cn('grid gap-3', gridCols)"
            >
              <button
                v-for="(url, index) in images"
                :key="index"
                type="button"
                :class="
                  cn(
                    'relative overflow-hidden transition-colors border shadow-sm rounded-lg',
                    'hover:border-primary',
                    selectedUrl === url ? 'border-primary hover:border-primary' : 'border-border'
                  )
                "
                @click="selectedUrl = url"
              >
                <div
                  :class="
                    cn(
                      'w-full bg-muted',
                      props.mediaType === 'cover' && 'aspect-[3/4]',
                      props.mediaType === 'backdrop' && 'aspect-video',
                      props.mediaType === 'logo' && 'aspect-[3/1]',
                      props.mediaType === 'icon' && 'aspect-square'
                    )
                  "
                >
                  <img
                    :src="url"
                    :alt="`Option ${index + 1}`"
                    class="size-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div
                  v-if="selectedUrl === url"
                  class="absolute inset-0 bg-primary/30 flex items-center justify-center"
                >
                  <Icon
                    icon="icon-[mdi--check-circle-outline]"
                    class="size-8 text-primary"
                  />
                </div>
              </button>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="outline"
            @click="handleClose"
          >
            取消
          </Button>
          <Button
            :disabled="!selectedUrl || isImporting"
            @click="handleConfirm"
          >
            <template v-if="isImporting">
              <Icon
                icon="icon-[mdi--loading]"
                class="size-4 animate-spin"
              />
              导入中...
            </template>
            <template v-else> 确认选择 </template>
          </Button>
        </DialogFooter>
      </template>
    </DialogContent>
  </Dialog>
</template>
