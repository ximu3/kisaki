<!--
  RelationField
  Entity select for relation filter fields.
  Displays selected items as removable badges below the selector.
  Supports match mode toggle between 'any' (OR) and 'all' (AND).
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { and, eq, inArray } from 'drizzle-orm'
import { storeToRefs } from 'pinia'
import type { FilterState, RelationValue } from '@shared/filter'
import { getFilterValue, setFilterValue } from '@shared/filter'
import { Icon } from '@renderer/components/ui/icon'
import { Field, FieldLabel, FieldContent } from '@renderer/components/ui/field'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import { GameSelect } from '@renderer/components/shared/game'
import { CharacterSelect } from '@renderer/components/shared/character'
import { PersonSelect } from '@renderer/components/shared/person'
import { CompanySelect } from '@renderer/components/shared/company'
import { TagSelect } from '@renderer/components/shared/tag'
import { CollectionSelect } from '@renderer/components/shared/collection'
import { useAsyncData } from '@renderer/composables'
import { db } from '@renderer/core/db'
import { games, characters, persons, companies, tags, collections } from '@shared/db'
import { cn } from '@renderer/utils'
import type { FilterUiFieldDef } from '../specs/types'
import { usePreferencesStore } from '@renderer/stores'

type MatchMode = 'any' | 'all'

interface Props {
  field: Extract<FilterUiFieldDef, { control: 'relation' }>
}

const props = defineProps<Props>()
const filterModel = defineModel<FilterState>({ required: true })

const localMode = ref<MatchMode>('any')

const storedRelation = computed(
  () => getFilterValue(filterModel.value, props.field.key) as RelationValue | undefined
)

watch(
  storedRelation,
  (rel) => {
    if (rel?.match === 'any' || rel?.match === 'all') {
      localMode.value = rel.match
    }
  },
  { immediate: true }
)

const selectedIds = computed({
  get: () => storedRelation.value?.ids ?? [],
  set: (ids: string[]) => {
    const cleanIds = ids.filter(Boolean)
    const value: RelationValue | undefined =
      cleanIds.length > 0 ? { match: localMode.value, ids: cleanIds } : undefined
    filterModel.value = setFilterValue(filterModel.value, props.field.key, value)
  }
})

const effectiveMode = computed(() => storedRelation.value?.match ?? localMode.value)

function handleModeChange(mode: MatchMode) {
  localMode.value = mode
  if (selectedIds.value.length > 0) {
    filterModel.value = setFilterValue(filterModel.value, props.field.key, {
      match: mode,
      ids: selectedIds.value
    })
  }
}

const targetEntity = computed(() => props.field.targetEntity)
const preferencesStore = usePreferencesStore()
const { showNsfw } = storeToRefs(preferencesStore)

const { data: selectedEntities } = useAsyncData(
  async () => {
    if (!targetEntity.value || selectedIds.value.length === 0) return []

    let result: { id: string; name: string }[] = []

    switch (targetEntity.value) {
      case 'game':
        result = await db
          .select({ id: games.id, name: games.name })
          .from(games)
          .where(
            and(
              inArray(games.id, selectedIds.value),
              showNsfw.value ? undefined : eq(games.isNsfw, false)
            )
          )
        break
      case 'character':
        result = await db
          .select({ id: characters.id, name: characters.name })
          .from(characters)
          .where(
            and(
              inArray(characters.id, selectedIds.value),
              showNsfw.value ? undefined : eq(characters.isNsfw, false)
            )
          )
        break
      case 'person':
        result = await db
          .select({ id: persons.id, name: persons.name })
          .from(persons)
          .where(
            and(
              inArray(persons.id, selectedIds.value),
              showNsfw.value ? undefined : eq(persons.isNsfw, false)
            )
          )
        break
      case 'company':
        result = await db
          .select({ id: companies.id, name: companies.name })
          .from(companies)
          .where(
            and(
              inArray(companies.id, selectedIds.value),
              showNsfw.value ? undefined : eq(companies.isNsfw, false)
            )
          )
        break
      case 'tag':
        result = await db
          .select({ id: tags.id, name: tags.name })
          .from(tags)
          .where(
            and(
              inArray(tags.id, selectedIds.value),
              showNsfw.value ? undefined : eq(tags.isNsfw, false)
            )
          )
        break
      case 'collection':
        result = await db
          .select({ id: collections.id, name: collections.name })
          .from(collections)
          .where(
            and(
              inArray(collections.id, selectedIds.value),
              showNsfw.value ? undefined : eq(collections.isNsfw, false)
            )
          )
        break
    }

    const entityMap = new Map(result.map((e) => [e.id, e]))
    return selectedIds.value.map((id) => entityMap.get(id)).filter(Boolean) as {
      id: string
      name: string
    }[]
  },
  { watch: [targetEntity, selectedIds, showNsfw] }
)

function handleRemove(idToRemove: string) {
  selectedIds.value = selectedIds.value.filter((id) => id !== idToRemove)
}
</script>

<template>
  <Field>
    <div class="flex items-center justify-between">
      <FieldLabel>{{ props.field.label }}</FieldLabel>
      <div class="inline-flex items-center rounded bg-muted/50 p-0.5 text-xs">
        <button
          type="button"
          :class="
            cn(
              'px-1.5 py-0.5 rounded transition-colors',
              effectiveMode === 'any'
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )
          "
          @click="() => handleModeChange('any')"
        >
          任意
        </button>
        <button
          type="button"
          :class="
            cn(
              'px-1.5 py-0.5 rounded transition-colors',
              effectiveMode === 'all'
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )
          "
          @click="() => handleModeChange('all')"
        >
          全部
        </button>
      </div>
    </div>

    <FieldContent>
      <GameSelect
        v-if="targetEntity === 'game'"
        v-model:selected-ids="selectedIds"
        multiple
        :placeholder="`选择${props.field.label}...`"
      />
      <CharacterSelect
        v-else-if="targetEntity === 'character'"
        v-model:selected-ids="selectedIds"
        multiple
        :placeholder="`选择${props.field.label}...`"
      />
      <PersonSelect
        v-else-if="targetEntity === 'person'"
        v-model:selected-ids="selectedIds"
        multiple
        :placeholder="`选择${props.field.label}...`"
      />
      <CompanySelect
        v-else-if="targetEntity === 'company'"
        v-model:selected-ids="selectedIds"
        multiple
        :placeholder="`选择${props.field.label}...`"
      />
      <TagSelect
        v-else-if="targetEntity === 'tag'"
        v-model:selected-ids="selectedIds"
        multiple
        :placeholder="`选择${props.field.label}...`"
      />
      <CollectionSelect
        v-else-if="targetEntity === 'collection'"
        v-model:selected-ids="selectedIds"
        multiple
        :placeholder="`选择${props.field.label}...`"
      />

      <div
        v-if="(selectedEntities?.length ?? 0) > 0"
        class="mt-2 flex flex-wrap gap-1.5"
      >
        <Badge
          v-for="item in selectedEntities"
          :key="item.id"
          variant="secondary"
          class="text-xs flex items-center gap-1"
        >
          <span class="truncate max-w-32">{{ item.name }}</span>
          <Button
            variant="ghost"
            size="icon-xs"
            class="size-4 -mr-1"
            @click="() => handleRemove(item.id)"
          >
            <Icon
              icon="icon-[mdi--close]"
              class="size-3"
            />
          </Button>
        </Badge>
      </div>
    </FieldContent>
  </Field>
</template>
