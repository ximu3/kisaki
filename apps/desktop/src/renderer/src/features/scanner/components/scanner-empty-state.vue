<script setup lang="ts">
/**
 * Scanner Empty State
 *
 * Empty state component for scanner page.
 * Self-contained: handles its own dialog state.
 */

import { ref } from 'vue'
import { Button } from '@renderer/components/ui/button'
import { Icon } from '@renderer/components/ui/icon'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@renderer/components/ui/empty'
import { ScannerItemFormDialog } from './scanner-item-form-dialog'

// =============================================================================
// State
// =============================================================================

const isCreateDialogOpen = ref(false)
</script>

<template>
  <Empty class="h-full border-none">
    <EmptyHeader>
      <EmptyMedia>
        <Icon
          icon="icon-[mdi--folder-search-outline]"
          class="size-12 text-muted-foreground/50"
        />
      </EmptyMedia>
      <EmptyTitle>暂无扫描器</EmptyTitle>
      <EmptyDescription>添加扫描器来自动发现并导入你的媒体文件</EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button @click="isCreateDialogOpen = true">
        <Icon
          icon="icon-[mdi--folder-plus-outline]"
          class="size-4"
        />
        添加扫描器
      </Button>
    </EmptyContent>
  </Empty>

  <ScannerItemFormDialog
    v-if="isCreateDialogOpen"
    v-model:open="isCreateDialogOpen"
  />
</template>
