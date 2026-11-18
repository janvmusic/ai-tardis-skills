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
const CENTRAL_TARGET = path.join('.tardis', 'skills')
const GLOBAL_CENTRAL = path.join(os.homedir(), '.tardis', 'skills')
const AGENT_LABELS = {
  claude: 'Claude Code',
  opencode: 'OpenCode',
  agents: 'Codex / AGENTS.md',
}
const DEFAULT_AI = 'claude'
const DEPRECATED_SKILLS = ['frontend-expert', 'rails-expert']
const RETIRED_SKILLS = ['root-cause-investigator']
const PRESERVED_ON_UPDATE = [
  path.join('references', 'conventions.md'),
  path.join('references', 'pr_template.md'),
]

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

function centralDirFor(scope) {
  return scope === 'global' ? GLOBAL_CENTRAL : path.join(process.cwd(), CENTRAL_TARGET)
}

function centralLabelFor(scope) {
  return scope === 'global' ? `~/${CENTRAL_TARGET}` : CENTRAL_TARGET
}

function availableSkills() {
  return fs.readdirSync(SKILLS_SRC).filter(f =>
    fs.statSync(path.join(SKILLS_SRC, f)).isDirectory()
  )
}

function installedSkills(dest) {
  if (!fs.existsSync(dest)) return []
  return fs.readdirSync(dest).filter(f =>
    fs.statSync(path.join(dest, f), { throwIfNoEntry: false })?.isDirectory()
  )
}

function linksTo(entry, central) {
  try {
    return fs.realpathSync(entry) === fs.realpathSync(central)
  } catch {
    return false
  }
}

function installSkill(scope, agent, skill) {
  const dest = resolveDestFor(agent, scope)
  const target = path.join(dest, skill)
  const central = path.join(centralDirFor(scope), skill)
  if (fs.lstatSync(target, { throwIfNoEntry: false }) && !linksTo(target, central)) return 'conflict'
  if (!fs.existsSync(central)) copyDir(path.join(SKILLS_SRC, skill), central)
  fs.mkdirSync(dest, { recursive: true })
  fs.rmSync(target, { force: true })
  fs.symlinkSync(path.relative(fs.realpathSync(dest), fs.realpathSync(central)), target, 'dir')
  return 'installed'
}

function readPreserved(dir) {
  return PRESERVED_ON_UPDATE
    .map(rel => [rel, path.join(dir, rel)])
    .filter(([, filePath]) => fs.existsSync(filePath))
    .map(([rel, filePath]) => [rel, fs.readFileSync(filePath)])
}

function writePreserved(dir, preserved) {
  preserved.forEach(([rel, contents]) => {
    const filePath = path.join(dir, rel)
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, contents)
  })
}

function isLegacyCopy(dest, skill) {
  return Boolean(fs.lstatSync(path.join(dest, skill), { throwIfNoEntry: false })?.isDirectory())
}

function migrateSkill(scope, agent, skill) {
  const target = path.join(resolveDestFor(agent, scope), skill)
  const central = path.join(centralDirFor(scope), skill)
  const preserved = readPreserved(target)
  const fresh = !fs.existsSync(central)
  fs.rmSync(target, { recursive: true, force: true })
  installSkill(scope, agent, skill)
  if (fresh) writePreserved(central, preserved)
}

function deleteSkill(scope, agent, skill) {
  fs.rmSync(path.join(resolveDestFor(agent, scope), skill), { recursive: true, force: true })
  const central = path.join(centralDirFor(scope), skill)
  const stillLinked = Object.keys(AI_TARGETS).some(a =>
    linksTo(path.join(resolveDestFor(a, scope), skill), central)
  )
  if (!stillLinked) fs.rmSync(central, { recursive: true, force: true })
}

function managedSkills(dest, includeRetired) {
  const known = includeRetired ? [...availableSkills(), ...RETIRED_SKILLS] : availableSkills()
  return installedSkills(dest).filter(s => known.includes(s))
}

function installedLocations(includeRetired = false) {
  return ['project', 'global'].flatMap(scope =>
    Object.keys(AI_TARGETS).map(agent => {
      const dest = resolveDestFor(agent, scope)
      return { scope, agent, dest, destLabel: destLabelFor(agent, scope), installed: managedSkills(dest, includeRetired) }
    })
  ).filter(l => l.installed.length > 0)
}

async function pickLocation(message, emptyMessage, includeRetired = false) {
  const locations = installedLocations(includeRetired)
  if (locations.length === 0) {
    p.outro(emptyMessage)
    return null
  }
  if (locations.length === 1) return locations[0]
  const choice = await p.select({
    message,
    options: locations.map((l, i) => ({
      value: i,
      label: `${l.scope === 'global' ? 'Global' : 'Project'} · ${AGENT_LABELS[l.agent]}`,
      hint: `${l.destLabel} · ${l.installed.length} skill${l.installed.length === 1 ? '' : 's'}`,
    })),
  })
  if (p.isCancel(choice)) return cancelWizard()
  return locations[choice]
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

  const destLabel = destLabelFor(agent, scope)
  const centralLabel = centralLabelFor(scope)

  p.note(
    [
      `Scope: ${scope === 'global' ? 'Global' : 'Project'}`,
      `Agent: ${AGENT_LABELS[agent]}`,
      `Skills: ${selected.join(', ')}`,
      `Source of truth: ${centralLabel}`,
      `Links: ${destLabel}`,
    ].join('\n'),
    'Summary'
  )

  const confirmed = await p.confirm({ message: 'Install these skills?' })
  if (p.isCancel(confirmed) || !confirmed) return cancelWizard('Nothing installed.')

  let installed = 0
  selected.forEach(s => {
    if (installSkill(scope, agent, s) === 'conflict') {
      p.log.warn(`Skipped "${s}" — ${destLabel}/${s} already exists and is not a link to ${centralLabel}/${s}. Delete it first.`)
      return
    }
    installed++
    p.log.success(`Installed "${s}" to ${centralLabel}/${s}, linked from ${destLabel}/${s} (${agent})`)
  })
  p.outro(`${installed} skill${installed === 1 ? '' : 's'} installed.`)
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
      log(`Skipped "${s}" — no longer part of ai-tardis-skills. Delete it with "tardis-ai delete".`)
      return
    }
    const target = fs.realpathSync(path.join(dest, s))
    const preserved = readPreserved(target)
    // Replace instead of merge so files dropped upstream don't linger.
    fs.rmSync(target, { recursive: true, force: true })
    copyDir(path.join(SKILLS_SRC, s), target)
    writePreserved(target, preserved)
    log(`Updated "${s}" in ${destLabel}/${s} (${agent})`)
    updated++
  })
  return updated
}

