<!--
  TagInfoFormDialog
  Dialog for editing tag information.
  Uses two-layer pattern: outer handles data fetching, inner handles form state.
-->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { tags } from '@shared/db'
import { useAsyncData } from '@renderer/composables'
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
import { MarkdownEditor } from '@renderer/components/ui/markdown'
import { Switch } from '@renderer/components/ui/switch'
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
  tagId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const { data: tag, isLoading } = useAsyncData(
  () => db.query.tags.findFirst({ where: eq(tags.id, props.tagId) }),
  {
    watch: [() => props.tagId],
    enabled: () => open.value
  }
)

// Form state
interface FormData {
  name: string
  description: string
  isNsfw: boolean
}

const formData = ref<FormData>({
  name: '',
  description: '',
  isNsfw: false
})
const isSaving = ref(false)

// Initialize form when dialog opens and data is loaded
watch(
  () => open.value,
  (isOpen) => {
    if (isOpen && tag.value) {
      formData.value.name = tag.value.name || ''
      formData.value.description = tag.value.description || ''
      formData.value.isNsfw = tag.value.isNsfw || false
    }
  },
  { immediate: true }
)

// Also watch for tag data loading after dialog is already open
watch(
  () => tag.value,
  (tagData) => {
    if (open.value && tagData) {
      formData.value.name = tagData.name || ''
      formData.value.description = tagData.description || ''
      formData.value.isNsfw = tagData.isNsfw || false
    }
  }
)

async function handleSubmit() {
  isSaving.value = true
  try {
    await db
      .update(tags)
      .set({
        name: formData.value.name || 'unknown tag',
        description: formData.value.description.trim() || null,
        isNsfw: formData.value.isNsfw
      })
      .where(eq(tags.id, props.tagId))
    notify.success('已保存')
    open.value = false
  } catch (error) {
    console.error('Update failed:', error)
    notify.error('保存失败，请重试')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-xl">
      <!-- Loading state -->
      <DialogBody
        v-if="isLoading || !tag"
        class="flex items-center justify-center py-8"
      >
        <Spinner class="size-8" />
      </DialogBody>

      <!-- Form content -->
      <template v-else>
        <DialogHeader>
          <DialogTitle>编辑标签</DialogTitle>
        </DialogHeader>
        <Form @submit="handleSubmit">
          <DialogBody class="max-h-[60vh] overflow-auto scrollbar-thin">
              <FieldGroup>
              <Field>
                <FieldLabel>名称</FieldLabel>
                <FieldContent>
                  <Input
                    v-model="formData.name"
                    placeholder="标签名称"
                    required
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>描述</FieldLabel>
                <FieldContent>
                  <MarkdownEditor
                    v-model="formData.description"
                    placeholder="标签描述（可选，支持 Markdown）"
                    min-height="140px"
                    max-height="200px"
                  />
                </FieldContent>
              </Field>
              <Field orientation="horizontal">
                <FieldLabel>NSFW</FieldLabel>
                <FieldDescription>标记此标签为成人内容</FieldDescription>
                <FieldContent>
                  <Switch
                    v-model="formData.isNsfw"
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
              @click="open = false"
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
