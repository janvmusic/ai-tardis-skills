#!/usr/bin/env node

const fs = require('fs')
const os = require('os')
const path = require('path')
const https = require('https')
const p = require('@clack/prompts')

const SKILLS_SRC = path.join(__dirname, '..', 'skills')
const PKG = require('../package.json')

const AI_TARGETS = {
  claude: path.join('.claude', 'skills'),
  opencode: path.join('.opencode', 'skill'),
  agents: path.join('.agents', 'skills'),
}
const GLOBAL_AI_TARGETS = {
  claude: path.join(os.homedir(), '.claude', 'skills'),
  opencode: path.join(os.homedir(), '.config', 'opencode', 'skills'),
  agents: path.join(os.homedir(), '.agents', 'skills'),
}
const AGENT_LABELS = {
  claude: 'Claude Code',
  opencode: 'OpenCode',
  agents: 'Codex / AGENTS.md',
}
const DEFAULT_AI = 'claude'
const DEPRECATED_SKILLS = ['frontend-expert', 'rails-expert']
const PRESERVED_ON_UPDATE = [
  path.join('references', 'conventions.md'),
  path.join('references', 'pr_template.md'),
]

const rawArgs = process.argv.slice(2)

// Extract --ai=<name> (or --ai <name>) and --yes/-y from anywhere in the args
let ai = DEFAULT_AI
let yes = false
const positional = []
for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i]
  if (arg === '--ai') {
    ai = rawArgs[++i]
  } else if (arg.startsWith('--ai=')) {
    ai = arg.slice('--ai='.length)
  } else if (arg === '--yes' || arg === '-y') {
    yes = true
  } else {
    positional.push(arg)
  }
}

const [command, ...rest] = positional

function resolveDest() {
  if (!ai || !AI_TARGETS[ai]) {
    console.error(`Unknown AI "${ai || ''}". Valid options: ${Object.keys(AI_TARGETS).join(', ')}`)
    process.exit(1)
  }
  return path.join(process.cwd(), AI_TARGETS[ai])
}

function resolveDestFor(agent, scope) {
  return scope === 'global'
    ? GLOBAL_AI_TARGETS[agent]
    : path.join(process.cwd(), AI_TARGETS[agent])
}

function destLabelFor(agent, scope) {
  return scope === 'global'
    ? `~${GLOBAL_AI_TARGETS[agent].slice(os.homedir().length)}`
    : AI_TARGETS[agent]
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

function installedLocations() {
  return ['project', 'global'].flatMap(scope =>
    Object.keys(AI_TARGETS).map(agent => {
      const dest = resolveDestFor(agent, scope)
      return { scope, agent, dest, destLabel: destLabelFor(agent, scope), installed: installedSkills(dest) }
    })
  ).filter(l => l.installed.length > 0)
}

function isInteractive() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY) && !process.env.CI
}

function list(showInstalled) {
  if (showInstalled) {
    const dest = resolveDest()
    const destLabel = AI_TARGETS[ai]
    const installed = installedSkills(dest)
    console.log(`Installed skills in ${destLabel} (${ai}):`)
    if (installed.length === 0) console.log('  (none)')
    installed.forEach(skill => console.log(`  - ${skill}`))
    return
  }
  const skills = availableSkills()
  console.log('Available skills:')
  skills.forEach(skill => console.log(`  - ${skill}`))
}

// Non-interactive default: every non-deprecated skill, to the Project/--ai target.
function installYes() {
  const dest = resolveDest()
  const destLabel = AI_TARGETS[ai]
  availableSkills().forEach(s => {
    if (DEPRECATED_SKILLS.includes(s)) return
    copyDir(path.join(SKILLS_SRC, s), path.join(dest, s))
    console.log(`Installed "${s}" to ${destLabel}/${s} (${ai})`)
  })
  const skipped = availableSkills().filter(s => DEPRECATED_SKILLS.includes(s))
  if (skipped.length > 0) {
    console.log(`Skipped deprecated: ${skipped.join(', ')}.`)
  }
}

