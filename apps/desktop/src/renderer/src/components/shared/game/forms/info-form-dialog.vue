<!--
  GameInfoFormDialog
  Dialog for editing game info (sort name, release date, created date).
-->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { games, type PartialDate } from '@shared/db'
import { useAsyncData } from '@renderer/composables'
import { formatDateInput } from '@renderer/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Field, FieldLabel, FieldContent, FieldGroup } from '@renderer/components/ui/field'
import { Form } from '@renderer/components/ui/form'
import { Spinner } from '@renderer/components/ui/spinner'
import { notify } from '@renderer/core/notify'
import { PartialDateInput, type PartialDateInputExpose } from '@renderer/components/ui/partial-date-input'

interface Props {
  gameId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

// Form state
interface FormData {
  sortName: string
  releaseDate: PartialDate | null
  createdAt: string
}

const formData = ref<FormData>({
  sortName: '',
  releaseDate: null,
  createdAt: ''
})
const isSaving = ref(false)
const releaseDateInput = ref<PartialDateInputExpose | null>(null)

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
    formData.value.sortName = gameData.sortName || ''
    formData.value.releaseDate = gameData.releaseDate ?? null
    formData.value.createdAt = formatDateInput(gameData.createdAt)
  }
})

async function handleSubmit() {
  isSaving.value = true
  try {
    const releaseDateValidation = releaseDateInput.value?.validate()
    if (releaseDateValidation && !releaseDateValidation.valid) {
      notify.error(releaseDateValidation.errorText ?? '发布日期格式不正确')
      return
    }
    const releaseDate = releaseDateValidation?.value ?? formData.value.releaseDate

    await db
      .update(games)
      .set({
        sortName: formData.value.sortName || null,
        releaseDate,
        createdAt: new Date(formData.value.createdAt)
      })
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

function handleCancel() {
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-lg">
      <!-- Loading state -->
      <template v-if="isLoading || !game">
        <DialogBody class="flex items-center justify-center py-8">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

      <!-- Form content -->
      <template v-else>
        <DialogHeader>
          <DialogTitle>编辑详细信息</DialogTitle>
        </DialogHeader>
        <Form @submit="handleSubmit">
          <DialogBody>
            <FieldGroup>
              <Field>
                <FieldLabel>排序名称</FieldLabel>
                <FieldContent>
                  <Input
                    v-model="formData.sortName"
                    placeholder="排序名称"
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>发布日期</FieldLabel>
                <FieldContent>
                  <PartialDateInput
                    ref="releaseDateInput"
                    v-model="formData.releaseDate"
                    :messages="{
                      yearDayWithoutMonthText: '发布日期填写了年份和日期时，必须同时填写月份。'
                    }"
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>添加日期</FieldLabel>
                <FieldContent>
                  <Input
                    v-model="formData.createdAt"
                    type="date"
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
