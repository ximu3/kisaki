/**
 * Helper Store
 *
 * Common query helpers for finding existing entities by name/externalId.
 * All methods are synchronous for better-sqlite3 compatibility.
 * All methods accept an optional DbContext parameter to work within transactions.
 */

import { eq, or, and } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from '@shared/db'
import {
  persons,
  companies,
  characters,
  games,
  tags,
  personExternalIds,
  companyExternalIds,
  characterExternalIds,
  gameExternalIds,
  type Person,
  type Company,
  type Character,
  type Game,
  type Tag
} from '@shared/db'
import type { ExternalId } from '@shared/metadata'
import type { DbContext } from './types'

export class HelperStore {
  constructor(private db: BetterSQLite3Database<typeof schema>) {}

  /**
   * Get db context (either provided transaction or default db instance)
   */
  private getDb(ctx?: DbContext): DbContext {
    return ctx ?? this.db
  }

  findExistingPerson(
    params: { name?: string; externalIds?: ExternalId[] },
    ctx?: DbContext
  ): Person | undefined {
    const db = this.getDb(ctx)

    // First check by externalIds (more specific match)
    if (params.externalIds && params.externalIds.length > 0) {
      for (const extId of params.externalIds) {
        const [row] = db
          .select()
          .from(personExternalIds)
          .where(
            and(
              eq(personExternalIds.source, extId.source),
              eq(personExternalIds.externalId, extId.id)
            )
          )
          .limit(1)
          .all()

        if (row) {
          const [person] = db
            .select()
            .from(persons)
            .where(eq(persons.id, row.personId))
            .limit(1)
            .all()
          if (person) return person
        }
      }
    }

    // Then check by name
    if (params.name) {
      const [result] = db
        .select()
        .from(persons)
        .where(or(eq(persons.name, params.name), eq(persons.originalName, params.name)))
        .limit(1)
        .all()

      return result
    }

    return undefined
  }

  findExistingCompany(
    params: { name?: string; externalIds?: ExternalId[] },
    ctx?: DbContext
  ): Company | undefined {
    const db = this.getDb(ctx)

    // First check by externalIds (more specific match)
    if (params.externalIds && params.externalIds.length > 0) {
      for (const extId of params.externalIds) {
        const [row] = db
          .select()
          .from(companyExternalIds)
          .where(
            and(
              eq(companyExternalIds.source, extId.source),
              eq(companyExternalIds.externalId, extId.id)
            )
          )
          .limit(1)
          .all()

        if (row) {
          const [company] = db
            .select()
            .from(companies)
            .where(eq(companies.id, row.companyId))
            .limit(1)
            .all()
          if (company) return company
        }
      }
    }

    // Then check by name
    if (params.name) {
      const [result] = db
        .select()
        .from(companies)
        .where(or(eq(companies.name, params.name), eq(companies.originalName, params.name)))
        .limit(1)
        .all()

      return result
    }

    return undefined
  }

  findExistingCharacter(
    params: { name?: string; externalIds?: ExternalId[] },
    ctx?: DbContext
  ): Character | undefined {
    const db = this.getDb(ctx)

    // First check by externalIds (more specific match)
    if (params.externalIds && params.externalIds.length > 0) {
      for (const extId of params.externalIds) {
        const [row] = db
          .select()
          .from(characterExternalIds)
          .where(
            and(
              eq(characterExternalIds.source, extId.source),
              eq(characterExternalIds.externalId, extId.id)
            )
          )
          .limit(1)
          .all()

        if (row) {
          const [character] = db
            .select()
            .from(characters)
            .where(eq(characters.id, row.characterId))
            .limit(1)
            .all()
          if (character) return character
        }
      }
    }

    // Then check by name
    if (params.name) {
      const [result] = db
        .select()
        .from(characters)
        .where(or(eq(characters.name, params.name), eq(characters.originalName, params.name)))
        .limit(1)
        .all()

      return result
    }

    return undefined
  }

  findExistingGame(
    params: { name?: string; externalIds?: ExternalId[]; path?: string },
    ctx?: DbContext
  ): Game | undefined {
    const db = this.getDb(ctx)

    // First check by path (most specific)
    if (params.path) {
      const [result] = db
        .select()
        .from(games)
        .where(eq(games.gameDirPath, params.path))
        .limit(1)
        .all()

      if (result) return result
    }

    // Then check by externalIds
    if (params.externalIds && params.externalIds.length > 0) {
      for (const extId of params.externalIds) {
        const [row] = db
          .select()
          .from(gameExternalIds)
          .where(
            and(eq(gameExternalIds.source, extId.source), eq(gameExternalIds.externalId, extId.id))
          )
          .limit(1)
          .all()

        if (row) {
          const [game] = db.select().from(games).where(eq(games.id, row.gameId)).limit(1).all()
          if (game) return game
        }
      }
    }

    // Finally check by name
    if (params.name) {
      const [result] = db
        .select()
        .from(games)
        .where(or(eq(games.name, params.name), eq(games.originalName, params.name)))
        .limit(1)
        .all()

      return result
    }

    return undefined
  }

  getAppSettings() {
    const settingsData = this.db.query.settings.findFirst().sync()
    if (!settingsData) {
      throw new Error('Settings not found in database')
    }
    return settingsData
  }

  /**
   * Find existing tag by name
   */
  findExistingTag(params: { name: string }, ctx?: DbContext): Tag | undefined {
    const db = this.getDb(ctx)
    if (!params.name) return undefined

    const [result] = db.select().from(tags).where(eq(tags.name, params.name)).limit(1).all()

    return result
  }
}
