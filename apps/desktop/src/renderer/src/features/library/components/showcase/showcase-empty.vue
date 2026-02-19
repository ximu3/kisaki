<!--
  LibraryShowcaseEmpty - Empty state
  Shown when there are no sections configured.
-->
<script setup lang="ts">
import { Button } from '@renderer/components/ui/button'

interface Emits {
  (e: 'addSection'): void
}

const emit = defineEmits<Emits>()
</script>

<template>
  <div class="h-full flex flex-col items-center justify-center text-center p-8">
    <span class="icon-[mdi--view-dashboard-outline] size-16 text-muted-foreground/30 mb-4" />
    <h2 class="text-lg font-medium mb-2">陈列柜为空</h2>
    <p class="text-sm text-muted-foreground mb-6 max-w-sm">
      添加区块来展示您的游戏、角色、人物或公司。每个区块可以有独立的筛选条件和布局。
    </p>
    <Button @click="emit('addSection')">
      <span class="icon-[mdi--plus] size-4 mr-2" />
      添加第一个区块
    </Button>
  </div>
</template>
