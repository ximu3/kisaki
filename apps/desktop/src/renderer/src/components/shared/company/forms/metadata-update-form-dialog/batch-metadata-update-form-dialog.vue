<!--
  CompanyBatchMetadataUpdateFormDialog
  Batch update company metadata from scraper results.
-->
<script setup lang="ts">
import { computed, ref, toRaw, watch } from 'vue'
import { inArray } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { ipcManager } from '@renderer/core/ipc'
import { notify } from '@renderer/core/notify'
import { useAsyncData } from '@renderer/composables'
import { companyExternalIds, companies } from '@shared/db'
import type { ExternalId } from '@shared/metadata'
import {
  COMPANY_METADATA_UPDATE_FIELDS,
  type CompanyMetadataUpdateField,
  type CompanyMetadataUpdateInput,
  type MetadataUpdateApply,
  type MetadataUpdateStrategy
} from '@shared/metadata-updater'
import { fieldsToOption, mergeExternalIds, pickFields } from '@renderer/utils'
import { ScraperProfileSelect } from '@renderer/components/shared/scraper'
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
  companyIds: string[]
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const isSubmitting = ref(false)
const profileId = ref('')

const applyMode = ref<MetadataUpdateApply>('ifMissing')
const strategy = ref<MetadataUpdateStrategy>('merge')
const selectedFields = ref<CompanyMetadataUpdateField[]>([...COMPANY_METADATA_UPDATE_FIELDS])
const useCurrentExternalIdsAsKnownIds = ref(true)

const FIELD_LABELS: Record<CompanyMetadataUpdateField, string> = {
  name: '名称',
  originalName: '原名',
  foundedDate: '成立日期',
  description: '简介',
  relatedSites: '相关链接',
  externalIds: '外部 ID',
  tags: '标签',
  logos: '徽标'
}

const selectedCount = computed(() => props.companyIds.length)

const { data, isLoading } = useAsyncData(
  async () => {
    const ids = props.companyIds
    if (ids.length === 0) return []

    const rows = await db
      .select({ id: companies.id, name: companies.name, originalName: companies.originalName })
      .from(companies)
      .where(inArray(companies.id, ids))

    const extRows = await db
      .select({
        companyId: companyExternalIds.companyId,
        source: companyExternalIds.source,
        id: companyExternalIds.externalId
      })
      .from(companyExternalIds)
      .where(inArray(companyExternalIds.companyId, ids))

    const byId = new Map<string, ExternalId[]>()
    for (const ext of extRows) {
      const list = byId.get(ext.companyId) ?? []
      list.push({ source: ext.source, id: ext.id })
      byId.set(ext.companyId, list)
    }

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      originalName: row.originalName ?? null,
      externalIds: byId.get(row.id) ?? []
    }))
  },
  { watch: [() => props.companyIds], enabled: () => open.value }
)

const canSubmit = computed(() => {
  return (
    !!profileId.value &&
    selectedFields.value.length > 0 &&
    selectedCount.value > 0 &&
    !isSubmitting.value
  )
})

function toggleField(field: CompanyMetadataUpdateField, nextValue: boolean) {
  const current = selectedFields.value
  if (nextValue) {
    if (!current.includes(field)) selectedFields.value = [...current, field]
    return
  }
  selectedFields.value = current.filter((f) => f !== field)
}

function handleSelectAll() {
  selectedFields.value = [...COMPANY_METADATA_UPDATE_FIELDS]
}

function handleSelectNone() {
  selectedFields.value = []
}

watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen) return
    isSubmitting.value = false
    profileId.value = ''
    applyMode.value = 'ifMissing'
    strategy.value = 'merge'
    selectedFields.value = [...COMPANY_METADATA_UPDATE_FIELDS]
    useCurrentExternalIdsAsKnownIds.value = true
  }
)

