import { eq, inArray } from 'drizzle-orm'
import type { DbContext, DbService } from '@main/services/db'
import type {
  GameMetadataUpdateField,
  GameMetadataUpdateInput,
  UpdateGameMetadataOptions,
  UpdateGameMetadataResult
} from '@shared/metadata-updater'
import { gameExternalIds, gameTagLinks, games, tags, type Game } from '@shared/db'
import type { ExternalId, Tag } from '@shared/metadata'
import {
  mergeExternalIds,
  mergeRelatedSites,
  mergeTags,
  resolveUpdateOptions,
  shouldApplyUpdate,
  toExternalIdKey,
  toImageMode
} from '../utils'

const GAME_FIELDS: readonly GameMetadataUpdateField[] = [
  'name',
  'originalName',
  'releaseDate',
  'description',
  'relatedSites',
  'externalIds',
  'tags',
  'covers',
  'backdrops',
  'logos',
  'icons'
]

export class GameMetadataUpdaterHandler {
  constructor(private db: DbService) {}

  async updateGame(
    gameId: string,
    metadata: GameMetadataUpdateInput,
    options?: UpdateGameMetadataOptions
  ): Promise<UpdateGameMetadataResult> {
    this.preCheckExternalIdConflicts(gameId, metadata, options)

    const asset = {
      coverUrl: undefined as string | undefined,
      backdropUrl: undefined as string | undefined,
      logoUrl: undefined as string | undefined,
      iconUrl: undefined as string | undefined
    }
    const result = this.db.db.transaction((tx) =>
      this.updateGameInternal(gameId, metadata, options, tx, asset)
    )

    const tasks: Promise<unknown>[] = []
    if (asset.coverUrl) {
      tasks.push(
        this.db.attachment.setFile(games, gameId, 'coverFile', {
          kind: 'url',
          url: asset.coverUrl
        })
      )
    }
    if (asset.backdropUrl) {
      tasks.push(
        this.db.attachment.setFile(games, gameId, 'backdropFile', {
          kind: 'url',
          url: asset.backdropUrl
        })
      )
    }
    if (asset.logoUrl) {
      tasks.push(
        this.db.attachment.setFile(games, gameId, 'logoFile', {
          kind: 'url',
          url: asset.logoUrl
        })
      )
    }
    if (asset.iconUrl) {
      tasks.push(
        this.db.attachment.setFile(games, gameId, 'iconFile', {
          kind: 'url',
          url: asset.iconUrl
        })
      )
    }
    await Promise.all(tasks)

    return result
  }

  private updateGameInternal(
    gameId: string,
    metadata: GameMetadataUpdateInput,
    options: UpdateGameMetadataOptions | undefined,
    tx: DbContext,
    asset: {
      coverUrl?: string
      backdropUrl?: string
      logoUrl?: string
      iconUrl?: string
    }
  ): UpdateGameMetadataResult {
    const game = tx.select().from(games).where(eq(games.id, gameId)).limit(1).all()[0]
    if (!game) {
      throw new Error(`Game not found: ${gameId}`)
    }

    const resolved = resolveUpdateOptions<GameMetadataUpdateField>(options, GAME_FIELDS)
    if (resolved.fields.length === 0) {
      return { gameId, updatedFields: [] }
    }

    const updatedFields: GameMetadataUpdateField[] = []
    const patch: Partial<Game> = {}
    const gameRecord = game as Record<string, unknown>

    for (const field of resolved.fields) {
      switch (field) {
        case 'name':
        case 'originalName':
        case 'releaseDate':
        case 'description': {
          const incoming = metadata[field]
          const current = gameRecord[field]
          if (shouldApplyUpdate(current, incoming, resolved.apply)) {
            ;(patch as Record<string, unknown>)[field] = incoming
            updatedFields.push(field)
          }
          break
        }

        case 'relatedSites': {
          const incoming = metadata.relatedSites
          if (!incoming?.length) break

          const next = mergeRelatedSites(game.relatedSites ?? [], incoming, resolved.strategy)
          if (
            resolved.strategy === 'replace' ||
            shouldApplyUpdate(game.relatedSites, incoming, resolved.apply)
          ) {
            patch.relatedSites = next
            updatedFields.push(field)
          }
          break
        }

        case 'externalIds': {
          const incoming = metadata.externalIds
          if (!incoming?.length) break

          const existingRows = tx
            .select()
            .from(gameExternalIds)
            .where(eq(gameExternalIds.gameId, gameId))
            .all()

          const existing = existingRows.map((row) => ({ source: row.source, id: row.externalId }))
          const next = mergeExternalIds(existing, incoming, resolved.strategy)
          if (
            resolved.strategy === 'replace' ||
            shouldApplyUpdate(existing, incoming, resolved.apply)
          ) {
            this.replaceGameExternalIds(tx, gameId, next)
            updatedFields.push(field)
          }
          break
        }

        case 'tags': {
          const incoming = metadata.tags
          if (!incoming?.length) break

          const existing = this.getGameTags(tx, gameId)
          const next = mergeTags(existing, incoming, resolved.strategy)
          if (
            resolved.strategy === 'replace' ||
            shouldApplyUpdate(existing, incoming, resolved.apply)
          ) {
            this.replaceGameTags(tx, gameId, next)
            updatedFields.push(field)
          }
          break
        }

        case 'covers': {
          const incoming = metadata.covers
          if (!incoming?.length || !incoming[0]) break

          const mode = toImageMode(resolved.strategy)
          if (mode === 'replace' || !game.coverFile) {
            asset.coverUrl = incoming[0]
            updatedFields.push(field)
          }
          break
        }

        case 'backdrops': {
          const incoming = metadata.backdrops
          if (!incoming?.length || !incoming[0]) break

          const mode = toImageMode(resolved.strategy)
          if (mode === 'replace' || !game.backdropFile) {
            asset.backdropUrl = incoming[0]
            updatedFields.push(field)
          }
          break
        }

        case 'logos': {
          const incoming = metadata.logos
          if (!incoming?.length || !incoming[0]) break

          const mode = toImageMode(resolved.strategy)
          if (mode === 'replace' || !game.logoFile) {
            asset.logoUrl = incoming[0]
            updatedFields.push(field)
          }
          break
        }

        case 'icons': {
          const incoming = metadata.icons
          if (!incoming?.length || !incoming[0]) break

          const mode = toImageMode(resolved.strategy)
          if (mode === 'replace' || !game.iconFile) {
            asset.iconUrl = incoming[0]
            updatedFields.push(field)
          }
          break
        }
      }
    }

    if (Object.keys(patch).length > 0) {
      tx.update(games)
        .set(patch as any)
        .where(eq(games.id, gameId))
        .run()
    }

    return { gameId, updatedFields }
  }

