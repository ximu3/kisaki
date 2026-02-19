<!--
  Statistics Layout

  Parent layout component for statistics feature.
  Provides statistics context and contains header with RouterView for child pages.
-->

<script setup lang="ts">
import { useStatisticsProvider } from '../composables'
import { StatisticsHeader } from '../components'

// Provide statistics context for all child components
useStatisticsProvider()
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header (includes report type navigation and period selector) -->
    <StatisticsHeader />

    <!-- Main content - child routes render here -->
    <div class="flex-1 min-h-0 overflow-auto p-4 scrollbar-thin">
      <RouterView />
    </div>
  </div>
</template>
