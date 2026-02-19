/**
 * Menu Components Types
 *
 * Shared type definitions for menu components.
 * Used by all entity menu items (game, person, character, company).
 */

import type { Component } from 'vue'

/**
 * Menu component primitives type.
 * Allows menu items to work with both ContextMenu and DropdownMenu.
 */
export interface MenuComponents {
  Item: Component
  Sub: Component
  SubTrigger: Component
  SubContent: Component
  Separator: Component
  CheckboxItem: Component
  RadioGroup: Component
  RadioItem: Component
}
