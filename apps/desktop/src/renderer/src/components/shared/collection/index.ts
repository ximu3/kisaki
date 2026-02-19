// Collection shared components re-exports

// Core components
export { default as CollectionCard } from './collection-card.vue'
export { default as CollectionSelect } from './collection-select.vue'

// Menus
export { CollectionContextMenu, CollectionDropdownMenu, CollectionMenuItems } from './menus'

// Forms
export {
  CollectionInfoFormDialog,
  CollectionEntitiesFormDialog,
  CollectionDynamicConfigFormDialog,
  CollectionConvertToStaticFormDialog,
  CollectionDeleteFormDialog
} from './forms'

// Detail
export { CollectionDetailContent, CollectionDetailDialog } from './detail'
