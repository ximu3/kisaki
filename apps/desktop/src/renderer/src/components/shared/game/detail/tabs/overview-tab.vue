<!--
  Game Overview Tab

  Overview tab with 2:1 two-column layout.
  Left: Description, Characters (horizontal scroll), Tags
  Right: Details, Staff, Companies, Links
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { useGame } from '@renderer/composables/use-game'
import { formatDate } from '@renderer/utils'
import { Button } from '@renderer/components/ui/button'
import { SectionHeader } from '@renderer/components/ui/section-header'
import { MarkdownContent } from '@renderer/components/ui/markdown'
import { VirtualHorizontalScroll } from '@renderer/components/ui/virtual'
import { CharacterCard, CharacterDetailDialog } from '@renderer/components/shared/character'
import { PersonCard, PersonDetailDialog } from '@renderer/components/shared/person'
import { CompanyCard, CompanyDetailDialog } from '@renderer/components/shared/company'
import { TagCard, TagDetailDialog } from '@renderer/components/shared/tag'
import {
  GameDescriptionFormDialog,
  GameInfoFormDialog,
  GameTagsFormDialog,
  GameCharactersFormDialog,
  GamePersonsFormDialog,
  GameCompaniesFormDialog,
  GameRelatedSitesFormDialog
} from '../../forms'

// VirtualHorizontalScroll ref type
type VirtualHorizontalScrollRef = {
  scrollLeft: () => void
  scrollRight: () => void
  canScrollLeft: { value: boolean }
  canScrollRight: { value: boolean }
}
const charactersScrollRef = ref<VirtualHorizontalScrollRef>()
const charactersScrollState = ref({ canScrollLeft: false, canScrollRight: false })

// =============================================================================
// Constants
// =============================================================================

const COMPANY_TYPE_LABELS: Record<string, string> = {
  developer: '开发',
  publisher: '发行',
  distributor: '分销',
  other: '其他'
}

const PERSON_TYPE_LABELS: Record<string, string> = {
  director: '导演',
  scenario: '剧本',
  illustration: '原画',
  music: '音乐',
  programmer: '程序',
  actor: '声优',
  other: '其他'
}

const PERSON_TYPE_ORDER = [
  'director',
  'scenario',
  'illustration',
  'music',
  'programmer',
  'actor',
  'other'
] as const

const COMPANY_TYPE_ORDER = ['developer', 'publisher', 'distributor', 'other'] as const

const CHARACTER_TYPE_ORDER = ['main', 'supporting', 'cameo', 'other'] as const

const CHARACTER_TYPE_LABELS: Record<string, string> = {
  main: '主角',
  supporting: '配角',
  cameo: '客串',
  other: '其他'
}

// =============================================================================
// State
// =============================================================================

const { game, tags, characters, persons, companies } = useGame()

/** Edit dialog states */
const editDialogs = ref({
  description: false,
  details: false,
  tags: false,
  characters: false,
  staff: false,
  companies: false,
  relatedSites: false
})

/** Entity detail dialog states */
const openCharacterId = ref<string | null>(null)
const openPersonId = ref<string | null>(null)
const openCompanyId = ref<string | null>(null)
const openTagId = ref<string | null>(null)

// =============================================================================
// Computed
// =============================================================================

const hasRelatedSites = computed(
  () => game.value?.relatedSites && game.value.relatedSites.length > 0
)
const hasTags = computed(() => tags.value && tags.value.length > 0)
const hasCharacters = computed(() => characters.value && characters.value.length > 0)
const hasCompanies = computed(() => companies.value && companies.value.length > 0)
const hasPersons = computed(() => persons.value && persons.value.length > 0)

/** Sorted characters by type and order */
const sortedCharacters = computed(() => {
  if (!hasCharacters.value) return []
  return [...characters.value]
    .sort((a, b) => {
      const typeIndexA = CHARACTER_TYPE_ORDER.indexOf(
        (a.type || 'other') as (typeof CHARACTER_TYPE_ORDER)[number]
      )
      const typeIndexB = CHARACTER_TYPE_ORDER.indexOf(
        (b.type || 'other') as (typeof CHARACTER_TYPE_ORDER)[number]
      )
      if (typeIndexA !== typeIndexB) return typeIndexA - typeIndexB
      return a.orderInGame - b.orderInGame
    })
    .map((link) => ({
      link,
      character: link.character,
      roleLabel: link.type ? CHARACTER_TYPE_LABELS[link.type] : undefined
    }))
    .filter((item) => item.character !== null)
})

