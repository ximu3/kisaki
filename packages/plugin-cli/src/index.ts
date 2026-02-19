/**
 * Kisaki Plugin CLI
 *
 * Development tools for Kisaki plugins.
 * Commands: dev, build, validate, pack
 */

import { program } from 'commander'
import { validateCommand } from './commands/validate'
import { packCommand } from './commands/pack'
import { devCommand } from './commands/dev'
import { buildCommand } from './commands/build'

program
  .name('kisaki-plugin')
  .description('CLI tools for Kisaki plugin development')
  .version('0.1.0')

program
  .command('dev')
  .description('Start development mode with hot reload (debug mode enabled by default)')
  .action(devCommand)

program.command('build').description('Build plugin for production').action(buildCommand)

program
  .command('validate')
  .description('Validate plugin structure and manifest')
  .action(validateCommand)

program
  .command('pack')
  .description('Package plugin into distributable zip (runs build first by default)')
  .option('-o, --outdir <dir>', 'Build output directory', 'dist')
  .option('--no-build', 'Skip build step')
  .action(packCommand)

program.parse()
