/**
 * Vue Router Configuration
 *
 * Hash history for Electron compatibility
 */

import { h } from 'vue'
import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useDefaultFromStore } from '@renderer/stores'
import { isContentEntityType } from '@shared/common'

// Library pages
import {
  LibraryLayout,
  ShowcasePage,
  GameDetailPage,
  PersonDetailPage,
  CharacterDetailPage,
  CompanyDetailPage,
  CollectionDetailPage,
  TagDetailPage,
  CollectionsPage,
  UncategorizedPage,
  FavoritesPage
} from '@renderer/features/library'

// Scanner page
import { ScannerPage } from '@renderer/features/scanner'

// Plugin page
import { PluginDiscoverPage, PluginInstalledPage, PluginLayout } from '@renderer/features/plugin'

// Statistics pages
import {
  StatisticsLayout,
  StatisticsOverviewPage,
  StatisticsWeeklyPage,
  StatisticsMonthlyPage,
  StatisticsYearlyPage
} from '@renderer/features/statistics'

// Placeholder component for routes during development
const PlaceholderPage = {
  name: 'PlaceholderPage',
  render() {
    return h(
      'div',
      { class: 'flex items-center justify-center h-full text-muted-foreground' },
      'Page under construction'
    )
  }
}

// Route definitions
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/library'
  },
  // Library routes
  {
    path: '/library',
    name: 'library',
    component: LibraryLayout,
    children: [
      {
        path: '',
        name: 'showcase',
        component: ShowcasePage
      },
      {
        path: 'game/:gameId',
        name: 'game-detail',
        component: GameDetailPage,
        props: true,
        meta: { entityType: 'game' }
      },
      {
        path: 'person/:personId',
        name: 'person-detail',
        component: PersonDetailPage,
        props: true,
        meta: { entityType: 'person' }
      },
      {
        path: 'character/:characterId',
        name: 'character-detail',
        component: CharacterDetailPage,
        props: true,
        meta: { entityType: 'character' }
      },
      {
        path: 'company/:companyId',
        name: 'company-detail',
        component: CompanyDetailPage,
        props: true,
        meta: { entityType: 'company' }
      },
      {
        path: 'collection/:collectionId',
        name: 'collection-detail',
        component: CollectionDetailPage,
        props: true,
        meta: { entityType: 'collection' }
      },
      {
        path: 'tag/:tagId',
        name: 'tag-detail',
        component: TagDetailPage,
        props: true,
        meta: { entityType: 'tag' }
      },
      {
        path: 'collections',
        name: 'collections',
        component: CollectionsPage
      },
      {
        path: 'uncategorized/:entityType',
        name: 'uncategorized',
        component: UncategorizedPage,
        props: true
      },
      {
        path: 'favorites',
        name: 'favorites',
        component: FavoritesPage
      }
    ]
  },
  // Statistics routes
  {
    path: '/statistics',
    component: StatisticsLayout,
    redirect: '/statistics/overview',
    children: [
      {
        path: 'overview',
        name: 'statistics-overview',
        component: StatisticsOverviewPage
      },
      {
        path: 'weekly',
        name: 'statistics-weekly',
        component: StatisticsWeeklyPage
      },
      {
        path: 'monthly',
        name: 'statistics-monthly',
        component: StatisticsMonthlyPage
      },
      {
        path: 'yearly',
        name: 'statistics-yearly',
        component: StatisticsYearlyPage
      }
    ]
  },
  // Scanner
  {
    path: '/scanner',
    name: 'scanner',
    component: ScannerPage
  },
  // Plugin
  {
    path: '/plugin',
    component: PluginLayout,
    redirect: '/plugin/discover',
    children: [
      {
        path: 'discover',
        name: 'plugin-discover',
        component: PluginDiscoverPage
      },
      {
        path: 'installed',
        name: 'plugin-installed',
        component: PluginInstalledPage
      }
    ]
  },
  // Updater
  {
    path: '/updater',
    name: 'updater',
    component: PlaceholderPage
  },
  // Catch-all 404
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@renderer/pages/not-found-page.vue')
  }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// Navigation guards
router.beforeEach((to, _from) => {
  // Auto-fill `from` query for content entity detail routes
  // Only ContentEntityType (game, character, person, company) needs the from parameter
  // OrganizerType (collection, tag) are containers themselves, not content to be organized
  const entityType = to.meta.entityType as string | undefined
  if (entityType && isContentEntityType(entityType) && !to.query.from) {
    const defaultFromStore = useDefaultFromStore()
    const paramKey = `${entityType}Id` as const
    const entityId = to.params[paramKey] as string | undefined

    if (entityId) {
      const defaultFrom = defaultFromStore.getFrom(entityType, entityId)
      return {
        ...to,
        query: { ...to.query, from: defaultFrom }
      }
    }
  }
  return true
})

router.afterEach((_to, _from) => {
  // Placeholder for analytics or tracking
})
