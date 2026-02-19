<script setup lang="ts">
/**
 * Scanner List Item
 *
 * Row component for scanner list displaying scanner info,
 * progress, status, and action buttons.
 */

import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { eq, and } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { Icon } from '@renderer/components/ui/icon'
import { scanners as scannersTable, collections, scraperProfiles, type Scanner } from '@shared/db'
import { ipcManager } from '@renderer/core/ipc'
import { useScannerStore } from '@renderer/stores'
import { useAsyncData } from '@renderer/composables/use-async-data'
import { cn } from '@renderer/utils/cn'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@renderer/components/ui/alert-dialog'
import { ScannerItemFormDialog } from './scanner-item-form-dialog'
import ScannerFailedScansDialog from './scanner-failed-scans-dialog.vue'
import { ScannerSkippedScansDialog } from './scanner-skipped-scans-dialog'
import { usePreferencesStore } from '@renderer/stores'
import { Spinner } from '@renderer/components/ui/spinner'

// =============================================================================
// Props
// =============================================================================

interface Props {
  scanner: Scanner
}

const props = defineProps<Props>()

// =============================================================================
// State
// =============================================================================

const isEditDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isFailedScansDialogOpen = ref(false)
const isSkippedScansDialogOpen = ref(false)

// =============================================================================
// Store
// =============================================================================

const scannerStore = useScannerStore()
const preferencesStore = usePreferencesStore()
const { showNsfw } = storeToRefs(preferencesStore)

// =============================================================================
// Data Fetching
// =============================================================================

// Fetch collection name if exists
const { data: collection } = useAsyncData(
  async () => {
    if (!props.scanner.targetCollectionId) return null
    const data = await db.query.collections.findFirst({
      where: and(
        eq(collections.id, props.scanner.targetCollectionId),
        showNsfw.value ? undefined : eq(collections.isNsfw, false)
      )
    })
    return data ?? null
  },
  { watch: [() => props.scanner.targetCollectionId, showNsfw] }
)

// Fetch profile name
const { data: profileName } = useAsyncData(
  async () => {
    if (!props.scanner.scraperProfileId) return undefined
    const profile = await db.query.scraperProfiles.findFirst({
      where: eq(scraperProfiles.id, props.scanner.scraperProfileId)
    })
    return profile?.name
  },
  { watch: [() => props.scanner.scraperProfileId] }
)

// =============================================================================
// Computed
// =============================================================================

const scannerState = computed(() => scannerStore.getScannerState(props.scanner.id))
const isScanning = computed(() => scannerState.value?.status === 'scanning')

const progress = computed(() => {
  const state = scannerState.value
  if (!state || state.total === 0) return 0
  return Math.round((state.processedCount / state.total) * 100)
})

const statusInfo = computed(() => {
  const state = scannerState.value
  if (!state) {
    return { variant: 'secondary' as const, label: '空闲' }
  }
  if (state.status === 'scanning') {
    return { variant: 'default' as const, label: `${progress.value}%` }
  }
  return { variant: 'success' as const, label: '完成' }
})

// =============================================================================
// Helpers
// =============================================================================

function getTypeText(type: Scanner['type']): string {
  if (type === 'game') return '游戏'
  return type
}

// =============================================================================
// Handlers
// =============================================================================

async function handleDelete() {
  await db.delete(scannersTable).where(eq(scannersTable.id, props.scanner.id))
  scannerStore.resetScannerState(props.scanner.id)
  isDeleteDialogOpen.value = false
}

function handleScan() {
  try {
    scannerStore.resetScannerState(props.scanner.id)
    ipcManager.send('scanner:scan-game', props.scanner.id)
  } catch (error) {
    console.error('Failed to start scan:', error)
  }
}

async function handleOpenPath() {
  try {
    await ipcManager.invoke('native:open-path', props.scanner.path)
  } catch (error) {
    console.error('Failed to open path:', error)
  }
}
</script>

