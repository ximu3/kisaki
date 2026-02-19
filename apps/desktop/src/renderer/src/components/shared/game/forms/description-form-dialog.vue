<!--
  GameDescriptionFormDialog
  Dialog for editing game description.
-->
<script setup lang="ts">
import { ref, watch, toRef } from 'vue'
import { eq } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { games } from '@shared/db'
import { useAsyncData, useInlineAttachments } from '@renderer/composables'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { MarkdownEditor } from '@renderer/components/ui/markdown'
import { Field, FieldLabel, FieldContent, FieldGroup } from '@renderer/components/ui/field'
import { Form } from '@renderer/components/ui/form'
import { Spinner } from '@renderer/components/ui/spinner'
import { notify } from '@renderer/core/notify'

interface Props {
  gameId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

// Form state
interface FormData {
  description: string
}

const formData = ref<FormData>({
  description: ''
})
const isSaving = ref(false)
const didSave = ref(false)

const { setBaselineContent, onAttachment, gcOnCancel, gcOnSave } = useInlineAttachments({
  table: games,
  rowId: toRef(props, 'gameId'),
  field: 'descriptionInlineFiles'
})

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
    formData.value.description = gameData.description || ''
    setBaselineContent(formData.value.description)
  }
})

watch(open, async (isOpen, wasOpen) => {
  if (isOpen) {
    didSave.value = false
    return
  }
  if (wasOpen && !didSave.value) {
    try {
      await gcOnCancel()
    } catch (error) {
      console.warn('Inline attachment cleanup failed:', error)
    }
  }
})

async function handleSubmit() {
  isSaving.value = true
  try {
    const next = formData.value.description.trim()
    await db
      .update(games)
      .set({ description: next || null })
      .where(eq(games.id, props.gameId))

    await gcOnSave(next)
    didSave.value = true
    notify.success('已保存')
    open.value = false
  } catch (error) {
    console.error('Update failed:', error)
    notify.error('保存失败，请重试')
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
      <!-- Loading state -->
      <template v-if="isLoading || !game">
        <DialogBody class="flex items-center justify-center py-8">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

      <!-- Form content -->
      <template v-else>
        <DialogHeader>
          <DialogTitle>编辑简介</DialogTitle>
        </DialogHeader>
        <Form @submit="handleSubmit">
          <DialogBody>
            <FieldGroup>
              <Field>
                <FieldLabel
                  for="description"
                  class="text-xs"
                >
                  支持 Markdown
                </FieldLabel>
                <FieldContent>
                  <MarkdownEditor
                    v-model="formData.description"
                    placeholder="输入游戏简介 (支持 Markdown)..."
                    min-height="500px"
                    max-height="500px"
                    :on-attachment="onAttachment"
                    auto-focus
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
              :disabled="isSaving"
            >
              保存
            </Button>
          </DialogFooter>
        </Form>
      </template>
    </DialogContent>
  </Dialog>
</template>
