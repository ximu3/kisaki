<!--
  ScraperNewProfileDialog
  Dialog for selecting media type and provider when creating a new profile.
  Step 1: Select media type
  Step 2: Select provider
-->
<script setup lang="ts">
import type { ScraperCapability } from '@shared/scraper'
import type { ContentEntityType } from '@shared/common'

import { ref, computed, watch } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { getEntityIcon } from '@renderer/utils'

type ProviderInfo = { id: string; name: string; capabilities: ScraperCapability[] }

interface Props {
  providersByType: Record<ContentEntityType, ProviderInfo[]>
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  select: [mediaType: ContentEntityType, providerId: string]
}>()

const selectedMediaType = ref<ContentEntityType | null>(null)

// Media type options
const mediaTypeOptions: { value: ContentEntityType; label: string }[] = [
  { value: 'game', label: '游戏' },
  { value: 'character', label: '角色' },
  { value: 'person', label: '人物' },
  { value: 'company', label: '公司' }
]

const currentProviders = computed<ProviderInfo[]>(() => {
  if (!selectedMediaType.value) return []
  return props.providersByType[selectedMediaType.value] ?? []
})

// Filter providers that support search capability
const searchProviders = computed(() =>
  currentProviders.value.filter((p) => p.capabilities.includes('search'))
)

// Reset state when dialog closes
watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen) {
      selectedMediaType.value = null
    }
  }
)

function handleMediaTypeSelected(mediaType: ContentEntityType) {
  selectedMediaType.value = mediaType
}

function handleProviderSelected(providerId: string) {
  if (!selectedMediaType.value) return
  emit('select', selectedMediaType.value, providerId)
  open.value = false
}

function handleBackToMediaType() {
  selectedMediaType.value = null
}

function handleClose() {
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-sm">
      <DialogHeader>
        <DialogTitle>{{ selectedMediaType ? '选择主要提供者' : '选择媒体类型' }}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <!-- Media Type Selection -->
        <template v-if="!selectedMediaType">
          <p class="text-sm text-muted-foreground mb-4">选择要创建配置的媒体类型</p>
          <div class="space-y-1">
            <button
              v-for="option in mediaTypeOptions"
              :key="option.value"
              type="button"
              class="w-full flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left"
              @click="() => handleMediaTypeSelected(option.value)"
            >
              <div class="size-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                <Icon
                  :icon="getEntityIcon(option.value)"
                  class="size-5 text-muted-foreground"
                />
              </div>
              <div class="min-w-0">
                <div class="text-sm font-medium">{{ option.label }}</div>
              </div>
            </button>
          </div>
        </template>

        <!-- Provider Selection -->
        <template v-else>
          <p class="text-sm text-muted-foreground mb-4">
            选择一个主要的数据提供者作为默认配置的基础
          </p>
          <div class="space-y-1">
            <button
              v-for="provider in searchProviders"
              :key="provider.id"
              type="button"
              class="w-full flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left"
              @click="() => handleProviderSelected(provider.id)"
            >
              <div class="size-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                <Icon
                  icon="icon-[mdi--database-outline]"
                  class="size-5 text-muted-foreground"
                />
              </div>
              <div class="min-w-0">
                <div class="text-sm font-medium">{{ provider.name }}</div>
                <div class="text-xs text-muted-foreground font-mono">{{ provider.id }}</div>
              </div>
            </button>
            <p
              v-if="searchProviders.length === 0"
              class="text-sm text-muted-foreground text-center py-4"
            >
              暂无可用的提供者
            </p>
          </div>
        </template>
      </DialogBody>
      <DialogFooter class="flex justify-between">
        <Button
          v-if="selectedMediaType"
          variant="outline"
          @click="handleBackToMediaType"
        >
          <Icon
            icon="icon-[mdi--arrow-left]"
            class="size-4 mr-1"
          />
          返回
        </Button>
        <div class="flex-1" />
        <Button
          variant="outline"
          @click="handleClose"
        >
          取消
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
