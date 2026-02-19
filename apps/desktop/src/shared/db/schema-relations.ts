/**
 * Database schema - Relations
 *
 * Drizzle ORM relations for all tables.
 * Separated from table definitions to avoid circular imports.
 */

import { relations } from 'drizzle-orm'

import {
  games,
  gameNotes,
  gamePersonLinks,
  gameCompanyLinks,
  gameCharacterLinks,
  gameSessions,
  persons,
  companies,
  characters,
  characterPersonLinks,
  collections,
  collectionGameLinks,
  collectionCharacterLinks,
  collectionPersonLinks,
  collectionCompanyLinks,
  scraperProfiles,
  scanners,
  tags,
  gameTagLinks,
  characterTagLinks,
  personTagLinks,
  companyTagLinks,
  gameExternalIds,
  personExternalIds,
  companyExternalIds,
  characterExternalIds
} from './schema'

// =============================================================================
// Game Relations
// =============================================================================

export const gamesRelations = relations(games, ({ many }) => ({
  sessions: many(gameSessions),
  notes: many(gameNotes),
  gamePersonLinks: many(gamePersonLinks),
  gameCompanyLinks: many(gameCompanyLinks),
  gameCharacterLinks: many(gameCharacterLinks),
  collectionGameLinks: many(collectionGameLinks),
  gameTagLinks: many(gameTagLinks),
  externalIds: many(gameExternalIds)
}))

export const gameNotesRelations = relations(gameNotes, ({ one }) => ({
  game: one(games, {
    fields: [gameNotes.gameId],
    references: [games.id]
  })
}))

export const gameSessionsRelations = relations(gameSessions, ({ one }) => ({
  game: one(games, {
    fields: [gameSessions.gameId],
    references: [games.id]
  })
}))

export const gamePersonLinksRelations = relations(gamePersonLinks, ({ one }) => ({
  game: one(games, {
    fields: [gamePersonLinks.gameId],
    references: [games.id]
  }),
  person: one(persons, {
    fields: [gamePersonLinks.personId],
    references: [persons.id]
  })
}))

export const gameCompanyLinksRelations = relations(gameCompanyLinks, ({ one }) => ({
  game: one(games, {
    fields: [gameCompanyLinks.gameId],
    references: [games.id]
  }),
  company: one(companies, {
    fields: [gameCompanyLinks.companyId],
    references: [companies.id]
  })
}))

export const gameCharacterLinksRelations = relations(gameCharacterLinks, ({ one }) => ({
  game: one(games, {
    fields: [gameCharacterLinks.gameId],
    references: [games.id]
  }),
  character: one(characters, {
    fields: [gameCharacterLinks.characterId],
    references: [characters.id]
  })
}))

// =============================================================================
// Person Relations
// =============================================================================

export const personsRelations = relations(persons, ({ many }) => ({
  gamePersonLinks: many(gamePersonLinks),
  characterPersonLinks: many(characterPersonLinks),
  collectionPersonLinks: many(collectionPersonLinks),
  personTagLinks: many(personTagLinks),
  externalIds: many(personExternalIds)
}))

// =============================================================================
// Company Relations
// =============================================================================

export const companiesRelations = relations(companies, ({ many }) => ({
  gameCompanyLinks: many(gameCompanyLinks),
  collectionCompanyLinks: many(collectionCompanyLinks),
  companyTagLinks: many(companyTagLinks),
  externalIds: many(companyExternalIds)
}))

// =============================================================================
// Character Relations
// =============================================================================

export const charactersRelations = relations(characters, ({ many }) => ({
  gameCharacterLinks: many(gameCharacterLinks),
  characterPersonLinks: many(characterPersonLinks),
  collectionCharacterLinks: many(collectionCharacterLinks),
  characterTagLinks: many(characterTagLinks),
  externalIds: many(characterExternalIds)
}))

export const characterPersonLinksRelations = relations(characterPersonLinks, ({ one }) => ({
  character: one(characters, {
    fields: [characterPersonLinks.characterId],
    references: [characters.id]
  }),
  person: one(persons, {
    fields: [characterPersonLinks.personId],
    references: [persons.id]
  })
}))

// =============================================================================
// Collection Relations
// =============================================================================

