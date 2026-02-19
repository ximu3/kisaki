<!--
  Character Detail Hero

  Hero section for character detail page.
  Shows photo and basic stats with editable button.
-->

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { useCharacter } from '@renderer/composables/use-character'
import { getAttachmentUrl } from '@renderer/utils/attachment'
import { formatDate, getEntityIcon } from '@renderer/utils'
import { Button } from '@renderer/components/ui/button'
import { CharacterBasicFormDialog } from '../forms'

// =============================================================================
// State
// =============================================================================

const { character } = useCharacter()

const isEditOpen = ref(false)

// =============================================================================
// Constants
// =============================================================================

const GENDER_LABELS: Record<string, string> = {
  male: '男性',
  female: '女性',
  other: '其他'
}

const BLOOD_TYPE_LABELS: Record<string, string> = {
  a: 'A型',
  b: 'B型',
  o: 'O型',
  ab: 'AB型'
}

const CUP_SIZE_LABELS: Record<string, string> = {
  aaa: 'AAA',
  aa: 'AA',
  a: 'A',
  b: 'B',
  c: 'C',
  d: 'D',
  e: 'E',
  f: 'F',
  g: 'G',
  h: 'H',
  i: 'I',
  j: 'J',
  k: 'K'
}

// =============================================================================
// Helpers
// =============================================================================

function getBodyStats() {
  if (!character.value) return null
  const c = character.value
  const parts = []

  if (c.height !== null) parts.push(`${c.height}cm`)
  if (c.weight !== null) parts.push(`${c.weight}kg`)
  if (c.bust !== null || c.waist !== null || c.hips !== null) {
    parts.push(`B${c.bust ?? '?'}-W${c.waist ?? '?'}-H${c.hips ?? '?'}`)
  }
  if (c.cup) parts.push(CUP_SIZE_LABELS[c.cup] || c.cup.toUpperCase())

  return parts.length > 0 ? parts.join(' / ') : null
}
</script>

<template>
  <template v-if="character">
    <div class="flex gap-4 mb-4 group">
      <!-- Photo -->
      <div class="w-24 aspect-[3/4] rounded-lg overflow-hidden shrink-0 bg-muted border shadow-sm">
        <img
          v-if="character.photoFile"
          :src="
            getAttachmentUrl('characters', character.id, character.photoFile, {
              width: 300,
              height: 400
            })
          "
          :alt="character.name"
          class="size-full object-cover"
        />
        <div
          v-else
          class="size-full flex items-center justify-center"
        >
          <Icon
            :icon="getEntityIcon('character')"
            class="size-8 text-muted-foreground/50"
          />
        </div>
      </div>

      <!-- Basic info -->
      <div class="flex-1 min-w-0 justify-between flex flex-col">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h2 class="text-lg font-semibold truncate">{{ character.name }}</h2>
            <p
              v-if="character.originalName"
              class="text-sm text-muted-foreground truncate"
            >
              {{ character.originalName }}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            class="group-hover:opacity-100 opacity-0 transition-opacity text-muted-foreground"
            @click="isEditOpen = true"
          >
            <Icon
              icon="icon-[mdi--pencil-outline]"
              class="size-3.5"
            />
          </Button>
        </div>

        <!-- Stats grid -->
        <div class="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs">
          <div
            v-if="character.gender"
            class="flex gap-2"
          >
            <span class="text-muted-foreground">性别</span>
            <span>{{ GENDER_LABELS[character.gender] || character.gender }}</span>
          </div>
          <div
            v-if="character.birthDate"
            class="flex gap-2"
          >
            <span class="text-muted-foreground">生日</span>
            <span>{{ formatDate(character.birthDate) }}</span>
          </div>
          <div
            v-if="character.age !== null"
            class="flex gap-2"
          >
            <span class="text-muted-foreground">年龄</span>
            <span>{{ character.age }}岁</span>
          </div>
          <div
            v-if="character.bloodType"
            class="flex gap-2"
          >
            <span class="text-muted-foreground">血型</span>
            <span>{{ BLOOD_TYPE_LABELS[character.bloodType] || character.bloodType }}</span>
          </div>
          <div
            v-if="getBodyStats()"
            class="flex gap-2 col-span-2"
          >
            <span class="text-muted-foreground">体型</span>
            <span>{{ getBodyStats() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Dialog - conditionally rendered -->
    <CharacterBasicFormDialog
      v-if="isEditOpen"
      v-model:open="isEditOpen"
      :character-id="character.id"
    />
  </template>
</template>
