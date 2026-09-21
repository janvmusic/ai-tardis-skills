const { describe, it, beforeEach, after } = require('node:test')
const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const CLI = path.join(__dirname, '..', 'bin', 'cli.js')
const SKILLS_SRC = path.join(__dirname, '..', 'skills')
const PKG = require('../package.json')
const cli = require('../bin/cli.js')

const AVAILABLE = fs
  .readdirSync(SKILLS_SRC)
  .filter(f => fs.statSync(path.join(SKILLS_SRC, f)).isDirectory())

const DEPRECATED = ['frontend-expert', 'rails-expert']

// cli.js runs its switch at module load only when invoked as a script
// (guarded by require.main), so every CLI-surface case is exercised by
// spawning the real binary against a throwaway project directory. Pure
// helpers (copyDir, resolveDestFor, destLabelFor, ...) are exported and
// tested directly below, without spawning a process.
let project

beforeEach(() => {
  project = fs.mkdtempSync(path.join(os.tmpdir(), 'tardis-cli-'))
})

after(() => {
  // beforeEach leaves one directory per test behind; clean the last one.
  fs.rmSync(project, { recursive: true, force: true })
})

function run(...args) {
  const result = spawnSync(process.execPath, [CLI, ...args], {
    cwd: project,
    encoding: 'utf8',
  })
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    output: result.stdout + result.stderr,
  }
}

function installed(skill, dir = path.join('.claude', 'skills')) {
  return fs.existsSync(path.join(project, dir, skill, 'SKILL.md'))
}

function seed(dir = path.join('.claude', 'skills')) {
  for (const skill of AVAILABLE) {
    if (DEPRECATED.includes(skill)) continue
    cli.copyDir(path.join(SKILLS_SRC, skill), path.join(project, dir, skill))
  }
}

describe('list', () => {
  it('prints every skill in skills/', () => {
    const { status, stdout } = run('list')

    assert.equal(status, 0)
    assert.match(stdout, /Available skills:/)
    for (const skill of AVAILABLE) {
      assert.match(stdout, new RegExp(`^ {2}- ${skill}$`, 'm'))
    }
  })

  it('does not touch the project directory', () => {
    run('list')

    assert.deepEqual(fs.readdirSync(project), [])
  })

  it('--installed shows nothing when no skills are installed', () => {
    const { status, stdout } = run('list', '--installed')

    assert.equal(status, 0)
    assert.match(stdout, /Installed skills in \.claude\/skills \(claude\):/)
    assert.match(stdout, /\(none\)/)
  })

  it('--installed shows only what was actually installed', () => {
    seed()

    const { stdout } = run('list', '--installed')

    for (const skill of AVAILABLE) {
      if (DEPRECATED.includes(skill)) {
        assert.doesNotMatch(stdout, new RegExp(`- ${skill}$`, 'm'))
      } else {
        assert.match(stdout, new RegExp(`- ${skill}$`, 'm'))
      }
    }
  })
})

describe('--ai targeting', () => {
  const cases = [
    ['claude', path.join('.claude', 'skills')],
    ['opencode', path.join('.opencode', 'skill')],
    ['agents', path.join('.agents', 'skills')],
  ]

  for (const [name, dir] of cases) {
    it(`list --installed reads ${dir} for --ai=${name}`, () => {
      seed(dir)

      const { stdout } = run('list', '--installed', `--ai=${name}`)

      assert.match(stdout, /- commit$/m)
    })

    it(`accepts the spaced form --ai ${name}`, () => {
      seed(dir)

      const { stdout } = run('list', '--installed', '--ai', name)

      assert.match(stdout, /- commit$/m)
    })
  }

  it('reads --ai from anywhere in the arguments', () => {
    seed(path.join('.opencode', 'skill'))

    const { stdout } = run('--ai=opencode', 'list', '--installed')

    assert.match(stdout, /- commit$/m)
  })

  it('rejects an unknown AI', () => {
    const { status, stderr } = run('list', '--installed', '--ai=emacs')

    assert.equal(status, 1)
    assert.match(stderr, /Unknown AI "emacs"/)
    assert.match(stderr, /claude, opencode, agents/)
  })
})

