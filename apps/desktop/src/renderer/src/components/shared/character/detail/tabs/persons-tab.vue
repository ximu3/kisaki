<!--
  CharacterPersonsTab
  Persons tab content for character detail dialog.
  Shows full list of related persons by type.
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { useCharacter } from '@renderer/composables/use-character'
import { Button } from '@renderer/components/ui/button'
import { PersonCard, PersonDetailDialog } from '@renderer/components/shared/person'
import { CharacterPersonsFormDialog } from '../../forms'

// =============================================================================
// State
// =============================================================================

const { character, persons } = useCharacter()

const isEditOpen = ref(false)
const openPersonId = ref<string | null>(null)

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

const hasPersons = computed(() => persons.value.length > 0)

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

const personDialogOpen = computed({
  get: () => openPersonId.value !== null,
  set: (value) => {
    if (!value) openPersonId.value = null
  }
})
</script>

<template>
  <template v-if="character">
    <!-- Empty state -->
    <div
      v-if="!hasPersons"
      class="flex flex-col items-center justify-center py-12 text-center"
    >
      <Icon
        icon="icon-[mdi--microphone-outline]"
        class="size-12 text-muted-foreground/30 mb-3"
      />
      <p class="text-sm text-muted-foreground">暂无相关人物</p>
      <Button
        variant="outline"
        size="sm"
        class="mt-4"
        @click="isEditOpen = true"
      >
        <Icon
          icon="icon-[mdi--plus]"
          class="size-4 mr-1.5"
        />
        添加人员
      </Button>
    </div>

    <!-- Content state -->
    <template v-else>
      <!-- Header with manage button -->
      <div class="flex items-center justify-start mb-4">
        <Button
          variant="outline"
          size="sm"
          @click="isEditOpen = true"
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
                  align="left"
                  size="sm"
                  @click="openPersonId = link.person.id"
                />
              </template>
            </div>
          </div>
        </template>
      </div>
    </template>

    <!-- Edit Dialog -->
    <CharacterPersonsFormDialog
      v-if="isEditOpen"
      v-model:open="isEditOpen"
      :character-id="character.id"
    />

    <!-- Person Detail Dialog -->
    <PersonDetailDialog
      v-if="openPersonId"
      v-model:open="personDialogOpen"
      :person-id="openPersonId"
    />
  </template>
</template>
