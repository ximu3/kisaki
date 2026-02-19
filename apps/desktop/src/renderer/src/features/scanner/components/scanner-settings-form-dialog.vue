<script setup lang="ts">
/**
 * Scanner Settings Form Dialog
 *
 * Dialog for configuring scanner settings.
 * Allows editing ignored names list, pHash assist option and auto-scan on startup option.
 */

import { ref, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { Icon } from '@renderer/components/ui/icon'
import { settings } from '@shared/db'
import { notify } from '@renderer/core/notify'
import { useAsyncData, useRenderState } from '@renderer/composables'
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
import { Badge } from '@renderer/components/ui/badge'
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

// =============================================================================
// Model
// =============================================================================

const open = defineModel<boolean>('open', { required: true })

// =============================================================================
// State
// =============================================================================

const isSaving = ref(false)
interface FormData {
  ignoredNames: string[]
  usePhash: boolean
  startAtOpen: boolean
  newIgnoredName: string
}

const formData = ref<FormData>({
  ignoredNames: [],
  usePhash: true,
  startAtOpen: true,
  newIgnoredName: ''
})

// =============================================================================
// Load Data on Open
// =============================================================================

const { data, isLoading, error } = useAsyncData(
  async () => {
    const result = await db.query.settings.findFirst()
    if (!result) {
      throw new Error('Settings not found')
    }
    return {
      ignoredNames: result.scannerIgnoredNames,
      usePhash: result.scannerUsePhash,
      startAtOpen: result.scannerStartAtOpen
    }
  },
  { enabled: open }
)
const state = useRenderState(isLoading, error, data)

// Initialize form when data loads
watch(data, (d) => {
  if (d) {
    formData.value.ignoredNames = d.ignoredNames
    formData.value.usePhash = d.usePhash
    formData.value.startAtOpen = d.startAtOpen
  }
})

// =============================================================================
// Handlers
// =============================================================================

function handleAddIgnoredName() {
  const trimmedName = formData.value.newIgnoredName.trim()
  if (trimmedName && !formData.value.ignoredNames.includes(trimmedName)) {
    formData.value.ignoredNames = [...formData.value.ignoredNames, trimmedName]
    formData.value.newIgnoredName = ''
  }
}

function handleRemoveIgnoredName(name: string) {
  formData.value.ignoredNames = formData.value.ignoredNames.filter((n) => n !== name)
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleAddIgnoredName()
  }
}

async function handleSubmit() {
  isSaving.value = true
  try {
    await db
      .update(settings)
      .set({
        scannerIgnoredNames: formData.value.ignoredNames,
        scannerUsePhash: formData.value.usePhash,
        scannerStartAtOpen: formData.value.startAtOpen
      })
      .where(eq(settings.id, 0))
    notify.success('设置已保存')
    open.value = false
  } catch {
    notify.error('保存失败，请重试')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle>扫描器设置</DialogTitle>
      </DialogHeader>

      <template v-if="state === 'loading'">
        <DialogBody class="flex items-center justify-center py-8">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

      <template v-else>
        <Form @submit="handleSubmit">
          <DialogBody class="max-h-[60vh] overflow-auto scrollbar-thin">
            <FieldGroup>
              <!-- Auto scan on startup -->
              <Field orientation="horizontal">
                <FieldLabel>启动时自动扫描</FieldLabel>
                <FieldDescription>打开应用时自动运行所有扫描器</FieldDescription>
                <FieldContent>
                  <Switch v-model="formData.startAtOpen" />
                </FieldContent>
              </Field>

              <!-- pHash assist -->
              <Field orientation="horizontal">
                <FieldLabel>pHash 辅助刮削</FieldLabel>
                <FieldDescription>实验性功能</FieldDescription>
                <FieldContent>
                  <Switch v-model="formData.usePhash" />
                </FieldContent>
              </Field>

              <!-- Ignored names -->
              <Field>
                <FieldLabel>忽略名称列表</FieldLabel>
                <FieldDescription>扫描器会跳过这些名称的文件夹</FieldDescription>
                <FieldContent>
                  <!-- Input for adding new name -->
                  <div class="flex gap-2">
                    <Input
                      v-model="formData.newIgnoredName"
                      placeholder="输入要忽略的名称..."
                      class="flex-1"
                      @keydown="handleKeyDown"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      :disabled="!formData.newIgnoredName.trim()"
                      @click="handleAddIgnoredName"
                    >
                      <Icon
                        icon="icon-[mdi--plus]"
                        class="size-4"
                      />
                      添加
                    </Button>
                  </div>

                  <!-- Ignored names tags -->
                  <div
                    v-if="formData.ignoredNames.length > 0"
                    class="flex flex-wrap gap-1.5 mt-1.5 max-h-32 overflow-auto scrollbar-thin pr-1"
                  >
                    <Badge
                      v-for="name in formData.ignoredNames"
                      :key="name"
                      variant="secondary"
                      class="gap-1 text-xs pr-0.5"
                      :title="name"
                    >
                      <span class="truncate max-w-[150px]">{{ name }}</span>
                      <Button
                        size="icon-xs"
                        variant="text"
                        type="button"
                        @click="handleRemoveIgnoredName(name)"
                      >
                        <Icon
                          icon="icon-[mdi--close]"
                          class="size-3"
                        />
                      </Button>
                    </Badge>
                  </div>

                  <p
                    v-else
                    class="text-xs text-muted-foreground mt-2"
                  >
                    暂无忽略名称
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
