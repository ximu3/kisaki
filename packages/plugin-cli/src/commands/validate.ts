/**
 * Validate Command
 *
 * Validates plugin structure and manifest.
 */

import { existsSync, readFileSync } from 'fs'
import { resolve, join } from 'path'
import semver from 'semver'
import { green, red, yellow, cyan, dim } from 'kolorist'

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

interface PluginManifest {
  id?: string
  name?: string
  version?: string
  main?: string
  renderer?: string
  kisakiCompat?: string
  [key: string]: unknown
}

interface SdkPackageJson {
  kisakiCompat?: string
  [key: string]: unknown
}

export async function validateCommand(): Promise<void> {
  const cwd = process.cwd()

  console.log()
  console.log(cyan('  kisaki-plugin validate'))
  console.log(dim('  Validating plugin structure...'))
  console.log()

  const result = validatePlugin(cwd)

  // Print errors
  for (const error of result.errors) {
    console.log(red('✖') + ' ' + error)
  }

  // Print warnings
  for (const warning of result.warnings) {
    console.log(yellow('⚠') + ' ' + warning)
  }

  console.log()

  if (result.valid) {
    console.log(green('✓') + ' Plugin structure is valid')
  } else {
    console.log(red('✖') + ' Validation failed')
    process.exit(1)
  }
}

function validatePlugin(cwd: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check source directories (at least one entry point required)
  const mainSrcPath = resolve(cwd, 'src/main/index.ts')
  const rendererSrcPath = resolve(cwd, 'src/renderer/index.ts')
  const hasMain = existsSync(mainSrcPath)
  const hasRenderer = existsSync(rendererSrcPath)

  if (!hasMain && !hasRenderer) {
    errors.push('Missing entry point: need src/main/index.ts or src/renderer/index.ts')
  }

  // Check package.json
  const pkgPath = resolve(cwd, 'package.json')
  if (!existsSync(pkgPath)) {
    errors.push('Missing package.json')
  } else {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      if (!pkg.name) {
        errors.push('package.json missing "name" field')
      }
      if (!pkg.version) {
        errors.push('package.json missing "version" field')
      }
    } catch {
      errors.push('Invalid package.json')
    }
  }

  // Check tsconfig.json
  const tsconfigPath = resolve(cwd, 'tsconfig.json')
  if (!existsSync(tsconfigPath)) {
    warnings.push('Missing tsconfig.json')
  }

  // Check manifest.json (generated in dist/ by build)
  const manifestPath = resolve(cwd, 'dist/manifest.json')
  if (!existsSync(manifestPath)) {
    errors.push('Missing dist/manifest.json - run "npm run build" first')
  } else {
    try {
      const manifest: PluginManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
      if (!manifest.id) {
        errors.push('manifest.json missing "id" field')
      }
      if (!manifest.name) {
        errors.push('manifest.json missing "name" field')
      }
      if (!manifest.version) {
        errors.push('manifest.json missing "version" field')
      }
      // Validate entry points match source
      if (manifest.main && !hasMain) {
        warnings.push('manifest.json declares "main" but src/main/index.ts not found')
      }
      if (manifest.renderer && !hasRenderer) {
        warnings.push('manifest.json declares "renderer" but src/renderer/index.ts not found')
      }

      // Validate kisakiCompat if present
      if (manifest.kisakiCompat) {
        if (!semver.validRange(manifest.kisakiCompat)) {
          errors.push(`Invalid kisakiCompat range: "${manifest.kisakiCompat}"`)
        } else {
          // Check if it's a plain version (not recommended)
          if (semver.valid(manifest.kisakiCompat)) {
            warnings.push(
              `kisakiCompat "${manifest.kisakiCompat}" is a plain version. ` +
                `Consider using ">=${manifest.kisakiCompat}" for clarity.`
            )
          }

          // Check against SDK requirement
          const sdkCompat = getSdkKisakiCompat(cwd)
          if (sdkCompat) {
            const sdkMin = semver.minVersion(sdkCompat)
            const manifestMin = semver.minVersion(manifest.kisakiCompat)
            if (sdkMin && manifestMin && semver.lt(manifestMin, sdkMin)) {
              warnings.push(
                `kisakiCompat "${manifest.kisakiCompat}" is lower than SDK requirement "${sdkCompat}". ` +
                  `Make sure you only use APIs available in older Kisaki versions.`
              )
            }
          }
        }
      } else {
        // Check if SDK provides kisakiCompat (will be auto-filled during pack)
        const sdkCompat = getSdkKisakiCompat(cwd)
        if (sdkCompat) {
          warnings.push(`kisakiCompat not set. Will use "${sdkCompat}" from SDK during pack.`)
        } else {
          warnings.push(
            'kisakiCompat not set and @kisaki/plugin-sdk not found. ' +
              'Run "npm install" or set kisakiCompat manually.'
          )
        }
      }
    } catch {
      errors.push('Invalid manifest.json')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Get kisakiCompat from installed SDK
 */
function getSdkKisakiCompat(cwd: string): string | null {
  const sdkPkgPath = join(cwd, 'node_modules/@kisaki/plugin-sdk/package.json')

  if (!existsSync(sdkPkgPath)) {
    return null
  }

  try {
    const sdkPkg: SdkPackageJson = JSON.parse(readFileSync(sdkPkgPath, 'utf-8'))
    return sdkPkg.kisakiCompat ?? null
  } catch {
    return null
  }
}
