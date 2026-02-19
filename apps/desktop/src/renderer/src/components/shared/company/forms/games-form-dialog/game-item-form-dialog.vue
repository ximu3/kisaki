<!--
  CompanyGamesItemFormDialog
  Dialog for adding/editing a single game link with company type.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { nanoid } from 'nanoid'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Form } from '@renderer/components/ui/form'
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
import { GameSelect } from '@renderer/components/shared/game'
import { db } from '@renderer/core/db'
import type { GameCompanyType } from '@shared/db'
import { notify } from '@renderer/core/notify'

const COMPANY_TYPE_OPTIONS: { value: GameCompanyType; label: string }[] = [
  { value: 'developer', label: '开发' },
  { value: 'publisher', label: '发行' },
  { value: 'distributor', label: '分销' },
  { value: 'other', label: '其他' }
]

interface GameLinkItem {
  id: string
  gameId: string
  gameName: string
  gameCover: string | null
  type: GameCompanyType
  note: string
  isSpoiler: boolean
  orderInCompany: number
  isNew?: boolean
}

interface Props {
  initialData?: GameLinkItem
  existingGameIds: string[]
  isAddMode: boolean
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  submit: [data: GameLinkItem]
}>()

// Form state
type FormData = Pick<GameLinkItem, 'gameId' | 'gameName' | 'gameCover' | 'type' | 'note' | 'isSpoiler'>

const formData = ref<FormData>({
  gameId: '',
  gameName: '',
  gameCover: null,
  type: 'developer',
  note: '',
  isSpoiler: false
})

// Initialize form state when dialog opens
watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) {
      formData.value.gameId = props.initialData?.gameId ?? ''
      formData.value.gameName = props.initialData?.gameName ?? ''
      formData.value.gameCover = props.initialData?.gameCover ?? null
      formData.value.type = props.initialData?.type ?? 'developer'
      formData.value.note = props.initialData?.note ?? ''
      formData.value.isSpoiler = props.initialData?.isSpoiler ?? false
    }
  },
  { immediate: true }
)

const excludeIds = computed(() =>
  props.isAddMode
    ? props.existingGameIds
    : props.existingGameIds.filter((id) => id !== formData.value.gameId)
)

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
      formData.value.gameCover = game.coverFile ?? null
    }
  }
)

function handleSubmit() {
  if (!formData.value.gameId) {
    notify.error('请选择游戏')
    return
  }
  emit('submit', {
    id: props.initialData?.id || nanoid(),
    gameId: formData.value.gameId,
    gameName: formData.value.gameName,
    gameCover: formData.value.gameCover,
    type: formData.value.type,
    note: formData.value.note.trim(),
    isSpoiler: formData.value.isSpoiler,
    orderInCompany: props.initialData?.orderInCompany ?? 0,
    isNew: props.isAddMode
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
        <DialogTitle>{{ props.isAddMode ? '添加游戏' : '编辑游戏' }}</DialogTitle>
      </DialogHeader>
      <Form @submit="handleSubmit">
        <DialogBody>
          <FieldGroup>
            <Field>
              <FieldLabel>游戏</FieldLabel>
              <FieldContent>
                <GameSelect
                  v-model="formData.gameId"
                  :exclude-ids="excludeIds"
                  placeholder="选择游戏..."
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>关系类型</FieldLabel>
              <FieldContent>
                <Select v-model="formData.type">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="option in COMPANY_TYPE_OPTIONS"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
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
          <Button type="submit">确定</Button>
        </DialogFooter>
      </Form>
    </DialogContent>
  </Dialog>
</template>
