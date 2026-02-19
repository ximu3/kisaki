<!--
  CharacterRelatedSitesItemFormDialog
  Dialog for adding/editing a related site link.
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

interface SiteData {
  label: string
  url: string
}

interface Props {
  initialData?: SiteData
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  submit: [data: SiteData]
}>()

const formData = ref<SiteData>({
  label: '',
  url: ''
})

const isAddMode = computed(() => !props.initialData)

// Initialize form state when dialog opens
watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) {
      if (props.initialData) {
        formData.value.label = props.initialData.label
        formData.value.url = props.initialData.url
      } else {
        formData.value.label = ''
        formData.value.url = ''
      }
    }
  },
  { immediate: true }
)

function handleSubmit() {
  const trimmedLabel = formData.value.label.trim()
  const trimmedUrl = formData.value.url.trim()
  if (!trimmedLabel || !trimmedUrl) {
    notify.error('请填写必填字段')
    return
  }

  emit('submit', { label: trimmedLabel, url: trimmedUrl })
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
        <DialogTitle>{{ isAddMode ? '添加链接' : '编辑链接' }}</DialogTitle>
      </DialogHeader>
      <Form @submit="handleSubmit">
        <DialogBody>
          <FieldGroup>
            <Field>
              <FieldLabel>名称</FieldLabel>
              <FieldContent>
                <Input
                  v-model="formData.label"
                  placeholder="如: 官网、VNDB..."
                  required
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>链接</FieldLabel>
              <FieldContent>
                <Input
                  v-model="formData.url"
                  placeholder="https://..."
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
