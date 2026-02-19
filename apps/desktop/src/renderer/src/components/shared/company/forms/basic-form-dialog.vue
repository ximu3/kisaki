<!--
  CompanyBasicFormDialog
  Dialog for editing company basic information.
  Uses two-layer pattern: outer handles data fetching, inner handles form state.
-->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { companies, type PartialDate } from '@shared/db'
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
import { Input } from '@renderer/components/ui/input'
import { Field, FieldLabel, FieldContent, FieldGroup } from '@renderer/components/ui/field'
import { Spinner } from '@renderer/components/ui/spinner'
import { notify } from '@renderer/core/notify'
import { PartialDateInput, type PartialDateInputExpose } from '@renderer/components/ui/partial-date-input'

interface Props {
  companyId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

// Form state
interface FormData {
  name: string
  originalName: string
  sortName: string
  foundedDate: PartialDate | null
}

const formData = ref<FormData>({
  name: '',
  originalName: '',
  sortName: '',
  foundedDate: null
})
const isSaving = ref(false)
const foundedDateInput = ref<PartialDateInputExpose | null>(null)

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
    formData.value.name = companyData.name || ''
    formData.value.originalName = companyData.originalName || ''
    formData.value.sortName = companyData.sortName || ''
    formData.value.foundedDate = companyData.foundedDate ?? null
  }
})

async function handleSubmit() {
  isSaving.value = true
  try {
    const foundedDateValidation = foundedDateInput.value?.validate()
    if (foundedDateValidation && !foundedDateValidation.valid) {
      notify.error(foundedDateValidation.errorText ?? '成立日期格式不正确')
      return
    }
    const foundedDate = foundedDateValidation?.value ?? formData.value.foundedDate

    await db
      .update(companies)
      .set({
        name: formData.value.name || 'unknown company',
        originalName: formData.value.originalName || null,
        sortName: formData.value.sortName || null,
        foundedDate
      })
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
    <DialogContent class="max-w-lg">
      <template v-if="isLoading || !company">
        <DialogBody class="flex items-center justify-center py-8">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

      <template v-else>
        <DialogHeader>
          <DialogTitle>编辑基本信息</DialogTitle>
        </DialogHeader>
        <Form @submit="handleSubmit">
          <DialogBody class="max-h-[60vh] overflow-auto scrollbar-thin">
            <FieldGroup>
              <Field>
                <FieldLabel>名称</FieldLabel>
                <FieldContent>
                  <Input
                    v-model="formData.name"
                    placeholder="公司名称"
                    required
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>原名</FieldLabel>
                <FieldContent>
                  <Input
                    v-model="formData.originalName"
                    placeholder="原文名称"
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>排序名</FieldLabel>
                <FieldContent>
                  <Input
                    v-model="formData.sortName"
                    placeholder="用于排序的名称"
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>成立日期</FieldLabel>
                <FieldContent>
                  <PartialDateInput
                    ref="foundedDateInput"
                    v-model="formData.foundedDate"
                    :messages="{
                      yearDayWithoutMonthText: '成立日期填写了年份和日期时，必须同时填写月份。'
                    }"
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
