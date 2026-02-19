<!--
  PersonGamesItemFormDialog
  Dialog for adding/editing a game link with type and note.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { games, type GamePersonType } from '@shared/db'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { Field, FieldLabel, FieldContent, FieldGroup } from '@renderer/components/ui/field'
import { Form } from '@renderer/components/ui/form'
import { GameSelect } from '@renderer/components/shared/game'
import { notify } from '@renderer/core/notify'

interface GameLinkData {
  gameId: string
  gameName: string
  gameCover: string | null
  type: GamePersonType
  note: string
  isSpoiler: boolean
}

interface Props {
  initialData?: GameLinkData
  excludeIds: string[]
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  submit: [data: GameLinkData]
}>()

const PERSON_TYPE_OPTIONS: { value: GamePersonType; label: string }[] = [
  { value: 'director', label: '导演' },
  { value: 'scenario', label: '剧本' },
  { value: 'illustration', label: '原画' },
  { value: 'music', label: '音乐' },
  { value: 'programmer', label: '程序' },
  { value: 'actor', label: '声优' },
  { value: 'other', label: '其他' }
]

// Form state
const formData = ref<GameLinkData>({
  gameId: '',
  gameName: '',
  gameCover: null,
  type: 'other',
  note: '',
  isSpoiler: false
})

const isAddMode = computed(() => !props.initialData)

// Initialize form state when dialog opens
watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) {
      if (props.initialData) {
        formData.value.gameId = props.initialData.gameId
        formData.value.gameName = props.initialData.gameName
        formData.value.gameCover = props.initialData.gameCover
        formData.value.type = props.initialData.type
        formData.value.note = props.initialData.note
        formData.value.isSpoiler = props.initialData.isSpoiler
      } else {
        formData.value.gameId = ''
        formData.value.gameName = ''
        formData.value.gameCover = null
        formData.value.type = 'other'
        formData.value.note = ''
        formData.value.isSpoiler = false
      }
    }
  },
  { immediate: true }
)

const selectExcludeIds = computed(() => {
  if (isAddMode.value) {
    return props.excludeIds
  }
  return props.excludeIds.filter((id) => id !== formData.value.gameId)
})

// Watch for game selection change - async side effect to fetch game info
watch(
  () => formData.value.gameId,
  async (gameId) => {
    if (!gameId) {
      formData.value.gameName = ''
      formData.value.gameCover = null
      return
    }
    const game = await db.query.games.findFirst({ where: eq(games.id, gameId) })
    if (game) {
      formData.value.gameName = game.name
      formData.value.gameCover = game.coverFile
    }
  }
)

function handleSubmit() {
  if (!formData.value.gameId) {
    notify.error('请选择游戏')
    return
  }

  emit('submit', {
    gameId: formData.value.gameId,
    gameName: formData.value.gameName,
    gameCover: formData.value.gameCover,
    type: formData.value.type,
    note: formData.value.note.trim(),
    isSpoiler: formData.value.isSpoiler
  })
  open.value = false
}

function handleCancel() {
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-sm">
      <DialogHeader>
        <DialogTitle>{{ isAddMode ? '添加游戏' : '编辑游戏' }}</DialogTitle>
      </DialogHeader>
      <Form @submit="handleSubmit">
        <DialogBody>
          <FieldGroup>
            <Field>
              <FieldLabel>游戏</FieldLabel>
              <FieldContent>
                <GameSelect
                  v-model="formData.gameId"
                  :exclude-ids="selectExcludeIds"
                  placeholder="选择游戏..."
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>职位</FieldLabel>
              <FieldContent>
                <Select v-model="formData.type">
                  <SelectTrigger
                    class="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="opt in PERSON_TYPE_OPTIONS"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>备注</FieldLabel>
              <FieldContent>
                <Input
                  v-model="formData.note"
                  placeholder="可选备注..."
                />
              </FieldContent>
            </Field>
            <Field orientation="horizontal">
              <FieldLabel>包含剧透</FieldLabel>
              <FieldContent>
                <Checkbox
                  v-model="formData.isSpoiler"
                />
              </FieldContent>
            </Field>
          </FieldGroup>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            @click="handleCancel"
          >
            取消
          </Button>
          <Button type="submit">保存</Button>
        </DialogFooter>
      </Form>
    </DialogContent>
  </Dialog>
</template>
