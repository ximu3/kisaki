<!--
  PersonDetailContent
  Main content area for person detail view.
  Used by both page and dialog modes.
-->
<script setup lang="ts">
import { Icon } from '@renderer/components/ui/icon'
import { usePerson } from '@renderer/composables/use-person'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@renderer/components/ui/tabs'
import { uiExtensions } from '@renderer/core/ui-extensions'
import { getEntityIcon } from '@renderer/utils'
import PersonDetailHero from './detail-hero.vue'
import { PersonDetailOverviewTab, PersonDetailGamesTab, PersonDetailCharactersTab } from './tabs'

const { person } = usePerson()

// Plugin-registered tabs
const pluginTabs = uiExtensions.detailTabs.person.items
</script>

<template>
  <template v-if="person">
    <!-- Hero section -->
    <PersonDetailHero />

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
          相关角色
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
        <PersonDetailOverviewTab />
      </TabsContent>
      <TabsContent value="characters">
        <PersonDetailCharactersTab />
      </TabsContent>
      <TabsContent value="games">
        <PersonDetailGamesTab />
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
