<!--
  RootLayout
  Application root layout with Titlebar, Sidebar, and main content slot.
-->
<script setup lang="ts">
import { TooltipProvider } from '@renderer/components/ui/tooltip'

import Sidebar from './sidebar.vue'
import Titlebar from './titlebar.vue'
</script>

<template>
  <TooltipProvider :delay-duration="0">
    <div class="h-screen flex flex-col overflow-hidden bg-background">
      <!-- Top titlebar with window controls -->
      <Titlebar />

      <!-- Main area: Sidebar + Content -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Left sidebar navigation -->
        <Sidebar />

        <!-- Main content area -->
        <main class="flex-1 overflow-hidden bg-background">
          <slot />
        </main>
      </div>
    </div>
  </TooltipProvider>
</template>
