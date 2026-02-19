/**
 * Kisaki Plugin SDK - Vue Router Re-exports
 *
 * Provides Vue Router APIs from host application.
 */

import type { KisakiRendererAPI } from '../types/renderer.plugin'

const w = (typeof window !== 'undefined' ? window : globalThis) as unknown as {
  kisaki: KisakiRendererAPI
}

const router = w.kisaki.__deps['vue-router']

// Composition API
export const useRouter: typeof router.useRouter = router.useRouter
export const useRoute: typeof router.useRoute = router.useRoute
export const useLink: typeof router.useLink = router.useLink

// Components
export const RouterLink: typeof router.RouterLink = router.RouterLink
export const RouterView: typeof router.RouterView = router.RouterView

// Navigation Guards
export const onBeforeRouteLeave: typeof router.onBeforeRouteLeave = router.onBeforeRouteLeave
export const onBeforeRouteUpdate: typeof router.onBeforeRouteUpdate = router.onBeforeRouteUpdate

// Utilities
export const createRouter: typeof router.createRouter = router.createRouter
export const createWebHistory: typeof router.createWebHistory = router.createWebHistory
export const createWebHashHistory: typeof router.createWebHashHistory = router.createWebHashHistory
export const createMemoryHistory: typeof router.createMemoryHistory = router.createMemoryHistory
export const createRouterMatcher: typeof router.createRouterMatcher = router.createRouterMatcher
export const isNavigationFailure: typeof router.isNavigationFailure = router.isNavigationFailure
export const NavigationFailureType: typeof router.NavigationFailureType =
  router.NavigationFailureType
export const START_LOCATION: typeof router.START_LOCATION = router.START_LOCATION

// Route matching
export const loadRouteLocation: typeof router.loadRouteLocation = router.loadRouteLocation

// Re-export all types
export type * from 'vue-router'
