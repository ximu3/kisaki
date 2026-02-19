<!--
  CompanyMediaUrlFormDialog
  Dialog for importing company logo from a URL.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { companies } from '@shared/db'
import { attachment } from '@renderer/core/db'
import { notify } from '@renderer/core/notify'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogDescription
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldGroup,
  FieldDescription
} from '@renderer/components/ui/field'

type CompanyMediaType = 'logo'

interface Props {
  companyId: string
  mediaType: CompanyMediaType
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const MEDIA_TYPE_LABEL: Record<CompanyMediaType, string> = {
  logo: 'Logo'
}

interface FormData {
  url: string
}

const formData = ref<FormData>({
  url: ''
})
const isImporting = ref(false)
const previewError = ref(false)

watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) {
      formData.value.url = ''
      previewError.value = false
    }
  }
)

const isValidUrl = computed(
  () =>
    formData.value.url.trim().startsWith('http://') ||
    formData.value.url.trim().startsWith('https://')
)

async function handleImport() {
  if (!isValidUrl.value) {
    notify.error('请输入有效的 URL')
    return
  }

  isImporting.value = true

  try {
    await attachment.setFile(companies, props.companyId, 'logoFile', {
      kind: 'url',
      url: formData.value.url.trim()
    })

    notify.success('媒体已更新')
    open.value = false
  } finally {
    isImporting.value = false
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && isValidUrl.value && !isImporting.value) {
    handleImport()
  }
}

function handleClose() {
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle>从链接导入{{ MEDIA_TYPE_LABEL[props.mediaType] }}</DialogTitle>
        <DialogDescription>输入图片 URL 以导入公司 {{ MEDIA_TYPE_LABEL[props.mediaType] }}</DialogDescription>
      </DialogHeader>

      <DialogBody class="space-y-4">
        <FieldGroup>
          <Field>
            <FieldLabel>图片链接</FieldLabel>
            <FieldContent>
              <Input
                v-model="formData.url"
                type="url"
                placeholder="https://example.com/logo.png"
                autofocus
                @keydown="handleKeyDown"
              />
            </FieldContent>
            <FieldDescription>支持 JPG、PNG、WebP 等常见图片格式</FieldDescription>
          </Field>
        </FieldGroup>

        <div
          v-if="isValidUrl"
          class="space-y-2"
        >
          <span class="text-xs text-muted-foreground">预览:</span>
          <div
            class="relative rounded-lg border bg-muted/50 overflow-hidden flex items-center justify-center aspect-square max-w-[120px]"
          >
            <div
              v-if="previewError"
              class="flex flex-col items-center gap-1 text-muted-foreground p-4"
            >
              <Icon
                icon="icon-[mdi--image-off-outline]"
                class="size-8"
              />
              <span class="text-xs">无法加载预览</span>
            </div>
            <img
              v-else
              :src="formData.url"
              alt="Preview"
              class="size-full object-contain p-2"
              @error="previewError = true"
            />
          </div>
        </div>
      </DialogBody>

      <DialogFooter>
        <Button
          variant="outline"
          @click="handleClose"
        >
          取消
        </Button>
        <Button
          :disabled="!isValidUrl || isImporting"
          @click="handleImport"
        >
          <template v-if="isImporting">
            <Icon
              icon="icon-[mdi--loading]"
              class="size-4 animate-spin"
            />
            导入中...
          </template>
          <template v-else>
            <Icon
              icon="icon-[mdi--download]"
              class="size-4"
            />
            导入
          </template>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
