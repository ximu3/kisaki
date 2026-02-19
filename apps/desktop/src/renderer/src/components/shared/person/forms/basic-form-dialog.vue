<!--
  PersonBasicFormDialog
  Dialog for editing person basic information.
  Uses two-layer pattern: outer handles data fetching, inner handles form state.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { persons, type PartialDate } from '@shared/db'
import { useAsyncData } from '@renderer/composables'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Field, FieldLabel, FieldContent, FieldGroup } from '@renderer/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Form } from '@renderer/components/ui/form'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Spinner } from '@renderer/components/ui/spinner'
import { notify } from '@renderer/core/notify'
import { PartialDateInput, type PartialDateInputExpose } from '@renderer/components/ui/partial-date-input'

interface Props {
  personId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const NONE_VALUE = '#none'
const GENDER_OPTIONS = [
  { value: NONE_VALUE, label: '无' },
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'other', label: '其他' }
]

// Form state
interface FormData {
  name: string
  originalName: string
  sortName: string
  gender: '' | 'male' | 'female' | 'other'
  birthDate: PartialDate | null
  deathDate: PartialDate | null
}

const formData = ref<FormData>({
  name: '',
  originalName: '',
  sortName: '',
  gender: '',
  birthDate: null,
  deathDate: null
})
const isSaving = ref(false)
const birthDateInput = ref<PartialDateInputExpose | null>(null)
const deathDateInput = ref<PartialDateInputExpose | null>(null)

// Fetch person data when dialog opens
const { data: person, isLoading } = useAsyncData(
  () => db.query.persons.findFirst({ where: eq(persons.id, props.personId) }),
  {
    watch: [() => props.personId],
    enabled: () => open.value
  }
)

// Initialize form state when data loads
watch(person, (personData) => {
  if (personData) {
    formData.value.name = personData.name || ''
    formData.value.originalName = personData.originalName || ''
    formData.value.sortName = personData.sortName || ''
    formData.value.gender = personData.gender || ''
    formData.value.birthDate = personData.birthDate ?? null
    formData.value.deathDate = personData.deathDate ?? null
  }
})

// Computed model to handle NONE_VALUE <-> empty string conversion
const genderModel = computed({
  get: () => formData.value.gender || NONE_VALUE,
  set: (v: unknown) => {
    if (v === NONE_VALUE) {
      formData.value.gender = ''
      return
    }
    if (v === 'male' || v === 'female' || v === 'other') {
      formData.value.gender = v
    }
  }
})

async function handleSubmit() {
  isSaving.value = true
  try {
    const birthDateValidation = birthDateInput.value?.validate()
    if (birthDateValidation && !birthDateValidation.valid) {
      notify.error(birthDateValidation.errorText ?? '生日格式不正确')
      return
    }
    const birthDate = birthDateValidation?.value ?? formData.value.birthDate

    const deathDateValidation = deathDateInput.value?.validate()
    if (deathDateValidation && !deathDateValidation.valid) {
      notify.error(deathDateValidation.errorText ?? '忌日格式不正确')
      return
    }
    const deathDate = deathDateValidation?.value ?? formData.value.deathDate

    await db
      .update(persons)
      .set({
        name: formData.value.name || 'unknown person',
        originalName: formData.value.originalName || null,
        sortName: formData.value.sortName || null,
        gender: formData.value.gender || null,
        birthDate,
        deathDate
      })
      .where(eq(persons.id, props.personId))

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
      <template v-if="isLoading || !person">
        <DialogBody class="flex items-center justify-center py-8">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

      <!-- Form content -->
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
                    placeholder="人物名称"
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
                <FieldLabel>性别</FieldLabel>
                <FieldContent>
                  <Select v-model="genderModel">
                    <SelectTrigger>
                      <SelectValue placeholder="选择性别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="opt in GENDER_OPTIONS"
                        :key="opt.value"
                        :value="opt.value"
                      >
                        {{ opt.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
              <div class="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>生日</FieldLabel>
                  <FieldContent>
                    <PartialDateInput
                      ref="birthDateInput"
                      v-model="formData.birthDate"
                      :messages="{ invalidIntegerText: '生日只能填写整数。' }"
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>忌日</FieldLabel>
                  <FieldContent>
                    <PartialDateInput
                      ref="deathDateInput"
                      v-model="formData.deathDate"
                      :messages="{ invalidIntegerText: '忌日只能填写整数。' }"
                    />
                  </FieldContent>
                </Field>
              </div>
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
