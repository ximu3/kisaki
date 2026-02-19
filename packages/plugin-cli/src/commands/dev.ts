/**
 * Dev Command
 *
 * Starts development mode with Vite watch and directly spawns Kisaki.
 * Automatically enables debug mode (inspector + wait for debugger).
 */

import { spawn, type ChildProcess } from 'child_process'
import { resolve, join } from 'path'
import { existsSync } from 'fs'
import { green, cyan, dim, red } from 'kolorist'

let kisaki: ChildProcess | null = null
let vite: ChildProcess | null = null

export async function devCommand(): Promise<void> {
  const cwd = process.cwd()

  console.log()
  console.log(cyan('  kisaki-plugin dev'))
  console.log(dim('  Starting development mode...'))
  console.log()
  console.log('[KISAKI_PLUGIN_DEV] START')

  // Verify this is a valid plugin project
  const manifestPath = join(cwd, 'src/shared/manifest.ts')
  if (!existsSync(manifestPath)) {
    console.log(red('✖') + ' Not a valid plugin project (src/shared/manifest.ts not found)')
    process.exit(1)
  }

  const kisakiCommand = 'kisaki'
  console.log(dim('  Kisaki: ' + kisakiCommand))

  const distPath = resolve(cwd, 'dist')

  // Start vite build --watch
  // Force a debugger-friendly build:
  // - no minification (preserve identifiers so VSCode hover evaluate works)
  // - sourcemaps enabled (some projects may disable them in config)
  // - development mode (lets plugin vite.config.ts apply dev-only options if desired)
  vite = spawn(
    'npx',
    ['vite', 'build', '--watch', '--mode', 'development', '--minify', 'false', '--sourcemap'],
    {
      cwd,
      stdio: ['inherit', 'pipe', 'inherit'],
      shell: true
    }
  )

  let firstBuildDone = false

  let isShuttingDown = false

  const cleanup = (exitCode = 0) => {
    if (isShuttingDown) return
    isShuttingDown = true
    if (kisaki && !kisaki.killed) {
      kisaki.kill()
    }
    if (vite && !vite.killed) {
      vite.kill()
    }
    process.exit(exitCode)
  }

  const handleSignal = (signal: NodeJS.Signals) => {
    const exitCode = signal === 'SIGINT' ? 130 : 143
    cleanup(exitCode)
  }

  vite.stdout?.on('data', (data: Buffer) => {
    process.stdout.write(data)

    // Detect first build completion (vite outputs "built in")
    if (!firstBuildDone && data.toString().includes('built in')) {
      firstBuildDone = true

      // Spawn Kisaki directly with command-line arguments
      kisaki = spawn(
        kisakiCommand,
        ['--inspect=9229', '--remote-debugging-port=9222', `--dev-plugin=${distPath}`],
        {
          stdio: 'inherit',
          detached: false,
          shell: process.platform === 'win32'
        }
      )

      kisaki.once('spawn', () => {
        console.log('[KISAKI_PLUGIN_DEV] READY main=9229 renderer=9222')
      })

      kisaki.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') {
          console.log(red('✖') + ' Kisaki not found in PATH')
          console.log(dim('  Install Kisaki and ensure "kisaki" is available in PATH'))
        } else {
          console.log(red('✖') + ' Failed to start Kisaki: ' + error.message)
        }
        cleanup(1)
      })

      kisaki.on('exit', (code) => {
        console.log(dim('  Kisaki exited with code: ' + code))
        cleanup(code ?? 0)
      })

      console.log()
      console.log(green('✔') + ' Kisaki started with dev plugin')
      console.log(dim('  Main process debugger: port 9229'))
      console.log(dim('  Renderer process debugger: port 9222'))
      console.log(dim('  Plugin activation waits for debugger attachment'))
      console.log(dim('  Watching for changes. Press Ctrl+C to stop.'))
      console.log()
    }
  })

  vite.on('close', (code) => {
    if (code !== 0) {
      console.log(red('✖') + ' Vite exited with code: ' + code)
    }
    cleanup(code ?? 0)
  })

  // Handle exit signals
  process.once('SIGINT', () => handleSignal('SIGINT'))
  process.once('SIGTERM', () => handleSignal('SIGTERM'))
}
