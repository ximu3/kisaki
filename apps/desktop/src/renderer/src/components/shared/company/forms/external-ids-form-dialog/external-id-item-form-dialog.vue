<!--
  ExternalIdItemFormDialog
  Dialog for adding/editing an external ID.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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
import { notify } from '@renderer/core/notify'

interface ExternalIdData {
  source: string
  externalId: string
}

interface Props {
  initialData?: ExternalIdData
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  submit: [data: ExternalIdData]
}>()

const formData = ref<ExternalIdData>({
  source: '',
  externalId: ''
})

const isAddMode = computed(() => !props.initialData)

watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen) return

    if (props.initialData) {
      formData.value.source = props.initialData.source
      formData.value.externalId = props.initialData.externalId
      return
    }

    formData.value.source = ''
    formData.value.externalId = ''
  },
  { immediate: true }
)

function handleSubmit() {
  const source = formData.value.source.trim()
  const externalId = formData.value.externalId.trim()

  if (!source || !externalId) {
    notify.error('请填写来源和ID')
    return
  }

  emit('submit', { source, externalId })
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
        <DialogTitle>{{ isAddMode ? '添加外部ID' : '编辑外部ID' }}</DialogTitle>
      </DialogHeader>
      <Form @submit="handleSubmit">
        <DialogBody>
          <FieldGroup>
            <Field>
              <FieldLabel>来源</FieldLabel>
              <FieldContent>
                <Input
                  v-model="formData.source"
                  placeholder="如: vndb、steam、bangumi"
                  required
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>外部ID</FieldLabel>
              <FieldContent>
                <Input
                  v-model="formData.externalId"
                  placeholder="如: v12345"
                  required
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
