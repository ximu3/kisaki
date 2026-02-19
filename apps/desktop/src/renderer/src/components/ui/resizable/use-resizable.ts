import { inject, provide, type InjectionKey } from 'vue'

export interface ResizableContext {
  leftWidth: number
  rightWidth: number
  containerWidth: number
  handleSize: number
  isResizing: boolean
  startResize: (e: MouseEvent) => void
  resetToDefault: () => void
}

const resizableKey: InjectionKey<ResizableContext> = Symbol('resizable')

/**
 * Provide resizable context to child components
 * Used internally by ResizableLayout
 */
export function useProvideResizable(context: ResizableContext) {
  provide(resizableKey, context)
  return context
}

/**
 * Inject resizable context from parent ResizableLayout
 * Used internally by ResizablePanel and ResizableHandle
 */
export function useResizable() {
  const context = inject(resizableKey)
  if (!context) {
    throw new Error('Resizable components must be used within ResizableLayout')
  }
  return context
}
