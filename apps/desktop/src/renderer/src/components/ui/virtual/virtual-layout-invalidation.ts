export type LayoutInvalidateCallback = () => void

/**
 * Shared per-scroll-parent layout invalidation registry.
 * Used to keep `scrollMargin` correct when sibling virtual components
 * change height/width (e.g. collapsible groups, dynamic collections).
 */
const layoutListeners = new WeakMap<HTMLElement, Set<LayoutInvalidateCallback>>()

/**
 * Subscribe to layout invalidation events for a scroll parent.
 * @returns Unsubscribe function
 */
export function onLayoutInvalidate(
  scrollParent: HTMLElement,
  callback: LayoutInvalidateCallback
): () => void {
  let listeners = layoutListeners.get(scrollParent)
  if (!listeners) {
    listeners = new Set<LayoutInvalidateCallback>()
    layoutListeners.set(scrollParent, listeners)
  }
  listeners.add(callback)
  return () => {
    const set = layoutListeners.get(scrollParent)
    if (!set) return
    set.delete(callback)
    if (set.size === 0) layoutListeners.delete(scrollParent)
  }
}

/**
 * Notify all subscribers that layout has changed for a scroll parent.
 */
export function invalidateLayout(scrollParent: HTMLElement): void {
  const listeners = layoutListeners.get(scrollParent)
  if (!listeners) return
  for (const callback of listeners) callback()
}
