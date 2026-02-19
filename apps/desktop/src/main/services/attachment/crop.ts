import fse from 'fs-extra'
import { nanoid } from 'nanoid'
import path from 'path'
import sharp from 'sharp'
import type { CropRegion } from '@shared/attachment'
import type { AttachmentInput } from '@shared/db/attachment'

export type CropToTempFormat = 'keep' | 'png' | 'jpeg' | 'webp'

export interface CropToTempOptions {
  format?: CropToTempFormat
  quality?: number
}

export interface AttachmentCropperDeps {
  tempDir: string
  downloadBuffer: (url: string) => Promise<Buffer>
}

export class AttachmentCropper {
  constructor(private deps: AttachmentCropperDeps) {}

  async cleanupOldTempCrops(ttlMs: number): Promise<void> {
    const { tempDir } = this.deps
    if (!(await fse.pathExists(tempDir))) return

    const now = Date.now()
    const entries = await fse.readdir(tempDir, { withFileTypes: true })
    await Promise.all(
      entries.map(async (entry) => {
        if (!entry.isFile()) return
        const filePath = path.join(tempDir, entry.name)
        try {
          const stat = await fse.stat(filePath)
          if (now - stat.mtimeMs > ttlMs) {
            await fse.remove(filePath)
          }
        } catch {
          // Best-effort cleanup
        }
      })
    )
  }

  async cropToTemp(input: AttachmentInput, cropRegion: CropRegion, options?: CropToTempOptions) {
    const resolved = await this.resolveSharpInput(input)
    const metadata = await sharp(resolved).metadata()
    const { width, height } = this.getEffectiveDimensions(metadata)

    if (!width || !height) {
      throw new Error('Failed to read image dimensions')
    }

    const crop = this.normalizeCropRegion(cropRegion, width, height)

    const requestedFormat = options?.format ?? 'keep'
    const quality = options?.quality
    const { ext, applyFormat } = this.getOutputFormat(requestedFormat, metadata.format, quality)

    const outputDir = this.deps.tempDir
    await fse.ensureDir(outputDir)

    const outputPath = path.join(outputDir, `${nanoid()}${ext}`)

    const pipeline = sharp(resolved).rotate().extract({
      left: crop.left,
      top: crop.top,
      width: crop.width,
      height: crop.height
    })

    await applyFormat(pipeline).toFile(outputPath)
    return outputPath
  }

  private async resolveSharpInput(input: AttachmentInput): Promise<string | Buffer> {
    switch (input.kind) {
      case 'buffer':
        return Buffer.from(input.buffer)
      case 'path': {
        const rawPath = input.path
        const filePath = path.isAbsolute(rawPath) ? rawPath : path.resolve(rawPath)
        let stat: fse.Stats
        try {
          stat = await fse.stat(filePath)
        } catch {
          throw new Error(`Source file not found: ${filePath}`)
        }
        if (!stat.isFile()) {
          throw new Error(`Source path is not a file: ${filePath}`)
        }
        return filePath
      }
      case 'url':
        return await this.deps.downloadBuffer(input.url)
    }
  }

  private getEffectiveDimensions(metadata: sharp.Metadata): { width: number; height: number } {
    const width = metadata.width ?? 0
    const height = metadata.height ?? 0
    const orientation = metadata.orientation

    if (orientation && [5, 6, 7, 8].includes(orientation)) {
      return { width: height, height: width }
    }

    return { width, height }
  }

  private normalizeCropRegion(
    cropRegion: CropRegion,
    imageWidth: number,
    imageHeight: number
  ): { left: number; top: number; width: number; height: number } {
    const x = Number(cropRegion.x)
    const y = Number(cropRegion.y)
    const w = Number(cropRegion.width)
    const h = Number(cropRegion.height)

    if (![x, y, w, h].every((v) => Number.isFinite(v))) {
      throw new Error('Invalid crop region')
    }
    if (w <= 0 || h <= 0) {
      throw new Error('Invalid crop region size')
    }

    let left = Math.round(x)
    let top = Math.round(y)
    let width = Math.round(w)
    let height = Math.round(h)

    left = Math.max(0, Math.min(left, imageWidth - 1))
    top = Math.max(0, Math.min(top, imageHeight - 1))

    width = Math.max(1, Math.min(width, imageWidth - left))
    height = Math.max(1, Math.min(height, imageHeight - top))

    return { left, top, width, height }
  }

  private getOutputFormat(
    requested: CropToTempFormat,
    sourceFormat: string | undefined,
    quality: number | undefined
  ): { ext: string; applyFormat: (pipeline: sharp.Sharp) => sharp.Sharp } {
    const q = typeof quality === 'number' ? Math.min(100, Math.max(1, Math.round(quality))) : 90

    const normalizeSource = (fmt: string | undefined) => {
      if (!fmt) return undefined
      if (fmt === 'jpg') return 'jpeg'
      return fmt
    }

    const fmt =
      requested === 'keep'
        ? (normalizeSource(sourceFormat) as 'png' | 'jpeg' | 'webp' | undefined)
        : requested

    if (fmt === 'png') {
      return { ext: '.png', applyFormat: (p) => p.png() }
    }
    if (fmt === 'jpeg') {
      return { ext: '.jpg', applyFormat: (p) => p.jpeg({ quality: q }) }
    }
    if (fmt === 'webp') {
      return { ext: '.webp', applyFormat: (p) => p.webp({ quality: q }) }
    }

    return { ext: '.webp', applyFormat: (p) => p.webp({ quality: q }) }
  }
}
