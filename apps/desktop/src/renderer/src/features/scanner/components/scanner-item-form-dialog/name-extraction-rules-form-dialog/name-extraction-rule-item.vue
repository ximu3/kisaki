<script setup lang="ts">
import type { NameExtractionRule } from '@shared/db'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { Switch } from '@renderer/components/ui/switch'

interface Props {
  rule: NameExtractionRule
  isFirst: boolean
  isLast: boolean
}

const props = defineProps<Props>()
const enabled = defineModel<boolean>('enabled', { required: true })

const emit = defineEmits<{
  moveUp: []
  moveDown: []
  edit: []
  delete: []
}>()
</script>

<template>
  <div class="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 group">
    <Switch
      v-model="enabled"
      class="shrink-0"
    />
    <div class="flex-1 min-w-0">
      <div class="text-sm font-medium truncate">
        {{ props.rule.description || '（未命名规则）' }}
      </div>
      <div class="text-xs text-muted-foreground font-mono truncate">
        {{ props.rule.pattern }}
      </div>
    </div>
    <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        class="size-7"
        :disabled="props.isFirst"
        @click="emit('moveUp')"
      >
        <Icon
          icon="icon-[mdi--arrow-up]"
          class="size-4"
        />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        class="size-7"
        :disabled="props.isLast"
        @click="emit('moveDown')"
      >
        <Icon
          icon="icon-[mdi--arrow-down]"
          class="size-4"
        />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        class="size-7"
        @click="emit('edit')"
      >
        <Icon
          icon="icon-[mdi--pencil-outline]"
          class="size-4"
        />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        class="size-7 text-destructive hover:text-destructive"
        @click="emit('delete')"
      >
        <Icon
          icon="icon-[mdi--delete-outline]"
          class="size-4"
        />
      </Button>
    </div>
  </div>
</template>