describe('wizard-only commands', () => {
  for (const command of ['install', 'update', 'remove', 'delete']) {
    it(`${command} rejects arguments and points to the wizard`, () => {
      const { status, stderr } = run(command, 'commit')

      assert.equal(status, 1)
      assert.match(stderr, new RegExp(`tardis-ai ${command} takes no arguments`))
      assert.deepEqual(fs.readdirSync(project), [])
    })

    it(`${command} requires an interactive terminal`, () => {
      const { status, stderr } = run(command)

      assert.equal(status, 1)
      assert.match(stderr, new RegExp(`tardis-ai ${command} requires an interactive terminal`))
    })

    it(`${command} no longer has a --yes escape hatch`, () => {
      const { status, stderr } = run(command, '--yes')

      assert.equal(status, 1)
      assert.match(stderr, /takes no arguments/)
    })
  }
})

describe('refreshSkills', () => {
  const skillDir = skill => path.join(project, '.claude', 'skills', skill)
  const refresh = (targets, log = () => {}) =>
    cli.refreshSkills(path.join(project, '.claude', 'skills'), '.claude/skills', 'claude', targets, log)

  it('refreshes an installed skill and logs it', () => {
    seed()
    const logged = []

    const updated = refresh(['commit'], message => logged.push(message))

    assert.equal(updated, 1)
    assert.deepEqual(logged, ['Updated "commit" in .claude/skills/commit (claude)'])
  })

  it('replaces the skill folder instead of merging into it', () => {
    seed()
    const stray = path.join(skillDir('commit'), 'stray.md')
    fs.writeFileSync(stray, 'left over from an older release')

    refresh(['commit'])

    assert.ok(!fs.existsSync(stray), 'files dropped upstream should not linger')
    assert.ok(installed('commit'))
  })

  it('preserves a customized references/conventions.md', () => {
    seed()
    const conventions = path.join(skillDir('commit'), 'references', 'conventions.md')
    fs.mkdirSync(path.dirname(conventions), { recursive: true })
    fs.writeFileSync(conventions, 'custom convention: no ticket scope required')

    refresh(['commit'])

    assert.equal(fs.readFileSync(conventions, 'utf8'), 'custom convention: no ticket scope required')
    assert.ok(installed('commit'), 'the rest of the skill folder is still refreshed')
  })

  it('does not fabricate references/conventions.md when none exists', () => {
    seed()

    refresh(['commit'])

    assert.ok(!fs.existsSync(path.join(skillDir('commit'), 'references', 'conventions.md')))
  })

  it('preserves a customized references/pr_template.md', () => {
    seed()
    const template = path.join(skillDir('create-pr'), 'references', 'pr_template.md')
    fs.mkdirSync(path.dirname(template), { recursive: true })
    fs.writeFileSync(template, 'custom PR template: Summary / Steps to Test / Demo')

    refresh(['create-pr'])

    assert.equal(fs.readFileSync(template, 'utf8'), 'custom PR template: Summary / Steps to Test / Demo')
    assert.ok(installed('create-pr'), 'the rest of the skill folder is still refreshed')
  })

  it('does not fabricate references/pr_template.md when none exists', () => {
    seed()

    refresh(['create-pr'])

    assert.ok(!fs.existsSync(path.join(skillDir('create-pr'), 'references', 'pr_template.md')))
  })

  it('skips a skill that no longer exists upstream without deleting it', () => {
    const orphan = skillDir('retired-skill')
    fs.mkdirSync(orphan, { recursive: true })
    const logged = []

    const updated = refresh(['retired-skill'], message => logged.push(message))

    assert.equal(updated, 0)
    assert.match(logged[0], /Skipped "retired-skill" — no longer part of ai-tardis-skills/)
    assert.ok(fs.existsSync(orphan), 'an orphan is reported, never deleted')
  })
})

