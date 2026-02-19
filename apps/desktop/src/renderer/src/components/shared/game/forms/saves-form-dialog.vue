<!--
  GameSavesFormDialog
  Dialog for editing backup note and lock status.
-->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Form } from '@renderer/components/ui/form'
import { Input } from '@renderer/components/ui/input'
import { Switch } from '@renderer/components/ui/switch'
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldGroup,
  FieldDescription
} from '@renderer/components/ui/field'

interface BackupData {
  note: string
  locked: boolean
}

interface Props {
  initialData?: BackupData
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  submit: [data: BackupData]
}>()

const formData = ref<BackupData>({
  note: '',
  locked: false
})
const isSaving = ref(false)

// Initialize form state when dialog opens
watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) {
      formData.value.note = props.initialData?.note ?? ''
      formData.value.locked = props.initialData?.locked ?? false
    }
  }
)

function handleSubmit() {
  isSaving.value = true
  emit('submit', { note: formData.value.note, locked: formData.value.locked })
}

function handleCancel() {
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>编辑备份</DialogTitle>
      </DialogHeader>
      <Form @submit="handleSubmit">
        <DialogBody>
          <FieldGroup>
            <Field>
              <FieldLabel>备注</FieldLabel>
              <FieldContent>
                <Input
                  v-model="formData.note"
                  placeholder="例如：第三章通关存档"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>锁定备份</FieldLabel>
              <FieldContent>
                <Switch
                  v-model="formData.locked"
                />
              </FieldContent>
              <FieldDescription>锁定后不会被自动清理</FieldDescription>
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
            <Icon
              v-if="isSaving"
              icon="icon-[mdi--loading]"
              class="size-4 animate-spin mr-1.5"
            />
            保存
          </Button>
        </DialogFooter>
      </Form>
    </DialogContent>
  </Dialog>
</template>
