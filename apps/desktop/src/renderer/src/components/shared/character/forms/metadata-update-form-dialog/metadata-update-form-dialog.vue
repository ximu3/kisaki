<!--
  CharacterMetadataUpdateFormDialog
  Update character metadata from scraper results via MetadataUpdaterService.
-->
<script setup lang="ts">
import { computed, ref, toRaw, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { ipcManager } from '@renderer/core/ipc'
import { notify } from '@renderer/core/notify'
import { useAsyncData } from '@renderer/composables'
import { characterExternalIds, characters } from '@shared/db'
import type { ExternalId } from '@shared/metadata'
import {
  CHARACTER_METADATA_UPDATE_FIELDS,
  type CharacterMetadataUpdateField,
  type CharacterMetadataUpdateInput,
  type MetadataUpdateApply,
  type MetadataUpdateStrategy
} from '@shared/metadata-updater'
import {
  CharacterSearcher,
  type CharacterSearcherSelection
} from '@renderer/components/shared/character'
import { dedupeExternalIds, fieldsToOption, pickFields } from '@renderer/utils'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { Label } from '@renderer/components/ui/label'
import { Spinner } from '@renderer/components/ui/spinner'
import { Form } from '@renderer/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldGroup,
  FieldDescription
} from '@renderer/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'

interface Props {
  characterId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const isSubmitting = ref(false)

const selection = ref<CharacterSearcherSelection>({
  profileId: '',
  characterId: '',
  characterName: '',
  originalName: '',
  knownIds: [],
  canSubmit: false
})

const applyMode = ref<MetadataUpdateApply>('ifMissing')
const strategy = ref<MetadataUpdateStrategy>('merge')
const selectedFields = ref<CharacterMetadataUpdateField[]>([...CHARACTER_METADATA_UPDATE_FIELDS])
const useCurrentExternalIdsAsKnownIds = ref(true)

const FIELD_LABELS: Record<CharacterMetadataUpdateField, string> = {
  name: '名称',
  originalName: '原名',
  birthDate: '生日',
  gender: '性别',
  age: '年龄',
  bloodType: '血型',
  height: '身高',
  weight: '体重',
  bust: '胸围',
  waist: '腰围',
  hips: '臀围',
  cup: '罩杯',
  description: '简介',
  relatedSites: '相关链接',
  externalIds: '外部 ID',
  tags: '标签',
  photos: '照片'
}

const { data, isLoading } = useAsyncData(
  async () => {
    const character = await db.query.characters.findFirst({
      where: eq(characters.id, props.characterId)
    })
    if (!character) return null

    const rows = await db
      .select({ source: characterExternalIds.source, id: characterExternalIds.externalId })
      .from(characterExternalIds)
      .where(eq(characterExternalIds.characterId, props.characterId))

    const externalIds: ExternalId[] = rows.map((row) => ({ source: row.source, id: row.id }))

    return { character, externalIds }
  },
  { watch: [() => props.characterId], enabled: () => open.value }
)

const defaultSearchQuery = computed(() => {
  const character = data.value?.character
  if (!character) return ''
  return character.originalName || character.name || ''
})

const canSubmit = computed(() => {
  const currentProfileId = selection.value.profileId
  return !!currentProfileId && selectedFields.value.length > 0 && !isSubmitting.value
})

function handleSelectionChange(next: CharacterSearcherSelection) {
  selection.value = next
}

function toggleField(field: CharacterMetadataUpdateField, nextValue: boolean) {
  const current = selectedFields.value
  if (nextValue) {
    if (!current.includes(field)) selectedFields.value = [...current, field]
    return
  }
  selectedFields.value = current.filter((f) => f !== field)
}

function handleSelectAll() {
  selectedFields.value = [...CHARACTER_METADATA_UPDATE_FIELDS]
}

function handleSelectNone() {
  selectedFields.value = []
}

watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen) return
    isSubmitting.value = false
    selection.value = {
      profileId: '',
      characterId: '',
      characterName: '',
      originalName: '',
      knownIds: [],
      canSubmit: false
    }
    applyMode.value = 'ifMissing'
    strategy.value = 'merge'
    selectedFields.value = [...CHARACTER_METADATA_UPDATE_FIELDS]
    useCurrentExternalIdsAsKnownIds.value = true
  }
)

