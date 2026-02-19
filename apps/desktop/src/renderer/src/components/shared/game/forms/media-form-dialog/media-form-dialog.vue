<!--
  GameMediaFormDialog
  Dialog for managing game media (cover, backdrop, logo, icon).
  Uses two-layer pattern: outer handles data fetching, inner handles form state.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { db, attachment } from '@renderer/core/db'
import { ipcManager } from '@renderer/core/ipc'
import { notify } from '@renderer/core/notify'
import { getOpenImageDialogOptions } from '@renderer/utils/dialog'
import { games, type Game } from '@shared/db'
import type { GameMediaType } from '@shared/attachment'
import { useAsyncData, useEvent } from '@renderer/composables'
import { cn } from '@renderer/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Spinner } from '@renderer/components/ui/spinner'
import { DeleteConfirmDialog } from '@renderer/components/ui/delete-confirm-dialog'
import GameMediaSearchFormDialog from './media-search-form-dialog.vue'
import GameMediaCropFormDialog from './media-crop-form-dialog.vue'
import GameMediaUrlFormDialog from './media-url-form-dialog.vue'

interface Props {
  gameId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

interface MediaTypeConfig {
  type: GameMediaType
  label: string
  description: string
  aspectRatio: string
  field: 'coverFile' | 'backdropFile' | 'logoFile' | 'iconFile'
}

const MEDIA_TYPES: MediaTypeConfig[] = [
  {
    type: 'cover',
    label: '封面',
    description: '游戏封面图，用于卡片和列表显示',
    aspectRatio: 'aspect-[3/4]',
    field: 'coverFile'
  },
  {
    type: 'backdrop',
    label: '背景',
    description: '详情页背景图',
    aspectRatio: 'aspect-video',
    field: 'backdropFile'
  },
  {
    type: 'logo',
    label: 'Logo',
    description: '游戏标题 Logo',
    aspectRatio: 'aspect-[3/1]',
    field: 'logoFile'
  },
  {
    type: 'icon',
    label: '图标',
    description: '小尺寸图标',
    aspectRatio: 'aspect-square',
    field: 'iconFile'
  }
]

// Content state
const game = ref<Game | null>(null)
const selectedType = ref<GameMediaType>('cover')

// Sub-dialog states
const showSearchDialog = ref(false)
const showCropDialog = ref(false)
const showUrlDialog = ref(false)
const showDeleteConfirm = ref(false)

// Loading states
const isImportingFile = ref(false)

// Fetch game when dialog opens
const {
  data: fetchedGame,
  isLoading,
  refetch
} = useAsyncData(() => db.query.games.findFirst({ where: eq(games.id, props.gameId) }), {
  watch: [() => props.gameId],
  enabled: () => open.value
})

// Initialize game ref when data loads
watch(fetchedGame, (data) => {
  game.value = data ?? null
})

// Listen for game updates
useEvent('db:updated', ({ table, id }) => {
  if (table === 'games' && id === props.gameId) {
    refetch()
  }
})

const selectedConfig = computed(() => MEDIA_TYPES.find((m) => m.type === selectedType.value)!)

const currentFile = computed(() => {
  if (!game.value) return null
  return game.value[selectedConfig.value.field]
})

const hasImage = computed(() => !!currentFile.value)

// Import from file
async function handleImportFile() {
  isImportingFile.value = true

  try {
    const dialogResult = await ipcManager.invoke(
      'native:open-dialog',
      getOpenImageDialogOptions()
    )
    if (!dialogResult.success) {
      notify.error(dialogResult.error || '选择文件失败')
      return
    }
    if (!dialogResult.data || dialogResult.data.canceled || !dialogResult.data.filePaths[0]) {
      return
    }

    await attachment.setFile(games, props.gameId, selectedConfig.value.field, {
      kind: 'path',
      path: dialogResult.data.filePaths[0]
    })

    notify.success('媒体已更新')
  } finally {
    isImportingFile.value = false
  }
}

// Delete media
async function handleDelete() {
  await attachment.clearFile(games, props.gameId, selectedConfig.value.field)
  notify.success('媒体已删除')
}

function handleClose() {
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-2xl">
      <!-- Loading state -->
      <template v-if="isLoading || !game">
        <DialogBody class="flex items-center justify-center py-8">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

      <!-- Form content -->
      <template v-else>
        <DialogHeader>
          <DialogTitle>媒体管理</DialogTitle>
        </DialogHeader>

        <DialogBody class="flex gap-4">
          <!-- Media Type Selector - Left Sidebar -->
          <div class="w-28 shrink-0 space-y-1">
            <button
              v-for="media in MEDIA_TYPES"
              :key="media.type"
              :class="
                cn(
                  'w-full flex flex-col items-center gap-1.5 p-2 rounded-md text-left transition-colors',
                  selectedType === media.type
                    ? 'bg-primary/20 text-primary'
                    : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                )
              "
              @click="selectedType = media.type"
            >
              <!-- Thumbnail -->
              <div
                :class="
                  cn(
                    'w-full rounded border bg-muted flex items-center justify-center overflow-hidden',
                    media.type === 'cover' && 'aspect-[3/4]',
                    media.type === 'backdrop' && 'aspect-video',
                    media.type === 'logo' && 'aspect-[3/1]',
                    media.type === 'icon' && 'aspect-square'
                  )
                "
              >
                <img
                  v-if="game[media.field]"
                  :src="`attachment://games/${game.id}/${game[media.field]}`"
                  :alt="media.label"
                  class="size-full object-cover"
                />
                <Icon
                  v-else
                  icon="icon-[mdi--image-off-outline]"
                  class="size-4 text-muted-foreground/50"
                />
              </div>
              <span class="text-xs font-medium">{{ media.label }}</span>
            </button>
          </div>

          <!-- Preview and Actions - Right Panel -->
          <div class="flex-1 min-w-0 space-y-4">
            <!-- Preview -->
            <div
              :class="
                cn(
                  'w-full rounded-lg border bg-muted/50 flex items-center justify-center overflow-hidden',
                  selectedConfig.aspectRatio,
                  'max-h-[300px]'
                )
              "
            >
              <img
                v-if="hasImage"
                :src="`attachment://games/${game.id}/${currentFile}`"
                :alt="selectedConfig.label"
                class="size-full object-contain"
              />
              <div
                v-else
                class="flex flex-col items-center gap-2 text-muted-foreground"
              >
                <Icon
                  icon="icon-[mdi--image-off-outline]"
                  class="size-12"
                />
                <span class="text-sm">暂无{{ selectedConfig.label }}</span>
              </div>
            </div>

            <!-- Description -->
            <p class="text-xs text-muted-foreground">{{ selectedConfig.description }}</p>

            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                :disabled="isImportingFile"
                @click="handleImportFile"
              >
                <Icon
                  v-if="isImportingFile"
                  icon="icon-[mdi--loading]"
                  class="size-4 animate-spin"
                />
                <Icon
                  v-else
                  icon="icon-[mdi--upload]"
                  class="size-4"
                />
                从文件导入
              </Button>
              <Button
                variant="outline"
                size="sm"
                @click="showUrlDialog = true"
              >
                <Icon
                  icon="icon-[mdi--link-variant]"
                  class="size-4"
                />
                从链接导入
              </Button>
              <Button
                variant="outline"
                size="sm"
                @click="showSearchDialog = true"
              >
                <Icon
                  icon="icon-[mdi--magnify]"
                  class="size-4"
                />
                搜索图片
              </Button>
              <template v-if="hasImage">
                <Button
                  variant="outline"
                  size="sm"
                  @click="showCropDialog = true"
                >
                  <Icon
                    icon="icon-[mdi--crop]"
                    class="size-4"
                  />
                  裁剪
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  class="text-destructive hover:text-destructive"
                  @click="showDeleteConfirm = true"
                >
                  <Icon
                    icon="icon-[mdi--delete-outline]"
                    class="size-4"
                  />
                  删除
                </Button>
              </template>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="outline"
            @click="handleClose"
          >
            关闭
          </Button>
        </DialogFooter>
      </template>
    </DialogContent>
  </Dialog>

  <!-- Search Dialog -->
  <GameMediaSearchFormDialog
    v-if="showSearchDialog"
    v-model:open="showSearchDialog"
    :game-id="props.gameId"
    :media-type="selectedType"
  />

  <!-- Crop Dialog -->
  <GameMediaCropFormDialog
    v-if="showCropDialog && hasImage && currentFile"
    v-model:open="showCropDialog"
    :game-id="props.gameId"
    :media-type="selectedType"
    :current-file-name="currentFile"
  />

  <!-- URL Import Dialog -->
  <GameMediaUrlFormDialog
    v-if="showUrlDialog"
    v-model:open="showUrlDialog"
    :game-id="props.gameId"
    :media-type="selectedType"
  />

  <!-- Delete Confirmation -->
  <DeleteConfirmDialog
    v-if="showDeleteConfirm"
    v-model:open="showDeleteConfirm"
    entity-label="图片"
    :entity-name="selectedConfig.label"
    @confirm="handleDelete"
  />
</template>
