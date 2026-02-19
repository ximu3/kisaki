<script setup lang="ts">
import { ref, onErrorCaptured, type Ref } from 'vue'

const error: Ref<Error | null> = ref(null)
const errorInfo: Ref<string | null> = ref(null)

onErrorCaptured((err, _instance, info) => {
  error.value = err
  errorInfo.value = info
  console.error('ErrorBoundary caught an error:', err, info)
  return false
})

function resetError() {
  error.value = null
  errorInfo.value = null
}

function reloadApp() {
  window.location.reload()
}
</script>

<template>
  <div
    v-if="error"
    class="flex items-center justify-center h-screen bg-background"
  >
    <div class="max-w-2xl p-8 space-y-4">
      <div class="space-y-2">
        <h1 class="text-2xl font-bold text-destructive">应用程序错误</h1>
        <p class="text-muted-foreground">抱歉，应用程序遇到了一个错误。</p>
      </div>

      <div class="p-4 rounded-lg bg-muted space-y-2">
        <div>
          <h2 class="font-semibold text-sm mb-1">错误信息：</h2>
          <pre class="text-xs overflow-auto scrollbar-thin">{{ error.message }}</pre>
        </div>

        <div v-if="error.stack">
          <h2 class="font-semibold text-sm mb-1">堆栈跟踪：</h2>
          <pre class="text-xs overflow-auto scrollbar-thin max-h-60">{{ error.stack }}</pre>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          class="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          @click="resetError"
        >
          重试
        </button>
        <button
          class="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
          @click="reloadApp"
        >
          重新加载应用
        </button>
      </div>
    </div>
  </div>

  <slot v-else />
</template>