  private preCheckExternalIdConflicts(
    gameId: string,
    metadata: GameMetadataUpdateInput,
    options?: UpdateGameMetadataOptions
  ): void {
    const resolved = resolveUpdateOptions<GameMetadataUpdateField>(options, GAME_FIELDS)
    if (!resolved.fields.includes('externalIds')) return

    for (const externalId of metadata.externalIds ?? []) {
      const existing = this.db.helper.findExistingGame({ externalIds: [externalId] })
      if (existing && existing.id !== gameId) {
        throw new Error(
          `External ID already belongs to another game: ${externalId.source}:${externalId.id}`
        )
      }
    }
  }

  private replaceGameExternalIds(tx: DbContext, gameId: string, externalIds: ExternalId[]): void {
    tx.delete(gameExternalIds).where(eq(gameExternalIds.gameId, gameId)).run()

    const uniqueExternalIds = new Map<string, ExternalId>()
    for (const externalId of externalIds) {
      uniqueExternalIds.set(toExternalIdKey(externalId), externalId)
    }

    const values = [...uniqueExternalIds.values()].map((externalId, index) => ({
      gameId,
      source: externalId.source,
      externalId: externalId.id,
      orderInGame: index
    }))

    if (!values.length) return
    tx.insert(gameExternalIds).values(values).run()
  }

  private getGameTags(tx: DbContext, gameId: string): Tag[] {
    const rows = tx
      .select()
      .from(gameTagLinks)
      .innerJoin(tags, eq(gameTagLinks.tagId, tags.id))
      .where(eq(gameTagLinks.gameId, gameId))
      .all()

    return rows.map((row) => ({
      name: row.tags.name,
      isNsfw: row.tags.isNsfw,
      isSpoiler: row.game_tag_links.isSpoiler,
      note: row.game_tag_links.note ?? undefined
    }))
  }

  private replaceGameTags(tx: DbContext, gameId: string, nextTags: Tag[]): void {
    tx.delete(gameTagLinks).where(eq(gameTagLinks.gameId, gameId)).run()

    if (!nextTags.length) return

    const tagNames = [...new Set(nextTags.map((item) => item.name))]
    for (const tag of nextTags) {
      tx.insert(tags)
        .values({ name: tag.name, isNsfw: tag.isNsfw ?? false })
        .onConflictDoNothing()
        .run()
    }

    const tagRows = tx.select().from(tags).where(inArray(tags.name, tagNames)).all()
    const tagIdByName = new Map(tagRows.map((row) => [row.name, row.id]))

    const linkValues = nextTags
      .map((tag, index) => {
        const tagId = tagIdByName.get(tag.name)
        if (!tagId) return null

        return {
          gameId,
          tagId,
          isSpoiler: tag.isSpoiler ?? false,
          note: tag.note ?? null,
          orderInGame: index,
          orderInTag: 0
        }
      })
      .filter((value): value is NonNullable<typeof value> => value !== null)

    if (!linkValues.length) return
    tx.insert(gameTagLinks).values(linkValues).run()
  }
}
