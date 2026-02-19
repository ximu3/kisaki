<script setup lang="ts">
/**
 * Scanner Name Extraction Rules Dialog
 *
 * Rules editor dialog:
 * - List of rules with enable/disable toggle
 * - Move up/down controls
 * - Edit/delete actions
 * - Opens rule form dialog and preset dialog
 */

import { ref, computed, watch } from 'vue'
import { nanoid } from 'nanoid'
import type { NameExtractionRule } from '@shared/db'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import ScannerNameExtractionRulesItemFormDialog from './name-extraction-rule-item-form-dialog.vue'
import ScannerNameExtractionPresetDialog from './name-extraction-rule-presets-dialog.vue'
import ScannerNameExtractionRuleItem from './name-extraction-rule-item.vue'

// =============================================================================
// Props & Model & Emits
// =============================================================================

interface Props {
  rules: NameExtractionRule[]
}

const props = defineProps<Props>()
const open = defineModel<boolean>('open', { required: true })

interface Emits {
  (e: 'save', rules: NameExtractionRule[]): void
}

const emit = defineEmits<Emits>()

// =============================================================================
// State
// =============================================================================

const localRules = ref<NameExtractionRule[]>([])
const editingRule = ref<NameExtractionRule | null>(null)
const isAddMode = ref(false)
const isPresetDialogOpen = ref(false)

// =============================================================================
// Computed
// =============================================================================

const isRuleFormOpen = computed({
  get: () => editingRule.value !== null,
  set: (value) => {
    if (!value) {
      editingRule.value = null
      isAddMode.value = false
    }
  }
})

// =============================================================================
// Initialize on Open
// =============================================================================

watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) {
      // Copy rules on open
      localRules.value = [...props.rules]
    }
  },
  { immediate: true }
)

// =============================================================================
// Handlers
// =============================================================================

function handleAddNew() {
  editingRule.value = {
    id: nanoid(),
    description: '',
    pattern: '',
    enabled: true
  }
  isAddMode.value = true
}

function handleEdit(rule: NameExtractionRule) {
  editingRule.value = { ...rule }
  isAddMode.value = false
}

function handleRuleSave(updatedRule: NameExtractionRule) {
  if (isAddMode.value) {
    localRules.value = [...localRules.value, updatedRule]
  } else {
    localRules.value = localRules.value.map((r) => (r.id === updatedRule.id ? updatedRule : r))
  }
  editingRule.value = null
  isAddMode.value = false
}

function handleRemove(ruleId: string) {
  localRules.value = localRules.value.filter((r) => r.id !== ruleId)
}

function handleToggleEnabled(ruleId: string) {
  localRules.value = localRules.value.map((r) =>
    r.id === ruleId ? { ...r, enabled: !r.enabled } : r
  )
}

// Helper to create checked model for a specific rule's enabled state
function createEnabledModel(ruleId: string) {
  return computed({
    get: () => localRules.value.find((r) => r.id === ruleId)?.enabled ?? false,
    set: () => handleToggleEnabled(ruleId)
  })
}

function handleMoveUp(index: number) {
  if (index <= 0) return
  const newRules = [...localRules.value]
  ;[newRules[index - 1], newRules[index]] = [newRules[index], newRules[index - 1]]
  localRules.value = newRules
}

function handleMoveDown(index: number) {
  if (index >= localRules.value.length - 1) return
  const newRules = [...localRules.value]
  ;[newRules[index], newRules[index + 1]] = [newRules[index + 1], newRules[index]]
  localRules.value = newRules
}

function handleAddPresets(presetRules: NameExtractionRule[]) {
  localRules.value = [...localRules.value, ...presetRules]
}

function handleSave() {
  emit('save', localRules.value)
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle>名称提取规则</DialogTitle>
      </DialogHeader>
      <DialogBody class="max-h-[60vh] overflow-auto scrollbar-thin">
        <p
          v-if="localRules.length === 0"
          class="text-sm text-muted-foreground text-center py-8"
        >
          暂无规则，点击下方按钮添加
        </p>
        <div
          v-else
          class="space-y-1"
        >
          <ScannerNameExtractionRuleItem
            v-for="(rule, index) in localRules"
            :key="rule.id"
            v-model:enabled="createEnabledModel(rule.id).value"
            :rule="rule"
            :is-first="index === 0"
            :is-last="index === localRules.length - 1"
            @move-up="handleMoveUp(index)"
            @move-down="handleMoveDown(index)"
            @edit="handleEdit(rule)"
            @delete="handleRemove(rule.id)"
          />
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
            添加规则
          </Button>
          <Button
            type="button"
            variant="outline"
            @click="isPresetDialogOpen = true"
          >
            <Icon
              icon="icon-[mdi--format-list-bulleted]"
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
            @click="handleSave"
          >
            保存
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>

    <ScannerNameExtractionRulesItemFormDialog
      v-if="isRuleFormOpen"
      v-model:open="isRuleFormOpen"
      :rule="editingRule"
      :is-new="isAddMode"
      @save="handleRuleSave"
    />

    <ScannerNameExtractionPresetDialog
      v-if="isPresetDialogOpen"
      v-model:open="isPresetDialogOpen"
      :existing-rule-ids="localRules.map((r) => r.id)"
      @add="handleAddPresets"
    />
  </Dialog>
</template>