async function updateWizard() {
  p.intro('tardis-ai update')

  const location = await pickLocation('Update skills where?', 'No skills installed in any Project or Global location. Run "tardis-ai install" first.')
  if (!location) return
  const { scope, agent, dest, destLabel, installed } = location

  const selected = await p.multiselect({
    message: 'Which skills do you want to update?',
    options: installed.map(s => ({ value: s, label: s })),
    initialValues: installed,
    required: true,
  })
  if (p.isCancel(selected)) return cancelWizard()

  const centralLabel = centralLabelFor(scope)
  const legacy = selected.filter(s => isLegacyCopy(dest, s))
  let migrate = false
  if (legacy.length > 0) {
    p.log.warn(`${legacy.join(', ')} ${legacy.length === 1 ? 'is a plain copy' : 'are plain copies'} in ${destLabel}, an old install layout. Skills now live in ${centralLabel} and are linked from ${destLabel}.`)
    migrate = await p.confirm({ message: `Delete the old ${legacy.length === 1 ? 'copy' : 'copies'} and link ${legacy.length === 1 ? 'it' : 'them'} to ${centralLabel}?` })
    if (p.isCancel(migrate)) return cancelWizard()
  }

  p.note(
    [
      `Scope: ${scope === 'global' ? 'Global' : 'Project'}`,
      `Agent: ${AGENT_LABELS[agent]}`,
      `Skills: ${selected.join(', ')}`,
      ...(legacy.length > 0
        ? [`Old copies: ${migrate ? `deleted and linked to ${centralLabel}` : 'kept and updated in place'}`]
        : []),
    ].join('\n'),
    'Summary'
  )

  const confirmed = await p.confirm({ message: 'Update these skills?' })
  if (p.isCancel(confirmed) || !confirmed) return cancelWizard('Nothing updated.')

  if (migrate) {
    legacy.forEach(s => {
      migrateSkill(scope, agent, s)
      p.log.success(`Replaced the old copy of "${s}" with a link to ${centralLabel}/${s} (${agent})`)
    })
  }
  const updated = refreshSkills(dest, destLabel, agent, selected, message => p.log.success(message))
  p.outro(`${updated} skill${updated === 1 ? '' : 's'} updated to ai-tardis-skills v${PKG.version}.`)
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

async function deleteWizard() {
  p.intro('tardis-ai delete')

  const location = await pickLocation('Delete from where?', 'No skills installed in any Project or Global location.', true)
  if (!location) return
  const { scope, agent, destLabel, installed } = location

  const selected = await p.multiselect({
    message: 'Which skills do you want to delete?',
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

  const confirmed = await p.confirm({ message: 'Delete these skills?' })
  if (p.isCancel(confirmed) || !confirmed) return cancelWizard('Nothing deleted.')

  selected.forEach(s => {
    deleteSkill(scope, agent, s)
    p.log.success(`Deleted "${s}" from ${destLabel}/${s} (${agent})`)
  })
  p.outro(`${selected.length} skill${selected.length === 1 ? '' : 's'} deleted.`)
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
  console.log('  update            Interactive wizard: scope, AI agent, then pick skills to refresh')
  console.log('  delete            Interactive wizard: scope, AI agent, then pick skills to delete')
  console.log('  version           Print the installed tardis-ai version')
  console.log('')
  console.log('Options:')
  console.log('  -v, --version     Print the installed tardis-ai version')
  console.log('  --ai=<name>       AI target for list --installed: claude (default), opencode, agents')
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
  console.log('  rca-investigator         Apply 5-Why methodology to find root causes of bugs and errors')
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

async function interactiveOnly(name, wizard) {
  if (rest.length > 0) {
    console.error(`tardis-ai ${name} takes no arguments. Run "tardis-ai ${name}" for the interactive wizard.`)
    process.exit(1)
  }
  if (!isInteractive()) {
    console.error(`tardis-ai ${name} requires an interactive terminal.`)
    process.exit(1)
  }
  await wizard()
}

async function main() {
  switch (command) {
    case 'list':
      list(rest.includes('--installed'))
      break
    case 'install':
      await interactiveOnly(command, installWizard)
      break
    case 'update':
      await interactiveOnly(command, updateWizard)
      break
    case 'delete':
      await interactiveOnly(command, deleteWizard)
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
  RETIRED_SKILLS,
  availableSkills,
  installedSkills,
  installedLocations,
  refreshSkills,
  copyDir,
  centralDirFor,
  centralLabelFor,
  installSkill,
  deleteSkill,
  isLegacyCopy,
  migrateSkill,
  resolveDestFor,
  destLabelFor,
}
