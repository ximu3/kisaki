/**
 * Build Script for Plugin Type Definitions and Theme CSS
 *
 * 1. Run rolldown to generate .d.ts files
 * 2. Extract theme CSS from globals.css
 *
 * This script integrates type generation and theme extraction into a single build step.
 */

import { execSync } from 'child_process'
import { parse, type AtRule } from 'postcss'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')

const GLOBALS_CSS = resolve(rootDir, 'src/renderer/src/styles/globals.css')
const OUTPUT_DIR = resolve(rootDir, 'plugin-types')
const OUTPUT_CSS = resolve(OUTPUT_DIR, 'theme.plugin.css')

// =============================================================================
// Step 1: Generate type definitions with rolldown
// =============================================================================

function buildTypeDefinitions() {
  console.log('\n📦 Generating type definitions with rolldown...\n')
  execSync('npx rolldown --config rolldown.plugin-types.config.ts', {
    stdio: 'inherit',
    cwd: rootDir
  })
}

// =============================================================================
// Step 2: Extract theme CSS
// =============================================================================

function extractThemeCss() {
  console.log('\n🎨 Extracting theme CSS for plugins...\n')

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const source = readFileSync(GLOBALS_CSS, 'utf-8')
  const ast = parse(source)

  const timestamp = new Date().toISOString()
  const header = `/**
 * Kisaki Plugin Theme Specification
 * Auto-generated from src/renderer/src/styles/globals.css
 * Generated at: ${timestamp}
 *
 * This file contains only Tailwind v4 semantic token mappings.
 * Actual color values are provided by the host app at runtime.
 *
 * DO NOT EDIT MANUALLY
 */

`

  const extracted: string[] = []

  // Extract @theme inline block
  ast.walkAtRules('theme', (rule: AtRule) => {
    if (rule.params.includes('inline')) {
      extracted.push(rule.toString())
    }
  })

  // Extract @layer utilities block
  ast.walkAtRules('layer', (rule: AtRule) => {
    if (rule.params === 'utilities') {
      extracted.push(rule.toString())
    }
  })

  const output = header + extracted.join('\n\n')
  const outputWithNewline = output.endsWith('\n') ? output : `${output}\n`
  writeFileSync(OUTPUT_CSS, outputWithNewline)

  console.log(`  ✓ Generated plugin-types/theme.plugin.css`)
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('  Building Plugin Types (.d.ts + theme.css)')
  console.log('═══════════════════════════════════════════════════════')

  try {
    buildTypeDefinitions()
    extractThemeCss()

    console.log('\n═══════════════════════════════════════════════════════')
    console.log('  ✅ Plugin types built successfully!')
    console.log('═══════════════════════════════════════════════════════\n')
  } catch (error) {
    console.error('\n❌ Build failed:', error)
    process.exit(1)
  }
}

main()
