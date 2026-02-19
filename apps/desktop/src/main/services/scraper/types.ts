/**
 * Scraper Shared Types
 *
 * Leaf + pure shared type helpers for main scraper modules.
 */

export type SlotResult<S extends string, D> = {
  slot: S
  priority: number
  data: D
}
