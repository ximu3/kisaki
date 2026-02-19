<!--
  CompanyDetailContent
  Main content area for company detail view.
  Used by both page and dialog modes.
-->
<script setup lang="ts">
import { Icon } from '@renderer/components/ui/icon'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { uiExtensions } from '@renderer/core/ui-extensions'
import { useCompany } from '@renderer/composables'
import { getEntityIcon } from '@renderer/utils'
import CompanyDetailHero from './detail-hero.vue'
import { CompanyDetailOverviewTab, CompanyDetailGamesTab } from './tabs'

const { company } = useCompany()

// Plugin-registered tabs
const pluginTabs = uiExtensions.detailTabs.company.items
</script>

<template>
  <template v-if="company">
    <!-- Hero section -->
    <CompanyDetailHero />

    <!-- Tabs -->
    <Tabs default-value="overview">
      <TabsList>
        <TabsTrigger value="overview">
          <Icon
            icon="icon-[mdi--information-outline]"
            class="size-3.5"
          />
          概览
        </TabsTrigger>
        <TabsTrigger value="games">
          <Icon
            :icon="getEntityIcon('game')"
            class="size-3.5"
          />
          相关游戏
        </TabsTrigger>

        <!-- Plugin tabs -->
        <TabsTrigger
          v-for="tab in pluginTabs"
          :key="tab.id"
          :value="tab.id"
        >
          <Icon
            v-if="tab.icon"
            :icon="tab.icon"
            class="size-3.5"
          />
          {{ tab.label }}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <CompanyDetailOverviewTab />
      </TabsContent>

      <TabsContent value="games">
        <CompanyDetailGamesTab />
      </TabsContent>

      <!-- Plugin tab contents -->
      <TabsContent
        v-for="tab in pluginTabs"
        :key="tab.id"
        :value="tab.id"
      >
        <component :is="tab.component" />
      </TabsContent>
    </Tabs>
  </template>
</template>
