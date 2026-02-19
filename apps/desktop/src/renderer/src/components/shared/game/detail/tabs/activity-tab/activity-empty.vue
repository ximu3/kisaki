<!--
  Game Detail Activity Empty State

  Displayed when there are no play sessions for the game.
-->

<script setup lang="ts">
import { Icon } from '@renderer/components/ui/icon'
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <Icon
      icon="icon-[mdi--report-timeline-variant]"
      class="size-12 text-muted-foreground/50 mb-4"
    />
    <h3 class="text-lg font-medium text-foreground mb-2">暂无游玩活动</h3>
    <p class="text-sm text-muted-foreground max-w-xs">启动游戏后，游玩时间将自动记录在这里</p>
  </div>
</template>
