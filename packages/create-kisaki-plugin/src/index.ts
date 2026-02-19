/**
 * create-kisaki-plugin
 *
 * Scaffolding tool to create Kisaki plugins.
 * Usage: npx create-kisaki-plugin [project-name]
 */

import { resolve } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import prompts from 'prompts'
import { green, cyan, red, bold, dim } from 'kolorist'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

interface PluginConfig {
  projectName: string
  pluginId: string
  pluginName: string
  description: string
  author: string
}

interface ScaffoldOptions {
  git?: boolean
}

async function main(): Promise<void> {
  // Parse CLI args
  const args = process.argv.slice(2)
  const gitIndex = args.indexOf('--git')
  const hasGitFlag = gitIndex !== -1
  if (hasGitFlag) args.splice(gitIndex, 1)

  const projectName = args[0]

  console.log()
  console.log(bold(cyan('  create-kisaki-plugin')))
  console.log(dim('  Scaffolding a new Kisaki plugin project...'))
  console.log()

  const response = await prompts(
    [
      {
        type: projectName ? null : 'text',
        name: 'projectName',
        message: 'Project name:',
        initial: 'my-kisaki-plugin',
        validate: (value) => (value.trim() ? true : 'Project name is required')
      },
      {
        type: 'text',
        name: 'pluginId',
        message: 'Plugin ID (unique identifier):',
        initial: (prev: string) =>
          (projectName || prev || 'my-kisaki-plugin').replace(/[^a-z0-9-]/gi, '-').toLowerCase(),
        validate: (value) =>
          /^[a-z0-9-]+$/.test(value) ? true : 'Plugin ID must be lowercase with hyphens only'
      },
      {
        type: 'text',
        name: 'pluginName',
        message: 'Plugin display name:',
        initial: (prev: string) =>
          prev
            .split('-')
            .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(' ')
      },
      {
        type: 'text',
        name: 'description',
        message: 'Description:',
        initial: 'A Kisaki plugin'
      },
      {
        type: 'text',
        name: 'author',
        message: 'Author:'
      },
      {
        type: hasGitFlag ? null : 'confirm',
        name: 'git',
        message: 'Initialize git repository?',
        initial: true
      }
    ],
    {
      onCancel: () => {
        console.log(red('✖') + ' Operation cancelled')
        process.exit(1)
      }
    }
  )

  const config: PluginConfig = {
    projectName: projectName || response.projectName,
    pluginId: response.pluginId,
    pluginName: response.pluginName,
    description: response.description,
    author: response.author
  }

  const options: ScaffoldOptions = {
    git: hasGitFlag || response.git
  }

  const targetDir = resolve(process.cwd(), config.projectName)

  // Check if directory exists
  if (existsSync(targetDir)) {
    console.log(red(`✖ Directory "${config.projectName}" already exists`))
    process.exit(1)
  }

  // Create project directory
  mkdirSync(targetDir, { recursive: true })

  // Copy template files (templates are in ../templates/default relative to dist)
  const templateDir = resolve(__dirname, '../templates/default')
  copyDir(templateDir, targetDir, config)

  // Initialize git repository
  if (options.git) {
    initGitRepo(targetDir, config)
  }

  console.log()
  console.log(green('✔') + ` Plugin project created in ${bold(config.projectName)}`)
  console.log()
  console.log('  Next steps:')
  console.log()
  console.log(`  ${dim('$')} cd ${config.projectName}`)
  console.log(`  ${dim('$')} npm install`)
  console.log(`  ${dim('$')} npm run build`)
  console.log()
}

/**
 * Recursively copy directory with template variable replacement
 */
function copyDir(src: string, dest: string, config: PluginConfig) {
  if (!existsSync(src)) {
    console.log(red(`✖ Template directory not found: ${src}`))
    process.exit(1)
  }

  mkdirSync(dest, { recursive: true })

  for (const file of readdirSync(src)) {
    const srcPath = resolve(src, file)
    const destPath = resolve(dest, file)

    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath, config)
    } else {
      // Read and replace template variables
      let content = readFileSync(srcPath, 'utf-8')
      content = content
        .replace(/kisaki-plugin-template/g, config.pluginId)
        .replace(/Kisaki Plugin Template/g, config.pluginName)
        .replace(/A Kisaki plugin\./g, config.description || 'A Kisaki plugin.')
        .replace(/example\.com/g, config.author || 'example.com')
        .replace(/https:\/\/example\.com/g, '')

      writeFileSync(destPath, content)
    }
  }
}

/**
 * Initialize git repository with initial commit
 */
function initGitRepo(targetDir: string, config: PluginConfig) {
  try {
    execSync('git init', { cwd: targetDir, stdio: 'ignore' })
    execSync('git add -A', { cwd: targetDir, stdio: 'ignore' })
    execSync(`git commit -m "Initial commit: ${config.pluginName}"`, {
      cwd: targetDir,
      stdio: 'ignore'
    })
    console.log(green('✔') + ' Initialized git repository')
  } catch {
    console.log(dim('  (git init skipped - git not available)'))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