async function installWizard() {
  p.intro('tardis-ai install')

  const scope = await p.select({
    message: 'Where do you want to install skills?',
    options: [
      { value: 'project', label: 'Project', hint: 'this directory only' },
      { value: 'global', label: 'Global', hint: 'available in every project' },
    ],
  })
  if (p.isCancel(scope)) return cancelWizard()

  const agent = await p.select({
    message: 'Which AI agent?',
    options: [
      { value: 'claude', label: AGENT_LABELS.claude },
      { value: 'opencode', label: AGENT_LABELS.opencode },
      { value: 'agents', label: AGENT_LABELS.agents },
    ],
  })
  if (p.isCancel(agent)) return cancelWizard()

  const skills = availableSkills()
  const selected = await p.multiselect({
    message: 'Which skills do you want to install?',
    options: skills.map(s => ({
      value: s,
      label: DEPRECATED_SKILLS.includes(s) ? `${s} (deprecated)` : s,
    })),
    required: true,
  })
  if (p.isCancel(selected)) return cancelWizard()

  const dest = resolveDestFor(agent, scope)
  const destLabel = destLabelFor(agent, scope)

  p.note(
    [
      `Scope: ${scope === 'global' ? 'Global' : 'Project'}`,
      `Agent: ${AGENT_LABELS[agent]}`,
      `Skills: ${selected.join(', ')}`,
    ].join('\n'),
    'Summary'
  )

  const confirmed = await p.confirm({ message: 'Install these skills?' })
  if (p.isCancel(confirmed) || !confirmed) return cancelWizard('Nothing installed.')

  selected.forEach(s => {
    copyDir(path.join(SKILLS_SRC, s), path.join(dest, s))
    p.log.success(`Installed "${s}" to ${destLabel}/${s} (${agent})`)
  })
  p.outro(`${selected.length} skill${selected.length === 1 ? '' : 's'} installed.`)
}

function cancelWizard(message = 'Cancelled. Nothing changed.') {
  p.cancel(message)
  process.exit(1)
}

function refreshSkills(dest, destLabel, agent, targets, log) {
  const available = availableSkills()
  let updated = 0
  targets.forEach(s => {
    if (!available.includes(s)) {
      log(`Skipped "${s}" — no longer part of ai-tardis-skills. Remove it with "tardis-ai remove".`)
      return
    }
    const target = path.join(dest, s)
    const preserved = PRESERVED_ON_UPDATE
      .map(rel => path.join(target, rel))
      .filter(filePath => fs.existsSync(filePath))
      .map(filePath => [filePath, fs.readFileSync(filePath)])
    // Replace instead of merge so files dropped upstream don't linger.
    fs.rmSync(target, { recursive: true, force: true })
    copyDir(path.join(SKILLS_SRC, s), target)
    preserved.forEach(([filePath, contents]) => {
      fs.mkdirSync(path.dirname(filePath), { recursive: true })
      fs.writeFileSync(filePath, contents)
    })
    log(`Updated "${s}" in ${destLabel}/${s} (${agent})`)
    updated++
  })
  return updated
}

