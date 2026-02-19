<!--
  CompanyRelatedSitesFormDialog
  Dialog for editing company related sites/links.
  Uses two-layer pattern: outer handles data fetching, inner handles form state.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
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
import { Button } from '@renderer/components/ui/button'
import { Spinner } from '@renderer/components/ui/spinner'
import { DeleteConfirmDialog } from '@renderer/components/ui/delete-confirm-dialog'
import { notify } from '@renderer/core/notify'
import CompanyRelatedSitesItem from './related-site-item.vue'
import CompanyRelatedSitesItemFormDialog from './related-site-item-form-dialog.vue'

interface RelatedSite {
  label: string
  url: string
}

interface Props {
  companyId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

// Form state
const sites = ref<RelatedSite[]>([])
const deleteIndex = ref<number | null>(null)
const formOpen = ref(false)
const editingIndex = ref<number | null>(null)
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
    sites.value = companyData.relatedSites ? [...companyData.relatedSites] : []
  }
})

async function handleSave() {
  isSaving.value = true
  try {
    const validSites = sites.value.filter((s) => s.label.trim() && s.url.trim())
    await db
      .update(companies)
      .set({ relatedSites: validSites.length > 0 ? validSites : null })
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

function handleAddClick() {
  editingIndex.value = null
  formOpen.value = true
}

function handleEditClick(index: number) {
  editingIndex.value = index
  formOpen.value = true
}

function handleFormSubmit(data: RelatedSite) {
  if (editingIndex.value !== null) {
    sites.value[editingIndex.value] = data
  } else {
    sites.value.push(data)
  }
}

function handleDeleteConfirm() {
  if (deleteIndex.value !== null) {
    sites.value.splice(deleteIndex.value, 1)
    deleteIndex.value = null
  }
}

const editingData = computed(() =>
  editingIndex.value !== null ? sites.value[editingIndex.value] : undefined
)

const deleteDialogOpen = computed({
  get: () => deleteIndex.value !== null,
  set: (v) => {
    if (!v) deleteIndex.value = null
  }
})
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
          <DialogTitle>编辑相关链接</DialogTitle>
        </DialogHeader>
        <DialogBody class="overflow-auto max-h-[60vh] scrollbar-thin">
          <div class="space-y-1">
            <p
              v-if="sites.length === 0"
              class="text-sm text-muted-foreground text-center py-8"
            >
              暂无相关链接，点击下方按钮添加
            </p>
            <CompanyRelatedSitesItem
              v-for="(site, index) in sites"
              :key="index"
              :site="site"
              :index="index"
              @edit="handleEditClick"
              @delete="(i) => (deleteIndex = i)"
            />
          </div>
        </DialogBody>
        <DialogFooter class="flex justify-between">
          <Button
            variant="outline"
            @click="handleAddClick"
          >
            <Icon
              icon="icon-[mdi--plus]"
              class="size-4 mr-1.5"
            />
            添加链接
          </Button>
          <div class="flex gap-2">
            <Button
              variant="outline"
              @click="open = false"
            >
              取消
            </Button>
            <Button
              :disabled="isSaving"
              @click="handleSave"
            >
              保存
            </Button>
          </div>
        </DialogFooter>
      </template>
    </DialogContent>
  </Dialog>

  <CompanyRelatedSitesItemFormDialog
    v-if="formOpen"
    v-model:open="formOpen"
    :initial-data="editingData"
    @submit="handleFormSubmit"
  />

  <DeleteConfirmDialog
    v-model:open="deleteDialogOpen"
    entity-label="链接"
    @confirm="handleDeleteConfirm"
  />
</template>
