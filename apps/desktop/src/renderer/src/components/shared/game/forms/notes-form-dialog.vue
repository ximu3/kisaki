<!--
  GameNotesFormDialog
  Dialog for creating or editing a game note.
-->
<script setup lang="ts">
import { computed, ref, watch, toRef } from 'vue'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { useAsyncData, useInlineAttachments } from '@renderer/composables'
import { db, attachment } from '@renderer/core/db'
import { ipcManager } from '@renderer/core/ipc'
import { notify } from '@renderer/core/notify'
import { getOpenImageDialogOptions } from '@renderer/utils/dialog'
import { getAttachmentUrl } from '@renderer/utils'
import { gameNotes } from '@shared/db'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Icon } from '@renderer/components/ui/icon'
import { Input } from '@renderer/components/ui/input'
import { Spinner } from '@renderer/components/ui/spinner'
import { MarkdownEditor } from '@renderer/components/ui/markdown'
import { Field, FieldLabel, FieldContent, FieldGroup } from '@renderer/components/ui/field'
import { Form } from '@renderer/components/ui/form'
import { ImagePicker } from '@renderer/components/ui/image-picker'

interface Props {
  gameId: string
  noteId?: string
  nextOrderInGame: number
}

const props = defineProps<Props>()
const open = defineModel<boolean>('open', { required: true })

const isEditMode = computed(() => !!props.noteId)

interface FormData {
  name: string
  content: string
}

const formData = ref<FormData>({
  name: '',
  content: ''
})
const isSaving = ref(false)
const didSave = ref(false)

type CoverMode = 'keep' | 'set' | 'clear'
const coverMode = ref<CoverMode>('keep')
const coverPath = ref<string | null>(null)

const noteIdRef = toRef(props, 'noteId')
const { setBaselineContent, onAttachment, gcOnCancel, gcOnSave } = useInlineAttachments({
  table: gameNotes,
  rowId: computed(() => noteIdRef.value || ''),
  field: 'contentInlineFiles'
})

const didUseInlineAttachments = ref(false)
async function handleInlineAttachment() {
  didUseInlineAttachments.value = true
  return await onAttachment()
}

const {
  data: existingNote,
  isLoading,
  refetch
} = useAsyncData(() => db.query.gameNotes.findFirst({ where: eq(gameNotes.id, props.noteId!) }), {
  watch: [() => props.noteId],
  enabled: () => open.value && isEditMode.value
})

const currentCoverUrl = computed(() => {
  if (!isEditMode.value) return null
  if (coverMode.value === 'clear') return null
  if (coverMode.value === 'set') return null
  if (!existingNote.value?.coverFile) return null
  return getAttachmentUrl('game_notes', existingNote.value.id, existingNote.value.coverFile)
})

watch(existingNote, (note) => {
  if (!note) return
  formData.value.name = note.name
  formData.value.content = note.content || ''
  setBaselineContent(formData.value.content)
})

watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen) return

    didSave.value = false
    didUseInlineAttachments.value = false
    coverMode.value = 'keep'
    coverPath.value = null

    if (isEditMode.value) {
      refetch()
      return
    }

    formData.value = { name: '', content: '' }
  },
  { immediate: true }
)

watch(open, async (isOpen, wasOpen) => {
  if (isOpen) return
  if (!wasOpen) return
  if (didSave.value) return
  if (!isEditMode.value) return
  if (!didUseInlineAttachments.value) return

  try {
    await gcOnCancel()
  } catch (error) {
    console.warn('Inline attachment cleanup failed:', error)
  }
})

async function pickCoverPath(): Promise<string | null> {
  const dialogOptions = getOpenImageDialogOptions({ title: '选择封面' })
  const res = await ipcManager.invoke('native:open-dialog', dialogOptions)
  if (!res.success) {
    throw new Error(res.error || 'Failed to open file dialog')
  }
  if (!res.data || res.data.canceled || !res.data.filePaths || res.data.filePaths.length === 0) {
    return null
  }
  return res.data.filePaths[0]
}

async function handlePickCover() {
  try {
    const path = await pickCoverPath()
    if (!path) return
    coverMode.value = 'set'
    coverPath.value = path
  } catch (error) {
    console.error('Pick cover failed:', error)
    notify.error('选择封面失败')
  }
}

function handleClearCover() {
  coverMode.value = 'clear'
  coverPath.value = null
}

const canSubmit = computed(() => formData.value.name.trim())

async function handleSubmit() {
  if (!canSubmit.value) return
  isSaving.value = true

  try {
    const name = formData.value.name.trim()
    const content = formData.value.content.trim()

    if (isEditMode.value && props.noteId) {
      await db
        .update(gameNotes)
        .set({
          name,
          content: content || null,
          updatedAt: new Date()
        })
        .where(eq(gameNotes.id, props.noteId))

      await gcOnSave(content)

      if (coverMode.value === 'clear') {
        await attachment.clearFile(gameNotes, props.noteId, 'coverFile')
      }
      if (coverMode.value === 'set' && coverPath.value) {
        await attachment.setFile(gameNotes, props.noteId, 'coverFile', {
          kind: 'path',
          path: coverPath.value
        })
      }
    } else {
      const id = nanoid()
      await db.insert(gameNotes).values({
        id,
        gameId: props.gameId,
        name,
        content: content || null,
        orderInGame: props.nextOrderInGame
      })

      if (coverMode.value === 'set' && coverPath.value) {
        await attachment.setFile(gameNotes, id, 'coverFile', {
          kind: 'path',
          path: coverPath.value
        })
      }
    }

    didSave.value = true
    notify.success('已保存')
    open.value = false
  } catch (error) {
    console.error('Save note failed:', error)
    notify.error('保存失败')
  } finally {
    isSaving.value = false
  }
}

function handleCancel() {
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-6xl">
      <template v-if="isEditMode && (isLoading || !existingNote)">
        <DialogBody class="flex items-center justify-center py-10">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

      <template v-else>
        <DialogHeader>
          <DialogTitle>{{ isEditMode ? '编辑笔记' : '新建笔记' }}</DialogTitle>
        </DialogHeader>
        <Form @submit="handleSubmit">
          <DialogBody class="space-y-4 max-h-[80vh] overflow-auto scrollbar-thin">
            <FieldGroup>
              <Field>
                <FieldLabel>标题</FieldLabel>
                <FieldContent>
                  <Input
                    v-model="formData.name"
                    placeholder="输入标题"
                    autofocus
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>封面</FieldLabel>
                <FieldContent>
                  <ImagePicker
                    :image-url="currentCoverUrl"
                    :picked-path="coverMode === 'set' ? coverPath : null"
                    pick-label="选择封面"
                    :clear-disabled="
                      (!isEditMode && coverMode !== 'set') ||
                      (isEditMode && !existingNote?.coverFile && coverMode !== 'set')
                    "
                    @pick="handlePickCover"
                    @clear="handleClearCover"
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>内容</FieldLabel>
                <FieldContent>
                  <MarkdownEditor
                    v-model="formData.content"
                    placeholder="支持 Markdown..."
                    min-height="420px"
                    max-height="420px"
                    :on-attachment="isEditMode ? handleInlineAttachment : undefined"
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              :disabled="isSaving"
              @click="handleCancel"
            >
              取消
            </Button>
            <Button
              type="submit"
              :disabled="isSaving || !canSubmit"
            >
              <Icon
                v-if="isSaving"
                icon="icon-[mdi--loading]"
                class="size-4 animate-spin mr-1.5"
              />
              保存
            </Button>
          </DialogFooter>
        </Form>
      </template>
    </DialogContent>
  </Dialog>
</template>
