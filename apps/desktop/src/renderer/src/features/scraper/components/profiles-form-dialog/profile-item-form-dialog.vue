<!--
  ScraperProfilesItemFormDialog
  Dialog for editing a single scraper profile item.
  Uses local state only - receives profile prop and returns via onSave callback.
  Slot list is displayed inline - clicking a slot opens ScraperSlotConfigFormDialog.
-->
<script setup lang="ts">
import type { ScraperProfile, ScraperSlotConfigs, SlotConfig, ScraperSlot } from '@shared/db'
import type { ContentEntityType } from '@shared/common'
import type { Locale } from '@shared/locale'

import { ref, watch, computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import {
  createEmptySlotConfig,
  getScraperSlotsForMediaType,
  normalizeSlotConfigs
} from '@shared/scraper'
import { ScraperProviderSelect } from '@renderer/components/shared/scraper'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { LocaleSelect } from '@renderer/components/ui/locale-select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldGroup,
  FieldDescription
} from '@renderer/components/ui/field'
import { Form } from '@renderer/components/ui/form'
import ScraperProfileSlotConfigFormDialog from './profile-slot-config-form-dialog.vue'

interface Props {
  profile: ScraperProfile | null
  isNew: boolean
  onSave: (profile: ScraperProfile) => void
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const MEDIA_TYPE_LABELS: Record<ContentEntityType, string> = {
  game: '游戏',
  character: '角色',
  person: '人物',
  company: '公司'
}

const SLOT_LABELS: Record<ScraperSlot, string> = {
  info: '基本信息',
  tags: '标签',
  characters: '角色',
  persons: '人物',
  companies: '公司',
  covers: '封面',
  backdrops: '背景图',
  logos: 'Logo',
  icons: '图标',
  photos: '照片'
}

const MERGE_STRATEGY_LABELS: Record<string, string> = {
  first: '首个',
  merge: '合并',
  append: '追加'
}

// Form state
interface FormData {
  name: string
  mediaType: ContentEntityType
  searchProviderId: string
  defaultLocale: Locale | null
  slotConfigs: ScraperSlotConfigs
}

const formData = ref<FormData>({
  name: '',
  mediaType: 'game',
  searchProviderId: '',
  defaultLocale: null,
  slotConfigs: normalizeSlotConfigs('game', null)
})

// Slot editing state
const editingSlot = ref<ScraperSlot | null>(null)
const slotDialogOpen = ref(false)

// Initialize form state when dialog opens
watch(
  () => open.value,
  (isOpen) => {
    if (isOpen && props.profile) {
      formData.value.name = props.profile.name
      formData.value.mediaType = props.profile.mediaType
      formData.value.searchProviderId = props.profile.searchProviderId
      formData.value.defaultLocale = props.profile.defaultLocale
      formData.value.slotConfigs = normalizeSlotConfigs(
        props.profile.mediaType,
        props.profile.slotConfigs
      )
    }
  },
  { immediate: true }
)

watch(
  () => formData.value.mediaType,
  (mediaType) => {
    formData.value.slotConfigs = normalizeSlotConfigs(mediaType, formData.value.slotConfigs)
  }
)

const slotsForMediaType = computed(() => getScraperSlotsForMediaType(formData.value.mediaType))

// Computed for slot editing
const editingSlotConfig = computed(() => {
  if (!editingSlot.value) return null
  return formData.value.slotConfigs[editingSlot.value] ?? createEmptySlotConfig()
})

function handleSlotClick(slot: ScraperSlot) {
  editingSlot.value = slot
  slotDialogOpen.value = true
}

function handleSlotSave(config: SlotConfig) {
  if (editingSlot.value) {
    formData.value.slotConfigs = {
      ...formData.value.slotConfigs,
      [editingSlot.value]: config
    }
  }
  editingSlot.value = null
  slotDialogOpen.value = false
}

// Clean up state when slot dialog closes (handles cancel scenario)
watch(
  () => slotDialogOpen.value,
  (isOpen) => {
    if (!isOpen) {
      editingSlot.value = null
    }
  }
)

function handleSubmit() {
  if (!formData.value.name.trim() || !props.profile) return

  props.onSave({
    ...props.profile,
    name: formData.value.name.trim(),
    mediaType: formData.value.mediaType,
    searchProviderId: formData.value.searchProviderId,
    defaultLocale: formData.value.defaultLocale,
    slotConfigs: formData.value.slotConfigs,
    updatedAt: new Date()
  })
  open.value = false
}

// Computed model for media type (Select returns unknown type)
const mediaTypeModel = computed({
  get: () => formData.value.mediaType,
  set: (value: unknown) => {
    if (value === 'game' || value === 'character' || value === 'person' || value === 'company') {
      formData.value.mediaType = value
    }
  }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ props.isNew ? '添加配置' : '编辑配置' }}</DialogTitle>
      </DialogHeader>
      <Form @submit="handleSubmit">
        <DialogBody class="max-h-[70vh] overflow-auto scrollbar-thin">
          <FieldGroup>
            <!-- Profile Name -->
            <Field>
              <FieldLabel>配置名称</FieldLabel>
              <FieldContent>
                <Input
                  v-model="formData.name"
                  required
                  placeholder="例如: 视觉小说"
                />
              </FieldContent>
            </Field>

