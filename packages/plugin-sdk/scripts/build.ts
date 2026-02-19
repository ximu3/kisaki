/**
 * Build Script for @kisaki/plugin-sdk
 *
 * 1. Copy type definitions and theme CSS from main app to src/ (for tsdown dts bundling)
 * 2. Build with tsdown (generates .mjs + .d.mts with all types inlined)
 * 3. Copy theme CSS to dist/ (after tsdown clean)
 * 4. Validate output
 *
 * tsdown automatically:
 * - Bundles runtime code to .mjs
 * - Generates .d.mts with all types inlined (including from .d.ts source files)
 * - No need to manually copy .d.ts to dist!
 */

import { execSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, copyFileSync, existsSync, statSync, writeFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkgRoot = resolve(__dirname, '..')
const mainAppRoot = resolve(pkgRoot, '../../apps/desktop')
const srcDir = resolve(pkgRoot, 'src')
const distDir = resolve(pkgRoot, 'dist')

// =============================================================================
// Step 1: Copy type definitions and theme CSS from main app to src/
// =============================================================================

function copyTypeDefinitionsToSrc() {
  console.log('\n📋 Copying plugin assets from main app to src/types/...\n')

  const sourceDir = resolve(mainAppRoot, 'plugin-types')
  const typesDir = resolve(srcDir, 'types')

  // Copy type definition files to src/types/ (for tsdown dts bundling)
  const typeFiles = ['main.plugin.d.ts', 'renderer.plugin.d.ts']
  for (const file of typeFiles) {
    const sourcePath = resolve(sourceDir, file)
    const destPath = resolve(typesDir, file)

    if (!existsSync(sourcePath)) {
      throw new Error(
        `Type file not found: ${sourcePath}\n` +
          `Run 'pnpm --filter kisaki build:plugin-types' first.`
      )
    }

    copyFileSync(sourcePath, destPath)
    console.log(`  ✓ Copied ${file} to src/types/`)
  }

  // Copy theme CSS to src/types/ (alongside .d.ts files)
  const themeSrc = resolve(sourceDir, 'theme.plugin.css')
  const themeDest = resolve(typesDir, 'theme.plugin.css')

  if (!existsSync(themeSrc)) {
    throw new Error(
      `Theme CSS not found: ${themeSrc}\n` + `Run 'pnpm --filter kisaki build:plugin-types' first.`
    )
  }

  copyFileSync(themeSrc, themeDest)
  console.log(`  ✓ Copied theme.plugin.css to src/types/`)
}

// =============================================================================
// Step 2: Build with tsdown
// =============================================================================

function buildWithTsdown() {
  console.log('\n📦 Building with tsdown...\n')
  execSync('npx tsdown', { stdio: 'inherit', cwd: pkgRoot })
}

// =============================================================================
// Step 3: Copy theme CSS to dist/ (after tsdown build)
// =============================================================================

function copyThemeCssToDist() {
  console.log('\n🎨 Copying theme CSS to dist/...\n')

  const themeSrc = resolve(srcDir, 'types/theme.plugin.css')
  const themeDest = resolve(distDir, 'theme.css')

  copyFileSync(themeSrc, themeDest)
  console.log('  ✓ Copied theme.css to dist/')
}

// =============================================================================
// Step 4: Validate output files
// =============================================================================

function validateOutput() {
  console.log('\n🔍 Validating output files...\n')

  const requiredFiles = [
    // Main process
    'main/index.mjs',
    'main/index.d.mts',
    'main/tables.mjs',
    'main/tables.d.mts',
    'main/electron.mjs',
    'main/electron.d.mts',
    'main/drizzle.mjs',
    'main/drizzle.d.mts',
    // Renderer process
    'renderer/index.mjs',
    'renderer/index.d.mts',
    'renderer/tables.mjs',
    'renderer/tables.d.mts',
    'renderer/ui.mjs',
    'renderer/ui.d.mts',
    'renderer/composables.mjs',
    'renderer/composables.d.mts',
    'renderer/stores.mjs',
    'renderer/stores.d.mts',
    'renderer/vue.mjs',
    'renderer/vue.d.mts',
    'renderer/vue-router.mjs',
    'renderer/vue-router.d.mts',
    'renderer/pinia.mjs',
    'renderer/pinia.d.mts',
    'renderer/drizzle.mjs',
    'renderer/drizzle.d.mts',
    // Assets
    'theme.css'
  ]

  const missing = requiredFiles.filter((f) => !existsSync(resolve(distDir, f)))

  if (missing.length > 0) {
    throw new Error(`Missing output files: ${missing.join(', ')}`)
  }

  console.log('✅ All output files present')
  for (const file of requiredFiles) {
    const size = statSync(resolve(distDir, file)).size
    const sizeKB = (size / 1024).toFixed(1)
    console.log(`   ${file}: ${sizeKB} KB`)
  }
}

// =============================================================================
// Step 4: Sync peerDependencies from built output
// =============================================================================

function removeComments(content: string): string {
  // Remove single-line comments
  content = content.replace(/\/\/.*$/gm, '')
  // Remove multi-line comments (including JSDoc)
  content = content.replace(/\/\*[\s\S]*?\*\//g, '')
  return content
}

function extractImportsFromDts(content: string): Set<string> {
  // Remove comments first to avoid matching imports in comments
  const cleanContent = removeComments(content)

  const imports = new Set<string>()
  // Match actual import statements (not in comments)
  const importRegex =
    /(?:^|\n)\s*import\s+(?:type\s+)?(?:\{[^}]*\}|[^'"]*)\s+from\s+['"]([^'"]+)['"]/g
  let match

  while ((match = importRegex.exec(cleanContent)) !== null) {
    const importPath = match[1]
    // Skip relative imports
    if (importPath.startsWith('.') || importPath.startsWith('/')) continue
    // Skip self-reference
    if (importPath.startsWith('@kisaki/plugin-sdk')) continue

    // Extract package name (handle scoped packages)
    const parts = importPath.split('/')
    const pkgName = importPath.startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0]
    imports.add(pkgName)
  }

  return imports
}

/**
 * Sync peerDependencies based on imports found in built .d.mts files.
 * Uses exact versions from main app's package.json.
 */
function syncPeerDependencies(): boolean {
  console.log('\n🔄 Syncing peerDependencies from built output...\n')

  // Packages that must always be peer dependencies (not detected from imports)
  // These are required for non-TypeScript assets (e.g., theme.css requires tailwindcss)
  const alwaysRequired = ['tailwindcss']

  // Read all .d.mts files from subdirectories
  const dtsFiles = [
    'main/index.d.mts',
    'main/tables.d.mts',
    'main/electron.d.mts',
    'main/drizzle.d.mts',
    'renderer/index.d.mts',
    'renderer/tables.d.mts',
    'renderer/ui.d.mts',
    'renderer/composables.d.mts',
    'renderer/stores.d.mts',
    'renderer/vue.d.mts',
    'renderer/vue-router.d.mts',
    'renderer/pinia.d.mts',
    'renderer/drizzle.d.mts'
  ]

  const allImports = new Set<string>(alwaysRequired)

  for (const dtsFile of dtsFiles) {
    const content = readFileSync(resolve(distDir, dtsFile), 'utf-8')
    const imports = extractImportsFromDts(content)
    for (const imp of imports) {
      allImports.add(imp)
    }
    console.log(`   ${dtsFile}: ${[...imports].join(', ') || '(none)'}`)
  }

  console.log(`   Always required: ${alwaysRequired.join(', ')}`)
  console.log()

  // Read main app package.json to get versions
  const mainAppPkgPath = resolve(mainAppRoot, 'package.json')
  const mainAppPkg = JSON.parse(readFileSync(mainAppPkgPath, 'utf-8'))
  const mainDeps = { ...mainAppPkg.dependencies, ...mainAppPkg.devDependencies }

  // Read SDK package.json
  const sdkPkgPath = resolve(pkgRoot, 'package.json')
  const sdkPkg = JSON.parse(readFileSync(sdkPkgPath, 'utf-8'))
  const currentPeerDeps = sdkPkg.peerDependencies ?? {}

  // Build new peerDependencies from imports (use exact version from main app)
  const newPeerDeps: Record<string, string> = {}
  let hasError = false

  for (const pkgName of allImports) {
    const mainVersion = mainDeps[pkgName]
    if (!mainVersion) {
      console.error(`  ❌ ${pkgName}: not found in main app dependencies`)
      hasError = true
      continue
    }

    newPeerDeps[pkgName] = mainVersion

    const currentVersion = currentPeerDeps[pkgName]
    if (currentVersion !== mainVersion) {
      console.log(`  📝 ${pkgName}: ${currentVersion || '(new)'} → ${mainVersion}`)
    } else {
      console.log(`  ✓ ${pkgName}: ${mainVersion}`)
    }
  }

  if (hasError) {
    return false
  }

  // Check for removed dependencies
  const removed = Object.keys(currentPeerDeps).filter((pkg) => !allImports.has(pkg))
  for (const pkg of removed) {
    console.log(`  🗑️ ${pkg}: removed (no longer imported)`)
  }

  // Update package.json if changed
  const isChanged =
    JSON.stringify(newPeerDeps) !== JSON.stringify(currentPeerDeps) || removed.length > 0

  if (isChanged) {
    // Sort keys for consistent output
    const sortedPeerDeps: Record<string, string> = {}
    for (const key of Object.keys(newPeerDeps).sort()) {
      sortedPeerDeps[key] = newPeerDeps[key]
    }

    sdkPkg.peerDependencies = sortedPeerDeps

    // Update devDependencies to match main app exactly
    for (const [pkgName] of Object.entries(sortedPeerDeps)) {
      if (sdkPkg.devDependencies?.[pkgName]) {
        sdkPkg.devDependencies[pkgName] = mainDeps[pkgName]
      }
    }

    writeFileSync(sdkPkgPath, JSON.stringify(sdkPkg, null, 2) + '\n')
    console.log('\n  ✅ package.json updated')
  } else {
    console.log('\n  ✅ All peerDependencies already in sync')
  }

  return true
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('  @kisaki/plugin-sdk Build (powered by tsdown)')
  console.log('═══════════════════════════════════════════════════════')

  try {
    copyTypeDefinitionsToSrc() // Step 1: Copy .d.ts + .css to src/types/
    buildWithTsdown() // Step 2: Build (clean + generate .mjs + .d.mts)
    copyThemeCssToDist() // Step 3: Copy theme.css to dist/ (after tsdown clean)
    validateOutput() // Step 4: Validate all files
    const isPeerDepsValid = syncPeerDependencies() // Step 5: Sync deps

    if (!isPeerDepsValid) {
      console.error('\n❌ Build completed with errors')
      process.exit(1)
    }

    console.log('\n═══════════════════════════════════════════════════════')
    console.log('  ✅ Build completed successfully!')
    console.log('═══════════════════════════════════════════════════════\n')
  } catch (error) {
    console.error('\n❌ Build failed:', error)
    process.exit(1)
  }
}

main()
