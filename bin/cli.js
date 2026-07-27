#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const SKILLS_SRC = path.join(__dirname, '..', 'skills')

const AI_TARGETS = {
  claude: path.join('.claude', 'skills'),
  opencode: path.join('.opencode', 'skill'),
  agents: path.join('.agents', 'skills'),
}
const DEFAULT_AI = 'claude'

const rawArgs = process.argv.slice(2)

// Extract --ai=<name> (or --ai <name>) from anywhere in the args
let ai = DEFAULT_AI
const positional = []
for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i]
  if (arg === '--ai') {
    ai = rawArgs[++i]
  } else if (arg.startsWith('--ai=')) {
    ai = arg.slice('--ai='.length)
  } else {
    positional.push(arg)
  }
}

const [command, skillName] = positional

function resolveDest() {
  if (!ai || !AI_TARGETS[ai]) {
    console.error(`Unknown AI "${ai || ''}". Valid options: ${Object.keys(AI_TARGETS).join(', ')}`)
    process.exit(1)
  }
  return path.join(process.cwd(), AI_TARGETS[ai])
}

function list() {
  const skills = fs.readdirSync(SKILLS_SRC).filter(f =>
    fs.statSync(path.join(SKILLS_SRC, f)).isDirectory()
  )
  console.log('Available skills:')
  skills.forEach(skill => console.log(`  - ${skill}`))
}

function install(skill) {
  const dest = resolveDest()
  const destLabel = AI_TARGETS[ai]
  if (!skill || skill === 'all') {
    const skills = fs.readdirSync(SKILLS_SRC).filter(f =>
      fs.statSync(path.join(SKILLS_SRC, f)).isDirectory()
    )
    skills.forEach(s => {
      copyDir(path.join(SKILLS_SRC, s), path.join(dest, s))
      console.log(`Installed "${s}" to ${destLabel}/${s} (${ai})`)
    })
    return
  }
  const src = path.join(SKILLS_SRC, skill)
  if (!fs.existsSync(src)) {
    console.error(`Skill "${skill}" not found. Run "tardis-ai list" to see available skills.`)
    process.exit(1)
  }
  copyDir(src, path.join(dest, skill))
  console.log(`Installed "${skill}" to ${destLabel}/${skill} (${ai})`)
}

function remove(skill) {
  if (!skill) {
    console.error('Usage: tardis-ai remove <skill-name> [--ai=<name>]')
    process.exit(1)
  }
  const dest = resolveDest()
  const destLabel = AI_TARGETS[ai]
  const target = path.join(dest, skill)
  if (!fs.existsSync(target)) {
    console.error(`Skill "${skill}" is not installed for ${ai}.`)
    process.exit(1)
  }
  fs.rmSync(target, { recursive: true })
  console.log(`Removed "${skill}" from ${destLabel}/${skill} (${ai})`)
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry)
    const destPath = path.join(dest, entry)
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

function help() {
  console.log('Usage: tardis-ai <command> [skill-name]')
  console.log('')
  console.log('Commands:')
  console.log('  list              Show available skills')
  console.log('  install [skill]   Install a skill (omit or use "all" to install all)')
  console.log('  remove <skill>    Remove an installed skill')
  console.log('')
  console.log('Options:')
  console.log('  --ai=<name>       Target AI: claude (default), opencode, agents')
  console.log('                    claude   -> .claude/skills')
  console.log('                    opencode -> .opencode/skill')
  console.log('                    agents   -> .agents/skills')
  console.log('')
  console.log('Skills:')
  console.log('  code-review              Thorough code reviews on branch changes')
  console.log('  commit                   Git commits with conventional commit format')
  console.log('  create-pr                GitHub Pull Requests with structured descriptions')
  console.log('  frontend-expert          React + TypeScript UI/UX guidance')
  console.log('  rails-expert             Rails application patterns and best practices')
  console.log('  unravel                  Stress-test a plan via relentless design interviews')
  console.log('  root-cause-investigator  Apply 5-Why methodology to find root causes of bugs and errors')
  console.log('  read-jira-ticket         Load a Jira ticket via ACLI, summarize, and analyze as a senior dev/architect')
  console.log('  plan-review              Staff Engineer + Architect review an implementation plan for readiness')
}

function tardis() {
  console.log('           ___')
  console.log('          | |')
  console.log('          | |')
  console.log('  -------------------')
  console.log('  -------------------')
  console.log('   |  ___  |  ___  |')
  console.log('   | | | | | | | | |')
  console.log('   | |-+-| | |-+-| |')
  console.log('   | |_|_| | |_|_| |')
  console.log('   |  ___  |  ___  |')
  console.log('   | |   | | |   | |')
  console.log('   | |   | | |   | |')
  console.log('   | |___| | |___| |')
  console.log('   |  ___  |  ___  |')
  console.log('   | |   | | |   | |')
  console.log('   | |   | | |   | |')
  console.log('   | |___| | |___| |')
  console.log('   |       |       |')
  console.log('  ===================')
}

switch (command) {
  case 'list':    list();          break
  case 'install': install(skillName); break
  case 'remove':  remove(skillName);  break
  case 'sexy':    tardis();        break
  default:        help();          break
}
