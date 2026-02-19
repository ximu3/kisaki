<!-- Spoiler Confirm Dialog component -->
<script setup lang="ts">
import { ref, nextTick } from 'vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@renderer/components/ui/alert-dialog'
import { Spinner } from '@renderer/components/ui/spinner'

interface Props {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '显示剧透？',
  description: '开启后将立即显示被标记为剧透的内容。',
  confirmText: '确认',
  cancelText: '取消',
  loading: false
})

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  confirm: []
}>()

const isConfirming = ref(false)

async function handleConfirm() {
  isConfirming.value = true
  try {
    emit('confirm')
    await nextTick()
    open.value = false
  } finally {
    isConfirming.value = false
  }
}
</script>

<template>
  <AlertDialog v-model:open="open">
    <AlertDialogContent>
      <div
        v-if="props.loading"
        class="flex items-center justify-center py-8"
      >
        <Spinner class="size-8" />
      </div>

      <template v-else>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ props.title }}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          <div class="space-y-4">
            <p>{{ props.description }}</p>
            <slot />
          </div>
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="isConfirming">{{ props.cancelText }}</AlertDialogCancel>
          <AlertDialogAction
            :disabled="isConfirming"
            @click="handleConfirm"
          >
            {{ props.confirmText }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </template>
    </AlertDialogContent>
  </AlertDialog>
</template>
