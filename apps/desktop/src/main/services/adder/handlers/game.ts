import type { DbContext, DbService } from '@main/services/db'
import type { AddGameOptions, AddGameResult } from '@shared/adder'
import type {
  CharacterPerson,
  GameCharacter,
  GameCompany,
  GameMetadata,
  GamePerson
} from '@shared/metadata'
import type { CharacterPersonType } from '@shared/db'
import {
  characterPersonLinks,
  characters,
  companies,
  collectionGameLinks,
  gameCharacterLinks,
  gameCompanyLinks,
  gameExternalIds,
  gamePersonLinks,
  games,
  gameTagLinks,
  persons,
  tags,
  type NewCharacterPersonLink,
  type NewCollectionGameLink,
  type NewGame,
  type NewGameCharacterLink,
  type NewGameCompanyLink,
  type NewGamePersonLink
} from '@shared/db'
import { nanoid } from 'nanoid'
import log from 'electron-log/main'
import type { CharacterAdderHandler } from './character'
import type { CompanyAdderHandler } from './company'
import type { PersonAdderHandler } from './person'
import type { AddGameInternalResult, PendingAssetTask } from '../types'

export class GameAdderHandler {
  constructor(
    private db: DbService,
    private person: PersonAdderHandler,
    private company: CompanyAdderHandler,
    private character: CharacterAdderHandler
  ) {}

  addGame(metadata: GameMetadata, options?: AddGameOptions): Promise<AddGameResult>
  addGame(
    metadata: GameMetadata,
    options: AddGameOptions | undefined,
    ctx: DbContext
  ): Promise<AddGameInternalResult>
  async addGame(
    metadata: GameMetadata,
    options?: AddGameOptions,
    ctx?: DbContext
  ): Promise<AddGameResult | AddGameInternalResult> {
    if (ctx) {
      return this.addGameInternal(metadata, options, ctx)
    }

    const result = this.db.db.transaction((tx) => this.addGameInternal(metadata, options, tx))
    await this.flushPendingAssets(result.pendingAssets)
    return this.toPublicResult(result)
  }

  addGameInternal(
    metadata: GameMetadata,
    options: AddGameOptions | undefined,
    tx: DbContext
  ): AddGameInternalResult {
    const gameDirPath = options?.gameDirPath
    const gameFilePath = options?.gameFilePath
    const targetCollectionId = options?.targetCollectionId

    if (gameDirPath) {
      const existingByPath = this.db.helper.findExistingGame({ path: gameDirPath }, tx)
      if (existingByPath) {
        return {
          gameId: existingByPath.id,
          isNew: false,
          existingReason: 'path',
          pendingAssets: []
        }
      }
    }

    if (metadata.externalIds?.length) {
      const existingByExternalId = this.db.helper.findExistingGame(
        { externalIds: metadata.externalIds },
        tx
      )
      if (existingByExternalId) {
        return {
          gameId: existingByExternalId.id,
          isNew: false,
          existingReason: 'externalId',
          pendingAssets: []
        }
      }
    }

    const gameId = nanoid()
    const newGame: NewGame = {
      id: gameId,
      name: metadata.name,
      originalName: metadata.originalName,
      releaseDate: metadata.releaseDate,
      description: metadata.description,
      relatedSites: metadata.relatedSites || [],
      gameDirPath,
      launcherPath: gameFilePath
    }
    tx.insert(games).values(newGame).run()

    this.insertExternalIds(tx, gameId, metadata.externalIds)
    this.insertTagLinks(tx, gameId, metadata.tags)

    const pendingAssets: PendingAssetTask[] = []
    this.collectGameAssets(pendingAssets, gameId, metadata)

    const personIdMap = this.insertPersonLinks(tx, gameId, metadata.persons, pendingAssets)
    this.insertCompanyLinks(tx, gameId, metadata.companies, pendingAssets)
    this.insertCharacterLinks(tx, gameId, metadata.characters, personIdMap, pendingAssets)

    this.addToCollection(tx, gameId, targetCollectionId)
    log.info(`[Adder] Successfully added game: ${metadata.name} (ID: ${gameId})`)

    return { gameId, isNew: true, pendingAssets }
  }

  private insertExternalIds(
    tx: DbContext,
    gameId: string,
    externalIds?: Array<{ source: string; id: string }>
  ): void {
    if (!externalIds?.length) return

    for (const [index, extId] of externalIds.entries()) {
      tx.insert(gameExternalIds)
        .values({
          gameId,
          source: extId.source,
          externalId: extId.id,
          orderInGame: index
        })
        .onConflictDoNothing()
        .run()
    }
  }

