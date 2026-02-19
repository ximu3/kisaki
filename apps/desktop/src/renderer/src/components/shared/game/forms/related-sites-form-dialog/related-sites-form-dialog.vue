<!--
  GameRelatedSitesFormDialog
  Dialog for editing game related sites/links.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { db } from '@renderer/core/db'
import { games } from '@shared/db'
import { useAsyncData } from '@renderer/composables'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@renderer/components/ui/alert-dialog'
import { Button } from '@renderer/components/ui/button'
import { Spinner } from '@renderer/components/ui/spinner'
import { notify } from '@renderer/core/notify'
import GameRelatedSitesItem from './related-site-item.vue'
import GameRelatedSitesItemFormDialog from './related-site-item-form-dialog.vue'

interface Props {
  gameId: string
}

interface RelatedSite {
  label: string
  url: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

// Form state
const sites = ref<RelatedSite[]>([])
const deleteIndex = ref<number | null>(null)
const formOpen = ref(false)
const editingIndex = ref<number | null>(null)
const isSaving = ref(false)

// Fetch game data when dialog opens
const { data: game, isLoading } = useAsyncData(
  () => db.query.games.findFirst({ where: eq(games.id, props.gameId) }),
  {
    watch: [() => props.gameId],
    enabled: () => open.value
  }
)

// Initialize form state when data loads
watch(game, (gameData) => {
  if (gameData) {
    sites.value = gameData.relatedSites || []
  }
})

// Delete dialog state
const deleteDialogOpen = computed({
  get: () => deleteIndex.value !== null,
  set: (v) => {
    if (!v) deleteIndex.value = null
  }
})

const formInitialData = computed(() => {
  if (editingIndex.value === null) return undefined
  return sites.value[editingIndex.value]
})

async function handleSave() {
  isSaving.value = true
  try {
    const validSites = sites.value.filter((s) => s.label.trim() && s.url.trim())
    await db
      .update(games)
      .set({ relatedSites: validSites.length > 0 ? validSites : null })
      .where(eq(games.id, props.gameId))

    notify.success('已保存')
    open.value = false
  } catch (error) {
    console.error('Update failed:', error)
    notify.error('保存失败，请重试')
  } finally {
    isSaving.value = false
  }
}

function handleAddClick() {
  editingIndex.value = null
  formOpen.value = true
}

function handleEditClick(index: number) {
  editingIndex.value = index
  formOpen.value = true
}

function handleFormSubmit(data: RelatedSite) {
  if (editingIndex.value !== null) {
    sites.value[editingIndex.value] = data
  } else {
    sites.value.push(data)
  }
  formOpen.value = false
  editingIndex.value = null
}

function handleRemoveSite(index: number) {
  sites.value.splice(index, 1)
  deleteIndex.value = null
}

function handleMoveUp(index: number) {
  if (index <= 0) return
  const temp = sites.value[index - 1]
  sites.value[index - 1] = sites.value[index]
  sites.value[index] = temp
}

function handleMoveDown(index: number) {
  if (index >= sites.value.length - 1) return
  const temp = sites.value[index]
  sites.value[index] = sites.value[index + 1]
  sites.value[index + 1] = temp
}

function handleCancel() {
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-lg">
      <!-- Loading state -->
      <template v-if="isLoading || !game">
        <DialogBody class="flex items-center justify-center py-8">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

      <!-- Form content -->
      <template v-else>
        <DialogHeader>
          <DialogTitle>编辑相关链接</DialogTitle>
        </DialogHeader>
        <DialogBody class="overflow-auto max-h-[60vh] scrollbar-thin">
          <div class="space-y-1">
            <p
              v-if="sites.length === 0"
              class="text-sm text-muted-foreground text-center py-8"
            >
              暂无相关链接，点击下方按钮添加
            </p>
            <GameRelatedSitesItem
              v-for="(site, index) in sites"
              v-else
              :key="index"
              :label="site.label"
              :url="site.url"
              :is-first="index === 0"
              :is-last="index === sites.length - 1"
              @move-up="handleMoveUp(index)"
              @move-down="handleMoveDown(index)"
              @edit="handleEditClick(index)"
              @delete="deleteIndex = index"
            />
          </div>
        </DialogBody>
        <DialogFooter class="flex justify-between">
          <Button
            variant="outline"
            @click="handleAddClick"
          >
            <Icon
              icon="icon-[mdi--plus]"
              class="size-4 mr-1.5"
            />
            添加链接
          </Button>
          <div class="flex gap-2">
            <Button
              variant="outline"
              @click="handleCancel"
            >
              取消
            </Button>
            <Button
              :disabled="isSaving"
              @click="handleSave"
            >
              保存
            </Button>
          </div>
        </DialogFooter>
      </template>
    </DialogContent>
  </Dialog>

  <!-- Site form dialog -->
  <GameRelatedSitesItemFormDialog
    v-if="formOpen"
    v-model:open="formOpen"
    :initial-data="formInitialData"
    @submit="handleFormSubmit"
  />

  <!-- Delete confirmation dialog -->
  <AlertDialog v-model:open="deleteDialogOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>确认删除</AlertDialogTitle>
      </AlertDialogHeader>
      <AlertDialogDescription>确定要删除这条链接吗？此操作无法撤销。</AlertDialogDescription>
      <AlertDialogFooter>
        <AlertDialogCancel>取消</AlertDialogCancel>
        <AlertDialogAction @click="deleteIndex !== null && handleRemoveSite(deleteIndex)">
          删除
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