/** Group persons by type */
const groupedPersons = computed(() => {
  if (!hasPersons.value) return {}
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

// =============================================================================
// Helpers
// =============================================================================

function openEditDialog(dialog: keyof typeof editDialogs.value) {
  editDialogs.value[dialog] = true
}

/** Parse HTML description (simple version without html-react-parser) */
// Entity dialog computed getters
const characterDialogOpen = computed({
  get: () => openCharacterId.value !== null,
  set: (value) => {
    if (!value) openCharacterId.value = null
  }
})

const personDialogOpen = computed({
  get: () => openPersonId.value !== null,
  set: (value) => {
    if (!value) openPersonId.value = null
  }
})

const companyDialogOpen = computed({
  get: () => openCompanyId.value !== null,
  set: (value) => {
    if (!value) openCompanyId.value = null
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
  <template v-if="game">
    <div class="grid md:grid-cols-[3fr_1fr] grid-cols-1 gap-8">
      <!-- Left column: Description, Characters, Tags -->
      <div class="space-y-6 min-w-0">
        <!-- Description -->
        <section>
          <SectionHeader
            title="简介"
            editable
            @edit="openEditDialog('description')"
          />
          <MarkdownContent
            v-if="game.description"
            :content="game.description"
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
            title="角色"
            editable
            @edit="openEditDialog('characters')"
          >
            <template
              v-if="sortedCharacters.length > 0"
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
          <template v-if="sortedCharacters.length > 0">
            <VirtualHorizontalScroll
              ref="charactersScrollRef"
              :items="sortedCharacters"
              :get-key="(item) => item.link.id"
              class="flex gap-3 pr-0.5"
              @scroll-state-change="charactersScrollState = $event"
            >
              <template #item="{ item }">
                <CharacterCard
                  v-if="item.character"
                  :character="item.character"
                  size="sm"
                  align="left"
                  :badge-label="item.roleLabel"
                  @click="openCharacterId = item.character.id"
                />
              </template>
            </VirtualHorizontalScroll>
          </template>
          <p
            v-else
            class="text-xs text-muted-foreground italic"
          >
            暂无角色
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

      <!-- Right column: Details, Staff, Companies, Links -->
      <div class="space-y-6 min-w-0">
        <!-- Basic details -->
        <section>
          <SectionHeader
            title="详细信息"
            editable
            @edit="openEditDialog('details')"
          />
          <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-xs">
            <dt class="text-muted-foreground">发布日期</dt>
            <dd>{{ formatDate(game.releaseDate) }}</dd>
            <dt class="text-muted-foreground">添加日期</dt>
            <dd>{{ formatDate(game.createdAt) }}</dd>
          </dl>
        </section>

        <!-- Staff (simplified) -->
        <section>
          <SectionHeader
            title="人物"
            editable
            @edit="openEditDialog('staff')"
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
                        v-if="index < groupedPersons[type].length - 1"
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
            暂无人物
          </p>
        </section>

        <!-- Companies -->
        <section>
          <SectionHeader
            title="公司"
            editable
            @edit="openEditDialog('companies')"
          />
          <div
            v-if="hasCompanies"
            class="space-y-2 text-sm"
          >
            <template
              v-for="type in COMPANY_TYPE_ORDER"
              :key="type"
            >
              <div v-if="companies.filter((c) => (c.type || 'other') === type).length > 0">
                <div class="text-muted-foreground text-xs mb-1">
                  {{ COMPANY_TYPE_LABELS[type] || type }}
                </div>
                <div class="flex flex-wrap gap-x-1 gap-y-0.5">
                  <template
                    v-for="(link, index) in companies.filter((c) => (c.type || 'other') === type)"
                    :key="link.id"
                  >
                    <span class="inline-flex items-center max-w-full min-w-0">
                      <CompanyCard
                        v-if="link.company"
                        :company="link.company"
                        variant="button"
                        button-variant="link"
                        button-size="xs"
                        @click="openCompanyId = link.company.id"
                      />
                      <span
                        v-if="
                          index < companies.filter((c) => (c.type || 'other') === type).length - 1
                        "
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
            暂无公司信息
          </p>
        </section>

        <!-- Related sites -->
        <section>
          <SectionHeader
            title="相关链接"
            editable
            @edit="openEditDialog('relatedSites')"
          />
          <div
            v-if="hasRelatedSites"
            class="flex flex-col gap-1.5"
          >
            <a
              v-for="(site, index) in game.relatedSites"
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
    <GameDescriptionFormDialog
      v-if="editDialogs.description"
      v-model:open="editDialogs.description"
      :game-id="game.id"
    />
    <GameInfoFormDialog
      v-if="editDialogs.details"
      v-model:open="editDialogs.details"
      :game-id="game.id"
    />
    <GameTagsFormDialog
      v-if="editDialogs.tags"
      v-model:open="editDialogs.tags"
      :game-id="game.id"
    />
    <GameCharactersFormDialog
      v-if="editDialogs.characters"
      v-model:open="editDialogs.characters"
      :game-id="game.id"
    />
    <GamePersonsFormDialog
      v-if="editDialogs.staff"
      v-model:open="editDialogs.staff"
      :game-id="game.id"
    />
    <GameCompaniesFormDialog
      v-if="editDialogs.companies"
      v-model:open="editDialogs.companies"
      :game-id="game.id"
    />
    <GameRelatedSitesFormDialog
      v-if="editDialogs.relatedSites"
      v-model:open="editDialogs.relatedSites"
      :game-id="game.id"
    />

    <!-- Entity Detail Dialogs -->
    <CharacterDetailDialog
      v-if="openCharacterId"
      v-model:open="characterDialogOpen"
      :character-id="openCharacterId"
    />
    <PersonDetailDialog
      v-if="openPersonId"
      v-model:open="personDialogOpen"
      :person-id="openPersonId"
    />
    <CompanyDetailDialog
      v-if="openCompanyId"
      v-model:open="companyDialogOpen"
      :company-id="openCompanyId"
    />
    <TagDetailDialog
      v-if="openTagId"
      v-model:open="tagDialogOpen"
      :tag-id="openTagId"
    />
  </template>
</template>
