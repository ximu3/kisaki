<!--
  AddTrigger
  Global add trigger for sidebar with dropdown menu.
-->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@renderer/components/ui/icon'
import { cn, getEntityIcon } from '@renderer/utils'
import { Tooltip, TooltipTrigger, TooltipContent } from '@renderer/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import GameAdderDialog from './game-adder-dialog.vue'
import PersonAdderDialog from './person-adder-dialog.vue'
import CompanyAdderDialog from './company-adder-dialog.vue'
import CharacterAdderDialog from './character-adder-dialog.vue'

const router = useRouter()
const gameDialogOpen = ref(false)
const personDialogOpen = ref(false)
const companyDialogOpen = ref(false)
const characterDialogOpen = ref(false)
const dropdownOpen = ref(false)

function handleAddGame() {
  dropdownOpen.value = false
  gameDialogOpen.value = true
}

function handleAddCharacter() {
  dropdownOpen.value = false
  characterDialogOpen.value = true
}

function handleAddPerson() {
  dropdownOpen.value = false
  personDialogOpen.value = true
}

function handleAddCompany() {
  dropdownOpen.value = false
  companyDialogOpen.value = true
}

function handleAddScanner() {
  dropdownOpen.value = false
  router.push('/scanner')
}
</script>

<template>
  <Tooltip>
    <DropdownMenu v-model:open="dropdownOpen">
      <TooltipTrigger as-child>
        <DropdownMenuTrigger as-child>
          <button
            :class="
              cn(
                'group relative flex items-center justify-center size-10 rounded-md transition-colors',
                'text-surface-foreground hover:text-accent-foreground hover:bg-accent',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary'
              )
            "
          >
            <Icon
              icon="icon-[mdi--plus]"
              class="size-5"
            />
          </button>
        </DropdownMenuTrigger>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        :side-offset="8"
      >
        添加
      </TooltipContent>

      <DropdownMenuContent
        side="right"
        align="end"
        class="w-48"
      >
        <DropdownMenuItem
          class="gap-2"
          @select="handleAddGame"
        >
            <Icon
              :icon="getEntityIcon('game')"
              class="size-4"
            />
          <span>添加游戏</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          class="gap-2"
          @select="handleAddCharacter"
        >
            <Icon
              :icon="getEntityIcon('character')"
              class="size-4"
            />
          <span>添加角色</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          class="gap-2"
          @select="handleAddPerson"
        >
            <Icon
              :icon="getEntityIcon('person')"
              class="size-4"
            />
          <span>添加人物</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          class="gap-2"
          @select="handleAddCompany"
        >
            <Icon
              :icon="getEntityIcon('company')"
              class="size-4"
            />
          <span>添加公司</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          class="gap-2"
          @select="handleAddScanner"
        >
          <Icon
            icon="icon-[mdi--folder-plus-outline]"
            class="size-4"
          />
          <span>添加扫描器</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </Tooltip>

  <GameAdderDialog
    v-if="gameDialogOpen"
    v-model:open="gameDialogOpen"
  />
  <CharacterAdderDialog
    v-if="characterDialogOpen"
    v-model:open="characterDialogOpen"
  />
  <PersonAdderDialog
    v-if="personDialogOpen"
    v-model:open="personDialogOpen"
  />
  <CompanyAdderDialog
    v-if="companyDialogOpen"
    v-model:open="companyDialogOpen"
  />
</template>