<template>
  <div
    :class="
      cn(
        'relative flex items-center h-11 px-4 transition-colors hover:bg-accent/30',
        isScanning && 'bg-primary/5'
      )
    "
  >
    <!-- Progress bar overlay when scanning -->
    <div
      v-if="isScanning"
      class="absolute left-0 top-0 h-full bg-primary/10 transition-all duration-300"
      :style="{ width: `${progress}%` }"
    />

    <!-- Name column -->
    <div class="relative flex-1 min-w-0 flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon-sm"
        class="bg-primary/10 text-primary hover:bg-primary/20"
        @click="handleOpenPath"
      >
        <Icon
          icon="icon-[mdi--folder-open-outline]"
          class="size-4"
        />
      </Button>
      <div class="min-w-0">
        <p class="text-sm font-medium truncate">{{ props.scanner.name }}</p>
        <p class="text-xs text-muted-foreground truncate">{{ props.scanner.path }}</p>
      </div>
    </div>

    <!-- Type column -->
    <div class="relative w-24 text-center">
      <span class="text-sm">{{ getTypeText(props.scanner.type) }}</span>
    </div>

    <!-- Profile column -->
    <div class="relative w-32 text-center">
      <span class="text-sm text-muted-foreground">
        {{ profileName || props.scanner.scraperProfileId }}
      </span>
    </div>

    <!-- Collection column -->
    <div class="relative w-28 text-center">
      <span class="text-sm text-muted-foreground truncate">{{ collection?.name || '-' }}</span>
    </div>

    <!-- Stats columns -->
    <div class="relative w-36 flex items-center justify-center gap-1">
      <template v-if="scannerState">
        <div class="flex items-center gap-2 text-xs">
          <Tooltip>
            <TooltipTrigger as-child>
              <span class="text-muted-foreground">{{ scannerState.processedCount }} 处理</span>
            </TooltipTrigger>
            <TooltipContent>已处理文件夹数</TooltipContent>
          </Tooltip>
          <span class="text-muted-foreground/50">|</span>
          <Tooltip>
            <TooltipTrigger as-child>
              <span class="text-success">{{ scannerState.newCount }} 新增</span>
            </TooltipTrigger>
            <TooltipContent>新添加到数据库的游戏数</TooltipContent>
          </Tooltip>
        </div>
      </template>
      <template v-else>
        <span class="text-sm text-muted-foreground">-</span>
      </template>
    </div>

    <!-- Status column -->
    <div class="relative w-20 flex items-center justify-center gap-1">
      <Badge
        :variant="statusInfo.variant"
        class="gap-1"
      >
        <Spinner
          v-if="isScanning"
          class="size-3"
        />
        {{ statusInfo.label }}
      </Badge>
    </div>

    <!-- Actions column -->
    <div class="relative w-36 flex items-center justify-end gap-0.5">
      <Tooltip v-if="scannerState && scannerState.skippedScans.length > 0">
        <TooltipTrigger as-child>
          <Button
            variant="ghost"
            size="icon-sm"
            class="text-muted-foreground hover:text-foreground"
            @click="isSkippedScansDialogOpen = true"
          >
            <Icon
              icon="icon-[mdi--skip-next-outline]"
              class="size-4"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>跳过 ({{ scannerState.skippedScans.length }})</TooltipContent>
      </Tooltip>

      <Tooltip v-if="scannerState && scannerState.failedScans.length > 0">
        <TooltipTrigger as-child>
          <Button
            variant="ghost"
            size="icon-sm"
            class="text-warning hover:text-warning"
            @click="isFailedScansDialogOpen = true"
          >
            <Icon
              icon="icon-[mdi--alert-outline]"
              class="size-4"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>失败 ({{ scannerState.failedScans.length }})</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            variant="ghost"
            size="icon-sm"
            :disabled="isScanning"
            @click="handleScan"
          >
            <Icon
              icon="icon-[mdi--play]"
              class="size-4"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>扫描</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            variant="ghost"
            size="icon-sm"
            :disabled="isScanning"
            @click="isEditDialogOpen = true"
          >
            <Icon
              icon="icon-[mdi--pencil-outline]"
              class="size-4"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>编辑</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            variant="ghost"
            size="icon-sm"
            :disabled="isScanning"
            class="hover:text-destructive"
            @click="isDeleteDialogOpen = true"
          >
            <Icon
              icon="icon-[mdi--delete-outline]"
              class="size-4"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>删除</TooltipContent>
      </Tooltip>
    </div>
  </div>

  <!-- Delete Dialog -->
  <AlertDialog v-model:open="isDeleteDialogOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>确认删除</AlertDialogTitle>
      </AlertDialogHeader>
      <AlertDialogDescription>
        确定要删除扫描器「{{ props.scanner.name }}」吗？此操作无法撤销。
      </AlertDialogDescription>
      <AlertDialogFooter>
        <AlertDialogCancel>取消</AlertDialogCancel>
        <AlertDialogAction @click="handleDelete">删除</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <!-- Other Dialogs -->
  <ScannerFailedScansDialog
    v-if="isFailedScansDialogOpen"
    v-model:open="isFailedScansDialogOpen"
    :scanner-id="props.scanner.id"
  />
  <ScannerSkippedScansDialog
    v-if="isSkippedScansDialogOpen"
    v-model:open="isSkippedScansDialogOpen"
    :scanner-id="props.scanner.id"
  />
  <ScannerItemFormDialog
    v-if="isEditDialogOpen"
    v-model:open="isEditDialogOpen"
    :scanner-id="props.scanner.id"
  />
</template>
