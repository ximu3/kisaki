<!--
  GameDurationSessionFormDialog
  Dialog for adding/editing a game session with start and end times.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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
import { Field, FieldLabel, FieldContent } from '@renderer/components/ui/field'
import { Form } from '@renderer/components/ui/form'
import { notify } from '@renderer/core/notify'
import type { GameSession } from '@shared/db'

interface SessionData {
  startedAt: Date
  endedAt: Date
}

interface Props {
  /** Existing session for editing, undefined for add mode */
  initialData?: SessionData
  /** Existing sessions for overlap validation */
  existingSessions: GameSession[]
  /** ID of editing session to exclude from overlap check */
  editingId?: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  submit: [data: SessionData]
}>()

interface FormData {
  startedAt: string
  endedAt: string
}

const formData = ref<FormData>({
  startedAt: '',
  endedAt: ''
})

const isAddMode = computed(() => !props.initialData)

// Initialize form state when dialog opens
watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) {
      if (props.initialData) {
        formData.value.startedAt = formatDatetimeLocalInput(props.initialData.startedAt)
        formData.value.endedAt = formatDatetimeLocalInput(props.initialData.endedAt)
      } else {
        const now = new Date()
        const oneHourAgo = new Date(now.getTime() - 3600000)
        formData.value.startedAt = formatDatetimeLocalInput(oneHourAgo)
        formData.value.endedAt = formatDatetimeLocalInput(now)
      }
    }
  },
  { immediate: true }
)

function findOverlappingSession(startedAt: Date, endedAt: Date): boolean {
  for (const session of props.existingSessions) {
    if (session.id === props.editingId) continue
    if (startedAt < session.endedAt && session.startedAt < endedAt) {
      return true
    }
  }
  return false
}

function handleSubmit() {
  if (!formData.value.startedAt || !formData.value.endedAt) {
    notify.error('请填写开始和结束时间')
    return
  }
  const start = new Date(formData.value.startedAt)
  const end = new Date(formData.value.endedAt)
  if (start >= end) {
    notify.error('结束时间必须晚于开始时间')
    return
  }
  if (findOverlappingSession(start, end)) {
    notify.error('时间段与现有记录重叠，请调整时间')
    return
  }

  emit('submit', { startedAt: start, endedAt: end })
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
        <DialogTitle>{{ isAddMode ? '添加记录' : '编辑记录' }}</DialogTitle>
      </DialogHeader>
      <Form @submit="handleSubmit">
        <DialogBody>
          <div class="space-y-4">
            <Field>
              <FieldLabel>开始时间</FieldLabel>
              <FieldContent>
                <Input
                  v-model="formData.startedAt"
                  type="datetime-local"
                  required
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>结束时间</FieldLabel>
              <FieldContent>
                <Input
                  v-model="formData.endedAt"
                  type="datetime-local"
                  required
                />
              </FieldContent>
            </Field>
          </div>
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
