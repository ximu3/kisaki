<!--
  CompanyDescriptionFormDialog
  Dialog for editing company description.
  Uses two-layer pattern: outer handles data fetching, inner handles form state.
-->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { companies } from '@shared/db'
import { useAsyncData } from '@renderer/composables'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Form } from '@renderer/components/ui/form'
import { Button } from '@renderer/components/ui/button'
import { MarkdownEditor } from '@renderer/components/ui/markdown'
import { Field, FieldLabel, FieldContent, FieldGroup } from '@renderer/components/ui/field'
import { Spinner } from '@renderer/components/ui/spinner'
import { notify } from '@renderer/core/notify'

interface Props {
  companyId: string
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

// Fetch company data when dialog opens
const { data: company, isLoading } = useAsyncData(
  () => db.query.companies.findFirst({ where: eq(companies.id, props.companyId) }),
  {
    watch: [() => props.companyId],
    enabled: () => open.value
  }
)

// Initialize form state when data loads
watch(company, (companyData) => {
  if (companyData) {
    formData.value.description = companyData.description || ''
  }
})

async function handleSubmit() {
  isSaving.value = true
  try {
    await db
      .update(companies)
      .set({ description: formData.value.description.trim() || null })
      .where(eq(companies.id, props.companyId))
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
    <DialogContent class="max-w-2xl">
      <template v-if="isLoading || !company">
        <DialogBody class="flex items-center justify-center py-8">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

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
                    placeholder="输入公司简介 (支持 Markdown)..."
                    min-height="300px"
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
