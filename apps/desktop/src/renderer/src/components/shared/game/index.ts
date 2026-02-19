// Game shared components re-exports

// Core components
export { default as GameCard } from './game-card.vue'
export { default as GamePlayButton } from './game-play-button.vue'
export { default as GameSearcher } from './game-searcher.vue'
export { default as GameSelect } from './game-select.vue'
export type { GameSearcherSelection } from './types'

// Menus
export {
  GameContextMenu,
  GameMenuItems,
  GameDropdownMenu,
  GameBatchContextMenu,
  GameBatchMenuItems
} from './menus'

// Forms
export {
  GameScoreFormDialog,
  GameDeleteFormDialog,
  GameBatchDeleteFormDialog,
  GameMetadataUpdateFormDialog,
  GameBatchMetadataUpdateFormDialog,
  GameExternalIdsFormDialog,
  GameInfoFormDialog,
  GameNameFormDialog,
  GameOriginalNameFormDialog,
  GameDescriptionFormDialog,
  GameStatusFormDialog,
  GameLastActiveFormDialog,
  GameTagsFormDialog,
  GameDurationFormDialog,
  GameRelatedSitesFormDialog,
  GameLaunchConfigFormDialog,
  GameCharactersFormDialog,
  GameCompaniesFormDialog,
  GamePersonsFormDialog,
  GameMediaFormDialog,
  GameNotesFormDialog,
  GameSavesFormDialog
} from './forms'

// Detail
export {
  GameDetailContent,
  GameDetailHero,
  GameDetailDialog,
  GameDetailOverviewTab,
  GameDetailCharactersTab,
  GameDetailPersonsTab,
  GameDetailCompaniesTab,
  GameDetailSavesTab,
  GameDetailNotesTab,
  GameDetailActivityTab
} from './detail'
