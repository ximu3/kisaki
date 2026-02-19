<!--
  CompanyDetailOverviewTab
  Overview tab content for company detail dialog.
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { SectionHeader } from '@renderer/components/ui/section-header'
import { MarkdownContent } from '@renderer/components/ui/markdown'
import { VirtualHorizontalScroll } from '@renderer/components/ui/virtual'
import { GameCard, GameDetailDialog } from '@renderer/components/shared/game'
import { TagCard, TagDetailDialog } from '@renderer/components/shared/tag'
import { useCompany } from '@renderer/composables'
import {
  CompanyDescriptionFormDialog,
  CompanyRelatedSitesFormDialog,
  CompanyTagsFormDialog,
  CompanyGamesFormDialog
} from '../../forms'

const GAME_COMPANY_TYPE_LABELS: Record<string, string> = {
  developer: '开发商',
  publisher: '发行商',
  distributor: '经销商',
  other: '其他'
}

const { company, tags, games } = useCompany()

// VirtualHorizontalScroll ref type
type VirtualHorizontalScrollRef = {
  scrollLeft: () => void
  scrollRight: () => void
  canScrollLeft: { value: boolean }
  canScrollRight: { value: boolean }
}
const gamesScrollRef = ref<VirtualHorizontalScrollRef>()
const gamesScrollState = ref({ canScrollLeft: false, canScrollRight: false })

// Edit dialog states
const descriptionDialogOpen = ref(false)
const sitesDialogOpen = ref(false)
const tagsDialogOpen = ref(false)
const gamesDialogOpen = ref(false)

// Detail dialog states
const openGameId = ref<string | null>(null)
const openTagId = ref<string | null>(null)

const gameDialogOpen = computed({
  get: () => openGameId.value !== null,
  set: (value) => {
    if (!value) openGameId.value = null
  }
})

const hasRelatedSites = computed(
  () => company.value?.relatedSites && company.value.relatedSites.length > 0
)
const hasGames = computed(() => games.value.length > 0)
const hasTags = computed(() => tags.value && tags.value.length > 0)

const tagDialogOpen = computed({
  get: () => openTagId.value !== null,
  set: (value) => {
    if (!value) openTagId.value = null
  }
})
</script>

<template>
  <template v-if="company">
    <div class="grid md:grid-cols-[3fr_1fr] grid-cols-1 gap-8">
      <!-- Left column: Description, Related Games, Tags -->
      <div class="space-y-6 min-w-0">
        <!-- Description -->
        <section>
          <SectionHeader
            title="简介"
            editable
            @edit="descriptionDialogOpen = true"
          />
          <MarkdownContent
            v-if="company.description"
            :content="company.description"
          />
          <p
            v-else
            class="text-xs text-muted-foreground italic"
          >
            暂无简介
          </p>
        </section>

        <!-- Related Games -->
        <section>
          <SectionHeader
            title="相关游戏"
            editable
            @edit="gamesDialogOpen = true"
          >
            <template
              v-if="hasGames"
              #actions
            >
              <div class="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  class="size-6"
                  :disabled="!gamesScrollState.canScrollLeft"
                  @click="gamesScrollRef?.scrollLeft()"
                >
                  <Icon
                    icon="icon-[mdi--chevron-left]"
                    class="size-4"
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  class="size-6"
                  :disabled="!gamesScrollState.canScrollRight"
                  @click="gamesScrollRef?.scrollRight()"
                >
                  <Icon
                    icon="icon-[mdi--chevron-right]"
                    class="size-4"
                  />
                </Button>
              </div>
            </template>
          </SectionHeader>
          <VirtualHorizontalScroll
            v-if="hasGames"
            ref="gamesScrollRef"
            :items="games.filter((link) => link.game)"
            :get-key="(item) => item.id"
            class="flex gap-3 pr-0.5"
            @scroll-state-change="gamesScrollState = $event"
          >
            <template #item="{ item: link }">
              <GameCard
                :game="link.game!"
                align="left"
                size="sm"
                :badge-label="link.type ? GAME_COMPANY_TYPE_LABELS[link.type] : undefined"
                @click="openGameId = link.game!.id"
              />
            </template>
          </VirtualHorizontalScroll>
          <p
            v-else
            class="text-xs text-muted-foreground italic"
          >
            暂无相关游戏
          </p>
        </section>

        <!-- Tags -->
        <section>
          <SectionHeader
            title="标签"
            editable
            @edit="tagsDialogOpen = true"
          />
          <div
            v-if="hasTags"
            class="flex flex-wrap gap-1"
          >
            <template
              v-for="tagLink in tags"
              :key="tagLink.id"
            >
              <TagCard
                v-if="tagLink.tag"
                :tag="tagLink.tag"
                variant="button"
                button-size="xs"
                @click="openTagId = tagLink.tag.id"
              />
            </template>
          </div>
          <p
            v-else
            class="text-xs text-muted-foreground italic"
          >
            暂无标签
          </p>
        </section>
      </div>

      <!-- Right column: Related Sites -->
      <div class="space-y-6 min-w-0">
        <section>
          <SectionHeader
            title="相关链接"
            editable
            @edit="sitesDialogOpen = true"
          />
          <div
            v-if="hasRelatedSites"
            class="flex flex-col gap-1.5"
          >
            <a
              v-for="(site, index) in company.relatedSites"
              :key="index"
              :href="site.url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Icon
                icon="icon-[mdi--open-in-new]"
                class="size-3.5"
              />
              {{ site.label }}
            </a>
          </div>
          <p
            v-else
            class="text-xs text-muted-foreground italic"
          >
            暂无相关链接
          </p>
        </section>
      </div>
    </div>

    <!-- Edit Dialogs -->
    <CompanyDescriptionFormDialog
      v-if="descriptionDialogOpen"
      v-model:open="descriptionDialogOpen"
      :company-id="company.id"
    />
    <CompanyRelatedSitesFormDialog
      v-if="sitesDialogOpen"
      v-model:open="sitesDialogOpen"
      :company-id="company.id"
    />
    <CompanyTagsFormDialog
      v-if="tagsDialogOpen"
      v-model:open="tagsDialogOpen"
      :company-id="company.id"
    />
    <CompanyGamesFormDialog
      v-if="gamesDialogOpen"
      v-model:open="gamesDialogOpen"
      :company-id="company.id"
    />

    <!-- Entity Dialogs -->
    <GameDetailDialog
      v-if="openGameId"
      v-model:open="gameDialogOpen"
      :game-id="openGameId"
    />

    <!-- Tag Detail Dialog -->
    <TagDetailDialog
      v-if="openTagId"
      v-model:open="tagDialogOpen"
      :tag-id="openTagId"
    />
  </template>
</template>
