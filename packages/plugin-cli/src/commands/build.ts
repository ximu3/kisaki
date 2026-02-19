/**
 * Build Command
 *
 * Wraps vite build for consistency with other CLI commands.
 */

import { spawn } from 'child_process'
import { cyan, dim } from 'kolorist'

export async function buildCommand(): Promise<void> {
  console.log()
  console.log(cyan('  kisaki-plugin build'))
  console.log(dim('  Building plugin...'))
  console.log()

  const vite = spawn('npx', ['vite', 'build'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true
  })

  vite.on('close', (code) => {
    process.exit(code ?? 0)
  })
}
