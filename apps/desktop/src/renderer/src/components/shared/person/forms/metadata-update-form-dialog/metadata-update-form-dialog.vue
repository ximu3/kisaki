<!--
  PersonMetadataUpdateFormDialog
  Update person metadata from scraper results via MetadataUpdaterService.
-->
<script setup lang="ts">
import { computed, ref, toRaw, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { ipcManager } from '@renderer/core/ipc'
import { notify } from '@renderer/core/notify'
import { useAsyncData } from '@renderer/composables'
import { personExternalIds, persons } from '@shared/db'
import type { ExternalId } from '@shared/metadata'
import {
  PERSON_METADATA_UPDATE_FIELDS,
  type PersonMetadataUpdateField,
  type PersonMetadataUpdateInput,
  type MetadataUpdateApply,
  type MetadataUpdateStrategy
} from '@shared/metadata-updater'
import { PersonSearcher, type PersonSearcherSelection } from '@renderer/components/shared/person'
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
  personId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const isSubmitting = ref(false)

const selection = ref<PersonSearcherSelection>({
  profileId: '',
  personId: '',
  personName: '',
  originalName: '',
  knownIds: [],
  canSubmit: false
})

const applyMode = ref<MetadataUpdateApply>('ifMissing')
const strategy = ref<MetadataUpdateStrategy>('merge')
const selectedFields = ref<PersonMetadataUpdateField[]>([...PERSON_METADATA_UPDATE_FIELDS])
const useCurrentExternalIdsAsKnownIds = ref(true)

const FIELD_LABELS: Record<PersonMetadataUpdateField, string> = {
  name: '名称',
  originalName: '原名',
  birthDate: '出生日期',
  deathDate: '去世日期',
  gender: '性别',
  description: '简介',
  relatedSites: '相关链接',
  externalIds: '外部 ID',
  tags: '标签',
  photos: '照片'
}

const { data, isLoading } = useAsyncData(
  async () => {
    const person = await db.query.persons.findFirst({ where: eq(persons.id, props.personId) })
    if (!person) return null

    const rows = await db
      .select({ source: personExternalIds.source, id: personExternalIds.externalId })
      .from(personExternalIds)
      .where(eq(personExternalIds.personId, props.personId))

    const externalIds: ExternalId[] = rows.map((row) => ({ source: row.source, id: row.id }))

    return { person, externalIds }
  },
  {
    watch: [() => props.personId],
    enabled: () => open.value
  }
)

const defaultSearchQuery = computed(() => {
  const person = data.value?.person
  if (!person) return ''
  return person.originalName || person.name || ''
})

const canSubmit = computed(() => {
  const profileId = selection.value.profileId
  return !!profileId && selectedFields.value.length > 0 && !isSubmitting.value
})

function handleSelectionChange(next: PersonSearcherSelection) {
  selection.value = next
}

function toggleField(field: PersonMetadataUpdateField, nextValue: boolean) {
  const current = selectedFields.value
  if (nextValue) {
    if (!current.includes(field)) selectedFields.value = [...current, field]
    return
  }
  selectedFields.value = current.filter((f) => f !== field)
}

function handleSelectAll() {
  selectedFields.value = [...PERSON_METADATA_UPDATE_FIELDS]
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
      personId: '',
      personName: '',
      originalName: '',
      knownIds: [],
      canSubmit: false
    }
    applyMode.value = 'ifMissing'
    strategy.value = 'merge'
    selectedFields.value = [...PERSON_METADATA_UPDATE_FIELDS]
    useCurrentExternalIdsAsKnownIds.value = true
  }
)

async function handleSubmit() {
  if (!data.value?.person) return
  if (!selection.value.profileId) return
  if (selectedFields.value.length === 0) return

  const currentProfileId = selection.value.profileId
  const personId = props.personId

  const name =
    selection.value.originalName ||
    selection.value.personName ||
    data.value.person.originalName ||
    data.value.person.name

  const baseKnownIds = useCurrentExternalIdsAsKnownIds.value ? toRaw(data.value.externalIds) : []
  const selectionKnownIds = toRaw(selection.value.knownIds)
  const knownIds = dedupeExternalIds([...baseKnownIds, ...selectionKnownIds])

  const fields = [...selectedFields.value]
  const options = {
    fields: fieldsToOption(fields, PERSON_METADATA_UPDATE_FIELDS),
    apply: applyMode.value,
    strategy: strategy.value
  } as const

  open.value = false
  const toastId = notify.loading('更新元数据中...')
  isSubmitting.value = true

  try {
    const metadataResult = await ipcManager.invoke(
      'scraper:get-person-metadata',
      currentProfileId,
      {
        name,
        knownIds
      }
    )
    if (!metadataResult.success) throw new Error(metadataResult.error)
    if (!metadataResult.data) throw new Error('无法获取元数据，请检查网络或更换刮削器配置')

    const updateMetadata = pickFields(
      metadataResult.data as unknown as Record<string, unknown>,
      fields
    )
    const updateResult = await ipcManager.invoke(
      'metadata-updater:update-person',
      personId,
      updateMetadata as unknown as PersonMetadataUpdateInput,
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
            <PersonSearcher
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
                      v-for="field in PERSON_METADATA_UPDATE_FIELDS"
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
                <FieldDescription>请勿在当前人物为错误目标的情况下使用</FieldDescription>
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