  private insertTagLinks(
    tx: DbContext,
    gameId: string,
    metadataTags?: Array<{ name: string; isNsfw?: boolean; isSpoiler?: boolean; note?: string }>
  ): void {
    if (!metadataTags?.length) return

    for (let i = 0; i < metadataTags.length; i++) {
      const tagData = metadataTags[i]
      try {
        tx.insert(tags)
          .values({ name: tagData.name, isNsfw: tagData.isNsfw })
          .onConflictDoNothing()
          .run()

        const existingTag = this.db.helper.findExistingTag({ name: tagData.name }, tx)
        if (!existingTag) {
          continue
        }

        tx.insert(gameTagLinks)
          .values({
            gameId,
            tagId: existingTag.id,
            isSpoiler: tagData.isSpoiler || false,
            note: tagData.note || null,
            orderInGame: i,
            orderInTag: 0
          })
          .run()
      } catch (error) {
        log.warn(`[Adder] Failed to process tag "${tagData.name}": ${error}`)
      }
    }
  }

  private insertPersonLinks(
    tx: DbContext,
    gameId: string,
    persons: GamePerson[] | undefined,
    pendingAssets: PendingAssetTask[]
  ): Map<string, string> {
    const personIdMap = new Map<string, string>()
    if (!persons?.length) return personIdMap

    const personTypeOrderCounters = new Map<string, number>()

    for (const personData of persons) {
      try {
        const personResult = this.person.addPersonInternal(personData, undefined, tx)
        const identityKey = this.buildEntityIdentityKey(personData)
        personIdMap.set(identityKey, personResult.personId)
        pendingAssets.push(...personResult.pendingAssets)

        const personType = personData.type || 'other'
        const orderInGame = personTypeOrderCounters.get(personType) || 0
        personTypeOrderCounters.set(personType, orderInGame + 1)

        const link: NewGamePersonLink = {
          gameId,
          personId: personResult.personId,
          type: personData.type,
          note: personData.note,
          orderInGame
        }
        tx.insert(gamePersonLinks).values(link).onConflictDoNothing().run()
      } catch (error) {
        log.warn(`[Adder] Failed to process person "${personData.name}": ${error}`)
      }
    }

    return personIdMap
  }

  private insertCompanyLinks(
    tx: DbContext,
    gameId: string,
    companies: GameCompany[] | undefined,
    pendingAssets: PendingAssetTask[]
  ): void {
    if (!companies?.length) return

    const companyTypeOrderCounters = new Map<string, number>()

    for (const companyData of companies) {
      try {
        const companyResult = this.company.addCompanyInternal(companyData, undefined, tx)
        pendingAssets.push(...companyResult.pendingAssets)

        const companyType = companyData.type || 'other'
        const orderInGame = companyTypeOrderCounters.get(companyType) || 0
        companyTypeOrderCounters.set(companyType, orderInGame + 1)

        const link: NewGameCompanyLink = {
          gameId,
          companyId: companyResult.companyId,
          type: companyData.type,
          note: companyData.note,
          orderInGame
        }
        tx.insert(gameCompanyLinks).values(link).onConflictDoNothing().run()
      } catch (error) {
        log.warn(`[Adder] Failed to process company "${companyData.name}": ${error}`)
      }
    }
  }

  private insertCharacterLinks(
    tx: DbContext,
    gameId: string,
    characters: GameCharacter[] | undefined,
    personIdMap: Map<string, string>,
    pendingAssets: PendingAssetTask[]
  ): void {
    if (!characters?.length) return

    const characterTypeOrderCounters = new Map<string, number>()

    for (const characterData of characters) {
      try {
        const characterResult = this.character.addCharacterInternal(characterData, undefined, tx)
        const characterId = characterResult.characterId
        pendingAssets.push(...characterResult.pendingAssets)

        const characterType = characterData.type || 'other'
        const orderInGame = characterTypeOrderCounters.get(characterType) || 0
        characterTypeOrderCounters.set(characterType, orderInGame + 1)

        const link: NewGameCharacterLink = {
          gameId,
          characterId,
          type: characterData.type,
          note: characterData.note,
          orderInGame
        }
        tx.insert(gameCharacterLinks).values(link).onConflictDoNothing().run()

        this.insertCharacterPersonLinks(
          tx,
          characterId,
          gameId,
          characterData.persons,
          personIdMap,
          pendingAssets
        )
      } catch (error) {
        log.warn(`[Adder] Failed to process character "${characterData.name}": ${error}`)
      }
    }
  }

