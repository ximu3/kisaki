<!--
  ScraperProfilesFormDialog
  Dialog for managing all scraper profiles.
  Follows name-extraction-rules-dialog pattern:
  - Local state array for profiles
  - Edit dialog for each profile
  - Footer: Add + Preset (left), Cancel + Save (right)
-->
<script setup lang="ts">
import type { ScraperProfile } from '@shared/db'
import type { ScraperCapability } from '@shared/scraper'
import type { ContentEntityType } from '@shared/common'

import { ref, watch, computed } from 'vue'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { Icon } from '@renderer/components/ui/icon'
import { notify } from '@renderer/core/notify'
import { db } from '@renderer/core/db'
import { useAsyncData, useEvent } from '@renderer/composables'
import { ipcManager } from '@renderer/core/ipc'
import { scraperProfiles } from '@shared/db'
import { createSlotConfigs } from '@shared/scraper'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Spinner } from '@renderer/components/ui/spinner'
import { DeleteConfirmDialog } from '@renderer/components/ui/delete-confirm-dialog'
import { ScraperPresetFormDialog } from '@renderer/components/shared/scraper'
import ScraperProfilesItemFormDialog from './profile-item-form-dialog.vue'
import ScraperProfilesItem from './profile-item.vue'
import ScraperNewProfileDialog from './new-profile-dialog.vue'

const open = defineModel<boolean>('open', { required: true })

type ProviderInfo = { id: string; name: string; capabilities: ScraperCapability[] }

// Profile form data type
interface ProfileFormData {
  profiles: ScraperProfile[]
  providersByType: Record<ContentEntityType, ProviderInfo[]>
}

// Fetch data when dialog opens
const { data, isLoading, refetch } = useAsyncData(
  async (): Promise<ProfileFormData> => {
    const [
      profilesData,
      gameProvidersResult,
      personProvidersResult,
      companyProvidersResult,
      characterProvidersResult
    ] = await Promise.all([
      db.select().from(scraperProfiles).orderBy(scraperProfiles.order),
      ipcManager.invoke('scraper:list-game-providers'),
      ipcManager.invoke('scraper:list-person-providers'),
      ipcManager.invoke('scraper:list-company-providers'),
      ipcManager.invoke('scraper:list-character-providers')
    ])
    return {
      profiles: profilesData,
      providersByType: {
        game: gameProvidersResult.success ? gameProvidersResult.data : [],
        person: personProvidersResult.success ? personProvidersResult.data : [],
        company: companyProvidersResult.success ? companyProvidersResult.data : [],
        character: characterProvidersResult.success ? characterProvidersResult.data : []
      }
    }
  },
  { enabled: () => open.value }
)

// Listen for external changes
useEvent('db:inserted', (payload) => {
  if (payload.table === 'scraper_profiles') refetch()
})
useEvent('db:deleted', (payload) => {
  if (payload.table === 'scraper_profiles') refetch()
})

// Local state for editing
const profiles = ref<ScraperProfile[]>([])
const initialProfilesRef = ref<ScraperProfile[]>([])
const editingProfile = ref<ScraperProfile | null>(null)
const isAddMode = ref(false)
const isPresetDialogOpen = ref(false)
const isProviderSelectOpen = ref(false)
const deleteProfileId = ref<string | null>(null)
const isSaving = ref(false)
const editDialogOpen = ref(false)

const providersByType = computed<Record<ContentEntityType, ProviderInfo[]>>(() => {
  return (
    data.value?.providersByType ?? {
      game: [],
      person: [],
      company: [],
      character: []
    }
  )
})

// Initialize local state when data loads
watch(
  () => data.value,
  (newData) => {
    if (newData) {
      profiles.value = [...newData.profiles]
      initialProfilesRef.value = [...newData.profiles]
    }
  },
  { immediate: true }
)

