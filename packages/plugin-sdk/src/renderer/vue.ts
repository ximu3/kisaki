/**
 * Kisaki Plugin SDK - Vue Re-exports
 *
 * Provides Vue APIs from host application.
 * Plugins import from here instead of 'vue' directly.
 */

import type { KisakiRendererAPI } from '../types/renderer.plugin'

// Access global kisaki object
const w = (typeof window !== 'undefined' ? window : globalThis) as unknown as {
  kisaki: KisakiRendererAPI
}

const vue = w.kisaki.__deps.vue

// Reactivity
export const ref: typeof vue.ref = vue.ref
export const computed: typeof vue.computed = vue.computed
export const reactive: typeof vue.reactive = vue.reactive
export const readonly: typeof vue.readonly = vue.readonly
export const watch: typeof vue.watch = vue.watch
export const watchEffect: typeof vue.watchEffect = vue.watchEffect
export const watchPostEffect: typeof vue.watchPostEffect = vue.watchPostEffect
export const watchSyncEffect: typeof vue.watchSyncEffect = vue.watchSyncEffect
export const shallowRef: typeof vue.shallowRef = vue.shallowRef
export const triggerRef: typeof vue.triggerRef = vue.triggerRef
export const customRef: typeof vue.customRef = vue.customRef
export const shallowReactive: typeof vue.shallowReactive = vue.shallowReactive
export const shallowReadonly: typeof vue.shallowReadonly = vue.shallowReadonly
export const toRaw: typeof vue.toRaw = vue.toRaw
export const markRaw: typeof vue.markRaw = vue.markRaw
export const toRef: typeof vue.toRef = vue.toRef
export const toRefs: typeof vue.toRefs = vue.toRefs
export const toValue: typeof vue.toValue = vue.toValue
export const unref: typeof vue.unref = vue.unref
export const isRef: typeof vue.isRef = vue.isRef
export const isReactive: typeof vue.isReactive = vue.isReactive
export const isReadonly: typeof vue.isReadonly = vue.isReadonly
export const isProxy: typeof vue.isProxy = vue.isProxy
export const effectScope: typeof vue.effectScope = vue.effectScope
export const getCurrentScope: typeof vue.getCurrentScope = vue.getCurrentScope
export const onScopeDispose: typeof vue.onScopeDispose = vue.onScopeDispose

// Lifecycle
export const onMounted: typeof vue.onMounted = vue.onMounted
export const onUpdated: typeof vue.onUpdated = vue.onUpdated
export const onUnmounted: typeof vue.onUnmounted = vue.onUnmounted
export const onBeforeMount: typeof vue.onBeforeMount = vue.onBeforeMount
export const onBeforeUpdate: typeof vue.onBeforeUpdate = vue.onBeforeUpdate
export const onBeforeUnmount: typeof vue.onBeforeUnmount = vue.onBeforeUnmount
export const onActivated: typeof vue.onActivated = vue.onActivated
export const onDeactivated: typeof vue.onDeactivated = vue.onDeactivated
export const onErrorCaptured: typeof vue.onErrorCaptured = vue.onErrorCaptured
export const onRenderTracked: typeof vue.onRenderTracked = vue.onRenderTracked
export const onRenderTriggered: typeof vue.onRenderTriggered = vue.onRenderTriggered
export const onServerPrefetch: typeof vue.onServerPrefetch = vue.onServerPrefetch

// Dependency Injection
export const provide: typeof vue.provide = vue.provide
export const inject: typeof vue.inject = vue.inject
export const hasInjectionContext: typeof vue.hasInjectionContext = vue.hasInjectionContext

