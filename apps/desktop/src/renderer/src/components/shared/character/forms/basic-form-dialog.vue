<!--
  CharacterBasicFormDialog
  Dialog for editing character basic information.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { characters, type CupSize, type PartialDate } from '@shared/db'
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
  characterId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

interface FormData {
  name: string
  originalName: string
  sortName: string
  gender: '' | 'male' | 'female' | 'other'
  birthDate: PartialDate | null
  bloodType: '' | 'a' | 'b' | 'o' | 'ab'
  height: string
  weight: string
  bust: string
  waist: string
  hips: string
  cup: '' | CupSize
  age: string
}

const NONE_VALUE = '#none'
const GENDER_OPTIONS = [
  { value: NONE_VALUE, label: '无' },
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'other', label: '其他' }
]
const BLOOD_TYPE_OPTIONS = [
  { value: NONE_VALUE, label: '无' },
  { value: 'a', label: 'A型' },
  { value: 'b', label: 'B型' },
  { value: 'o', label: 'O型' },
  { value: 'ab', label: 'AB型' }
]
const CUP_SIZE_OPTIONS = [
  { value: NONE_VALUE, label: '无' },
  { value: 'aaa', label: 'AAA' },
  { value: 'aa', label: 'AA' },
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
  { value: 'c', label: 'C' },
  { value: 'd', label: 'D' },
  { value: 'e', label: 'E' },
  { value: 'f', label: 'F' },
  { value: 'g', label: 'G' },
  { value: 'h', label: 'H' },
  { value: 'i', label: 'I' },
  { value: 'j', label: 'J' },
  { value: 'k', label: 'K' }
]

// Form state
const formData = ref<FormData>({
  name: '',
  originalName: '',
  sortName: '',
  gender: '',
  birthDate: null,
  bloodType: '',
  height: '',
  weight: '',
  bust: '',
  waist: '',
  hips: '',
  cup: '',
  age: ''
})
const isSaving = ref(false)
const birthDateInput = ref<PartialDateInputExpose | null>(null)

// Fetch character data when dialog opens
const { data: character, isLoading } = useAsyncData(
  () => db.query.characters.findFirst({ where: eq(characters.id, props.characterId) }),
  {
    watch: [() => props.characterId],
    enabled: () => open.value
  }
)

// Initialize form state when data loads
watch(character, (characterData) => {
  if (characterData) {
    formData.value = {
      name: characterData.name || '',
      originalName: characterData.originalName || '',
      sortName: characterData.sortName || '',
      gender: characterData.gender || '',
      birthDate: characterData.birthDate ?? null,
      bloodType: characterData.bloodType || '',
      height: characterData.height?.toString() || '',
      weight: characterData.weight?.toString() || '',
      bust: characterData.bust?.toString() || '',
      waist: characterData.waist?.toString() || '',
      hips: characterData.hips?.toString() || '',
      cup: characterData.cup || '',
      age: characterData.age?.toString() || ''
    }
  }
})

// Computed models to handle NONE_VALUE <-> empty string conversion
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

const bloodTypeModel = computed({
  get: () => formData.value.bloodType || NONE_VALUE,
  set: (v: unknown) => {
    if (v === NONE_VALUE) {
      formData.value.bloodType = ''
      return
    }
    if (v === 'a' || v === 'b' || v === 'o' || v === 'ab') {
      formData.value.bloodType = v
    }
  }
})

const cupModel = computed({
  get: () => formData.value.cup || NONE_VALUE,
  set: (v: unknown) => {
    if (v === NONE_VALUE) {
      formData.value.cup = ''
      return
    }
    if (typeof v === 'string' && isCupSize(v)) {
      formData.value.cup = v
    }
  }
})

function isCupSize(value: string): value is CupSize {
  return value !== NONE_VALUE && CUP_SIZE_OPTIONS.some((o) => o.value === value)
}

async function handleSubmit() {
  isSaving.value = true
  try {
    const birthDateValidation = birthDateInput.value?.validate()
    if (birthDateValidation && !birthDateValidation.valid) {
      notify.error(birthDateValidation.errorText ?? '生日格式不正确')
      return
    }
    const birthDate = birthDateValidation?.value ?? formData.value.birthDate

    await db
      .update(characters)
      .set({
        name: formData.value.name || 'unknown character',
        originalName: formData.value.originalName || null,
        sortName: formData.value.sortName || null,
        gender: formData.value.gender || null,
        birthDate,
        bloodType: formData.value.bloodType || null,
        height: formData.value.height ? parseInt(formData.value.height, 10) : null,
        weight: formData.value.weight ? parseInt(formData.value.weight, 10) : null,
        bust: formData.value.bust ? parseInt(formData.value.bust, 10) : null,
        waist: formData.value.waist ? parseInt(formData.value.waist, 10) : null,
        hips: formData.value.hips ? parseInt(formData.value.hips, 10) : null,
        cup: formData.value.cup || null,
        age: formData.value.age ? parseInt(formData.value.age, 10) : null
      })
      .where(eq(characters.id, props.characterId))

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
      <template v-if="isLoading || !character">
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
                    placeholder="角色名称"
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
              <div class="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>性别</FieldLabel>
                  <FieldContent>
                    <Select v-model="genderModel">
                      <SelectTrigger
                        class="w-full"
                      >
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
                <Field>
                  <FieldLabel>年龄</FieldLabel>
                  <FieldContent>
                    <Input
                      v-model="formData.age"
                      type="number"
                      min="0"
                      placeholder="岁"
                    />
                  </FieldContent>
                </Field>
              </div>
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
                  <FieldLabel>血型</FieldLabel>
                  <FieldContent>
                    <Select v-model="bloodTypeModel">
                      <SelectTrigger
                        class="w-full"
                      >
                        <SelectValue placeholder="选择血型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          v-for="opt in BLOOD_TYPE_OPTIONS"
                          :key="opt.value"
                          :value="opt.value"
                        >
                          {{ opt.label }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>身高</FieldLabel>
                  <FieldContent>
                    <Input
                      v-model="formData.height"
                      type="number"
                      min="0"
                      placeholder="cm"
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>体重</FieldLabel>
                  <FieldContent>
                    <Input
                      v-model="formData.weight"
                      type="number"
                      min="0"
                      placeholder="kg"
                    />
                  </FieldContent>
                </Field>
              </div>
              <div class="grid grid-cols-4 gap-4">
                <Field>
                  <FieldLabel>B</FieldLabel>
                  <FieldContent>
                    <Input
                      v-model="formData.bust"
                      type="number"
                      min="0"
                      placeholder="cm"
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>W</FieldLabel>
                  <FieldContent>
                    <Input
                      v-model="formData.waist"
                      type="number"
                      min="0"
                      placeholder="cm"
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>H</FieldLabel>
                  <FieldContent>
                    <Input
                      v-model="formData.hips"
                      type="number"
                      min="0"
                      placeholder="cm"
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>罩杯</FieldLabel>
                  <FieldContent>
                    <Select v-model="cupModel">
                      <SelectTrigger
                        class="w-full"
                      >
                        <SelectValue placeholder="罩杯" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          v-for="opt in CUP_SIZE_OPTIONS"
                          :key="opt.value"
                          :value="opt.value"
                        >
                          {{ opt.label }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
