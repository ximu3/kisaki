<script setup lang="ts">
/**
 * Scanner Name Extraction Rules Item Form Dialog
 *
 * Simple form for editing single rule (description + pattern).
 */

import { ref, watch } from 'vue'
import { nanoid } from 'nanoid'
import type { NameExtractionRule } from '@shared/db'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Field, FieldLabel, FieldContent, FieldGroup } from '@renderer/components/ui/field'
import { Form } from '@renderer/components/ui/form'

// =============================================================================
// Props & Model & Emits
// =============================================================================

interface Props {
  rule: NameExtractionRule | null
  isNew: boolean
}

const props = defineProps<Props>()
const open = defineModel<boolean>('open', { required: true })

interface Emits {
  (e: 'save', rule: NameExtractionRule): void
}

const emit = defineEmits<Emits>()

// =============================================================================
// State
// =============================================================================

interface FormData {
  description: string
  pattern: string
}

const formData = ref<FormData>({
  description: '',
  pattern: ''
})

// =============================================================================
// Initialize on Open
// =============================================================================

watch(
  () => open.value,
  (isOpen) => {
    if (isOpen && props.rule) {
      formData.value.description = props.rule.description
      formData.value.pattern = props.rule.pattern
    }
  },
  { immediate: true }
)

// =============================================================================
// Handlers
// =============================================================================

function handleSubmit() {
  if (!formData.value.description.trim() || !formData.value.pattern.trim()) return

  emit('save', {
    id: props.rule?.id || nanoid(),
    description: formData.value.description.trim(),
    pattern: formData.value.pattern.trim(),
    enabled: props.rule?.enabled ?? true
  })
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ props.isNew ? '添加规则' : '编辑规则' }}</DialogTitle>
      </DialogHeader>
      <Form @submit="handleSubmit">
        <DialogBody>
          <FieldGroup>
            <Field>
              <FieldLabel>描述</FieldLabel>
              <FieldContent>
                <Input
                  v-model="formData.description"
                  placeholder="例如: 移除方括号前缀"
                  required
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>正则表达式</FieldLabel>
              <FieldContent>
                <Input
                  v-model="formData.pattern"
                  placeholder="例如: ^\[.*?\]\s*(?<name>.+)"
                  class="font-mono text-sm"
                  required
                />
                <p class="text-xs text-muted-foreground mt-1">
                  使用命名捕获组 <code class="text-primary">(?&lt;name&gt;...)</code>
                  来指定要提取的名称
                </p>
              </FieldContent>
            </Field>
          </FieldGroup>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            @click="open = false"
          >
            取消
          </Button>
          <Button type="submit">确定</Button>
        </DialogFooter>
      </Form>
    </DialogContent>
  </Dialog>
</template>
