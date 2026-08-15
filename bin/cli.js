#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const https = require('https')

const SKILLS_SRC = path.join(__dirname, '..', 'skills')
const PKG = require('../package.json')

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

function availableSkills() {
  return fs.readdirSync(SKILLS_SRC).filter(f =>
    fs.statSync(path.join(SKILLS_SRC, f)).isDirectory()
  )
}

function installedSkills(dest) {
  if (!fs.existsSync(dest)) return []
  return fs.readdirSync(dest).filter(f =>
    fs.statSync(path.join(dest, f)).isDirectory()
  )
}

function list() {
  const skills = availableSkills()
  console.log('Available skills:')
  skills.forEach(skill => console.log(`  - ${skill}`))
}

function install(skill) {
  const dest = resolveDest()
  const destLabel = AI_TARGETS[ai]
  if (!skill || skill === 'all') {
    availableSkills().forEach(s => {
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

function update(skill) {
  const dest = resolveDest()
  const destLabel = AI_TARGETS[ai]
  const available = availableSkills()
  const installed = installedSkills(dest)

  if (installed.length === 0) {
    console.error(`No skills installed in ${destLabel} (${ai}). Run "tardis-ai install all" first.`)
    process.exit(1)
  }

  let targets = installed
  if (skill && skill !== 'all') {
    if (!installed.includes(skill)) {
      console.error(`Skill "${skill}" is not installed for ${ai}. Run "tardis-ai install ${skill}" first.`)
      process.exit(1)
    }
    targets = [skill]
  }

  let updated = 0
  const orphans = []
  targets.forEach(s => {
    if (!available.includes(s)) {
      orphans.push(s)
      return
    }
    const target = path.join(dest, s)
    // Replace instead of merge so files dropped upstream don't linger.
    fs.rmSync(target, { recursive: true, force: true })
    copyDir(path.join(SKILLS_SRC, s), target)
    console.log(`Updated "${s}" in ${destLabel}/${s} (${ai})`)
    updated++
  })

  orphans.forEach(s =>
    console.log(`Skipped "${s}" — no longer part of ai-tardis-skills. Remove it with "tardis-ai remove ${s}".`)
  )

  console.log(`${updated} skill${updated === 1 ? '' : 's'} updated to ai-tardis-skills v${PKG.version}.`)

  const newSkills = available.filter(s => !installed.includes(s))
  if (newSkills.length > 0) {
    console.log(`New skills available: ${newSkills.join(', ')}. Install with "tardis-ai install <skill>".`)
  }

  notifyIfOutdated()
}

// Skills ship inside the package, so a stale CLI updates skills to stale
// content. Best-effort notice — never blocks or fails the update.
function notifyIfOutdated() {
  const req = https.get(
    'https://registry.npmjs.org/ai-tardis-skills/latest',
    { timeout: 2000, headers: { accept: 'application/json' } },
    res => {
      if (res.statusCode !== 200) return res.resume()
      let body = ''
      res.on('data', chunk => (body += chunk))
      res.on('end', () => {
        try {
          const latest = JSON.parse(body).version
          if (latest && isNewer(latest, PKG.version)) {
            console.log('')
            console.log(`A newer ai-tardis-skills is available (v${PKG.version} -> v${latest}).`)
            console.log('Update the CLI, then run "tardis-ai update" again:')
            console.log('  npm install -g ai-tardis-skills@latest   # or: brew upgrade tardis-ai')
          }
        } catch (_) {
          // Malformed response — nothing worth reporting.
        }
      })
    }
  )
  req.on('timeout', () => req.destroy())
  req.on('error', () => {})
}

function isNewer(a, b) {
  const parse = v => String(v).split('-')[0].split('.').map(Number)
  const [x, y] = [parse(a), parse(b)]
  for (let i = 0; i < 3; i++) {
    const left = x[i] || 0
    const right = y[i] || 0
    if (left !== right) return left > right
  }
  return false
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
  console.log('  update [skill]    Refresh installed skills (omit or use "all" for every one)')
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
  case 'update':  update(skillName);  break
  case 'remove':  remove(skillName);  break
  case 'sexy':    tardis();        break
  default:        help();          break
}
