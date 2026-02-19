<!--
  PersonOverviewTab
  Overview tab with 2-column layout.
  Left: Description, Characters (horizontal scroll), Games (horizontal scroll), Tags
  Right: Related Sites
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { usePerson } from '@renderer/composables/use-person'
import { Button } from '@renderer/components/ui/button'
import { SectionHeader } from '@renderer/components/ui/section-header'
import { MarkdownContent } from '@renderer/components/ui/markdown'
import { VirtualHorizontalScroll } from '@renderer/components/ui/virtual'
import { GameCard, GameDetailDialog } from '@renderer/components/shared/game'
import { CharacterCard, CharacterDetailDialog } from '@renderer/components/shared/character'
import { TagCard, TagDetailDialog } from '@renderer/components/shared/tag'
import {
  PersonDescriptionFormDialog,
  PersonRelatedSitesFormDialog,
  PersonTagsFormDialog,
  PersonGamesFormDialog,
  PersonCharactersFormDialog
} from '../../forms'

type VirtualHorizontalScrollRef = {
  scrollLeft: () => void
  scrollRight: () => void
  canScrollLeft: { value: boolean }
  canScrollRight: { value: boolean }
}

const GAME_PERSON_TYPE_LABELS: Record<string, string> = {
  director: '导演',
  scenario: '剧本',
  illustration: '原画',
  music: '音乐',
  programmer: '程序',
  actor: '声优',
  other: '其他'
}

const CHARACTER_PERSON_TYPE_LABELS: Record<string, string> = {
  actor: '声优',
  illustration: '原画',
  designer: '设计',
  other: '其他'
}

// =============================================================================
// State
// =============================================================================

const { person, tags, games, characters } = usePerson()

const charactersScrollRef = ref<VirtualHorizontalScrollRef>()
const charactersScrollState = ref({ canScrollLeft: false, canScrollRight: false })
const gamesScrollRef = ref<VirtualHorizontalScrollRef>()
const gamesScrollState = ref({ canScrollLeft: false, canScrollRight: false })

/** Edit dialog states */
const editDialogs = ref({
  description: false,
  sites: false,
  tags: false,
  games: false,
  characters: false
})

/** Entity detail dialog states */
const openGameId = ref<string | null>(null)
const openCharacterId = ref<string | null>(null)
const openTagId = ref<string | null>(null)

// =============================================================================
// Computed
// =============================================================================

const hasRelatedSites = computed(
  () => person.value?.relatedSites && person.value.relatedSites.length > 0
)
const hasTags = computed(() => tags.value && tags.value.length > 0)
const hasGames = computed(() => games.value && games.value.length > 0)
const hasCharacters = computed(() => characters.value && characters.value.length > 0)

// =============================================================================
// Helpers
// =============================================================================

function openEditDialog(dialog: keyof typeof editDialogs.value) {
  editDialogs.value[dialog] = true
}

const gameDialogOpen = computed({
  get: () => openGameId.value !== null,
  set: (value) => {
    if (!value) openGameId.value = null
  }
})

const characterDialogOpen = computed({
  get: () => openCharacterId.value !== null,
  set: (value) => {
    if (!value) openCharacterId.value = null
  }
})

const tagDialogOpen = computed({
  get: () => openTagId.value !== null,
  set: (value) => {
    if (!value) openTagId.value = null
  }
})
</script>

<template>
  <template v-if="person">
    <div class="grid md:grid-cols-[3fr_1fr] grid-cols-1 gap-8">
      <!-- Left column: Description, Characters, Games, Tags -->
      <div class="space-y-6 min-w-0">
        <!-- Description -->
        <section>
          <SectionHeader
            title="简介"
            editable
            @edit="openEditDialog('description')"
          />
          <MarkdownContent
            v-if="person.description"
            :content="person.description"
          />
          <p
            v-else
            class="text-xs text-muted-foreground italic"
          >
            暂无简介
          </p>
        </section>

        <!-- Characters -->
        <section>
          <SectionHeader
            title="相关角色"
            editable
            @edit="openEditDialog('characters')"
          >
            <template
              v-if="hasCharacters"
              #actions
            >
              <Button
                variant="ghost"
                size="icon-sm"
                class="size-6"
                :disabled="!charactersScrollState.canScrollLeft"
                @click="charactersScrollRef?.scrollLeft()"
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
                :disabled="!charactersScrollState.canScrollRight"
                @click="charactersScrollRef?.scrollRight()"
              >
                <Icon
                  icon="icon-[mdi--chevron-right]"
                  class="size-4"
                />
              </Button>
            </template>
          </SectionHeader>
          <template v-if="hasCharacters">
            <VirtualHorizontalScroll
              ref="charactersScrollRef"
              :items="characters.filter((link) => link.character)"
              :get-key="(item) => item.id"
              class="flex gap-3 pr-0.5"
              @scroll-state-change="charactersScrollState = $event"
            >
              <template #item="{ item: link }">
                <CharacterCard
                  :character="link.character!"
                  size="sm"
                  align="left"
                  :badge-label="link.type ? CHARACTER_PERSON_TYPE_LABELS[link.type] : undefined"
                  @click="openCharacterId = link.character!.id"
                />
              </template>
            </VirtualHorizontalScroll>
          </template>
          <p
            v-else
            class="text-xs text-muted-foreground italic"
          >
            暂无相关角色
          </p>
        </section>

        <!-- Games -->
        <section>
          <SectionHeader
            title="相关游戏"
            editable
            @edit="openEditDialog('games')"
          >
            <template
              v-if="hasGames"
              #actions
            >
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
            </template>
          </SectionHeader>
          <template v-if="hasGames">
            <VirtualHorizontalScroll
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
                  :badge-label="link.type ? GAME_PERSON_TYPE_LABELS[link.type] : undefined"
                  @click="openGameId = link.game!.id"
                />
              </template>
            </VirtualHorizontalScroll>
          </template>
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
            @edit="openEditDialog('tags')"
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
            @edit="openEditDialog('sites')"
          />
          <div
            v-if="hasRelatedSites"
            class="flex flex-col gap-1.5"
          >
            <a
              v-for="(site, index) in person.relatedSites"
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
    <PersonDescriptionFormDialog
      v-if="editDialogs.description"
      v-model:open="editDialogs.description"
      :person-id="person.id"
    />
    <PersonRelatedSitesFormDialog
      v-if="editDialogs.sites"
      v-model:open="editDialogs.sites"
      :person-id="person.id"
    />
    <PersonTagsFormDialog
      v-if="editDialogs.tags"
      v-model:open="editDialogs.tags"
      :person-id="person.id"
    />
    <PersonGamesFormDialog
      v-if="editDialogs.games"
      v-model:open="editDialogs.games"
      :person-id="person.id"
    />
    <PersonCharactersFormDialog
      v-if="editDialogs.characters"
      v-model:open="editDialogs.characters"
      :person-id="person.id"
    />

    <!-- Entity Detail Dialogs -->
    <GameDetailDialog
      v-if="openGameId"
      v-model:open="gameDialogOpen"
      :game-id="openGameId"
    />
    <CharacterDetailDialog
      v-if="openCharacterId"
      v-model:open="characterDialogOpen"
      :character-id="openCharacterId"
    />
    <TagDetailDialog
      v-if="openTagId"
      v-model:open="tagDialogOpen"
      :tag-id="openTagId"
    />
  </template>
</template>