async function updateWizard() {
  p.intro('tardis-ai update')

  const locations = installedLocations()
  if (locations.length === 0) {
    p.outro('No skills installed in any Project or Global location. Run "tardis-ai install" first.')
    return
  }

  let location = locations[0]
  if (locations.length > 1) {
    const choice = await p.select({
      message: 'Update skills where?',
      options: locations.map((l, i) => ({
        value: i,
        label: `${l.scope === 'global' ? 'Global' : 'Project'} · ${AGENT_LABELS[l.agent]}`,
        hint: `${l.destLabel} · ${l.installed.length} skill${l.installed.length === 1 ? '' : 's'}`,
      })),
    })
    if (p.isCancel(choice)) return cancelWizard()
    location = locations[choice]
  }

  const { scope, agent, dest, destLabel, installed } = location

  const selected = await p.multiselect({
    message: 'Which skills do you want to update?',
    options: installed.map(s => ({ value: s, label: s })),
    initialValues: installed,
    required: true,
  })
  if (p.isCancel(selected)) return cancelWizard()

  p.note(
    [
      `Scope: ${scope === 'global' ? 'Global' : 'Project'}`,
      `Agent: ${AGENT_LABELS[agent]}`,
      `Skills: ${selected.join(', ')}`,
    ].join('\n'),
    'Summary'
  )

  const confirmed = await p.confirm({ message: 'Update these skills?' })
  if (p.isCancel(confirmed) || !confirmed) return cancelWizard('Nothing updated.')

  const updated = refreshSkills(dest, destLabel, agent, selected, message => p.log.success(message))
  p.outro(`${updated} skill${updated === 1 ? '' : 's'} updated to ai-tardis-skills v${PKG.version}.`)
  notifyIfOutdated()
}

