<!--
  GameLastActiveFormDialog
  Dialog for editing game last active time.
-->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { games } from '@shared/db'
import { useAsyncData } from '@renderer/composables'
import { formatDatetimeLocalInput } from '@renderer/utils'
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
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldGroup,
  FieldDescription
} from '@renderer/components/ui/field'
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
  datetime: string
}

const formData = ref<FormData>({
  datetime: ''
})
const isSaving = ref(false)

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
    formData.value.datetime = formatDatetimeLocalInput(gameData.lastActiveAt)
  }
})

async function handleSubmit() {
  isSaving.value = true
  try {
    const newLastActiveAt = formData.value.datetime ? new Date(formData.value.datetime) : null
    await db.update(games).set({ lastActiveAt: newLastActiveAt }).where(eq(games.id, props.gameId))

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

function clearDatetime() {
  formData.value.datetime = ''
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-md">
      <!-- Loading state -->
      <template v-if="isLoading || !game">
        <DialogBody class="flex items-center justify-center py-8">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

      <!-- Form content -->
      <template v-else>
        <DialogHeader>
          <DialogTitle>编辑最近运行时间</DialogTitle>
        </DialogHeader>
        <Form @submit="handleSubmit">
          <DialogBody>
            <FieldGroup>
              <Field>
                <FieldLabel>最近运行时间</FieldLabel>
                <FieldContent>
                  <div class="flex gap-2">
                    <Input
                      v-model="formData.datetime"
                      type="datetime-local"
                      class="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      @click="clearDatetime"
                    >
                      清空
                    </Button>
                  </div>
                </FieldContent>
                <FieldDescription>留空表示从未运行过</FieldDescription>
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
