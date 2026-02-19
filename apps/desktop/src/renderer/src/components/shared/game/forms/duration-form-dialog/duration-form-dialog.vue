<!--
  GameDurationFormDialog
  Dialog for editing game duration and sessions.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { eq, desc } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { db } from '@renderer/core/db'
import { games, gameSessions, type GameSession } from '@shared/db'
import { useAsyncData } from '@renderer/composables'
import { formatDuration } from '@renderer/utils'
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
import { Input } from '@renderer/components/ui/input'
import { Field, FieldLabel, FieldContent, FieldDescription } from '@renderer/components/ui/field'
import { Spinner } from '@renderer/components/ui/spinner'
import { notify } from '@renderer/core/notify'
import GameDurationSessionItem from './duration-session-item.vue'
import GameDurationSessionFormDialog from './duration-session-form-dialog.vue'

interface Props {
  gameId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

function calculateSessionsDuration(sessionsList: GameSession[]): number {
  return sessionsList.reduce((sum, session) => {
    const duration = session.endedAt.getTime() - session.startedAt.getTime()
    return sum + Math.max(0, duration)
  }, 0)
}

function parseDurationToMs(hours: number, minutes: number): number {
  return (hours * 3600 + minutes * 60) * 1000
}

function msToHoursMinutes(ms: number): { hours: number; minutes: number } {
  const seconds = Math.floor(ms / 1000)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return { hours, minutes }
}

// Form state
const sessions = ref<GameSession[]>([])
const untrackedHours = ref(0)
const untrackedMinutes = ref(0)
const deleteId = ref<string | null>(null)
const sessionFormOpen = ref(false)
const editingId = ref<string | null>(null)
const isSaving = ref(false)

interface InitialDurationData {
  sessions: GameSession[]
  untrackedHours: number
  untrackedMinutes: number
}

const { data, isLoading } = useAsyncData<InitialDurationData>(
  async () => {
    const [sessionsData, game] = await Promise.all([
      db.query.gameSessions.findMany({
        where: eq(gameSessions.gameId, props.gameId),
        orderBy: desc(gameSessions.startedAt)
      }),
      db.query.games.findFirst({ where: eq(games.id, props.gameId) })
    ])
    let hours = 0
    let minutes = 0
    if (game) {
      const sessionsDurationMs = calculateSessionsDuration(sessionsData)
      const untrackedMs = Math.max(0, game.totalDuration - sessionsDurationMs)
      const result = msToHoursMinutes(untrackedMs)
      hours = result.hours
      minutes = result.minutes
    }
    return { sessions: sessionsData, untrackedHours: hours, untrackedMinutes: minutes }
  },
  {
    watch: [() => props.gameId],
    enabled: () => open.value
  }
)

// Initialize form state when data loads
watch(data, (d) => {
  if (d) {
    sessions.value = d.sessions
    untrackedHours.value = d.untrackedHours
    untrackedMinutes.value = d.untrackedMinutes
  }
})

const sessionsDuration = computed(() => calculateSessionsDuration(sessions.value))
const untrackedMs = computed(() => parseDurationToMs(untrackedHours.value, untrackedMinutes.value))
const totalDuration = computed(() => sessionsDuration.value + untrackedMs.value)

const deleteDialogOpen = computed({
  get: () => deleteId.value !== null,
  set: (v) => {
    if (!v) deleteId.value = null
  }
})

const sessionFormInitialData = computed(() => {
  if (!editingId.value) return undefined
  const session = sessions.value.find((s) => s.id === editingId.value)
  if (!session) return undefined
  return { startedAt: session.startedAt, endedAt: session.endedAt }
})

async function handleSave() {
  isSaving.value = true
  try {
    const newTotalDuration = sessionsDuration.value + untrackedMs.value
    await db
      .update(games)
      .set({ totalDuration: newTotalDuration })
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

async function handleDeleteSession(sessionId: string) {
  try {
    await db.delete(gameSessions).where(eq(gameSessions.id, sessionId))
    sessions.value = sessions.value.filter((s) => s.id !== sessionId)
    notify.success('已删除记录')
  } catch (error) {
    console.error('Delete session failed:', error)
    notify.error('删除失败')
  } finally {
    deleteId.value = null
  }
}

function handleAddClick() {
  editingId.value = null
  sessionFormOpen.value = true
}

function handleEditClick(sessionId: string) {
  editingId.value = sessionId
  sessionFormOpen.value = true
}

async function handleSessionFormSubmit(data: { startedAt: Date; endedAt: Date }) {
  try {
    if (editingId.value) {
      await db
        .update(gameSessions)
        .set({ startedAt: data.startedAt, endedAt: data.endedAt })
        .where(eq(gameSessions.id, editingId.value))
      notify.success('已更新记录')
    } else {
      await db.insert(gameSessions).values({
        gameId: props.gameId,
        startedAt: data.startedAt,
        endedAt: data.endedAt
      })
      notify.success('已添加记录')
    }
    const updated = await db.query.gameSessions.findMany({
      where: eq(gameSessions.gameId, props.gameId),
      orderBy: desc(gameSessions.startedAt)
    })
    sessions.value = updated
  } catch (error) {
    console.error('Session save failed:', error)
    notify.error(editingId.value ? '更新失败' : '添加失败')
  }
  sessionFormOpen.value = false
  editingId.value = null
}

function handleCancel() {
  open.value = false
}

// Computed model for hours input (parse and clamp >= 0)
const hoursModel = computed({
  get: () => untrackedHours.value,
  set: (v: string | number) => {
    untrackedHours.value = Math.max(0, parseInt(String(v)) || 0)
  }
})

// Computed model for minutes input (parse and clamp 0-59)
const minutesModel = computed({
  get: () => untrackedMinutes.value,
  set: (v: string | number) => {
    untrackedMinutes.value = Math.max(0, Math.min(59, parseInt(String(v)) || 0))
  }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-lg max-h-[80vh] flex flex-col">
      <!-- Loading state -->
      <template v-if="isLoading || !data">
        <DialogBody class="flex items-center justify-center py-8">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

      <!-- Form content -->
      <template v-else>
        <DialogHeader>
          <DialogTitle>编辑游玩时间</DialogTitle>
        </DialogHeader>
        <DialogBody class="flex-1 min-h-0 p-0 flex flex-col">
          <!-- Total duration summary -->
          <div class="px-4 py-3 border-b bg-muted/30">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">总游玩时间</span>
              <span class="font-medium">{{ formatDuration(totalDuration) }}</span>
            </div>
            <div class="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>会话记录: {{ formatDuration(sessionsDuration) }}</span>
              <span>未记录时间: {{ formatDuration(untrackedMs) }}</span>
            </div>
          </div>

          <!-- Untracked time input -->
          <div class="px-4 py-3 border-b">
            <Field>
              <FieldLabel>未记录的游玩时间</FieldLabel>
              <FieldContent>
                <div class="flex items-center gap-2">
                  <Input
                    v-model="hoursModel"
                    type="number"
                    min="0"
                    class="w-20"
                  />
                  <span class="text-sm text-muted-foreground">小时</span>
                  <Input
                    v-model="minutesModel"
                    type="number"
                    min="0"
                    max="59"
                    class="w-20"
                  />
                  <span class="text-sm text-muted-foreground">分钟</span>
                </div>
              </FieldContent>
              <FieldDescription>游戏会话未记录的游玩时间（如导入的历史数据）</FieldDescription>
            </Field>
          </div>

          <!-- Session records -->
          <div class="flex-1 min-h-0 flex flex-col">
            <div class="px-4 py-2 text-sm font-medium text-muted-foreground border-b shrink-0">
              会话记录 ({{ sessions.length }})
            </div>
            <div class="px-4 py-3 space-y-1 overflow-auto scrollbar-thin max-h-[40vh]">
              <p
                v-if="sessions.length === 0"
                class="text-sm text-muted-foreground text-center py-6"
              >
                暂无会话记录，点击下方按钮添加
              </p>
              <GameDurationSessionItem
                v-for="session in sessions"
                v-else
                :key="session.id"
                :started-at="session.startedAt"
                :ended-at="session.endedAt"
                @edit="handleEditClick(session.id)"
                @delete="deleteId = session.id"
              />
            </div>
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
            添加记录
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

  <!-- Session form dialog -->
  <GameDurationSessionFormDialog
    v-if="sessionFormOpen"
    v-model:open="sessionFormOpen"
    :initial-data="sessionFormInitialData"
    :existing-sessions="sessions"
    :editing-id="editingId ?? undefined"
    @submit="handleSessionFormSubmit"
  />

  <!-- Delete confirmation dialog -->
  <AlertDialog v-model:open="deleteDialogOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>确认删除</AlertDialogTitle>
      </AlertDialogHeader>
      <AlertDialogDescription>确定要删除这条会话记录吗？此操作无法撤销。</AlertDialogDescription>
      <AlertDialogFooter>
        <AlertDialogCancel>取消</AlertDialogCancel>
        <AlertDialogAction @click="deleteId && handleDeleteSession(deleteId)">
          删除
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
