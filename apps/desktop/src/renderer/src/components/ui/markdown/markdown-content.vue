<script setup lang="ts">
import { computed } from 'vue'
import { renderMarkdown } from './markdown-render'
import { cn } from '@renderer/utils'

interface Props {
  content: string
  class?: string
}

const props = defineProps<Props>()

const html = computed(() => renderMarkdown(props.content ?? ''))

function onMarkdownClick(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof Element)) return

  const link = target.closest('a')
  if (!(link instanceof HTMLAnchorElement)) return

  const href = link.getAttribute('href')
  if (!href?.startsWith('#')) return

  const id = href.slice(1)
  if (!id) return

  event.preventDefault()
  event.stopPropagation()

  const el = document.getElementById(decodeURIComponent(id))
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div
    :class="cn('prose prose-xs max-w-none', props.class)"
    @click="onMarkdownClick"
    v-html="html"
  />
</template>
