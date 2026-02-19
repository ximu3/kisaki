/**
 * Preferences Store
 *
 * Pinia store for user preferences with automatic persistence.
 * Uses pinia-plugin-persistedstate for localStorage sync.
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePreferencesStore = defineStore(
  'preferences',
  () => {
    /**
     * Whether to show NSFW content across the app.
     *
     * When false, all renderer-side data fetching should apply `isNsfw = false`
     * filtering at the query stage.
     */
    const showNsfw = ref(true)

    function setShowNsfw(value: boolean) {
      showNsfw.value = value
    }

    function toggleShowNsfw() {
      showNsfw.value = !showNsfw.value
    }

    return {
      showNsfw,
      setShowNsfw,
      toggleShowNsfw
    }
  },
  {
    persist: true
  }
)
