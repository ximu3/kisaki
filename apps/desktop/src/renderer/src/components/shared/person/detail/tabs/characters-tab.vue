<!--
  PersonCharactersTab
  Full grid of related characters grouped by role type.
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { usePerson } from '@renderer/composables/use-person'
import { getEntityIcon } from '@renderer/utils'
import { Button } from '@renderer/components/ui/button'
import { CharacterCard, CharacterDetailDialog } from '@renderer/components/shared/character'
import { PersonCharactersFormDialog } from '../../forms'

const CHARACTER_PERSON_TYPE_LABELS: Record<string, string> = {
  actor: '声优',
  illustration: '原画',
  designer: '设计',
  other: '其他'
}

const CHARACTER_PERSON_TYPE_ORDER = ['actor', 'illustration', 'designer', 'other'] as const

const { person, characters } = usePerson()

const editDialogOpen = ref(false)
const openCharacterId = ref<string | null>(null)

const hasCharacters = computed(() => characters.value && characters.value.length > 0)

const groupedCharacters = computed(() => {
  if (!hasCharacters.value) return {}
  return characters.value.reduce(
    (acc, link) => {
      const type = link.type || 'other'
      if (!acc[type]) acc[type] = []
      acc[type].push(link)
      return acc
    },
    {} as Record<string, typeof characters.value>
  )
})

const characterDialogOpen = computed({
  get: () => openCharacterId.value !== null,
  set: (value) => {
    if (!value) openCharacterId.value = null
  }
})
</script>

<template>
  <template v-if="person">
    <!-- Empty state -->
    <template v-if="!hasCharacters">
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <Icon
          :icon="getEntityIcon('character')"
          class="size-12 text-muted-foreground/30 mb-3"
        />
        <p class="text-sm text-muted-foreground">暂无相关角色</p>
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
          添加角色
        </Button>
      </div>
    </template>

    <!-- Characters list -->
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
          v-for="type in CHARACTER_PERSON_TYPE_ORDER"
          :key="type"
        >
          <div v-if="groupedCharacters[type]?.length">
            <h4 class="text-xs font-medium text-muted-foreground mb-2">
              {{ CHARACTER_PERSON_TYPE_LABELS[type] || type }}
            </h4>
            <div class="grid grid-cols-[repeat(auto-fill,6rem)] gap-3 justify-between">
              <template
                v-for="link in groupedCharacters[type]"
                :key="link.id"
              >
                <CharacterCard
                  v-if="link.character"
                  :character="link.character"
                  size="sm"
                  align="left"
                  @click="openCharacterId = link.character.id"
                />
              </template>
            </div>
          </div>
        </template>
      </div>
    </template>

    <!-- Edit Dialog -->
    <PersonCharactersFormDialog
      v-if="editDialogOpen"
      v-model:open="editDialogOpen"
      :person-id="person.id"
    />

    <!-- Character Detail Dialog -->
    <CharacterDetailDialog
      v-if="openCharacterId"
      v-model:open="characterDialogOpen"
      :character-id="openCharacterId"
    />
  </template>
</template>
