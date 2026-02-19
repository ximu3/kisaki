<!--
  PersonDetailHero
  Hero section for person detail dialog.
  Shows photo and basic stats.
-->
<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { usePerson } from '@renderer/composables/use-person'
import { getAttachmentUrl, formatDate, getEntityIcon } from '@renderer/utils'
import { Button } from '@renderer/components/ui/button'
import { PersonBasicFormDialog } from '../forms'

const GENDER_LABELS: Record<string, string> = {
  male: '男性',
  female: '女性',
  other: '其他'
}

const { person } = usePerson()

const isEditOpen = ref(false)
</script>

<template>
  <template v-if="person">
    <div class="flex gap-4 mb-4 group">
      <!-- Photo -->
      <div class="w-24 aspect-[3/4] rounded-lg overflow-hidden shrink-0 bg-muted border shadow-sm">
        <img
          v-if="person.photoFile"
          :src="
            getAttachmentUrl('persons', person.id, person.photoFile, { width: 200, height: 267 }) ??
            undefined
          "
          :alt="person.name"
          class="size-full object-cover"
        />
        <div
          v-else
          class="size-full flex items-center justify-center"
        >
          <Icon
            :icon="getEntityIcon('person')"
            class="size-8 text-muted-foreground/50"
          />
        </div>
      </div>

      <!-- Basic info -->
      <div class="flex-1 min-w-0 justify-between flex flex-col">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h2 class="text-lg font-semibold truncate">{{ person.name }}</h2>
            <p
              v-if="person.originalName"
              class="text-sm text-muted-foreground truncate"
            >
              {{ person.originalName }}
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
            v-if="person.gender"
            class="flex gap-2"
          >
            <span class="text-muted-foreground">性别</span>
            <span>{{ GENDER_LABELS[person.gender] || person.gender }}</span>
          </div>
          <div
            v-if="person.birthDate"
            class="flex gap-2"
          >
            <span class="text-muted-foreground">生日</span>
            <span>{{ formatDate(person.birthDate) }}</span>
          </div>
          <div
            v-if="person.deathDate"
            class="flex gap-2"
          >
            <span class="text-muted-foreground">忌日</span>
            <span>{{ formatDate(person.deathDate) }}</span>
          </div>
          <div
            v-if="person.score !== null"
            class="flex gap-2"
          >
            <span class="text-muted-foreground">评分</span>
            <span class="text-warning">{{ (person.score / 10).toFixed(1) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Dialog -->
    <PersonBasicFormDialog
      v-if="isEditOpen"
      v-model:open="isEditOpen"
      :person-id="person.id"
    />
  </template>
</template>