describe('internals: copyDir', () => {
  let src, dest

  beforeEach(() => {
    src = fs.mkdtempSync(path.join(os.tmpdir(), 'tardis-src-'))
    dest = fs.mkdtempSync(path.join(os.tmpdir(), 'tardis-dest-'))
    fs.rmSync(dest, { recursive: true, force: true })
  })

  after(() => {
    fs.rmSync(src, { recursive: true, force: true })
  })

  it('copies nested directories and files, not just top-level ones', () => {
    fs.writeFileSync(path.join(src, 'SKILL.md'), '# skill')
    fs.mkdirSync(path.join(src, 'references'))
    fs.writeFileSync(path.join(src, 'references', 'one.md'), 'one')
    fs.mkdirSync(path.join(src, 'references', 'nested'))
    fs.writeFileSync(path.join(src, 'references', 'nested', 'two.md'), 'two')

    cli.copyDir(src, dest)

    assert.equal(fs.readFileSync(path.join(dest, 'SKILL.md'), 'utf8'), '# skill')
    assert.equal(fs.readFileSync(path.join(dest, 'references', 'one.md'), 'utf8'), 'one')
    assert.equal(fs.readFileSync(path.join(dest, 'references', 'nested', 'two.md'), 'utf8'), 'two')
  })
})

describe('internals: resolveDestFor / destLabelFor', () => {
  it('resolves project scope relative to cwd', () => {
    const dest = cli.resolveDestFor('claude', 'project')

    assert.equal(dest, path.join(process.cwd(), '.claude', 'skills'))
  })

  it('resolves global scope to the home directory equivalent', () => {
    assert.equal(cli.resolveDestFor('claude', 'global'), path.join(os.homedir(), '.claude', 'skills'))
    assert.equal(cli.resolveDestFor('opencode', 'global'), path.join(os.homedir(), '.config', 'opencode', 'skills'))
    assert.equal(cli.resolveDestFor('agents', 'global'), path.join(os.homedir(), '.agents', 'skills'))
  })

  it('labels project scope with the relative directory', () => {
    assert.equal(cli.destLabelFor('opencode', 'project'), path.join('.opencode', 'skill'))
  })

  it('labels global scope with a ~-prefixed path', () => {
    assert.equal(cli.destLabelFor('claude', 'global'), '~/.claude/skills')
  })
})

describe('internals: installedLocations', () => {
  it('lists only project locations that have skills installed', () => {
    const original = process.cwd()
    fs.mkdirSync(path.join(project, '.claude', 'skills', 'commit'), { recursive: true })
    fs.mkdirSync(path.join(project, '.agents', 'skills', 'polish'), { recursive: true })
    fs.mkdirSync(path.join(project, '.opencode', 'skill'), { recursive: true })
    process.chdir(project)
    try {
      const found = cli.installedLocations()
        .filter(l => l.scope === 'project')
        .map(l => [l.agent, l.installed])
      assert.deepEqual(found, [['claude', ['commit']], ['agents', ['polish']]])
    } finally {
      process.chdir(original)
    }
  })
})

describe('version', () => {
  for (const flag of ['version', '--version', '-v']) {
    it(`prints the package version for "${flag}"`, () => {
      const { status, stdout } = run(flag)

      assert.equal(status, 0)
      assert.equal(stdout.trim(), `tardis-ai v${PKG.version}`)
    })
  }
})

describe('help', () => {
  it('lists every command', () => {
    const { status, stdout } = run('help')

    assert.equal(status, 0)
    for (const command of ['list', 'install', 'update', 'remove', 'delete', 'version']) {
      assert.match(stdout, new RegExp(`^ {2}${command}\\b`, 'm'))
    }
  })

  it('documents delete as an alias for remove', () => {
    const { stdout } = run('help')

    assert.match(stdout, /^ {2}delete {12}Alias for remove$/m)
  })

  it('documents update as an interactive wizard', () => {
    const { stdout } = run('help')

    assert.match(stdout, /^ {2}update {12}Interactive wizard/m)
  })

  it('falls back to help for an unknown command', () => {
    const { status, stdout } = run('frobnicate')

    assert.equal(status, 0)
    assert.match(stdout, /Usage: tardis-ai <command> \[options\]/)
  })

  it('falls back to help with no arguments', () => {
    const { status, stdout } = run()

    assert.equal(status, 0)
    assert.match(stdout, /Usage: tardis-ai <command> \[options\]/)
  })
})
