<!--
  CharacterOverviewTab
  Overview tab content for character detail dialog.
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { useCharacter } from '@renderer/composables/use-character'
import { Button } from '@renderer/components/ui/button'
import { SectionHeader } from '@renderer/components/ui/section-header'
import { MarkdownContent } from '@renderer/components/ui/markdown'
import { VirtualHorizontalScroll } from '@renderer/components/ui/virtual'
import { GameCard, GameDetailDialog } from '@renderer/components/shared/game'
import { PersonCard, PersonDetailDialog } from '@renderer/components/shared/person'
import { TagCard, TagDetailDialog } from '@renderer/components/shared/tag'
import {
  CharacterDescriptionFormDialog,
  CharacterPersonsFormDialog,
  CharacterRelatedSitesFormDialog,
  CharacterTagsFormDialog,
  CharacterGamesFormDialog
} from '../../forms'

// =============================================================================
// Types
// =============================================================================

type VirtualHorizontalScrollRef = {
  scrollLeft: () => void
  scrollRight: () => void
  canScrollLeft: { value: boolean }
  canScrollRight: { value: boolean }
}

interface HorizontalScrollState {
  canScrollLeft: boolean
  canScrollRight: boolean
}

// =============================================================================
// State
// =============================================================================

const { character, tags, persons, games } = useCharacter()

const gamesScrollRef = ref<VirtualHorizontalScrollRef | null>(null)
const gamesScrollState = ref<HorizontalScrollState>({
  canScrollLeft: false,
  canScrollRight: false
})

// Edit dialog states
const editDialogs = ref({
  description: false,
  persons: false,
  sites: false,
  tags: false,
  games: false
})

// Entity dialog states
const openGameId = ref<string | null>(null)
const openPersonId = ref<string | null>(null)
const openTagId = ref<string | null>(null)

// =============================================================================
// Constants
// =============================================================================

const PERSON_TYPE_LABELS: Record<string, string> = {
  actor: '声优',
  illustration: '原画',
  designer: '设计',
  other: '其他'
}

const PERSON_TYPE_ORDER = ['actor', 'illustration', 'designer', 'other'] as const

// =============================================================================
// Computed
// =============================================================================

const groupedPersons = computed(() => {
  return persons.value.reduce(
    (acc, link) => {
      const type = link.type || 'other'
      if (!acc[type]) acc[type] = []
      acc[type].push(link)
      return acc
    },
    {} as Record<string, typeof persons.value>
  )
})

const hasRelatedSites = computed(
  () => character.value?.relatedSites && character.value.relatedSites.length > 0
)
const hasGames = computed(() => games.value.length > 0)
const hasPersons = computed(() => persons.value.length > 0)
const hasTags = computed(() => tags.value && tags.value.length > 0)

// =============================================================================
// Helpers
// =============================================================================

function openEditDialog(dialog: keyof typeof editDialogs.value) {
  editDialogs.value[dialog] = true
}

function getRoleLabel(type: string | null | undefined) {
  if (!type) return undefined
  const labels: Record<string, string> = {
    main: '主角',
    supporting: '配角',
    other: '其他'
  }
  return labels[type]
}

const gameDialogOpen = computed({
  get: () => openGameId.value !== null,
  set: (value) => {
    if (!value) openGameId.value = null
  }
})

const personDialogOpen = computed({
  get: () => openPersonId.value !== null,
  set: (value) => {
    if (!value) openPersonId.value = null
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
  <template v-if="character">
    <div class="grid md:grid-cols-[3fr_1fr] grid-cols-1 gap-8">
      <!-- Left column: Description, Related Games, Tags -->
      <div class="space-y-6 min-w-0">
        <!-- Description -->
        <section>
          <SectionHeader
            title="简介"
            editable
            @edit="openEditDialog('description')"
          />
          <MarkdownContent
            v-if="character.description"
            :content="character.description"
          />
          <p
            v-else
            class="text-xs text-muted-foreground italic"
          >
            暂无简介
          </p>
        </section>

        <!-- Related Games - horizontal scroll with navigation -->
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
              <div class="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  :disabled="!gamesScrollState.canScrollLeft"
                  class="size-6"
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
                  :disabled="!gamesScrollState.canScrollRight"
                  class="size-6"
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
                :badge-label="getRoleLabel(link.type)"
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

      <!-- Right column: Related Persons, Related Sites -->
      <div class="space-y-6 min-w-0">
        <!-- Related Persons -->
        <section>
          <SectionHeader
            title="相关人物"
            editable
            @edit="openEditDialog('persons')"
          />
          <div
            v-if="hasPersons"
            class="space-y-2 text-sm"
          >
            <template
              v-for="type in PERSON_TYPE_ORDER"
              :key="type"
            >
              <div v-if="groupedPersons[type]?.length">
                <div class="text-muted-foreground text-xs mb-1">
                  {{ PERSON_TYPE_LABELS[type] || type }}
                </div>
                <div class="flex flex-wrap gap-x-1 gap-y-0.5">
                  <template
                    v-for="(link, index) in groupedPersons[type]"
                    :key="link.id"
                  >
                    <span class="inline-flex items-center max-w-full min-w-0">
                      <PersonCard
                        v-if="link.person"
                        :person="link.person"
                        variant="button"
                        button-variant="link"
                        button-size="xs"
                        @click="openPersonId = link.person.id"
                      />
                      <span
                        v-if="index < groupedPersons[type]!.length - 1"
                        class="text-muted-foreground/50"
                        >,</span
                      >
                    </span>
                  </template>
                </div>
              </div>
            </template>
          </div>
          <p
            v-else
            class="text-xs text-muted-foreground italic"
          >
            暂无相关人物
          </p>
        </section>

        <!-- Related Sites -->
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
              v-for="(site, index) in character.relatedSites"
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

    <!-- Edit Dialogs - conditionally rendered -->
    <CharacterDescriptionFormDialog
      v-if="editDialogs.description"
      v-model:open="editDialogs.description"
      :character-id="character.id"
    />
    <CharacterPersonsFormDialog
      v-if="editDialogs.persons"
      v-model:open="editDialogs.persons"
      :character-id="character.id"
    />
    <CharacterRelatedSitesFormDialog
      v-if="editDialogs.sites"
      v-model:open="editDialogs.sites"
      :character-id="character.id"
    />
    <CharacterTagsFormDialog
      v-if="editDialogs.tags"
      v-model:open="editDialogs.tags"
      :character-id="character.id"
    />
    <CharacterGamesFormDialog
      v-if="editDialogs.games"
      v-model:open="editDialogs.games"
      :character-id="character.id"
    />

    <!-- Entity Dialogs -->
    <GameDetailDialog
      v-if="openGameId"
      v-model:open="gameDialogOpen"
      :game-id="openGameId"
    />
    <PersonDetailDialog
      v-if="openPersonId"
      v-model:open="personDialogOpen"
      :person-id="openPersonId"
    />
    <TagDetailDialog
      v-if="openTagId"
      v-model:open="tagDialogOpen"
      :tag-id="openTagId"
    />
  </template>
</template>
