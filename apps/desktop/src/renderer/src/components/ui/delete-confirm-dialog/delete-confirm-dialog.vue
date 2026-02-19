<!-- Delete Confirm Dialog component -->
<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel
} from '@renderer/components/ui/alert-dialog'
import { Spinner } from '@renderer/components/ui/spinner'

interface Props {
  entityLabel: string
  entityName?: string
  /**
   * Mode of the dialog:
   * - 'delete': Permanent deletion from database (default)
   * - 'remove': Removal from form/list (not permanent)
   */
  mode?: 'delete' | 'remove'
  /**
   * Whether the dialog is loading data.
   * When true, shows a spinner instead of content.
   */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'delete',
  loading: false
})

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  confirm: []
}>()

const isDeleting = ref(false)

// Computed text based on mode
const titleText = computed(() => {
  if (props.mode === 'remove') {
    return `确认移除${props.entityLabel}？`
  }
  return `确认删除${props.entityLabel}？`
})

const descriptionText = computed(() => {
  if (props.mode === 'remove') {
    if (props.entityName) {
      return `确定要移除「${props.entityName}」吗？`
    }
    return `确定要移除此${props.entityLabel}吗？`
  }
  // delete mode
  if (props.entityName) {
    return `确定要删除「${props.entityName}」吗？此操作无法撤销，${props.entityLabel}数据将被永久删除。`
  }
  return `此操作无法撤销，${props.entityLabel}数据将被永久删除。`
})

const actionText = computed(() => {
  if (props.mode === 'remove') {
    return isDeleting.value ? '移除中...' : '移除'
  }
  return isDeleting.value ? '删除中...' : '删除'
})

async function handleConfirm() {
  isDeleting.value = true
  try {
    emit('confirm')
    // Wait for next tick to ensure event handler completes before closing
    // This prevents v-if from destroying the component before @confirm is processed
    await nextTick()
    open.value = false
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <AlertDialog v-model:open="open">
    <AlertDialogContent>
      <!-- Loading state -->
      <div
        v-if="props.loading"
        class="flex items-center justify-center py-8"
      >
        <Spinner class="size-8" />
      </div>

      <!-- Normal content -->
      <template v-else>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ titleText }}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          <div class="space-y-4">
            <p>{{ descriptionText }}</p>
            <slot />
          </div>
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="isDeleting">取消</AlertDialogCancel>
          <AlertDialogAction
            :disabled="isDeleting"
            @click="handleConfirm"
          >
            {{ actionText }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </template>
    </AlertDialogContent>
  </AlertDialog>
</template>
