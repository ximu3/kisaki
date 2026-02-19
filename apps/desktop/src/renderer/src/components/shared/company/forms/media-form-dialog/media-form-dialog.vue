<!--
  CompanyMediaFormDialog
  Dialog for managing company media (logo).
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { db, attachment } from '@renderer/core/db'
import { ipcManager } from '@renderer/core/ipc'
import { notify } from '@renderer/core/notify'
import { getOpenImageDialogOptions } from '@renderer/utils/dialog'
import { companies, type Company } from '@shared/db'
import { useAsyncData, useEvent } from '@renderer/composables'
import { cn } from '@renderer/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Spinner } from '@renderer/components/ui/spinner'
import { DeleteConfirmDialog } from '@renderer/components/ui/delete-confirm-dialog'
import CompanyMediaSearchFormDialog from './media-search-form-dialog.vue'
import CompanyMediaCropFormDialog from './media-crop-form-dialog.vue'
import CompanyMediaUrlFormDialog from './media-url-form-dialog.vue'

interface Props {
  companyId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

type CompanyMediaType = 'logo'

interface MediaTypeConfig {
  type: CompanyMediaType
  label: string
  description: string
  aspectRatio: string
  field: 'logoFile'
}

const MEDIA_TYPES: MediaTypeConfig[] = [
  {
    type: 'logo',
    label: 'Logo',
    description: '公司 Logo，用于卡片和详情显示',
    aspectRatio: 'aspect-square',
    field: 'logoFile'
  }
]

// Content state
const company = ref<Company | null>(null)
const selectedType = ref<CompanyMediaType>('logo')

// Sub-dialog states
const showSearchDialog = ref(false)
const showCropDialog = ref(false)
const showUrlDialog = ref(false)
const showDeleteConfirm = ref(false)

// Loading states
const isImportingFile = ref(false)

// Fetch company when dialog opens
const {
  data: fetchedCompany,
  isLoading,
  refetch
} = useAsyncData(() => db.query.companies.findFirst({ where: eq(companies.id, props.companyId) }), {
  watch: [() => props.companyId],
  enabled: () => open.value
})

watch(fetchedCompany, (data) => {
  company.value = data ?? null
})

useEvent('db:updated', ({ table, id }) => {
  if (table === 'companies' && id === props.companyId) {
    refetch()
  }
})

const selectedConfig = computed(() => MEDIA_TYPES.find((m) => m.type === selectedType.value)!)

const currentFile = computed(() => {
  if (!company.value) return null
  return company.value[selectedConfig.value.field]
})
const hasImage = computed(() => !!currentFile.value)

async function handleImportFile() {
  isImportingFile.value = true

  try {
    const dialogResult = await ipcManager.invoke(
      'native:open-dialog',
      getOpenImageDialogOptions()
    )
    if (!dialogResult.success) {
      notify.error(dialogResult.error || '选择文件失败')
      return
    }
    if (!dialogResult.data || dialogResult.data.canceled || !dialogResult.data.filePaths[0]) {
      return
    }

    await attachment.setFile(companies, props.companyId, selectedConfig.value.field, {
      kind: 'path',
      path: dialogResult.data.filePaths[0]
    })

    notify.success('媒体已更新')
  } finally {
    isImportingFile.value = false
  }
}

async function handleDelete() {
  await attachment.clearFile(companies, props.companyId, selectedConfig.value.field)
  notify.success('媒体已删除')
}

function handleClose() {
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-2xl">
      <!-- Loading state -->
      <template v-if="isLoading || !company">
        <DialogBody class="flex items-center justify-center py-8">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

      <!-- Form content -->
      <template v-else>
        <DialogHeader>
          <DialogTitle>媒体管理</DialogTitle>
        </DialogHeader>

        <DialogBody class="flex gap-4">
          <!-- Media Type Selector - Left Sidebar -->
          <div class="w-28 shrink-0 space-y-1">
            <button
              v-for="media in MEDIA_TYPES"
              :key="media.type"
              :class="
                cn(
                  'w-full flex flex-col items-center gap-1.5 p-2 rounded-md text-left transition-colors',
                  selectedType === media.type
                    ? 'bg-primary/20 text-primary'
                    : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                )
              "
              @click="selectedType = media.type"
            >
              <!-- Thumbnail -->
              <div
                :class="
                  cn(
                    'w-full rounded border bg-muted flex items-center justify-center overflow-hidden',
                    media.aspectRatio
                  )
                "
              >
                <img
                  v-if="company[media.field]"
                  :src="`attachment://companies/${company.id}/${company[media.field]}`"
                  :alt="media.label"
                  class="size-full object-cover"
                />
                <Icon
                  v-else
                  icon="icon-[mdi--image-off-outline]"
                  class="size-4 text-muted-foreground/50"
                />
              </div>
              <span class="text-xs font-medium">{{ media.label }}</span>
            </button>
          </div>

          <!-- Preview and Actions - Right Panel -->
          <div class="flex-1 min-w-0 space-y-4">
            <!-- Preview -->
            <div
              :class="
                cn(
                  'w-full rounded-lg border bg-muted/50 flex items-center justify-center overflow-hidden',
                  selectedConfig.aspectRatio,
                  'max-h-[300px]'
                )
              "
            >
              <img
                v-if="hasImage && currentFile"
                :src="`attachment://companies/${company.id}/${currentFile}`"
                :alt="selectedConfig.label"
                class="size-full object-contain"
              />
              <div
                v-else
                class="flex flex-col items-center gap-2 text-muted-foreground"
              >
                <Icon
                  icon="icon-[mdi--image-off-outline]"
                  class="size-12"
                />
                <span class="text-sm">暂无{{ selectedConfig.label }}</span>
              </div>
            </div>

            <!-- Description -->
            <p class="text-xs text-muted-foreground">{{ selectedConfig.description }}</p>

            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                :disabled="isImportingFile"
                @click="handleImportFile"
              >
                <Icon
                  v-if="isImportingFile"
                  icon="icon-[mdi--loading]"
                  class="size-4 animate-spin"
                />
                <Icon
                  v-else
                  icon="icon-[mdi--upload]"
                  class="size-4"
                />
                从文件导入
              </Button>

              <Button
                variant="outline"
                size="sm"
                @click="showUrlDialog = true"
              >
                <Icon
                  icon="icon-[mdi--link-variant]"
                  class="size-4"
                />
                从链接导入
              </Button>

              <Button
                variant="outline"
                size="sm"
                @click="showSearchDialog = true"
              >
                <Icon
                  icon="icon-[mdi--magnify]"
                  class="size-4"
                />
                搜索图片
              </Button>

              <template v-if="hasImage && currentFile">
                <Button
                  variant="outline"
                  size="sm"
                  @click="showCropDialog = true"
                >
                  <Icon
                    icon="icon-[mdi--crop]"
                    class="size-4"
                  />
                  裁剪
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  class="text-destructive hover:text-destructive"
                  @click="showDeleteConfirm = true"
                >
                  <Icon
                    icon="icon-[mdi--delete-outline]"
                    class="size-4"
                  />
                  删除
                </Button>
              </template>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="outline"
            @click="handleClose"
          >
            关闭
          </Button>
        </DialogFooter>
      </template>
    </DialogContent>
  </Dialog>

  <!-- Search Dialog -->
  <CompanyMediaSearchFormDialog
    v-if="showSearchDialog"
    v-model:open="showSearchDialog"
    :company-id="props.companyId"
    :media-type="selectedType"
  />

  <!-- Crop Dialog -->
  <CompanyMediaCropFormDialog
    v-if="showCropDialog && hasImage && currentFile"
    v-model:open="showCropDialog"
    :company-id="props.companyId"
    :media-type="selectedType"
    :current-file-name="currentFile"
  />

  <!-- URL Import Dialog -->
  <CompanyMediaUrlFormDialog
    v-if="showUrlDialog"
    v-model:open="showUrlDialog"
    :company-id="props.companyId"
    :media-type="selectedType"
  />

  <!-- Delete Confirmation -->
  <DeleteConfirmDialog
    v-if="showDeleteConfirm"
    v-model:open="showDeleteConfirm"
    entity-label="图片"
    entity-name="Logo"
    @confirm="handleDelete"
  />
</template>
