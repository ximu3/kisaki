<!--
  Character Detail Content

  Main content area for character detail view.
  Used by both page and dialog modes.
-->

<script setup lang="ts">
import { Icon } from '@renderer/components/ui/icon'
import { useCharacter } from '@renderer/composables/use-character'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@renderer/components/ui/tabs'
import { uiExtensions } from '@renderer/core/ui-extensions'
import { getEntityIcon } from '@renderer/utils'
import CharacterDetailHero from './detail-hero.vue'
import {
  CharacterDetailOverviewTab,
  CharacterDetailPersonsTab,
  CharacterDetailGamesTab
} from './tabs'

// =============================================================================
// State
// =============================================================================

const { character } = useCharacter()

// Plugin-registered tabs
const pluginTabs = uiExtensions.detailTabs.character.items
</script>

<template>
  <template v-if="character">
    <!-- Hero section -->
    <CharacterDetailHero />

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
        <TabsTrigger value="persons">
          <Icon
            :icon="getEntityIcon('person')"
            class="size-3.5"
          />
          相关人物
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
        <CharacterDetailOverviewTab />
      </TabsContent>
      <TabsContent value="persons">
        <CharacterDetailPersonsTab />
      </TabsContent>
      <TabsContent value="games">
        <CharacterDetailGamesTab />
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
