import { promises as fs } from 'fs'
import path from 'path'
import log from 'electron-log/main'
import type { NameExtractionRule } from '@shared/db'
import type { EntityEntry } from '@shared/scanner'

export interface ScanOptions {
  /** Depth at which to collect entities (0 = immediate children) */
  entityDepth: number
  /** Names to ignore (case-insensitive) */
  ignoredNames: string[]
  /** Rules for extracting entity name from folder/file name */
  nameExtractionRules: NameExtractionRule[]
}

/**
 * Extract entity name using configured rules.
 * Tries each enabled rule in order until one matches.
 */
export function extractEntityName(
  originalName: string,
  rules: NameExtractionRule[]
): { extractedName: string; matchedRuleId: string | null } {
  for (const rule of rules) {
    if (!rule.enabled) continue
    try {
      const regex = new RegExp(rule.pattern)
      const match = regex.exec(originalName)
      if (match?.groups?.name) {
        return { extractedName: match.groups.name.trim(), matchedRuleId: rule.id }
      }
    } catch (error) {
      log.warn(`[Scanner] Invalid regex pattern in rule ${rule.id}: ${error}`)
    }
  }
  return { extractedName: originalName, matchedRuleId: null }
}

/**
 * Generic entity scanner - works for all media types.
 * Returns all entries at the specified depth level.
 */
export async function scanForEntities(
  rootPath: string,
  options: ScanOptions
): Promise<EntityEntry[]> {
  const { entityDepth, ignoredNames, nameExtractionRules } = options

  try {
    const entries = await fs.readdir(rootPath, { withFileTypes: true })

    // Filter ignored names (case-insensitive)
    const ignoredNameSet = new Set(ignoredNames.map((name) => name.toLowerCase()))
    const filtered = entries.filter((entry) => !ignoredNameSet.has(entry.name.toLowerCase()))

    if (entityDepth > 0) {
      // Not at target depth yet - traverse directories only
      // Include symlinks as they may point to directories
      const subDirs = filtered.filter((e) => e.isDirectory() || e.isSymbolicLink())
      const results = await Promise.all(
        subDirs.map((d) =>
          scanForEntities(path.join(rootPath, d.name), {
            entityDepth: entityDepth - 1,
            ignoredNames,
            nameExtractionRules
          })
        )
      )
      return results.flat()
    }

    // At target depth - all entries become entities with name extraction applied
    return filtered.map((entry) => {
      const originalName = entry.name
      const originalBaseName = entry.isFile() ? path.parse(originalName).name : originalName
      const { extractedName, matchedRuleId } = extractEntityName(
        originalBaseName,
        nameExtractionRules
      )
      return {
        path: path.join(rootPath, entry.name),
        originalName,
        originalBaseName,
        extractedName,
        matchedRuleId
      }
    })
  } catch (error) {
    log.error(`[Scanner] Failed to scan directory ${rootPath}: ${error}`)
    return []
  }
}
