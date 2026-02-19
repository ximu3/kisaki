<!--
  Game Saves Tab

  Saves tab content showing save backup list with management actions.
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { useGame } from '@renderer/composables/use-game'
import { ipcManager } from '@renderer/core/ipc'
import { notify } from '@renderer/core/notify'
import { Button } from '@renderer/components/ui/button'
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
import { DeleteConfirmDialog } from '@renderer/components/ui/delete-confirm-dialog'
import type { SaveBackup } from '@shared/db/json-types'
import { GameSavesFormDialog } from '../../../forms'
import GameDetailSavesItem from './saves-item.vue'

const { game, refetch } = useGame()

const isCreating = ref(false)
const restoreTarget = ref<number | null>(null)
const deleteTarget = ref<number | null>(null)
const editTarget = ref<SaveBackup | null>(null)
const editDialogOpen = ref(false)

const backups = computed(() => game.value?.saveBackups || [])
const hasSavePath = computed(() => !!game.value?.savePath)
const sortedBackups = computed(() => [...backups.value].sort((a, b) => b.backupAt - a.backupAt))

// Dialog open states derived from target values
const restoreDialogOpen = computed({
  get: () => restoreTarget.value !== null,
  set: (v) => {
    if (!v) restoreTarget.value = null
  }
})
const deleteDialogOpen = computed({
  get: () => deleteTarget.value !== null,
  set: (v) => {
    if (!v) deleteTarget.value = null
  }
})

const editFormInitialData = computed(() => {
  if (!editTarget.value) return undefined
  return { note: editTarget.value.note, locked: editTarget.value.locked }
})

async function handleCreate() {
  if (!game.value) return
  isCreating.value = true
  try {
    // TODO: Rename 'attachment:create-game-backup' to 'attachment:create-game-save-backup'
    const result = await ipcManager.invoke('attachment:create-game-backup', game.value.id)
    if (result.success) {
      notify.success('存档已创建')
      refetch()
    } else {
      notify.error('创建存档失败', result.error)
    }
  } finally {
    isCreating.value = false
  }
}

async function handleRestore(backupAt: number) {
  if (!game.value) return
  const result = await ipcManager.invoke('attachment:restore-game-backup', game.value.id, backupAt)
  if (result.success) {
    notify.success('存档已恢复')
    refetch()
  } else {
    notify.error('恢复存档失败', result.error)
  }
  restoreTarget.value = null
}

async function handleDelete(backupAt: number) {
  if (!game.value) return
  const result = await ipcManager.invoke('attachment:delete-game-backup', game.value.id, backupAt)
  if (result.success) {
    notify.success('备份已删除')
    refetch()
  } else {
    notify.error(result.error || '删除备份失败')
  }
  deleteTarget.value = null
}

async function handleOpenBackupFolder() {
  if (!game.value) return
  await ipcManager.invoke('attachment:open-backup-folder', game.value.id)
}

async function handleOpenSaveFolder() {
  if (!game.value) return
  await ipcManager.invoke('attachment:open-save-folder', game.value.id)
}

function openEditDialog(backup: SaveBackup) {
  editTarget.value = backup
  editDialogOpen.value = true
}

async function handleEditSubmit(data: { note: string; locked: boolean }) {
  if (!game.value || !editTarget.value) return
  try {
    const result = await ipcManager.invoke(
      'attachment:update-game-backup',
      game.value.id,
      editTarget.value.backupAt,
      data
    )
    if (result.success) {
      notify.success('备份信息已更新')
      editDialogOpen.value = false
      editTarget.value = null
      refetch()
    } else {
      notify.error(result.error || '更新失败')
    }
  } catch {
    notify.error('更新失败')
  }
}
</script>

<template>
  <template v-if="game">
    <!-- No save path configured -->
    <template v-if="!hasSavePath">
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <Icon
          icon="icon-[mdi--folder-search-outline]"
          class="size-12 text-muted-foreground/30 mb-3"
        />
        <p class="text-sm text-muted-foreground">未设置存档路径</p>
        <p class="text-xs text-muted-foreground/70 mt-1">
          请在游戏设置中配置存档目录后再使用备份功能
        </p>
      </div>
    </template>

    <!-- Empty state -->
    <template v-else-if="!backups.length">
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <Icon
          icon="icon-[mdi--content-save-outline]"
          class="size-12 text-muted-foreground/30 mb-3"
        />
        <p class="text-sm text-muted-foreground">暂无存档备份</p>
        <p class="text-xs text-muted-foreground/70 mt-1 mb-4">创建备份以保护你的游戏进度</p>
        <Button
          :disabled="isCreating"
          @click="handleCreate"
        >
          <Icon
            v-if="isCreating"
            icon="icon-[mdi--loading]"
            class="size-4 animate-spin mr-2"
          />
          <Icon
            v-else
            icon="icon-[mdi--plus]"
            class="size-4 mr-2"
          />
          创建备份
        </Button>
      </div>
    </template>

    <!-- Backup list -->
    <template v-else>
      <div class="space-y-3">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Button
              size="sm"
              :disabled="isCreating"
              @click="handleCreate"
            >
              <Icon
                v-if="isCreating"
                icon="icon-[mdi--loading]"
                class="size-4 animate-spin mr-1.5"
              />
              <Icon
                v-else
                icon="icon-[mdi--plus]"
                class="size-4 mr-1.5"
              />
              创建备份
            </Button>
            <span class="text-xs text-muted-foreground">
              {{ backups.length }} / {{ game.maxSaveBackups }} 个备份
            </span>
          </div>
          <div class="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              @click="handleOpenSaveFolder"
            >
              <Icon
                icon="icon-[mdi--folder-open-outline]"
                class="size-4 mr-1.5"
              />
              存档目录
            </Button>
            <Button
              variant="ghost"
              size="sm"
              @click="handleOpenBackupFolder"
            >
              <Icon
                icon="icon-[mdi--folder-zip-outline]"
                class="size-4 mr-1.5"
              />
              备份目录
            </Button>
          </div>
        </div>

        <!-- Backup list -->
        <div class="space-y-2">
          <GameDetailSavesItem
            v-for="backup in sortedBackups"
            :key="backup.backupAt"
            :note="backup.note"
            :backup-at="backup.backupAt"
            :size-bytes="backup.sizeBytes"
            :locked="backup.locked"
            @restore="restoreTarget = backup.backupAt"
            @edit="openEditDialog(backup)"
            @delete="deleteTarget = backup.backupAt"
          />
        </div>
      </div>

      <!-- Edit backup dialog -->
      <GameSavesFormDialog
        v-if="editDialogOpen"
        v-model:open="editDialogOpen"
        :initial-data="editFormInitialData"
        @submit="handleEditSubmit"
      />

      <!-- Restore confirmation dialog -->
      <AlertDialog v-model:open="restoreDialogOpen">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>恢复存档</AlertDialogTitle>
            <AlertDialogDescription>
              确定要恢复此备份吗？当前存档将被覆盖，此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction @click="restoreTarget && handleRestore(restoreTarget)">
              确认恢复
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <!-- Delete confirmation dialog -->
      <DeleteConfirmDialog
        v-if="deleteDialogOpen"
        v-model:open="deleteDialogOpen"
        entity-label="备份"
        @confirm="deleteTarget && handleDelete(deleteTarget)"
      />
    </template>
  </template>
</template>
