<!--
  TagDetailDialog
  Dialog view for tag details.
  Shows entities with this tag, supports entity type switching.
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { GameDetailDialog } from '@renderer/components/shared/game'
import { CharacterDetailDialog } from '@renderer/components/shared/character'
import { PersonDetailDialog } from '@renderer/components/shared/person'
import { CompanyDetailDialog } from '@renderer/components/shared/company'
import { useTagProvider, useRenderState } from '@renderer/composables'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Spinner } from '@renderer/components/ui/spinner'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import { MarkdownContent } from '@renderer/components/ui/markdown'
import { SegmentedControl, SegmentedControlItem } from '@renderer/components/ui/segmented-control'
import { TagDropdownMenu } from '../menus'
import { TagInfoFormDialog } from '../forms'
import TagDetailContent from './detail-content.vue'
import { type ContentEntityType, CONTENT_ENTITY_TYPES } from '@shared/common'

interface Props {
  tagId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const ENTITY_CONFIG: Record<ContentEntityType, { label: string; unitLabel: string }> = {
  game: { label: '游戏', unitLabel: '款' },
  character: { label: '角色', unitLabel: '个' },
  person: { label: '人物', unitLabel: '位' },
  company: { label: '公司', unitLabel: '家' }
}

// Use TagProvider
const { tag, entityType, setEntityType, isLoading, error } = useTagProvider(() => props.tagId)
const state = useRenderState(isLoading, error, tag)

// Edit dialog state
const editDialogOpen = ref(false)

// Scroll container ref for VirtualGrid (access via $el)
const dialogBodyRef = ref<InstanceType<typeof DialogBody>>()

type EntityClickPayload = { type: ContentEntityType; id: string }

const openGameId = ref<string | null>(null)
const openCharacterId = ref<string | null>(null)
const openPersonId = ref<string | null>(null)
const openCompanyId = ref<string | null>(null)

const gameDialogOpen = computed({
  get: () => openGameId.value !== null,
  set: (value) => {
    if (!value) openGameId.value = null
  }
})
const characterDialogOpen = computed({
  get: () => openCharacterId.value !== null,
  set: (value) => {
    if (!value) openCharacterId.value = null
  }
})
const personDialogOpen = computed({
  get: () => openPersonId.value !== null,
  set: (value) => {
    if (!value) openPersonId.value = null
  }
})
const companyDialogOpen = computed({
  get: () => openCompanyId.value !== null,
  set: (value) => {
    if (!value) openCompanyId.value = null
  }
})

function handleEntityClick(payload: EntityClickPayload) {
  openGameId.value = null
  openCharacterId.value = null
  openPersonId.value = null
  openCompanyId.value = null

  switch (payload.type) {
    case 'game':
      openGameId.value = payload.id
      return
    case 'character':
      openCharacterId.value = payload.id
      return
    case 'person':
      openPersonId.value = payload.id
      return
    case 'company':
      openCompanyId.value = payload.id
      return
  }
}

// Entity type for tabs v-model
const entityTypeModel = computed({
  get: () => entityType.value,
  set: (value: string) => setEntityType(value as ContentEntityType)
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-4xl max-h-[90vh] flex flex-col">
      <!-- Loading state -->
      <DialogBody
        v-if="state === 'loading'"
        class="flex items-center justify-center py-12"
      >
        <Spinner class="size-8" />
      </DialogBody>

      <!-- Error state -->
      <DialogBody
        v-else-if="state === 'error'"
        class="flex items-center justify-center py-12"
      >
        <div class="text-center">
          <Icon
            icon="icon-[mdi--alert-circle-outline]"
            class="size-12 text-destructive/50 mb-3 mx-auto"
          />
          <p class="text-lg font-medium">加载失败</p>
          <p class="text-sm text-muted-foreground mt-1">
            {{ error?.message ?? error }}
          </p>
        </div>
      </DialogBody>

      <!-- Not found state -->
      <DialogBody
        v-else-if="state === 'not-found'"
        class="flex items-center justify-center py-12"
      >
        <div class="text-center">
          <Icon
            icon="icon-[mdi--tag-off-outline]"
            class="size-12 text-muted-foreground/50 mb-3 mx-auto"
          />
          <p class="text-lg font-medium">标签不存在</p>
          <p class="text-sm text-muted-foreground mt-1">该标签可能已被删除</p>
        </div>
      </DialogBody>

      <!-- Content -->
      <template v-else-if="state === 'success' && tag">
        <DialogHeader>
          <div class="flex items-center gap-2">
            <DialogTitle>{{ tag.name }}</DialogTitle>
            <Badge
              v-if="tag.isNsfw"
              variant="destructive"
              class="text-[10px] px-1.5 py-0"
            >
              NSFW
            </Badge>
          </div>
          <MarkdownContent
            v-if="tag.description"
            :content="tag.description"
            class="text-sm text-muted-foreground mt-1 line-clamp-2 prose-p:my-0"
          />
        </DialogHeader>

        <DialogBody
          ref="dialogBodyRef"
          class="flex-1 min-h-0 overflow-auto scrollbar-thin"
        >
          <TagDetailContent
            :scroll-parent="dialogBodyRef?.$el"
            @entity-click="handleEntityClick"
          />
        </DialogBody>

        <DialogFooter>
          <div class="flex items-center justify-between w-full">
            <!-- Left: Entity type tabs -->
            <SegmentedControl v-model="entityTypeModel">
              <SegmentedControlItem
                v-for="type in CONTENT_ENTITY_TYPES"
                :key="type"
                :value="type"
              >
                {{ ENTITY_CONFIG[type].label }}
              </SegmentedControlItem>
            </SegmentedControl>

            <!-- Right: Action buttons -->
            <div class="flex items-center gap-2">
              <!-- Edit button -->
              <Button
                variant="secondary"
                size="sm"
                @click="editDialogOpen = true"
              >
                <Icon
                  icon="icon-[mdi--pencil-outline]"
                  class="size-4 mr-1.5"
                />
                编辑
              </Button>
              <TagDropdownMenu :tag-id="tag.id" />
            </div>
          </div>
        </DialogFooter>
      </template>
    </DialogContent>
  </Dialog>

  <!-- Edit dialog -->
  <TagInfoFormDialog
    v-if="editDialogOpen"
    v-model:open="editDialogOpen"
    :tag-id="props.tagId"
  />

  <!-- Entity Dialogs -->
  <GameDetailDialog
    v-if="openGameId"
    v-model:open="gameDialogOpen"
    :game-id="openGameId"
  />
  <CharacterDetailDialog
    v-if="openCharacterId"
    v-model:open="characterDialogOpen"
    :character-id="openCharacterId"
  />
  <PersonDetailDialog
    v-if="openPersonId"
    v-model:open="personDialogOpen"
    :person-id="openPersonId"
  />
  <CompanyDetailDialog
    v-if="openCompanyId"
    v-model:open="companyDialogOpen"
    :company-id="openCompanyId"
  />
</template>