  private insertCharacterPersonLinks(
    tx: DbContext,
    characterId: string,
    gameId: string,
    persons: CharacterPerson[] | undefined,
    personIdMap: Map<string, string>,
    pendingAssets: PendingAssetTask[]
  ): void {
    if (!persons?.length) return

    for (const personData of persons) {
      try {
        const identityKey = this.buildEntityIdentityKey(personData)
        let personId = personIdMap.get(identityKey)

        if (!personId) {
          const personResult = this.person.addPersonInternal(personData, undefined, tx)
          personId = personResult.personId
          personIdMap.set(identityKey, personId)
          pendingAssets.push(...personResult.pendingAssets)
        }

        const gamePersonType =
          personData.type === 'designer'
            ? 'other'
            : (personData.type as 'actor' | 'illustration' | 'other')

        tx.insert(gamePersonLinks)
          .values({
            gameId,
            personId,
            type: gamePersonType,
            note: personData.note
          })
          .onConflictDoNothing()
          .run()

        const link: NewCharacterPersonLink = {
          characterId,
          personId,
          type: personData.type as CharacterPersonType,
          note: personData.note
        }
        tx.insert(characterPersonLinks).values(link).onConflictDoNothing().run()
      } catch (error) {
        log.warn(
          `[Adder] Failed to create character-person link for "${personData.name}": ${error}`
        )
      }
    }
  }

  private addToCollection(tx: DbContext, gameId: string, targetCollectionId?: string): void {
    if (!targetCollectionId) return

    const collectionLink: NewCollectionGameLink = {
      id: nanoid(),
      collectionId: targetCollectionId,
      gameId,
      orderInCollection: 0
    }
    tx.insert(collectionGameLinks).values(collectionLink).onConflictDoNothing().run()
    log.info(`[Adder] Added game ${gameId} to collection ${targetCollectionId}`)
  }

  private collectGameAssets(
    pendingAssets: PendingAssetTask[],
    gameId: string,
    metadata: GameMetadata
  ): void {
    if (metadata.covers?.[0]) {
      pendingAssets.push({ type: 'game', gameId, field: 'coverFile', url: metadata.covers[0] })
    }
    if (metadata.backdrops?.[0]) {
      pendingAssets.push({
        type: 'game',
        gameId,
        field: 'backdropFile',
        url: metadata.backdrops[0]
      })
    }
    if (metadata.logos?.[0]) {
      pendingAssets.push({ type: 'game', gameId, field: 'logoFile', url: metadata.logos[0] })
    }
    if (metadata.icons?.[0]) {
      pendingAssets.push({ type: 'game', gameId, field: 'iconFile', url: metadata.icons[0] })
    }
  }

  private buildEntityIdentityKey(entity: {
    name: string
    originalName?: string
    externalIds?: Array<{ source: string; id: string }>
  }): string {
    const extParts = (entity.externalIds ?? [])
      .map((e) => ({ source: e.source?.trim(), id: e.id?.trim() }))
      .filter((e): e is { source: string; id: string } => !!(e.source && e.id))
      .map((e) => `${e.source.toLowerCase()}:${e.id.toLowerCase()}`)
      .sort()

    if (extParts.length) return `ext:${extParts.join('|')}`

    const original = entity.originalName?.trim().toLowerCase()
    if (original) return `on:${original}`

    return `nm:${entity.name.trim().toLowerCase()}`
  }

  private async flushPendingAssets(pendingAssets: PendingAssetTask[]): Promise<void> {
    await Promise.all(
      pendingAssets.map(async (asset) => {
        try {
          switch (asset.type) {
            case 'game':
              await this.db.attachment.setFile(games, asset.gameId, asset.field, {
                kind: 'url',
                url: asset.url
              })
              break
            case 'person':
              await this.db.attachment.setFile(persons, asset.personId, 'photoFile', {
                kind: 'url',
                url: asset.url
              })
              break
            case 'company':
              await this.db.attachment.setFile(companies, asset.companyId, 'logoFile', {
                kind: 'url',
                url: asset.url
              })
              break
            case 'character':
              await this.db.attachment.setFile(characters, asset.characterId, 'photoFile', {
                kind: 'url',
                url: asset.url
              })
              break
          }
        } catch (error) {
          log.warn(`[Adder] Failed to persist pending asset: ${error}`)
        }
      })
    )
  }

  private toPublicResult(result: AddGameInternalResult): AddGameResult {
    const { pendingAssets, ...publicResult } = result
    void pendingAssets
    return publicResult
  }
}
