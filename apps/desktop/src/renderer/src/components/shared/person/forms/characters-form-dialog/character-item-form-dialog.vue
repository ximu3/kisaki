<!--
  PersonCharactersItemFormDialog
  Dialog for adding/editing a character link with type and note.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { characters, type CharacterPersonType } from '@shared/db'
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
import { CharacterSelect } from '@renderer/components/shared/character'
import { notify } from '@renderer/core/notify'

interface CharacterLinkData {
  characterId: string
  characterName: string
  characterPhoto: string | null
  type: CharacterPersonType
  note: string
  isSpoiler: boolean
}

interface Props {
  initialData?: CharacterLinkData
  excludeIds: string[]
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  submit: [data: CharacterLinkData]
}>()

const PERSON_TYPE_OPTIONS: { value: CharacterPersonType; label: string }[] = [
  { value: 'actor', label: '声优' },
  { value: 'illustration', label: '原画' },
  { value: 'designer', label: '设计' },
  { value: 'other', label: '其他' }
]

// Form state
const formData = ref<CharacterLinkData>({
  characterId: '',
  characterName: '',
  characterPhoto: null,
  type: 'actor',
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
        formData.value.characterId = props.initialData.characterId
        formData.value.characterName = props.initialData.characterName
        formData.value.characterPhoto = props.initialData.characterPhoto
        formData.value.type = props.initialData.type
        formData.value.note = props.initialData.note
        formData.value.isSpoiler = props.initialData.isSpoiler
      } else {
        formData.value.characterId = ''
        formData.value.characterName = ''
        formData.value.characterPhoto = null
        formData.value.type = 'actor'
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
  return props.excludeIds.filter((id) => id !== formData.value.characterId)
})

// Watch for character selection change - async side effect to fetch character info
watch(
  () => formData.value.characterId,
  async (characterId) => {
    if (!characterId) {
      formData.value.characterName = ''
      formData.value.characterPhoto = null
      return
    }
    const character = await db.query.characters.findFirst({ where: eq(characters.id, characterId) })
    if (character) {
      formData.value.characterName = character.name
      formData.value.characterPhoto = character.photoFile
    }
  }
)

function handleSubmit() {
  if (!formData.value.characterId) {
    notify.error('请选择角色')
    return
  }

  emit('submit', {
    characterId: formData.value.characterId,
    characterName: formData.value.characterName,
    characterPhoto: formData.value.characterPhoto,
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
        <DialogTitle>{{ isAddMode ? '添加角色' : '编辑角色' }}</DialogTitle>
      </DialogHeader>
      <Form @submit="handleSubmit">
        <DialogBody>
          <FieldGroup>
            <Field>
              <FieldLabel>角色</FieldLabel>
              <FieldContent>
                <CharacterSelect
                  v-model="formData.characterId"
                  :exclude-ids="selectExcludeIds"
                  placeholder="选择角色..."
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>类型</FieldLabel>
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
