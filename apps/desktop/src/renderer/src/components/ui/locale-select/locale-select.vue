<!-- Locale Select component -->
<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import type { Locale } from '@shared/locale'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@renderer/components/ui/select'
import { cn } from '@renderer/utils'

interface Props {
  placeholder?: string
  allowEmpty?: boolean
  class?: HTMLAttributes['class']
  triggerClass?: HTMLAttributes['class']
  size?: 'default' | 'sm'
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '选择语言',
  allowEmpty: true,
  size: 'default'
})

const model = defineModel<Locale | null>({ default: null })

// Use special key for empty value
const selectValue = computed({
  get: () => model.value || '__empty__',
  set: (v) => {
    model.value = v === '__empty__' ? null : (v as Locale)
  }
})

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁體中文',
  ja: '日本語',
  ko: '한국어',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  pt: 'Português',
  it: 'Italiano',
  ru: 'Русский',
  vi: 'Tiếng Việt',
  th: 'ไทย',
  id: 'Bahasa Indonesia',
  pl: 'Polski',
  tr: 'Türkçe',
  ar: 'العربية',
  uk: 'Українська'
}

const ALL_LOCALES: Locale[] = [
  'zh-Hans',
  'zh-Hant',
  'ja',
  'en',
  'ko',
  'ar',
  'de',
  'es',
  'fr',
  'id',
  'it',
  'pl',
  'pt',
  'ru',
  'th',
  'tr',
  'uk',
  'vi'
]

const displayValue = computed(() => {
  if (!model.value) return null
  return props.size === 'sm'
    ? model.value
    : `${LOCALE_LABELS[model.value as Locale]} (${model.value})`
})
</script>

<template>
  <Select v-model="selectValue">
    <SelectTrigger
      :size="props.size"
      :class="cn('w-auto min-w-20', props.triggerClass, props.class)"
    >
      <span
        v-if="displayValue"
        class="truncate"
        >{{ displayValue }}</span
      >
      <span
        v-else
        class="text-muted-foreground"
        >{{ props.placeholder }}</span
      >
    </SelectTrigger>
    <SelectContent>
      <SelectItem
        v-if="props.allowEmpty"
        value="__empty__"
        class="text-muted-foreground"
      >
        不指定
      </SelectItem>
      <SelectItem
        v-for="locale in ALL_LOCALES"
        :key="locale"
        :value="locale"
      >
        {{ LOCALE_LABELS[locale] }} ({{ locale }})
      </SelectItem>
    </SelectContent>
  </Select>
</template>
