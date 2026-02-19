/**
 * Native dialog option helpers (renderer)
 *
 * Pure helpers for building `native:open-dialog` options.
 */

import type { OpenDialogOptions } from 'electron'

const DEFAULT_IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'avif',
  'bmp',
  'tif',
  'tiff',
  'ico'
]

export function getOpenImageDialogOptions(
  options: {
    title?: string
    extensions?: string[]
    filterName?: string
  } = {}
): OpenDialogOptions {
  const {
    title = 'Select image',
    extensions = DEFAULT_IMAGE_EXTENSIONS,
    filterName = 'Images'
  } = options

  return {
    title,
    filters: [{ name: filterName, extensions }],
    properties: ['openFile']
  }
}
