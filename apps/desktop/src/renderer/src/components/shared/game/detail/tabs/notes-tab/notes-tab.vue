<!--
  Game Notes Tab

  Notes tab content showing game notes list with dialogs.
-->

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { DeleteConfirmDialog } from '@renderer/components/ui/delete-confirm-dialog'
import { useGame } from '@renderer/composables/use-game'
import { db } from '@renderer/core/db'
import { notify } from '@renderer/core/notify'
import { gameNotes, type GameNote } from '@shared/db'
import GameDetailNotesItem from './notes-item.vue'
import GameDetailNotesViewDialog from './notes-view-dialog.vue'
import { GameNotesFormDialog } from '../../../forms'

// =============================================================================
// State
// =============================================================================

const { game, notes } = useGame()

const viewTargetId = ref<string | null>(null)
const editTargetId = ref<string | null>(null)
const editDialogOpen = ref(false)
const deleteTargetId = ref<string | null>(null)
const isReordering = ref(false)
const displayNotes = ref<GameNote[]>([])
let pendingNotesSnapshot: GameNote[] | null = null

watch(
  notes,
  (next) => {
    const snapshot = [...(next ?? [])]
    if (isReordering.value) {
      pendingNotesSnapshot = snapshot
      return
    }
    displayNotes.value = snapshot
  },
  { immediate: true }
)

const hasNotes = computed(() => displayNotes.value.length > 0)

const viewDialogOpen = computed({
  get: () => viewTargetId.value !== null,
  set: (v) => {
    if (!v) viewTargetId.value = null
  }
})

const deleteDialogOpen = computed({
  get: () => deleteTargetId.value !== null,
  set: (v) => {
    if (!v) deleteTargetId.value = null
  }
})

function openCreateDialog() {
  editTargetId.value = null
  editDialogOpen.value = true
}

function openEditDialog(noteId: string) {
  editTargetId.value = noteId
  editDialogOpen.value = true
}

function openViewDialog(noteId: string) {
  viewTargetId.value = noteId
}

function handleViewEdit() {
  if (!viewTargetId.value) return
  const id = viewTargetId.value
  viewTargetId.value = null
  openEditDialog(id)
}

async function handleDelete(noteId: string) {
  try {
    await db.delete(gameNotes).where(eq(gameNotes.id, noteId))
    notify.success('已删除笔记')
  } catch (error) {
    console.error('Delete note failed:', error)
    notify.error('删除失败')
  } finally {
    deleteTargetId.value = null
  }
}

async function normalizeOrders(): Promise<void> {
  for (let i = 0; i < displayNotes.value.length; i++) {
    const note = displayNotes.value[i]
    if (note.orderInGame === i) continue
    await db.update(gameNotes).set({ orderInGame: i }).where(eq(gameNotes.id, note.id))
  }
}

async function reorder(noteId: string, direction: -1 | 1) {
  if (isReordering.value) return

  const index = displayNotes.value.findIndex((n) => n.id === noteId)
  if (index === -1) return

  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= displayNotes.value.length) return

  const source = displayNotes.value[index]
  const neighbor = displayNotes.value[nextIndex]

  // Optimistic UI swap
  const next = [...displayNotes.value]
  next[index] = neighbor
  next[nextIndex] = source
  displayNotes.value = next

  isReordering.value = true
  try {
    if (source.orderInGame === neighbor.orderInGame) {
      await normalizeOrders()
      return
    }

    // Swap the two order values (2 updates)
    await db
      .update(gameNotes)
      .set({ orderInGame: neighbor.orderInGame })
      .where(eq(gameNotes.id, source.id))
    await db
      .update(gameNotes)
      .set({ orderInGame: source.orderInGame })
      .where(eq(gameNotes.id, neighbor.id))
  } catch (error) {
    console.error('Reorder failed:', error)
    notify.error('排序失败')
    displayNotes.value = [...notes.value]
  } finally {
    isReordering.value = false
    if (pendingNotesSnapshot) {
      displayNotes.value = pendingNotesSnapshot
      pendingNotesSnapshot = null
    }
  }
}
</script>

<template>
  <template v-if="game">
    <!-- Empty state -->
    <template v-if="!hasNotes">
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <Icon
          icon="icon-[mdi--note-text-outline]"
          class="size-12 text-muted-foreground/30 mb-3"
        />
        <p class="text-sm text-muted-foreground">暂无笔记</p>
        <p class="text-xs text-muted-foreground/70 mt-1 mb-4">记录游戏过程中的想法与截图</p>
        <Button @click="openCreateDialog">
          <Icon
            icon="icon-[mdi--plus]"
            class="size-4 mr-2"
          />
          新建笔记
        </Button>
      </div>
    </template>

    <!-- Notes list -->
    <template v-else>
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Button
              size="sm"
              @click="openCreateDialog"
            >
              <Icon
                icon="icon-[mdi--plus]"
                class="size-4 mr-1.5"
              />
              新建笔记
            </Button>
            <span class="text-xs text-muted-foreground">{{ displayNotes.length }} 条</span>
          </div>
        </div>

        <div class="space-y-2">
          <GameDetailNotesItem
            v-for="(note, index) in displayNotes"
            :key="note.id"
            :note="note"
            :can-move-up="!isReordering && index > 0"
            :can-move-down="!isReordering && index < displayNotes.length - 1"
            @open="openViewDialog(note.id)"
            @move-up="reorder(note.id, -1)"
            @move-down="reorder(note.id, 1)"
            @edit="openEditDialog(note.id)"
            @delete="deleteTargetId = note.id"
          />
        </div>
      </div>
    </template>

    <GameDetailNotesViewDialog
      v-if="viewTargetId"
      v-model:open="viewDialogOpen"
      :note-id="viewTargetId"
      @edit="handleViewEdit"
    />

    <GameNotesFormDialog
      v-if="editDialogOpen"
      v-model:open="editDialogOpen"
      :game-id="game.id"
      :note-id="editTargetId || undefined"
      :next-order-in-game="displayNotes.length"
    />

    <DeleteConfirmDialog
      v-if="deleteDialogOpen"
      v-model:open="deleteDialogOpen"
      entity-label="笔记"
      @confirm="deleteTargetId && handleDelete(deleteTargetId)"
    />
  </template>
</template>
