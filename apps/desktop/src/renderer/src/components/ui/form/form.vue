<!-- Form wrapper component with validation feedback -->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { notify } from '@renderer/core/notify'
import { cn } from '@renderer/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: []
}>()

/**
 * Handle form submit event, preventing default browser behavior
 */
function handleFormSubmit(e: Event) {
  e.preventDefault()
  emit('submit')
}

const formRef = ref<HTMLFormElement | null>(null)

/**
 * Get the label text for a form field
 */
function getFieldLabel(input: HTMLElement): string | null {
  // Method 1: Via aria-label or aria-labelledby
  const ariaLabel = input.getAttribute('aria-label')
  if (ariaLabel) return ariaLabel

  const ariaLabelledBy = input.getAttribute('aria-labelledby')
  if (ariaLabelledBy) {
    const labelElement = document.getElementById(ariaLabelledBy)
    if (labelElement?.textContent) return labelElement.textContent.trim()
  }

  // Method 2: Via id to find corresponding label[for]
  const inputId = input.id
  if (inputId) {
    const label = document.querySelector(`label[for="${inputId}"]`)
    if (label?.textContent) return label.textContent.trim()
  }

  // Method 3: Find parent label element
  const parentLabel = input.closest('label')
  if (parentLabel?.textContent) {
    // Remove input's own text, keep only label text
    const clone = parentLabel.cloneNode(true) as HTMLElement
    const inputs = clone.querySelectorAll('input, select, textarea')
    inputs.forEach((el) => el.remove())
    const text = clone.textContent?.trim()
    if (text) return text
  }

  // Method 4: Infer from placeholder
  const placeholder = input.getAttribute('placeholder')
  if (placeholder) return placeholder

  return null
}

/**
 * Handle invalid event (capture phase) to show custom validation messages
 */
function handleInvalid(event: Event) {
  event.preventDefault() // Prevent native tooltip

  const input = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  const errorMessage = input.validationMessage

  if (!errorMessage) return

  // Get field label
  const fieldLabel = getFieldLabel(input)

  // Build full error message
  const fullMessage = fieldLabel ? `${fieldLabel}: ${errorMessage}` : errorMessage

  // Show error via notify
  notify.warning(fullMessage)

  // Focus on error field
  input.focus()
}

onMounted(() => {
  const form = formRef.value
  if (!form) return

  // Use capture phase to listen for invalid events
  form.addEventListener('invalid', handleInvalid, true)
})

onUnmounted(() => {
  const form = formRef.value
  if (!form) return

  form.removeEventListener('invalid', handleInvalid, true)
})
</script>

<template>
  <form
    ref="formRef"
    :class="cn('relative', props.class)"
    data-slot="form"
    @submit="handleFormSubmit"
  >
    <slot />
  </form>
</template>
