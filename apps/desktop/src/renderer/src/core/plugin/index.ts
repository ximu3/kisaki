/**
 * Renderer Plugin System
 *
 * Re-exports for the renderer plugin system.
 */

// Context initialization
export { initializeKisakiGlobal, type KisakiRendererAPI } from './context'

// Loader functions
export { getLoadedPlugins, setupPluginEventListeners, fetchInitialPlugins } from './loader'
