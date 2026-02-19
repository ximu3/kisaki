<!--
  Game Persons Tab

  Persons tab content showing game persons grouped by role.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { useGame } from '@renderer/composables/use-game'
import { getEntityIcon } from '@renderer/utils'
import { Button } from '@renderer/components/ui/button'
import { PersonCard, PersonDetailDialog } from '@renderer/components/shared/person'
import { GamePersonsFormDialog } from '../../forms'

// =============================================================================
// Constants
// =============================================================================

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

// =============================================================================
// State
// =============================================================================

const { game, persons } = useGame()

const editDialogOpen = ref(false)
const openPersonId = ref<string | null>(null)

// =============================================================================
// Computed
// =============================================================================

const hasPersons = computed(() => persons.value && persons.value.length > 0)

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

const personDialogOpen = computed({
  get: () => openPersonId.value !== null,
  set: (value) => {
    if (!value) openPersonId.value = null
  }
})
</script>

<template>
  <template v-if="game">
    <!-- Empty state -->
    <template v-if="!hasPersons">
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <Icon
          :icon="getEntityIcon('person')"
          class="size-12 text-muted-foreground/30 mb-3"
        />
        <p class="text-sm text-muted-foreground">暂无人物信息</p>
        <Button
          variant="outline"
          size="sm"
          class="mt-4"
          @click="editDialogOpen = true"
        >
          <Icon
            icon="icon-[mdi--plus]"
            class="size-4 mr-1.5"
          />
          添加人员
        </Button>
      </div>
    </template>

    <!-- Persons list -->
    <template v-else>
      <!-- Header with manage button -->
      <div class="flex items-center justify-start mb-4">
        <Button
          variant="outline"
          size="sm"
          @click="editDialogOpen = true"
        >
          <Icon
            icon="icon-[mdi--pencil-outline]"
            class="size-4 mr-1.5"
          />
          管理
        </Button>
      </div>

      <div class="space-y-4">
        <template
          v-for="type in PERSON_TYPE_ORDER"
          :key="type"
        >
          <div v-if="groupedPersons[type]?.length">
            <h4 class="text-xs font-medium text-muted-foreground mb-2">
              {{ PERSON_TYPE_LABELS[type] || type }}
            </h4>
            <div class="grid grid-cols-[repeat(auto-fill,6rem)] gap-3 justify-between">
              <template
                v-for="link in groupedPersons[type]"
                :key="link.id"
              >
                <PersonCard
                  v-if="link.person"
                  :person="link.person"
                  size="sm"
                  align="left"
                  @click="openPersonId = link.person.id"
                />
              </template>
            </div>
          </div>
        </template>
      </div>
    </template>

    <!-- Edit Dialog -->
    <GamePersonsFormDialog
      v-if="editDialogOpen"
      v-model:open="editDialogOpen"
      :game-id="game.id"
    />

    <!-- Person Detail Dialog -->
    <PersonDetailDialog
      v-if="openPersonId"
      v-model:open="personDialogOpen"
      :person-id="openPersonId"
    />
  </template>
</template>
