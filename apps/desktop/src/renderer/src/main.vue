<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ErrorBoundary } from '@renderer/components/shared'
import RootLayout from '@renderer/components/layout/root-layout.vue'
import { Toaster } from '@renderer/components/ui/toaster'
import { useThemeStore } from '@renderer/stores'

// Initialize theme store (triggers immediate theme application via watch)
void useThemeStore()
</script>

<template>
  <ErrorBoundary>
    <RootLayout>
      <RouterView />
    </RootLayout>
    <Toaster
      expand
      close-button
    />
  </ErrorBoundary>
</template>
