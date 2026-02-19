<!--
  Game Companies Tab

  Companies tab content showing game companies grouped by role.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { useGame } from '@renderer/composables/use-game'
import { getEntityIcon } from '@renderer/utils'
import { Button } from '@renderer/components/ui/button'
import { CompanyCard, CompanyDetailDialog } from '@renderer/components/shared/company'
import { GameCompaniesFormDialog } from '../../forms'

// =============================================================================
// Constants
// =============================================================================

const COMPANY_TYPE_LABELS: Record<string, string> = {
  developer: '开发',
  publisher: '发行',
  distributor: '分销',
  other: '其他'
}

const COMPANY_TYPE_ORDER = ['developer', 'publisher', 'distributor', 'other'] as const

// =============================================================================
// State
// =============================================================================

const { game, companies } = useGame()

const editDialogOpen = ref(false)
const openCompanyId = ref<string | null>(null)

// =============================================================================
// Computed
// =============================================================================

const hasCompanies = computed(() => companies.value && companies.value.length > 0)

/** Group companies by type */
const groupedCompanies = computed(() => {
  if (!hasCompanies.value) return {}
  return companies.value.reduce(
    (acc, link) => {
      const type = link.type || 'other'
      if (!acc[type]) acc[type] = []
      acc[type].push(link)
      return acc
    },
    {} as Record<string, typeof companies.value>
  )
})

const companyDialogOpen = computed({
  get: () => openCompanyId.value !== null,
  set: (value) => {
    if (!value) openCompanyId.value = null
  }
})
</script>

<template>
  <template v-if="game">
    <!-- Empty state -->
    <template v-if="!hasCompanies">
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <Icon
          :icon="getEntityIcon('company')"
          class="size-12 text-muted-foreground/30 mb-3"
        />
        <p class="text-sm text-muted-foreground">暂无公司信息</p>
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
          添加公司
        </Button>
      </div>
    </template>

    <!-- Companies list -->
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
          v-for="type in COMPANY_TYPE_ORDER"
          :key="type"
        >
          <div v-if="groupedCompanies[type]?.length">
            <h4 class="text-xs font-medium text-muted-foreground mb-2">
              {{ COMPANY_TYPE_LABELS[type] || type }}
            </h4>
            <div class="grid grid-cols-[repeat(auto-fill,6rem)] gap-3 justify-between">
              <template
                v-for="link in groupedCompanies[type]"
                :key="link.id"
              >
                <CompanyCard
                  v-if="link.company"
                  :company="link.company"
                  align="left"
                  size="sm"
                  @click="openCompanyId = link.company.id"
                />
              </template>
            </div>
          </div>
        </template>
      </div>
    </template>

    <!-- Edit Dialog -->
    <GameCompaniesFormDialog
      v-if="editDialogOpen"
      v-model:open="editDialogOpen"
      :game-id="game.id"
    />

    <!-- Company Detail Dialog -->
    <CompanyDetailDialog
      v-if="openCompanyId"
      v-model:open="companyDialogOpen"
      :company-id="openCompanyId"
    />
  </template>
</template>
