/**
 * Archive utilities - zip compression/extraction
 */

import archiver from 'archiver'
import fse from 'fs-extra'
import path from 'path'
import { createWriteStream, createReadStream } from 'fs'
import { pipeline } from 'stream/promises'
import unzipper from 'unzipper'

/**
 * Compress a directory into a zip file
 *
 * @param sourceDir - Source directory to compress
 * @param outputPath - Output zip file path
 * @returns Size of the created zip file in bytes
 */
export async function compressDir(sourceDir: string, outputPath: string): Promise<number> {
  // Ensure source exists
  if (!(await fse.pathExists(sourceDir))) {
    throw new Error(`Source directory not found: ${sourceDir}`)
  }

  // Ensure output directory exists
  await fse.ensureDir(path.dirname(outputPath))

  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath)
    const archive = archiver('zip', { zlib: { level: 6 } })

    output.on('close', () => resolve(archive.pointer()))
    archive.on('error', reject)

    archive.pipe(output)
    archive.directory(sourceDir, false)
    archive.finalize()
  })
}

/**
 * Extract a zip file to a target directory
 *
 * @param zipPath - Path to the zip file
 * @param targetDir - Target directory to extract to
 */
export async function extractZip(zipPath: string, targetDir: string): Promise<void> {
  // Ensure zip exists
  if (!(await fse.pathExists(zipPath))) {
    throw new Error(`Zip file not found: ${zipPath}`)
  }

  // Clear and create target directory
  await fse.emptyDir(targetDir)

  await pipeline(createReadStream(zipPath), unzipper.Extract({ path: targetDir }))
}