function update(skill) {
  const dest = resolveDest()
  const destLabel = AI_TARGETS[ai]
  const available = availableSkills()
  const installed = installedSkills(dest)

  if (installed.length === 0) {
    console.error(`No skills installed in ${destLabel} (${ai}). Run "tardis-ai install" first.`)
    process.exit(1)
  }

  let targets = installed
  if (skill && skill !== 'all') {
    if (!installed.includes(skill)) {
      console.error(`Skill "${skill}" is not installed for ${ai}. Run "tardis-ai install" first.`)
      process.exit(1)
    }
    targets = [skill]
  }

  const updated = refreshSkills(dest, destLabel, ai, targets, message => console.log(message))

  console.log(`${updated} skill${updated === 1 ? '' : 's'} updated to ai-tardis-skills v${PKG.version}.`)

  const newSkills = available.filter(s => !installed.includes(s))
  if (newSkills.length > 0) {
    console.log(`New skills available: ${newSkills.join(', ')}. Install with "tardis-ai install".`)
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

// Non-interactive default: remove everything installed at the Project/--ai target.
function removeYes(invokedAs) {
  const dest = resolveDest()
  const destLabel = AI_TARGETS[ai]
  const installed = installedSkills(dest)
  if (installed.length === 0) {
    console.error(`No skills installed in ${destLabel} (${ai}).`)
    process.exit(1)
  }
  installed.forEach(s => {
    fs.rmSync(path.join(dest, s), { recursive: true, force: true })
    console.log(`Removed "${s}" from ${destLabel}/${s} (${ai})`)
  })
}

async function removeWizard(invokedAs) {
  p.intro(`tardis-ai ${invokedAs}`)

  const scope = await p.select({
    message: 'Remove from where?',
    options: [
      { value: 'project', label: 'Project', hint: 'this directory only' },
      { value: 'global', label: 'Global', hint: 'shared across every project' },
    ],
  })
  if (p.isCancel(scope)) return cancelWizard()

  const agent = await p.select({
    message: 'Which AI agent?',
    options: [
      { value: 'claude', label: AGENT_LABELS.claude },
      { value: 'opencode', label: AGENT_LABELS.opencode },
      { value: 'agents', label: AGENT_LABELS.agents },
    ],
  })
  if (p.isCancel(agent)) return cancelWizard()

  const dest = resolveDestFor(agent, scope)
  const destLabel = destLabelFor(agent, scope)
  const installed = installedSkills(dest)

  if (installed.length === 0) {
    p.outro(`No skills installed in ${destLabel} (${agent}).`)
    return
  }

  const selected = await p.multiselect({
    message: 'Which skills do you want to remove?',
    options: installed.map(s => ({ value: s, label: s })),
    required: true,
  })
  if (p.isCancel(selected)) return cancelWizard()

  p.note(
    [
      `Scope: ${scope === 'global' ? 'Global' : 'Project'}`,
      `Agent: ${AGENT_LABELS[agent]}`,
      `Skills: ${selected.join(', ')}`,
    ].join('\n'),
    'Summary'
  )

  const confirmed = await p.confirm({ message: 'Remove these skills?' })
  if (p.isCancel(confirmed) || !confirmed) return cancelWizard('Nothing removed.')

  selected.forEach(s => {
    fs.rmSync(path.join(dest, s), { recursive: true, force: true })
    p.log.success(`Removed "${s}" from ${destLabel}/${s} (${agent})`)
  })
  p.outro(`${selected.length} skill${selected.length === 1 ? '' : 's'} removed.`)
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

function version() {
  console.log(`tardis-ai v${PKG.version}`)
}

function help() {
  console.log('Usage: tardis-ai <command> [options]')
  console.log('')
  console.log('Commands:')
  console.log('  list              Show available skills (--installed shows what\'s installed)')
  console.log('  install           Interactive wizard: scope, AI agent, then pick skills')
  console.log('  update [skill]    Interactive wizard: scope, AI agent, then pick skills to refresh')
  console.log('                    (a skill name or "all" skips the wizard, Project/--ai target)')
  console.log('  remove            Interactive wizard: scope, AI agent, then pick skills to remove')
  console.log('  delete            Alias for remove')
  console.log('  version           Print the installed tardis-ai version')
  console.log('')
  console.log('Options:')
  console.log('  -v, --version     Print the installed tardis-ai version')
  console.log('  --yes, -y         Skip the install/update/remove wizard: every non-deprecated skill (install)')
  console.log('                    or everything installed (update/remove), Project scope, --ai target')
  console.log('  --ai=<name>       AI target for update/list --installed/--yes: claude (default), opencode, agents')
  console.log('  --installed       With list: show what\'s installed instead of what\'s available')
  console.log('')
  console.log('Skills:')
  console.log('  code-review              Thorough code reviews on branch changes')
  console.log('  commit                   Git commits with conventional commit format')
  console.log('  create-pr                GitHub Pull Requests with structured descriptions')
  console.log('  polish                   Clean up style and structure against your documented rules')
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

async function main() {
  switch (command) {
    case 'list':
      list(rest.includes('--installed'))
      break
    case 'install':
      if (rest.length > 0) {
        console.error('tardis-ai install no longer takes a skill name. Run "tardis-ai install" for the interactive wizard, or "tardis-ai install --yes" to install every non-deprecated skill non-interactively.')
        process.exit(1)
      }
      if (yes) {
        installYes()
      } else if (!isInteractive()) {
        console.error('tardis-ai install requires an interactive terminal. Use "tardis-ai install --yes" in CI or non-interactive contexts.')
        process.exit(1)
      } else {
        await installWizard()
      }
      break
    case 'update':
      if (rest.length > 0 || yes) {
        update(rest[0])
      } else if (!isInteractive()) {
        console.error('tardis-ai update requires an interactive terminal. Use "tardis-ai update --yes" in CI or non-interactive contexts.')
        process.exit(1)
      } else {
        await updateWizard()
      }
      break
    case 'remove':
    case 'delete':
      if (rest.length > 0) {
        console.error(`tardis-ai ${command} no longer takes a skill name. Run "tardis-ai ${command}" for the interactive wizard, or "tardis-ai ${command} --yes" to remove everything installed non-interactively.`)
        process.exit(1)
      }
      if (yes) {
        removeYes(command)
      } else if (!isInteractive()) {
        console.error(`tardis-ai ${command} requires an interactive terminal. Use "tardis-ai ${command} --yes" in CI or non-interactive contexts.`)
        process.exit(1)
      } else {
        await removeWizard(command)
      }
      break
    case 'sexy':
      tardis()
      break
    case 'version':
    case '--version':
    case '-v':
      version()
      break
    default:
      help()
      break
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error(err)
    process.exit(1)
  })
}

module.exports = {
  AI_TARGETS,
  GLOBAL_AI_TARGETS,
  DEPRECATED_SKILLS,
  availableSkills,
  installedSkills,
  installedLocations,
  copyDir,
  resolveDestFor,
  destLabelFor,
}
