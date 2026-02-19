<script setup lang="ts">
/**
 * Scanner Header
 *
 * Self-contained header component for the scanner page.
 * Fetches scanner count internally and handles all actions.
 */

import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { db } from '@renderer/core/db'
import { Icon } from '@renderer/components/ui/icon'
import { scanners } from '@shared/db'
import { ipcManager } from '@renderer/core/ipc'
import { useAsyncData } from '@renderer/composables/use-async-data'
import { useEvent } from '@renderer/composables/use-event'
import { useScannerStore } from '@renderer/stores'
import { Button } from '@renderer/components/ui/button'
import { ScannerItemFormDialog } from './scanner-item-form-dialog'
import ScannerSettingsFormDialog from './scanner-settings-form-dialog.vue'

// =============================================================================
// State
// =============================================================================

const isSettingsDialogOpen = ref(false)
const isCreateDialogOpen = ref(false)

// =============================================================================
// Data Fetching
// =============================================================================

async function fetchScannerCount(): Promise<number> {
  const result = await db.select({ id: scanners.id }).from(scanners)
  return result.length
}

const { data: totalScanners, refetch } = useAsyncData(fetchScannerCount)

// Listen for scanner changes
useEvent('db:inserted', (payload) => {
  if (payload.table === 'scanners') refetch()
})

useEvent('db:updated', (payload) => {
  if (payload.table === 'scanners') refetch()
})

useEvent('db:deleted', (payload) => {
  if (payload.table === 'scanners') refetch()
})

// =============================================================================
// Scanner State
// =============================================================================

const scannerStore = useScannerStore()

const activeScanners = computed(() => scannerStore.activeScanners.length)
const isScanning = computed(() => scannerStore.hasActiveScans)

// =============================================================================
// Handlers
// =============================================================================

function handleScanAll() {
  try {
    scannerStore.resetAllScannerStates()
    ipcManager.send('scanner:scan-all-game')
  } catch (error) {
    console.error('Failed to scan all:', error)
  }
}
</script>

<template>
  <header
    class="flex items-center justify-between px-4 h-12 bg-surface border-b border-border shrink-0"
  >
    <div class="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon-sm"
        as-child
      >
        <RouterLink to="/library">
          <Icon
            icon="icon-[mdi--arrow-left]"
            class="size-4"
          />
        </RouterLink>
      </Button>
      <Icon
        icon="icon-[mdi--folder-search-outline]"
        class="size-5"
      />
      <h1 class="text-base font-semibold">扫描器</h1>
      <span class="text-xs text-muted-foreground">
        {{ totalScanners ?? 0 }} 个扫描器
        <template v-if="activeScanners > 0"> · {{ activeScanners }} 个运行中</template>
      </span>
    </div>

    <div class="flex items-center gap-2">
      <Button
        size="sm"
        :disabled="isScanning"
        @click="isCreateDialogOpen = true"
      >
        <Icon
          icon="icon-[mdi--folder-plus-outline]"
          class="size-4"
        />
        添加扫描器
      </Button>
      <Button
        variant="secondary"
        size="sm"
        :disabled="isScanning || totalScanners === 0"
        @click="handleScanAll"
      >
        <Icon
          icon="icon-[mdi--refresh]"
          class="size-4"
        />
        扫描全部
      </Button>
      <Button
        variant="secondary"
        size="icon-sm"
        title="扫描器设置"
        :disabled="isScanning"
        @click="isSettingsDialogOpen = true"
      >
        <Icon
          icon="icon-[mdi--cog-outline]"
          class="size-4"
        />
      </Button>
    </div>
  </header>

  <!-- Dialogs -->
  <ScannerSettingsFormDialog
    v-if="isSettingsDialogOpen"
    v-model:open="isSettingsDialogOpen"
  />
  <ScannerItemFormDialog
    v-if="isCreateDialogOpen"
    v-model:open="isCreateDialogOpen"
  />
</template>
