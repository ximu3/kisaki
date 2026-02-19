<!--
  CharacterGamesItemFormDialog
  Dialog for adding/editing a game link with role type and note.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { db } from '@renderer/core/db'
import type { GameCharacterType } from '@shared/db'
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
  type: GameCharacterType
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

const CHARACTER_TYPE_OPTIONS: { value: GameCharacterType; label: string }[] = [
  { value: 'main', label: '主角' },
  { value: 'supporting', label: '配角' },
  { value: 'cameo', label: '客串' },
  { value: 'other', label: '其他' }
]

// Form state
const formData = ref<GameLinkData>({
  gameId: '',
  gameName: '',
  gameCover: null,
  type: 'main',
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
        formData.value.type = 'main'
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
    const game = await db.query.games.findFirst({
      where: (g, { eq }) => eq(g.id, gameId)
    })
    if (game) {
      formData.value.gameName = game.name
      formData.value.gameCover = game.coverFile || null
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
    gameName: formData.value.gameName || 'Unknown',
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
              <FieldLabel>角色类型</FieldLabel>
              <FieldContent>
                <Select v-model="formData.type">
                  <SelectTrigger
                    class="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="opt in CHARACTER_TYPE_OPTIONS"
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
