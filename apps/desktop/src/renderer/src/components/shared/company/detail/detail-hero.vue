<!--
  CompanyDetailHero
  Hero section for company detail dialog.
  Shows logo and basic stats.
-->
<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { useCompany } from '@renderer/composables'
import { CompanyBasicFormDialog } from '../forms'
import { getAttachmentUrl, formatDate, getEntityIcon } from '@renderer/utils'

const { company } = useCompany()

const isEditOpen = ref(false)
</script>

<template>
  <template v-if="company">
    <div class="flex gap-4 mb-4 group">
      <!-- Logo -->
      <div class="w-24 aspect-square rounded-lg overflow-hidden shrink-0 bg-muted border shadow-sm">
        <img
          v-if="company.logoFile"
          :src="
            getAttachmentUrl('companies', company.id, company.logoFile, {
              width: 200,
              height: 200
            })
          "
          :alt="company.name"
          class="size-full object-cover"
        />
        <div
          v-else
          class="size-full flex items-center justify-center"
        >
          <Icon
            :icon="getEntityIcon('company')"
            class="size-8 text-muted-foreground/50"
          />
        </div>
      </div>

      <!-- Basic info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h2 class="text-lg font-semibold truncate">{{ company.name }}</h2>
            <p
              v-if="company.originalName"
              class="text-sm text-muted-foreground truncate"
            >
              {{ company.originalName }}
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
            v-if="company.foundedDate"
            class="flex gap-2"
          >
            <span class="text-muted-foreground">成立日期</span>
            <span>{{ formatDate(company.foundedDate) }}</span>
          </div>
          <div
            v-if="company.score !== null"
            class="flex gap-2"
          >
            <span class="text-muted-foreground">评分</span>
            <span class="text-warning">{{ (company.score / 10).toFixed(1) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Dialog -->
    <CompanyBasicFormDialog
      v-if="isEditOpen"
      v-model:open="isEditOpen"
      :company-id="company.id"
    />
  </template>
</template>
