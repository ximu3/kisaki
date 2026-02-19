/**
 * Kisaki Plugin SDK - Pinia Re-exports
 *
 * Provides Pinia APIs from host application.
 */

import type { KisakiRendererAPI } from '../types/renderer.plugin'

const w = (typeof window !== 'undefined' ? window : globalThis) as unknown as {
  kisaki: KisakiRendererAPI
}

const pinia = w.kisaki.__deps.pinia

// Core
export const createPinia: typeof pinia.createPinia = pinia.createPinia
export const defineStore: typeof pinia.defineStore = pinia.defineStore
export const storeToRefs: typeof pinia.storeToRefs = pinia.storeToRefs
export const setActivePinia: typeof pinia.setActivePinia = pinia.setActivePinia
export const getActivePinia: typeof pinia.getActivePinia = pinia.getActivePinia

// Plugins
export const acceptHMRUpdate: typeof pinia.acceptHMRUpdate = pinia.acceptHMRUpdate

// Map helpers
export const mapStores: typeof pinia.mapStores = pinia.mapStores
export const mapState: typeof pinia.mapState = pinia.mapState
export const mapActions: typeof pinia.mapActions = pinia.mapActions
export const mapWritableState: typeof pinia.mapWritableState = pinia.mapWritableState

// Dispose
export const disposePinia: typeof pinia.disposePinia = pinia.disposePinia

// Re-export all types
export type * from 'pinia'