// Group profiles by media type
const groupedProfiles = computed(() => {
  return profiles.value.reduce(
    (acc, profile) => {
      const type = profile.mediaType || 'game'
      if (!acc[type]) acc[type] = []
      acc[type].push(profile)
      return acc
    },
    {} as Record<string, ScraperProfile[]>
  )
})

const mediaTypeLabels: Record<string, string> = {
  game: '游戏',
  character: '角色',
  person: '人物',
  company: '公司'
}

// Computed for delete dialog
const deleteDialogOpen = computed({
  get: () => deleteProfileId.value !== null,
  set: (value) => {
    if (!value) deleteProfileId.value = null
  }
})

const deleteProfileName = computed(() => {
  if (!deleteProfileId.value) return undefined
  const profile = profiles.value.find((p) => p.id === deleteProfileId.value)
  return profile?.name || undefined
})

function handleAddNew() {
  isProviderSelectOpen.value = true
}

function handleProviderSelected(mediaType: ContentEntityType, providerId: string) {
  // Find the provider to get its capabilities
  const provider = data.value?.providersByType[mediaType].find((p) => p.id === providerId)
  const capabilities = provider?.capabilities ?? []
  const newProfile: ScraperProfile = {
    id: nanoid(),
    name: '',
    description: null,
    mediaType,
    sourcePresetId: null,
    searchProviderId: providerId,
    defaultLocale: null,
    slotConfigs: createSlotConfigs(mediaType, providerId, capabilities),
    order: profiles.value.length,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  editingProfile.value = newProfile
  isAddMode.value = true
  editDialogOpen.value = true
}

function handleEdit(profile: ScraperProfile) {
  editingProfile.value = { ...profile }
  isAddMode.value = false
  editDialogOpen.value = true
}

function handleProfileSave(updatedProfile: ScraperProfile) {
  if (isAddMode.value) {
    profiles.value = [...profiles.value, updatedProfile]
  } else {
    profiles.value = profiles.value.map((p) => (p.id === updatedProfile.id ? updatedProfile : p))
  }
  editingProfile.value = null
  isAddMode.value = false
  editDialogOpen.value = false
}

// Clean up state when dialog closes (handles cancel scenario)
watch(
  () => editDialogOpen.value,
  (isOpen) => {
    if (!isOpen) {
      editingProfile.value = null
      isAddMode.value = false
    }
  }
)

function handleDeleteRequest(profileId: string) {
  deleteProfileId.value = profileId
}

function handleDeleteConfirm() {
  if (deleteProfileId.value) {
    profiles.value = profiles.value.filter((p) => p.id !== deleteProfileId.value)
  }
}

function handleMoveUp(index: number) {
  if (index <= 0) return
  const newProfiles = [...profiles.value]
  ;[newProfiles[index - 1], newProfiles[index]] = [newProfiles[index], newProfiles[index - 1]]
  profiles.value = newProfiles
}

function handleMoveDown(index: number) {
  if (index >= profiles.value.length - 1) return
  const newProfiles = [...profiles.value]
  ;[newProfiles[index], newProfiles[index + 1]] = [newProfiles[index + 1], newProfiles[index]]
  profiles.value = newProfiles
}

function handleAddPresets(presetProfiles: ScraperProfile[]) {
  profiles.value = [...profiles.value, ...presetProfiles]
}

async function handleSave() {
  isSaving.value = true
  try {
    // Delete removed profiles
    const currentIds = new Set(profiles.value.map((p) => p.id))
    const deletedIds = initialProfilesRef.value
      .filter((p) => !currentIds.has(p.id))
      .map((p) => p.id)
    for (const id of deletedIds) {
      await db.delete(scraperProfiles).where(eq(scraperProfiles.id, id))
    }

    // Upsert all profiles with updated order
    for (let i = 0; i < profiles.value.length; i++) {
      const profile = profiles.value[i]
      const isNew = !initialProfilesRef.value.some((p) => p.id === profile.id)

      if (isNew) {
        await db.insert(scraperProfiles).values({
          ...profile,
          order: i
        })
      } else {
        await db
          .update(scraperProfiles)
          .set({
            name: profile.name,
            description: profile.description,
            mediaType: profile.mediaType,
            searchProviderId: profile.searchProviderId,
            defaultLocale: profile.defaultLocale,
            slotConfigs: profile.slotConfigs,
            order: i
          })
          .where(eq(scraperProfiles.id, profile.id))
      }
    }

    notify.success('配置已保存')
    open.value = false
  } catch {
    notify.error('保存失败')
  } finally {
    isSaving.value = false
  }
}

function getGlobalIndex(profile: ScraperProfile): number {
  return profiles.value.findIndex((p) => p.id === profile.id)
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle>刮削配置管理</DialogTitle>
      </DialogHeader>

      <!-- Loading state -->
      <DialogBody
        v-if="isLoading || !data"
        class="flex items-center justify-center py-8"
      >
        <Spinner class="size-8" />
      </DialogBody>

      <!-- Content -->
      <template v-else>
        <DialogBody class="max-h-[60vh] overflow-auto scrollbar-thin">
          <p
            v-if="profiles.length === 0"
            class="text-sm text-muted-foreground text-center py-8"
          >
            暂无配置，点击下方按钮添加
          </p>
          <div
            v-else
            class="space-y-4"
          >
            <!-- Group profiles by media type -->
            <div
              v-for="[type, typeProfiles] in Object.entries(groupedProfiles)"
              :key="type"
            >
              <h4 class="text-xs font-medium text-muted-foreground mb-1">
                {{ mediaTypeLabels[type] || type }}
              </h4>
              <div class="space-y-1">
                <ScraperProfilesItem
                  v-for="profile in typeProfiles"
                  :key="profile.id"
                  :profile="profile"
                  :index="getGlobalIndex(profile)"
                  :total-count="profiles.length"
                  @edit="handleEdit"
                  @delete="handleDeleteRequest"
                  @move-up="handleMoveUp"
                  @move-down="handleMoveDown"
                />
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogFooter class="flex justify-between">
          <div class="flex gap-2">
            <Button
              type="button"
              variant="outline"
              @click="handleAddNew"
            >
              <Icon
                icon="icon-[mdi--plus]"
                class="size-4 mr-1"
              />
              添加配置
            </Button>
            <Button
              type="button"
              variant="outline"
              @click="isPresetDialogOpen = true"
            >
              <Icon
                icon="icon-[mdi--flash-outline]"
                class="size-4 mr-1"
              />
              选择预设
            </Button>
          </div>
          <div class="flex gap-2">
            <Button
              type="button"
              variant="outline"
              @click="open = false"
            >
              取消
            </Button>
            <Button
              type="button"
              :disabled="isSaving"
              @click="handleSave"
            >
              {{ isSaving ? '保存中...' : '保存' }}
            </Button>
          </div>
        </DialogFooter>
      </template>
    </DialogContent>
  </Dialog>

  <!-- Profile Edit Dialog -->
  <ScraperProfilesItemFormDialog
    v-if="editingProfile"
    v-model:open="editDialogOpen"
    :profile="editingProfile"
    :is-new="isAddMode"
    :on-save="handleProfileSave"
  />

  <!-- Preset Dialog -->
  <ScraperPresetFormDialog
    v-if="isPresetDialogOpen"
    v-model:open="isPresetDialogOpen"
    :on-add="handleAddPresets"
  />

  <!-- Delete Confirmation Dialog -->
  <DeleteConfirmDialog
    v-if="deleteDialogOpen"
    v-model:open="deleteDialogOpen"
    entity-label="配置"
    :entity-name="deleteProfileName"
    mode="remove"
    @confirm="handleDeleteConfirm"
  />

  <!-- New Profile Dialog -->
  <ScraperNewProfileDialog
    v-if="isProviderSelectOpen"
    v-model:open="isProviderSelectOpen"
    :providers-by-type="providersByType"
    @select="handleProviderSelected"
  />
</template>
