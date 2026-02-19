<!--
  GameCompaniesItemFormDialog
  Dialog for adding/editing a company link with type and note.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { db } from '@renderer/core/db'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { Field, FieldLabel, FieldContent, FieldGroup } from '@renderer/components/ui/field'
import { Form } from '@renderer/components/ui/form'
import { CompanySelect } from '@renderer/components/shared/company'
import { notify } from '@renderer/core/notify'

type CompanyType = 'developer' | 'publisher' | 'distributor' | 'other'

interface CompanyLinkData {
  companyId: string
  companyName: string
  type: CompanyType
  note: string
  isSpoiler: boolean
}

interface Props {
  initialData?: CompanyLinkData
  excludeIds: string[]
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  submit: [data: CompanyLinkData]
}>()

const COMPANY_TYPE_OPTIONS: { value: CompanyType; label: string }[] = [
  { value: 'developer', label: '开发' },
  { value: 'publisher', label: '发行' },
  { value: 'distributor', label: '分销' },
  { value: 'other', label: '其他' }
]

// Form state
const formData = ref<CompanyLinkData>({
  companyId: '',
  companyName: '',
  type: 'developer',
  note: '',
  isSpoiler: false
})

const isAddMode = computed(() => !props.initialData)

// Initialize form state when dialog opens
watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) {
      if (props.initialData) {
        formData.value.companyId = props.initialData.companyId
        formData.value.companyName = props.initialData.companyName
        formData.value.type = props.initialData.type
        formData.value.note = props.initialData.note
        formData.value.isSpoiler = props.initialData.isSpoiler
      } else {
        formData.value.companyId = ''
        formData.value.companyName = ''
        formData.value.type = 'developer'
        formData.value.note = ''
        formData.value.isSpoiler = false
      }
    }
  },
  { immediate: true }
)

const selectExcludeIds = computed(() => {
  if (isAddMode.value) {
    return props.excludeIds
  }
  return props.excludeIds.filter((id) => id !== formData.value.companyId)
})

// Watch for company selection change - async side effect to fetch company name
watch(
  () => formData.value.companyId,
  async (companyId) => {
    if (!companyId) {
      formData.value.companyName = ''
      return
    }
    const company = await db.query.companies.findFirst({
      where: (c, { eq }) => eq(c.id, companyId)
    })
    if (company) {
      formData.value.companyName = company.name
    }
  }
)

function handleSubmit() {
  if (!formData.value.companyId) {
    notify.error('请选择公司')
    return
  }

  emit('submit', {
    companyId: formData.value.companyId,
    companyName: formData.value.companyName || 'Unknown',
    type: formData.value.type,
    note: formData.value.note.trim(),
    isSpoiler: formData.value.isSpoiler
  })
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
        <DialogTitle>{{ isAddMode ? '添加公司' : '编辑公司' }}</DialogTitle>
      </DialogHeader>
      <Form @submit="handleSubmit">
        <DialogBody>
          <FieldGroup>
            <Field>
              <FieldLabel>公司</FieldLabel>
              <FieldContent>
                <CompanySelect
                  v-model="formData.companyId"
                  :exclude-ids="selectExcludeIds"
                  placeholder="选择公司..."
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>公司类型</FieldLabel>
              <FieldContent>
                <Select v-model="formData.type">
                  <SelectTrigger
                    class="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="opt in COMPANY_TYPE_OPTIONS"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>备注</FieldLabel>
              <FieldContent>
                <Input
                  v-model="formData.note"
                  placeholder="可选备注..."
                />
              </FieldContent>
            </Field>
            <Field orientation="horizontal">
              <FieldLabel>包含剧透</FieldLabel>
              <FieldContent>
                <Checkbox
                  v-model="formData.isSpoiler"
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
          <Button type="submit">保存</Button>
        </DialogFooter>
      </Form>
    </DialogContent>
  </Dialog>
</template>
