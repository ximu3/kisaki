<script setup lang="ts">
/**
 * Scanner Skipped Scans Dialog
 *
 * Dialog showing skipped scan entries with game name lookup.
 */

import { computed } from 'vue'
import { useScannerStore } from '@renderer/stores'
import { Icon } from '@renderer/components/ui/icon'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody
} from '@renderer/components/ui/dialog'
import ScannerSkippedScanItem from './scanner-skipped-scan-item.vue'

import type { SkippedScan } from '@shared/scanner'

// =============================================================================
// Props & Model
// =============================================================================

interface Props {
  scannerId?: string
}

const props = defineProps<Props>()
const open = defineModel<boolean>('open', { required: true })

// =============================================================================
// Store
// =============================================================================

const scannerStore = useScannerStore()

// =============================================================================
// Computed
// =============================================================================

const skippedScans = computed(() => {
  if (props.scannerId) {
    return scannerStore.getScannerState(props.scannerId)?.skippedScans || []
  }
  // Get from all scanners
  const allSkipped: SkippedScan[] = []
  for (const state of scannerStore.scannerStates.values()) {
    allSkipped.push(...state.skippedScans)
  }
  return allSkipped
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-3xl max-h-[80vh]">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Icon
            icon="icon-[mdi--skip-forward]"
            class="size-5 text-muted-foreground"
          />
          跳过的文件夹
        </DialogTitle>
        <DialogDescription>
          以下文件夹因游戏已存在而被跳过，共 {{ skippedScans.length }} 项
        </DialogDescription>
      </DialogHeader>

      <DialogBody class="overflow-auto max-h-[60vh] scrollbar-thin">
        <div class="space-y-3 pr-2">
          <div
            v-if="skippedScans.length === 0"
            class="text-center py-8 text-muted-foreground"
          >
            没有跳过项
          </div>
          <template v-else>
            <ScannerSkippedScanItem
              v-for="(skipped, index) in skippedScans"
              :key="index"
              :skipped="skipped"
            />
          </template>
        </div>
      </DialogBody>
    </DialogContent>
  </Dialog>
</template>
