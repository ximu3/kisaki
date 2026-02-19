<!--
  NotFoundPage
  404 page for unmatched routes.
-->
<script setup lang="ts">
import { Icon } from '@renderer/components/ui/icon'
import { RouterLink } from 'vue-router'
import { Button } from '@renderer/components/ui/button'
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full gap-4">
    <Icon
      icon="icon-[mdi--alert-circle-outline]"
      class="size-16 text-muted-foreground"
    />
    <h1 class="text-2xl font-bold">页面未找到</h1>
    <p class="text-muted-foreground">您访问的页面不存在</p>
    <Button as-child>
      <RouterLink to="/library">返回媒体库</RouterLink>
    </Button>
  </div>
</template>
