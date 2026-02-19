<!--
  ScraperProfilesItem
  Individual profile item in the scraper profiles list.
  Displays profile info with action buttons for edit, delete, and reorder.
-->
<script setup lang="ts">
import type { ScraperProfile } from '@shared/db'

import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { getEntityIcon } from '@renderer/utils'

interface Props {
  profile: ScraperProfile
  index: number
  totalCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [profile: ScraperProfile]
  delete: [profileId: string]
  moveUp: [index: number]
  moveDown: [index: number]
}>()
</script>

<template>
  <div class="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 group">
    <!-- Icon -->
    <div class="shrink-0">
      <div class="size-10 rounded-md bg-muted flex items-center justify-center">
        <Icon
          :icon="getEntityIcon(props.profile.mediaType)"
          class="size-5 text-muted-foreground"
        />
      </div>
    </div>

    <!-- Profile Info -->
    <div class="flex-1 min-w-0">
      <div class="text-sm font-medium truncate">
        {{ props.profile.name || '(未命名)' }}
      </div>
      <div class="text-xs text-muted-foreground truncate">
        搜索: {{ props.profile.searchProviderId }}
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        :disabled="props.index === 0"
        class="size-7"
        @click="emit('moveUp', props.index)"
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
        :disabled="props.index === props.totalCount - 1"
        class="size-7"
        @click="emit('moveDown', props.index)"
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
        @click="emit('edit', props.profile)"
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
        @click="emit('delete', props.profile.id)"
      >
        <Icon
          icon="icon-[mdi--delete-outline]"
          class="size-4"
        />
      </Button>
    </div>
  </div>
</template>