            <!-- Media Type -->
            <Field>
              <FieldLabel>媒体类型</FieldLabel>
              <FieldContent>
                <Select v-model="mediaTypeModel">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="选择媒体类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="game">{{ MEDIA_TYPE_LABELS.game }}</SelectItem>
                    <SelectItem value="character">{{ MEDIA_TYPE_LABELS.character }}</SelectItem>
                    <SelectItem value="person">{{ MEDIA_TYPE_LABELS.person }}</SelectItem>
                    <SelectItem value="company">{{ MEDIA_TYPE_LABELS.company }}</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <!-- Search Provider -->
            <Field>
              <FieldLabel>搜索提供者</FieldLabel>
              <FieldContent>
                <ScraperProviderSelect
                  v-model="formData.searchProviderId"
                  :entity-type="formData.mediaType"
                  :required-capabilities="['search']"
                />
              </FieldContent>
            </Field>

            <!-- Default Locale -->
            <Field>
              <FieldLabel class="flex items-center gap-1.5">
                默认语言
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Icon
                      icon="icon-[mdi--information-outline]"
                      class="size-3.5 text-muted-foreground cursor-help"
                    />
                  </TooltipTrigger>
                  <TooltipContent class="max-w-xs">
                    语言偏好设置，会传递给各提供者。实际是否生效取决于提供者的实现。若未指定，将使用系统语言。
                  </TooltipContent>
                </Tooltip>
              </FieldLabel>
              <FieldContent>
                <LocaleSelect
                  v-model="formData.defaultLocale"
                  placeholder="选择默认语言"
                />
              </FieldContent>
            </Field>

            <!-- Slot Configs - inline list -->
            <Field>
              <FieldLabel>槽位配置</FieldLabel>
              <FieldDescription>点击槽位配置数据来源和合并策略</FieldDescription>
              <FieldContent>
                <div class="space-y-1">
                  <button
                    v-for="slot in slotsForMediaType"
                    :key="slot"
                    type="button"
                    class="w-full flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left"
                    @click="() => handleSlotClick(slot)"
                  >
                    <span class="text-sm font-medium">{{ SLOT_LABELS[slot] }}</span>
                    <div class="flex items-center gap-2 text-muted-foreground">
                      <span class="text-xs font-mono">
                        {{
                          MERGE_STRATEGY_LABELS[formData.slotConfigs[slot]?.mergeStrategy] || '首个'
                        }}
                        ·
                        {{
                          formData.slotConfigs[slot]?.providers.filter((p) => p.enabled).length || 0
                        }}
                        个提供者
                      </span>
                      <Icon
                        icon="icon-[mdi--chevron-right]"
                        class="size-4"
                      />
                    </div>
                  </button>
                </div>
              </FieldContent>
            </Field>
          </FieldGroup>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            @click="open = false"
          >
            取消
          </Button>
          <Button type="submit">保存</Button>
        </DialogFooter>
      </Form>
    </DialogContent>
  </Dialog>

  <!-- Slot Config Sub-Dialog -->
  <ScraperProfileSlotConfigFormDialog
    v-if="editingSlot && editingSlotConfig"
    v-model:open="slotDialogOpen"
    :entity-type="formData.mediaType"
    :slot-type="editingSlot"
    :slot-name="SLOT_LABELS[editingSlot]"
    :slot-config="editingSlotConfig"
    :on-save="handleSlotSave"
  />
</template>