async function handleSubmit() {
  if (!profileId.value) return
  if (selectedFields.value.length === 0) return
  if (!data.value || data.value.length === 0) return

  const currentProfileId = profileId.value
  const fields = [...selectedFields.value]
  const options = {
    fields: fieldsToOption(fields, COMPANY_METADATA_UPDATE_FIELDS),
    apply: applyMode.value,
    strategy: strategy.value
  } as const

  const entities = toRaw(data.value)

  open.value = false
  const toastTitle = '批量更新元数据中...'
  const toastId = notify.loading(toastTitle, `${entities.length} 个公司`)
  isSubmitting.value = true

  let okCount = 0
  const failed: Array<{ id: string; name: string; error: string }> = []

  const total = entities.length

  for (const [index, entity] of entities.entries()) {
    const queryName = entity.originalName || entity.name
    const baseKnownIds = useCurrentExternalIdsAsKnownIds.value ? entity.externalIds : []

    notify.update(toastId, {
      title: toastTitle,
      message: `${index + 1} / ${total}`,
      type: 'loading'
    })

    try {
      const searchResult = await ipcManager.invoke(
        'scraper:search-company',
        currentProfileId,
        queryName
      )
      if (!searchResult.success) throw new Error(searchResult.error)
      const first = searchResult.data?.[0]
      if (!first) throw new Error('无搜索结果')

      const knownIds = mergeExternalIds(baseKnownIds, first.externalIds ?? [])
      const lookupName = first.originalName || first.name || queryName

      const metadataResult = await ipcManager.invoke(
        'scraper:get-company-metadata',
        currentProfileId,
        { name: lookupName, knownIds }
      )
      if (!metadataResult.success) throw new Error(metadataResult.error)
      if (!metadataResult.data) throw new Error('无法获取元数据')

      const updateMetadata = pickFields(
        metadataResult.data as unknown as Record<string, unknown>,
        fields
      )
      const updateResult = await ipcManager.invoke(
        'metadata-updater:update-company',
        entity.id,
        updateMetadata as unknown as CompanyMetadataUpdateInput,
        options
      )
      if (!updateResult.success) throw new Error(updateResult.error)

      okCount++
    } catch (error) {
      failed.push({
        id: entity.id,
        name: queryName,
        error: error instanceof Error ? error.message : '未知错误'
      })
    }
  }

  const failCount = failed.length
  if (failCount === 0) {
    notify.update(toastId, {
      title: '批量更新完成',
      message: `${okCount} / ${entities.length}`,
      type: 'success'
    })
  } else if (okCount === 0) {
    notify.update(toastId, { title: '批量更新失败', message: failed[0]?.error, type: 'error' })
  } else {
    notify.update(toastId, {
      title: '批量更新完成（部分失败）',
      message: `成功 ${okCount}，失败 ${failCount}`,
      type: 'warning'
    })
  }

  isSubmitting.value = false
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
            批量更新元数据
            <span class="text-xs text-muted-foreground">{{ selectedCount }} 个公司</span>
          </DialogTitle>
        </DialogHeader>

        <Form @submit="handleSubmit">
          <DialogBody class="space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
            <FieldGroup>
              <Field>
                <FieldLabel>刮削器配置</FieldLabel>
                <FieldContent>
                  <ScraperProfileSelect
                    v-model="profileId"
                    media-type="company"
                  />
                </FieldContent>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel>
                  <span>更新字段</span>
                  <FieldDescription></FieldDescription>
                </FieldLabel>
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
                      v-for="field in COMPANY_METADATA_UPDATE_FIELDS"
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
                  {{ applyMode === 'ifMissing' ? '仅当当前字段为空时写入' : '总是覆盖写入' }}
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
                <FieldDescription>请勿在当前公司为错误目标的情况下使用</FieldDescription>
              </Field>
            </FieldGroup>
          </DialogBody>

          <DialogFooter>
            <div class="flex items-center gap-1.5 text-[11px] text-muted-foreground mr-auto">
              <Icon
                icon="icon-[mdi--lightbulb-outline]"
                class="size-3.5"
              />
              <span>将使用「原名」静默搜索并取第一个结果</span>
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