// Component
export const defineComponent: typeof vue.defineComponent = vue.defineComponent
export const defineAsyncComponent: typeof vue.defineAsyncComponent = vue.defineAsyncComponent
export const getCurrentInstance: typeof vue.getCurrentInstance = vue.getCurrentInstance
export const h: typeof vue.h = vue.h
export const createVNode: typeof vue.createVNode = vue.createVNode
export const cloneVNode: typeof vue.cloneVNode = vue.cloneVNode
export const mergeProps: typeof vue.mergeProps = vue.mergeProps
export const isVNode: typeof vue.isVNode = vue.isVNode
export const resolveComponent: typeof vue.resolveComponent = vue.resolveComponent
export const resolveDirective: typeof vue.resolveDirective = vue.resolveDirective
export const withDirectives: typeof vue.withDirectives = vue.withDirectives
export const withModifiers: typeof vue.withModifiers = vue.withModifiers

// Utilities
export const nextTick: typeof vue.nextTick = vue.nextTick
export const defineModel: typeof vue.defineModel = vue.defineModel
export const defineProps: typeof vue.defineProps = vue.defineProps
export const defineEmits: typeof vue.defineEmits = vue.defineEmits
export const defineExpose: typeof vue.defineExpose = vue.defineExpose
export const defineOptions: typeof vue.defineOptions = vue.defineOptions
export const defineSlots: typeof vue.defineSlots = vue.defineSlots
export const withDefaults: typeof vue.withDefaults = vue.withDefaults
export const useSlots: typeof vue.useSlots = vue.useSlots
export const useAttrs: typeof vue.useAttrs = vue.useAttrs
export const useModel: typeof vue.useModel = vue.useModel
export const useTemplateRef: typeof vue.useTemplateRef = vue.useTemplateRef
export const useId: typeof vue.useId = vue.useId

// Transition
export const Transition: typeof vue.Transition = vue.Transition
export const TransitionGroup: typeof vue.TransitionGroup = vue.TransitionGroup

// Teleport & Suspense
export const Teleport: typeof vue.Teleport = vue.Teleport
export const Suspense: typeof vue.Suspense = vue.Suspense
export const KeepAlive: typeof vue.KeepAlive = vue.KeepAlive

// Fragment
export const Fragment: typeof vue.Fragment = vue.Fragment
export const Text: typeof vue.Text = vue.Text
export const Comment: typeof vue.Comment = vue.Comment
export const Static: typeof vue.Static = vue.Static

// SFC Template Helpers (used by Vue compiler for SFC templates)
export const openBlock: typeof vue.openBlock = vue.openBlock
export const createBlock: typeof vue.createBlock = vue.createBlock
export const createElementBlock: typeof vue.createElementBlock = vue.createElementBlock
export const createElementVNode: typeof vue.createElementVNode = vue.createElementVNode
export const createTextVNode: typeof vue.createTextVNode = vue.createTextVNode
export const createCommentVNode: typeof vue.createCommentVNode = vue.createCommentVNode
export const createStaticVNode: typeof vue.createStaticVNode = vue.createStaticVNode
export const renderList: typeof vue.renderList = vue.renderList
export const renderSlot: typeof vue.renderSlot = vue.renderSlot
export const toDisplayString: typeof vue.toDisplayString = vue.toDisplayString
export const normalizeClass: typeof vue.normalizeClass = vue.normalizeClass
export const normalizeStyle: typeof vue.normalizeStyle = vue.normalizeStyle
export const normalizeProps: typeof vue.normalizeProps = vue.normalizeProps
export const guardReactiveProps: typeof vue.guardReactiveProps = vue.guardReactiveProps
export const withCtx: typeof vue.withCtx = vue.withCtx
export const withKeys: typeof vue.withKeys = vue.withKeys
export const withMemo: typeof vue.withMemo = vue.withMemo
export const isMemoSame: typeof vue.isMemoSame = vue.isMemoSame
export const resolveDynamicComponent: typeof vue.resolveDynamicComponent =
  vue.resolveDynamicComponent
export const setBlockTracking: typeof vue.setBlockTracking = vue.setBlockTracking
export const pushScopeId: typeof vue.pushScopeId = vue.pushScopeId
export const popScopeId: typeof vue.popScopeId = vue.popScopeId
export const withScopeId: typeof vue.withScopeId = vue.withScopeId

// Re-export all types
export type * from 'vue'
