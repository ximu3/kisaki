<!--
  GamePersonsItemFormDialog
  Dialog for adding/editing a person link with type and note.
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
import { PersonSelect } from '@renderer/components/shared/person'
import { notify } from '@renderer/core/notify'

type PersonType =
  | 'director'
  | 'scenario'
  | 'illustration'
  | 'music'
  | 'programmer'
  | 'actor'
  | 'other'

interface PersonLinkData {
  personId: string
  personName: string
  type: PersonType
  note: string
  isSpoiler: boolean
}

interface Props {
  initialData?: PersonLinkData
  excludeIds: string[]
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  submit: [data: PersonLinkData]
}>()

const PERSON_TYPE_OPTIONS: { value: PersonType; label: string }[] = [
  { value: 'director', label: '导演' },
  { value: 'scenario', label: '剧本' },
  { value: 'illustration', label: '原画' },
  { value: 'music', label: '音乐' },
  { value: 'programmer', label: '程序' },
  { value: 'actor', label: '声优' },
  { value: 'other', label: '其他' }
]

// Form state
const formData = ref<PersonLinkData>({
  personId: '',
  personName: '',
  type: 'director',
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
        formData.value.personId = props.initialData.personId
        formData.value.personName = props.initialData.personName
        formData.value.type = props.initialData.type
        formData.value.note = props.initialData.note
        formData.value.isSpoiler = props.initialData.isSpoiler
      } else {
        formData.value.personId = ''
        formData.value.personName = ''
        formData.value.type = 'director'
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
  return props.excludeIds.filter((id) => id !== formData.value.personId)
})

// Watch for person selection change - async side effect to fetch person name
watch(
  () => formData.value.personId,
  async (personId) => {
    if (!personId) {
      formData.value.personName = ''
      return
    }
    const person = await db.query.persons.findFirst({
      where: (p, { eq }) => eq(p.id, personId)
    })
    if (person) {
      formData.value.personName = person.name
    }
  }
)

function handleSubmit() {
  if (!formData.value.personId) {
    notify.error('请选择人物')
    return
  }

  emit('submit', {
    personId: formData.value.personId,
    personName: formData.value.personName || 'Unknown',
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
        <DialogTitle>{{ isAddMode ? '添加人物' : '编辑人物' }}</DialogTitle>
      </DialogHeader>
      <Form @submit="handleSubmit">
        <DialogBody>
          <FieldGroup>
            <Field>
              <FieldLabel>人物</FieldLabel>
              <FieldContent>
                <PersonSelect
                  v-model="formData.personId"
                  :exclude-ids="selectExcludeIds"
                  placeholder="选择人物..."
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>人物类型</FieldLabel>
              <FieldContent>
                <Select v-model="formData.type">
                  <SelectTrigger
                    class="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="opt in PERSON_TYPE_OPTIONS"
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