export const collectionsRelations = relations(collections, ({ many }) => ({
  collectionGameLinks: many(collectionGameLinks),
  collectionCharacterLinks: many(collectionCharacterLinks),
  collectionPersonLinks: many(collectionPersonLinks),
  collectionCompanyLinks: many(collectionCompanyLinks),
  scanners: many(scanners)
}))

export const collectionGameLinksRelations = relations(collectionGameLinks, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionGameLinks.collectionId],
    references: [collections.id]
  }),
  game: one(games, {
    fields: [collectionGameLinks.gameId],
    references: [games.id]
  })
}))

export const collectionCharacterLinksRelations = relations(collectionCharacterLinks, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionCharacterLinks.collectionId],
    references: [collections.id]
  }),
  character: one(characters, {
    fields: [collectionCharacterLinks.characterId],
    references: [characters.id]
  })
}))

export const collectionPersonLinksRelations = relations(collectionPersonLinks, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionPersonLinks.collectionId],
    references: [collections.id]
  }),
  person: one(persons, {
    fields: [collectionPersonLinks.personId],
    references: [persons.id]
  })
}))

export const collectionCompanyLinksRelations = relations(collectionCompanyLinks, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionCompanyLinks.collectionId],
    references: [collections.id]
  }),
  company: one(companies, {
    fields: [collectionCompanyLinks.companyId],
    references: [companies.id]
  })
}))

// =============================================================================
// Scraper Profile Relations
// =============================================================================

export const scraperProfilesRelations = relations(scraperProfiles, ({ many }) => ({
  scanners: many(scanners)
}))

// =============================================================================
// Scanner Relations
// =============================================================================

export const scannersRelations = relations(scanners, ({ one }) => ({
  scraperProfile: one(scraperProfiles, {
    fields: [scanners.scraperProfileId],
    references: [scraperProfiles.id]
  }),
  targetCollection: one(collections, {
    fields: [scanners.targetCollectionId],
    references: [collections.id]
  })
}))

// =============================================================================
// Tag Relations
// =============================================================================

export const tagsRelations = relations(tags, ({ many }) => ({
  gameTagLinks: many(gameTagLinks),
  characterTagLinks: many(characterTagLinks),
  personTagLinks: many(personTagLinks),
  companyTagLinks: many(companyTagLinks)
}))

export const gameTagLinksRelations = relations(gameTagLinks, ({ one }) => ({
  game: one(games, {
    fields: [gameTagLinks.gameId],
    references: [games.id]
  }),
  tag: one(tags, {
    fields: [gameTagLinks.tagId],
    references: [tags.id]
  })
}))

export const characterTagLinksRelations = relations(characterTagLinks, ({ one }) => ({
  character: one(characters, {
    fields: [characterTagLinks.characterId],
    references: [characters.id]
  }),
  tag: one(tags, {
    fields: [characterTagLinks.tagId],
    references: [tags.id]
  })
}))

export const personTagLinksRelations = relations(personTagLinks, ({ one }) => ({
  person: one(persons, {
    fields: [personTagLinks.personId],
    references: [persons.id]
  }),
  tag: one(tags, {
    fields: [personTagLinks.tagId],
    references: [tags.id]
  })
}))

export const companyTagLinksRelations = relations(companyTagLinks, ({ one }) => ({
  company: one(companies, {
    fields: [companyTagLinks.companyId],
    references: [companies.id]
  }),
  tag: one(tags, {
    fields: [companyTagLinks.tagId],
    references: [tags.id]
  })
}))

// =============================================================================
// External ID Relations
// =============================================================================

export const gameExternalIdsRelations = relations(gameExternalIds, ({ one }) => ({
  game: one(games, {
    fields: [gameExternalIds.gameId],
    references: [games.id]
  })
}))

export const personExternalIdsRelations = relations(personExternalIds, ({ one }) => ({
  person: one(persons, {
    fields: [personExternalIds.personId],
    references: [persons.id]
  })
}))

export const companyExternalIdsRelations = relations(companyExternalIds, ({ one }) => ({
  company: one(companies, {
    fields: [companyExternalIds.companyId],
    references: [companies.id]
  })
}))

export const characterExternalIdsRelations = relations(characterExternalIds, ({ one }) => ({
  character: one(characters, {
    fields: [characterExternalIds.characterId],
    references: [characters.id]
  })
}))
