<!--
  ScraperSlotConfigFormDialog
  Dialog for editing a single slot's configuration (merge strategy + providers).
  Providers are managed inline without nested dialogs.
-->
<script setup lang="ts">
import type { SlotConfig, MergeStrategy, ScraperProviderEntry, ScraperSlot } from '@shared/db'
import type { ContentEntityType } from '@shared/common'

import { ref, watch, computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
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
import { Switch } from '@renderer/components/ui/switch'
import { LocaleSelect } from '@renderer/components/ui/locale-select'
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldGroup,
  FieldDescription
} from '@renderer/components/ui/field'
import { Form } from '@renderer/components/ui/form'
import { cn } from '@renderer/utils'

interface Props {
  entityType: ContentEntityType
  slotType: ScraperSlot
  slotName: string
  slotConfig: SlotConfig
  onSave: (config: SlotConfig) => void
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const MERGE_STRATEGY_OPTIONS: { value: MergeStrategy; label: string; description: string }[] = [
  { value: 'first', label: '首个', description: '使用第一个有效结果' },
  { value: 'merge', label: '合并', description: '合并多个结果，以第一个有效结果为基础' },
  { value: 'append', label: '追加', description: '将所有结果追加到列表中' }
]

// Form state
const mergeStrategy = ref<MergeStrategy>('first')
const providerEntries = ref<ScraperProviderEntry[]>([])

// Initialize form state when dialog opens
watch(
  () => open.value,
  (isOpen) => {
    if (isOpen && props.slotConfig) {
      mergeStrategy.value = props.slotConfig.mergeStrategy
      providerEntries.value = [...props.slotConfig.providers]
    }
  },
  { immediate: true }
)

// Computed for existing provider IDs (for exclude list)
const existingProviderIds = computed(() => providerEntries.value.map((e) => e.providerId))

// Handlers for provider management
function handleAddProvider(providerId: string) {
  if (!providerId) return
  providerEntries.value.push({
    providerId,
    enabled: true,
    priority: providerEntries.value.length,
    locale: undefined
  })
}

function handleRemoveProvider(index: number) {
  providerEntries.value.splice(index, 1)
  // Reindex priorities
  providerEntries.value.forEach((e, i) => (e.priority = i))
}

function handleMoveUp(index: number) {
  if (index <= 0) return
  const entries = providerEntries.value
  ;[entries[index - 1], entries[index]] = [entries[index], entries[index - 1]]
  entries.forEach((e, i) => (e.priority = i))
}

function handleMoveDown(index: number) {
  if (index >= providerEntries.value.length - 1) return
  const entries = providerEntries.value
  ;[entries[index], entries[index + 1]] = [entries[index + 1], entries[index]]
  entries.forEach((e, i) => (e.priority = i))
}

function handleSubmit() {
  props.onSave({
    mergeStrategy: mergeStrategy.value,
    providers: providerEntries.value
  })
  open.value = false
}

// Sorted providers for display (need shallow copy for sort stability)
const sortedProviders = computed(() =>
  [...providerEntries.value].sort((a, b) => a.priority - b.priority)
)
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>配置: {{ props.slotName }}</DialogTitle>
      </DialogHeader>
      <Form @submit="handleSubmit">
        <DialogBody class="max-h-[60vh] overflow-auto scrollbar-thin">
          <FieldGroup>
            <!-- Merge Strategy -->
            <Field>
              <FieldLabel>合并策略</FieldLabel>
              <FieldDescription>多个提供者返回数据时的处理方式</FieldDescription>
              <FieldContent>
                <Select v-model="mergeStrategy">
                  <SelectTrigger
                    class="w-full"
                  >
                    <SelectValue placeholder="选择合并策略" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="opt in MERGE_STRATEGY_OPTIONS"
                      :key="opt.value"
                      :value="opt.value"
                      :description="opt.description"
                    >
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <!-- Providers - inline management -->
            <Field>
              <FieldLabel>数据提供者</FieldLabel>
              <FieldDescription>选择为此槽位提供数据的来源，可调整优先级</FieldDescription>
              <FieldContent>
                <div class="space-y-1.5">
                  <p
                    v-if="providerEntries.length === 0"
                    class="text-sm text-muted-foreground text-center py-4 border rounded-lg bg-muted/30"
                  >
                    暂无提供者
                  </p>
                  <div
                    v-for="(entry, index) in sortedProviders"
                    :key="entry.providerId"
                    :class="
                      cn(
                        'flex items-center gap-2 p-2 rounded-lg border bg-card',
                        !entry.enabled && 'opacity-50'
                      )
                    "
                  >
                    <Switch
                      v-model="entry.enabled"
                      class="shrink-0"
                    />
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium truncate">{{ entry.providerId }}</div>
                    </div>
                    <!-- Inline locale select with label -->
                    <div class="flex items-center gap-1.5 shrink-0">
                      <span class="text-xs text-muted-foreground">语言:</span>
                      <LocaleSelect
                        v-model="entry.locale"
                        class="w-20"
                        size="sm"
                        placeholder="默认"
                      />
                    </div>
                    <!-- Actions - always visible -->
                    <div class="flex items-center gap-0.5 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        :disabled="index === 0"
                        class="size-6"
                        @click="handleMoveUp(index)"
                      >
                        <Icon
                          icon="icon-[mdi--arrow-up]"
                          class="size-3.5"
                        />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        :disabled="index === providerEntries.length - 1"
                        class="size-6"
                        @click="handleMoveDown(index)"
                      >
                        <Icon
                          icon="icon-[mdi--arrow-down]"
                          class="size-3.5"
                        />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        class="size-6 text-destructive hover:text-destructive"
                        @click="handleRemoveProvider(index)"
                      >
                        <Icon
                          icon="icon-[mdi--close]"
                          class="size-3.5"
                        />
                      </Button>
                    </div>
                  </div>
                  <!-- Direct add provider select -->
                  <ScraperProviderSelect
                    model-value=""
                    :entity-type="props.entityType"
                    :required-capabilities="[props.slotType]"
                    :exclude-provider-ids="existingProviderIds"
                    placeholder="添加提供者..."
                    size="sm"
                    :auto-select-first="false"
                    @change="handleAddProvider"
                  />
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
</template>
