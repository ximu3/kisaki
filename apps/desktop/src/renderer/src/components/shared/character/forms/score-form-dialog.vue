<!--
  CharacterScoreFormDialog
  Dialog for editing character score.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { characters } from '@shared/db'
import { useAsyncData } from '@renderer/composables'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Field, FieldLabel, FieldContent, FieldDescription } from '@renderer/components/ui/field'
import { Form } from '@renderer/components/ui/form'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Spinner } from '@renderer/components/ui/spinner'
import { notify } from '@renderer/core/notify'
import { dbScoreToDisplay, displayScoreToDb } from '@renderer/utils'

interface Props {
  characterId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

// Form state
interface FormData {
  score: string
}

const formData = ref<FormData>({
  score: ''
})
const isSaving = ref(false)

// Fetch character data when dialog opens
const { data: character, isLoading } = useAsyncData(
  () => db.query.characters.findFirst({ where: eq(characters.id, props.characterId) }),
  {
    watch: [() => props.characterId],
    enabled: () => open.value
  }
)

// Initialize form state when data loads
watch(character, (characterData) => {
  if (characterData) {
    formData.value.score = dbScoreToDisplay(characterData.score)
  }
})

// Computed model for score input (validates input pattern)
const scoreModel = computed({
  get: () => formData.value.score,
  set: (value: string) => {
    if (value === '' || /^(\d+\.?\d*)?$/.test(value)) {
      formData.value.score = value
    }
  }
})

async function handleSubmit() {
  const trimmed = formData.value.score.trim()
  if (trimmed !== '') {
    const num = parseFloat(trimmed)
    if (isNaN(num) || num < 0 || num > 10) {
      notify.error('评分必须在 0-10 之间')
      return
    }
  }

  isSaving.value = true
  try {
    await db
      .update(characters)
      .set({ score: displayScoreToDb(formData.value.score) })
      .where(eq(characters.id, props.characterId))

    notify.success('已保存')
    open.value = false
  } catch (error) {
    console.error('Update failed:', error)
    notify.error('保存失败，请重试')
  } finally {
    isSaving.value = false
  }
}

function handleClear() {
  formData.value.score = ''
}

function handleCancel() {
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-md">
      <!-- Loading state -->
      <template v-if="isLoading || !character">
        <DialogBody class="flex items-center justify-center py-8">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

      <!-- Form content -->
      <template v-else>
        <DialogHeader>
          <DialogTitle>编辑评分</DialogTitle>
        </DialogHeader>
        <Form @submit="handleSubmit">
          <DialogBody>
            <Field>
              <FieldLabel>我的评分</FieldLabel>
              <FieldContent>
                <div class="flex gap-2 items-center">
                  <Input
                    v-model="scoreModel"
                    type="text"
                    inputmode="decimal"
                    placeholder="0.0"
                    class="w-24"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    @click="handleClear"
                  >
                    清空
                  </Button>
                </div>
              </FieldContent>
              <FieldDescription>评分范围 0-10，支持一位小数（如 8.5）</FieldDescription>
            </Field>
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
