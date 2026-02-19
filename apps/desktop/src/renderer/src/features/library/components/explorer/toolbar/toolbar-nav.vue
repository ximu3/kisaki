<script setup lang="ts">
/**
 * ToolbarNav - Route navigation links
 *
 * Entry points to library sub-routes (Showcase / Collections / Favorites).
 */

import { RouterLink } from 'vue-router'
import { Icon } from '@renderer/components/ui/icon'
import { useLibraryExplorerStore } from '../../../stores'
import { getEntityIcon } from '@renderer/utils'

const store = useLibraryExplorerStore()

function handleNavClick() {
  if (store.selectedKeys.length === 0) return
  store.clearSelection()
}
</script>

<template>
  <div
    class="flex items-center gap-1 w-full"
    @click.capture="handleNavClick"
  >
    <!-- Showcase link -->
    <RouterLink
      to="/library"
      exact
      class="flex flex-1 items-center gap-1.5 h-7 px-2.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 [&.router-link-exact-active]:text-foreground [&.router-link-exact-active]:bg-accent [&.router-link-exact-active]:shadow-sm"
    >
      <Icon
        icon="icon-[mdi--view-dashboard-outline]"
        class="size-4"
      />
      <span>陈列柜</span>
    </RouterLink>

    <!-- Right side icons -->
    <div class="flex items-center gap-1">
      <!-- Collections link -->
      <RouterLink
        to="/library/collections"
        class="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 [&.router-link-active]:text-foreground [&.router-link-active]:bg-accent [&.router-link-active]:shadow-sm"
        title="合集"
      >
        <Icon
          :icon="getEntityIcon('collection')"
          class="size-4"
        />
      </RouterLink>

      <!-- Favorites link -->
      <RouterLink
        to="/library/favorites"
        class="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 [&.router-link-active]:text-foreground [&.router-link-active]:bg-accent [&.router-link-active]:shadow-sm"
        title="喜欢"
      >
        <Icon
          icon="icon-[mdi--heart-outline]"
          class="size-4"
        />
      </RouterLink>
    </div>
  </div>
</template>
