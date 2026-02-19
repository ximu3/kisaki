/**
 * Build Script for create-kisaki-plugin
 *
 * 1. Sync template dependencies from @kisaki/plugin-sdk
 * 2. Build with tsdown
 */

import { execSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, writeFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkgRoot = resolve(__dirname, '..')
const sdkPkgPath = resolve(pkgRoot, '../plugin-sdk/package.json')
const cliPkgPath = resolve(pkgRoot, '../plugin-cli/package.json')
const templatePkgPath = resolve(pkgRoot, 'templates/default/package.json')

// =============================================================================
// Step 1: Sync template dependencies
// =============================================================================

function syncTemplateDependencies(): void {
  console.log('\n🔄 Syncing template dependencies...\n')

  const sdkPkg = JSON.parse(readFileSync(sdkPkgPath, 'utf-8'))
  const cliPkg = JSON.parse(readFileSync(cliPkgPath, 'utf-8'))
  const templatePkg = JSON.parse(readFileSync(templatePkgPath, 'utf-8'))

  const sdkVersion = sdkPkg.version
  const cliVersion = cliPkg.version
  const peerDeps: Record<string, string> = sdkPkg.peerDependencies ?? {}

  console.log(`  SDK version: ${sdkVersion}`)
  console.log(`  CLI version: ${cliVersion}`)
  console.log(`  Peer dependencies: ${Object.keys(peerDeps).length}`)

  // Build new devDependencies
  const newDevDeps: Record<string, string> = {
    '@kisaki/plugin-cli': `^${cliVersion}`,
    '@kisaki/plugin-sdk': `^${sdkVersion}`
  }

  // Add all peerDependencies from SDK
  for (const [pkg, version] of Object.entries(peerDeps)) {
    newDevDeps[pkg] = version
  }

  // Preserve existing non-SDK dependencies
  const preserveList = ['@vitejs/plugin-vue', 'typescript', 'vite', 'vue-tsc']
  for (const pkg of preserveList) {
    if (templatePkg.devDependencies?.[pkg]) {
      newDevDeps[pkg] = templatePkg.devDependencies[pkg]
    }
  }

  // Sort keys
  const sortedDevDeps: Record<string, string> = {}
  for (const key of Object.keys(newDevDeps).sort()) {
    sortedDevDeps[key] = newDevDeps[key]
  }

  // Compare and update
  const oldJson = JSON.stringify(templatePkg.devDependencies, null, 2)
  const newJson = JSON.stringify(sortedDevDeps, null, 2)

  if (oldJson !== newJson) {
    const oldDeps = templatePkg.devDependencies ?? {}
    for (const [pkg, version] of Object.entries(sortedDevDeps)) {
      const oldVersion = oldDeps[pkg]
      if (!oldVersion) {
        console.log(`    + ${pkg}: ${version}`)
      } else if (oldVersion !== version) {
        console.log(`    ~ ${pkg}: ${oldVersion} → ${version}`)
      }
    }

    for (const pkg of Object.keys(oldDeps)) {
      if (!(pkg in sortedDevDeps)) {
        console.log(`    - ${pkg}: (removed)`)
      }
    }

    templatePkg.devDependencies = sortedDevDeps
    writeFileSync(templatePkgPath, JSON.stringify(templatePkg, null, 2) + '\n')
    console.log('\n  ✅ Template updated')
  } else {
    console.log('\n  ✅ Template already in sync')
  }
}

// =============================================================================
// Step 2: Build with tsdown
// =============================================================================

function buildWithTsdown(): void {
  console.log('\n📦 Building with tsdown...\n')
  execSync('npx tsdown', { stdio: 'inherit', cwd: pkgRoot })
}

// =============================================================================
// Main
// =============================================================================

function main(): void {
  console.log('═══════════════════════════════════════════════════════')
  console.log('  create-kisaki-plugin Build')
  console.log('═══════════════════════════════════════════════════════')

  try {
    syncTemplateDependencies()
    buildWithTsdown()

    console.log('\n═══════════════════════════════════════════════════════')
    console.log('  ✅ Build completed successfully!')
    console.log('═══════════════════════════════════════════════════════\n')
  } catch (error) {
    console.error('\n❌ Build failed:', error)
    process.exit(1)
  }
}

main()
