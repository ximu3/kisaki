<script setup lang="ts">
/**
 * Scanner Failed Scans Dialog
 *
 * Dialog showing failed scan entries from scanner store.
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
import { Badge } from '@renderer/components/ui/badge'

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

const failedScans = computed(() => {
  if (props.scannerId) {
    return scannerStore.getScannerState(props.scannerId)?.failedScans || []
  }
  // Get from all scanners
  const allFailed: { name: string; path: string; reason: string }[] = []
  for (const state of scannerStore.scannerStates.values()) {
    allFailed.push(...state.failedScans)
  }
  return allFailed
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-3xl max-h-[80vh]">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Icon
            icon="icon-[mdi--alert-circle-outline]"
            class="w-5 h-5 text-destructive"
          />
          扫描失败项
        </DialogTitle>
        <DialogDescription>
          以下是扫描过程中失败的文件夹，共 {{ failedScans.length }} 项
        </DialogDescription>
      </DialogHeader>

      <DialogBody class="overflow-auto max-h-[60vh] scrollbar-thin">
        <div class="space-y-3 pr-2">
          <div
            v-if="failedScans.length === 0"
            class="text-center py-8 text-muted-foreground"
          >
            没有失败项
          </div>
          <template v-else>
            <div
              v-for="(failed, index) in failedScans"
              :key="index"
              class="border rounded-lg p-4 space-y-2"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <Icon
                      icon="icon-[mdi--folder-open-outline]"
                      class="w-4 h-4 text-muted-foreground"
                    />
                    <span class="font-medium truncate">{{ failed.name }}</span>
                  </div>
                  <div
                    class="text-sm text-muted-foreground truncate"
                    :title="failed.path"
                  >
                    {{ failed.path }}
                  </div>
                </div>
                <Badge variant="destructive">失败</Badge>
              </div>
              <div class="text-sm bg-destructive/10 text-destructive p-2 rounded-md">
                <span class="font-medium">原因: </span>
                {{ failed.reason }}
              </div>
            </div>
          </template>
        </div>
      </DialogBody>
    </DialogContent>
  </Dialog>
</template>
