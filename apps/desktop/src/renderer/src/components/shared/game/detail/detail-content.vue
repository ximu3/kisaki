<!--
  Game Detail Content

  Main content area for game detail view.
  Used by both page and dialog modes.
-->

<script setup lang="ts">
import { Icon } from '@renderer/components/ui/icon'
import { useGame } from '@renderer/composables/use-game'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@renderer/components/ui/tabs'
import { uiExtensions } from '@renderer/core/ui-extensions'
import { getEntityIcon } from '@renderer/utils'
import GameDetailHero from './detail-hero.vue'
import {
  GameDetailOverviewTab,
  GameDetailCharactersTab,
  GameDetailPersonsTab,
  GameDetailCompaniesTab,
  GameDetailActivityTab,
  GameDetailSavesTab,
  GameDetailNotesTab
} from './tabs'

// =============================================================================
// State
// =============================================================================

const { game } = useGame()

// Plugin-registered tabs for game entity
const pluginTabs = uiExtensions.detailTabs.game.items
</script>

<template>
  <template v-if="game">
    <!-- Hero section -->
    <GameDetailHero />

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
        <TabsTrigger value="characters">
          <Icon
            :icon="getEntityIcon('character')"
            class="size-3.5"
          />
          角色
        </TabsTrigger>
        <TabsTrigger value="staff">
          <Icon
            :icon="getEntityIcon('person')"
            class="size-3.5"
          />
          人物
        </TabsTrigger>
        <TabsTrigger value="companies">
          <Icon
            :icon="getEntityIcon('company')"
            class="size-3.5"
          />
          公司
        </TabsTrigger>
        <TabsTrigger value="activity">
          <Icon
            icon="icon-[mdi--report-timeline-variant]"
            class="size-3.5"
          />
          活动
        </TabsTrigger>
        <TabsTrigger value="saves">
          <Icon
            icon="icon-[mdi--content-save-outline]"
            class="size-3.5"
          />
          存档
        </TabsTrigger>
        <TabsTrigger value="notes">
          <Icon
            icon="icon-[mdi--image-multiple-outline]"
            class="size-3.5"
          />
          笔记
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
        <GameDetailOverviewTab />
      </TabsContent>
      <TabsContent value="characters">
        <GameDetailCharactersTab />
      </TabsContent>
      <TabsContent value="staff">
        <GameDetailPersonsTab />
      </TabsContent>
      <TabsContent value="companies">
        <GameDetailCompaniesTab />
      </TabsContent>
      <TabsContent value="activity">
        <GameDetailActivityTab />
      </TabsContent>
      <TabsContent value="saves">
        <GameDetailSavesTab />
      </TabsContent>
      <TabsContent value="notes">
        <GameDetailNotesTab />
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