async function handleSubmit() {
  if (!data.value?.character) return
  if (!selection.value.profileId) return
  if (selectedFields.value.length === 0) return

  const currentProfileId = selection.value.profileId
  const characterId = props.characterId

  const name =
    selection.value.originalName ||
    selection.value.characterName ||
    data.value.character.originalName ||
    data.value.character.name

  const baseKnownIds = useCurrentExternalIdsAsKnownIds.value ? toRaw(data.value.externalIds) : []
  const selectionKnownIds = toRaw(selection.value.knownIds)
  const knownIds = dedupeExternalIds([...baseKnownIds, ...selectionKnownIds])

  const fields = [...selectedFields.value]
  const options = {
    fields: fieldsToOption(fields, CHARACTER_METADATA_UPDATE_FIELDS),
    apply: applyMode.value,
    strategy: strategy.value
  } as const

  open.value = false
  const toastId = notify.loading('更新元数据中...')
  isSubmitting.value = true

  try {
    const metadataResult = await ipcManager.invoke(
      'scraper:get-character-metadata',
      currentProfileId,
      { name, knownIds }
    )
    if (!metadataResult.success) throw new Error(metadataResult.error)
    if (!metadataResult.data) throw new Error('无法获取元数据，请检查网络或更换刮削器配置')

    const updateMetadata = pickFields(
      metadataResult.data as unknown as Record<string, unknown>,
      fields
    )
    const updateResult = await ipcManager.invoke(
      'metadata-updater:update-character',
      characterId,
      updateMetadata as unknown as CharacterMetadataUpdateInput,
      options
    )
    if (!updateResult.success) {
      notify.update(toastId, { title: '更新失败', message: updateResult.error, type: 'error' })
      return
    }

    const updatedCount = updateResult.data.updatedFields.length
    notify.update(toastId, {
      title: '更新完成',
      message: updatedCount ? `已更新 ${updatedCount} 个字段` : '没有字段被更新',
      type: updatedCount ? 'success' : 'info'
    })
  } catch (error) {
    notify.update(toastId, {
      title: '更新失败',
      message: error instanceof Error ? error.message : '未知错误',
      type: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-3xl">
      <template v-if="isLoading || !data">
        <DialogBody class="flex items-center justify-center py-10">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

      <template v-else>
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Icon
              icon="icon-[mdi--database-sync-outline]"
              class="size-4"
            />
            更新元数据
          </DialogTitle>
        </DialogHeader>

        <Form @submit="handleSubmit">
          <DialogBody class="space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
            <CharacterSearcher
              :default-search-query="defaultSearchQuery"
              :is-submitting="isSubmitting"
              @selection-change="handleSelectionChange"
            />

            <FieldGroup>
              <Field>
                <FieldLabel>更新字段</FieldLabel>
                <FieldContent>
                  <div class="flex items-center gap-2 pb-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      :disabled="isSubmitting"
                      @click="handleSelectAll"
                    >
                      全选
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      :disabled="isSubmitting"
                      @click="handleSelectNone"
                    >
                      全不选
                    </Button>
                  </div>
                  <div class="grid grid-cols-2 gap-x-6 gap-y-2">
                    <div
                      v-for="field in CHARACTER_METADATA_UPDATE_FIELDS"
                      :key="field"
                      class="flex items-center gap-2"
                    >
                      <Checkbox
                        :id="`field-${field}`"
                        :model-value="selectedFields.includes(field)"
                        :disabled="isSubmitting"
                        @update:model-value="(v) => toggleField(field, !!v)"
                      />
                      <Label
                        :for="`field-${field}`"
                        class="text-sm font-normal cursor-pointer"
                      >
                        {{ FIELD_LABELS[field] }}
                      </Label>
                    </div>
                  </div>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>应用时机</FieldLabel>
                <FieldContent>
                  <Select
                    v-model="applyMode"
                    :disabled="isSubmitting"
                  >
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="选择 Apply..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ifMissing">仅缺失时</SelectItem>
                      <SelectItem value="always">总是</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
                <FieldDescription>
                  {{ applyMode === 'ifMissing' ? '仅当当前字段为空时写入' : '总是写入' }}
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>更新策略</FieldLabel>
                <FieldContent>
                  <Select
                    v-model="strategy"
                    :disabled="isSubmitting"
                  >
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="选择 Strategy..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="merge">合并</SelectItem>
                      <SelectItem value="replace">替换</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
                <FieldDescription>
                  {{
                    strategy === 'merge'
                      ? '列表/ID 等去重合并；图片仅补全缺失'
                      : '用刮削结果替换现有值'
                  }}
                </FieldDescription>
              </Field>

              <Field orientation="horizontal">
                <FieldLabel>使用当前外部 ID 辅助刮削定位</FieldLabel>
                <FieldContent>
                  <Checkbox
                    id="use-current-external-ids"
                    v-model="useCurrentExternalIdsAsKnownIds"
                    :disabled="isSubmitting"
                  />
                </FieldContent>
                <FieldDescription>请勿在当前角色为错误目标的情况下使用</FieldDescription>
              </Field>
            </FieldGroup>
          </DialogBody>

          <DialogFooter>
            <div class="flex items-center gap-1.5 text-[11px] text-muted-foreground mr-auto">
              <Icon
                icon="icon-[mdi--lightbulb-outline]"
                class="size-3.5"
              />
              <span>不指定 ID 时将使用「原名」静默搜索并取第一个结果</span>
            </div>
            <Button
              type="button"
              variant="outline"
              :disabled="isSubmitting"
              @click="open = false"
            >
              取消
            </Button>
            <Button
              type="submit"
              :disabled="!canSubmit"
            >
              <template v-if="isSubmitting">
                <Icon
                  icon="icon-[mdi--loading]"
                  class="size-4 animate-spin"
                />
                更新中...
              </template>
              <template v-else>
                <Icon
                  icon="icon-[mdi--refresh]"
                  class="size-4"
                />
                更新
              </template>
            </Button>
          </DialogFooter>
        </Form>
      </template>
    </DialogContent>
  </Dialog>
</template>
