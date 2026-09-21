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
    run('install', '--yes')

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

describe('install', () => {
  it('rejects a skill name — direct install no longer exists', () => {
    const { status, stderr } = run('install', 'commit')

    assert.equal(status, 1)
    assert.match(stderr, /no longer takes a skill name/)
    assert.deepEqual(fs.readdirSync(project), [])
  })

  it('requires an interactive terminal without --yes', () => {
    const { status, stderr } = run('install')

    assert.equal(status, 1)
    assert.match(stderr, /requires an interactive terminal/)
    assert.match(stderr, /--yes/)
  })

  it('--yes installs everything except deprecated skills', () => {
    const { status } = run('install', '--yes')

    assert.equal(status, 0)
    for (const skill of AVAILABLE) {
      if (DEPRECATED.includes(skill)) {
        assert.ok(!installed(skill), `${skill} is deprecated and should not be installed`)
      } else {
        assert.ok(installed(skill), `${skill} should be installed`)
      }
    }
  })

  it('--yes reports the skipped deprecated skills', () => {
    const { stdout } = run('install', '--yes')

    assert.match(stdout, /Skipped deprecated: .*frontend-expert.*rails-expert\./)
  })

  it('--yes is idempotent', () => {
    run('install', '--yes')
    const { status } = run('install', '--yes')

    assert.equal(status, 0)
    assert.ok(installed('commit'))
  })
})

describe('--ai targeting', () => {
  const cases = [
    ['claude', path.join('.claude', 'skills')],
    ['opencode', path.join('.opencode', 'skill')],
    ['agents', path.join('.agents', 'skills')],
  ]

  for (const [name, dir] of cases) {
    it(`installs to ${dir} for --ai=${name}`, () => {
      const { status } = run('install', '--yes', `--ai=${name}`)

      assert.equal(status, 0)
      assert.ok(installed('commit', dir))
    })

    it(`accepts the spaced form --ai ${name}`, () => {
      run('install', '--yes', '--ai', name)

      assert.ok(installed('commit', dir))
    })
  }

  it('reads --ai from anywhere in the arguments', () => {
    run('--ai=opencode', 'install', '--yes')

    assert.ok(installed('commit', path.join('.opencode', 'skill')))
  })

  it('rejects an unknown AI', () => {
    const { status, stderr } = run('install', '--yes', '--ai=emacs')

    assert.equal(status, 1)
    assert.match(stderr, /Unknown AI "emacs"/)
    assert.match(stderr, /claude, opencode, agents/)
  })
})

describe('remove', () => {
  it('rejects a skill name — direct remove no longer exists', () => {
    const { status, stderr } = run('remove', 'commit')

    assert.equal(status, 1)
    assert.match(stderr, /no longer takes a skill name/)
  })

  it('requires an interactive terminal without --yes', () => {
    const { status, stderr } = run('remove')

    assert.equal(status, 1)
    assert.match(stderr, /requires an interactive terminal/)
    assert.match(stderr, /--yes/)
  })

  it('--yes removes everything installed', () => {
    run('install', '--yes')
    const { status, stdout } = run('remove', '--yes')

    assert.equal(status, 0)
    assert.match(stdout, /Removed "commit" from \.claude\/skills\/commit \(claude\)/)
    assert.ok(!installed('commit'))
  })

  it('--yes honours --ai', () => {
    run('install', '--yes', '--ai=opencode')
    const { status } = run('remove', '--yes', '--ai=opencode')

    assert.equal(status, 0)
    assert.ok(!installed('commit', path.join('.opencode', 'skill')))
  })

  it('--yes fails when nothing is installed', () => {
    const { status, stderr } = run('remove', '--yes')

    assert.equal(status, 1)
    assert.match(stderr, /No skills installed in \.claude\/skills \(claude\)/)
  })
})

describe('delete (alias for remove)', () => {
  it('rejects a skill name, naming "delete" not "remove" in the error', () => {
    const { status, stderr } = run('delete', 'commit')

    assert.equal(status, 1)
    assert.match(stderr, /tardis-ai delete no longer takes a skill name/)
  })

  it('requires an interactive terminal without --yes, naming "delete"', () => {
    const { status, stderr } = run('delete')

    assert.equal(status, 1)
    assert.match(stderr, /tardis-ai delete requires an interactive terminal/)
  })

  it('--yes removes everything installed', () => {
    run('install', '--yes', '--ai=agents')
    run('delete', '--yes', '--ai=agents')

    assert.ok(!installed('commit', path.join('.agents', 'skills')))
  })
})

describe('update', () => {
  it('refreshes an installed skill', () => {
    run('install', '--yes')
    const { status, stdout } = run('update', '--yes')

    assert.equal(status, 0)
    assert.match(stdout, /Updated "commit" in \.claude\/skills\/commit \(claude\)/)
    assert.match(stdout, new RegExp(`${AVAILABLE.length - DEPRECATED.length} skills updated to ai-tardis-skills v${PKG.version}\\.`))
  })

  it('replaces the skill folder instead of merging into it', () => {
    run('install', '--yes')
    const stray = path.join(project, '.claude', 'skills', 'commit', 'stray.md')
    fs.writeFileSync(stray, 'left over from an older release')

    run('update', '--yes')

    assert.ok(!fs.existsSync(stray), 'files dropped upstream should not linger')
    assert.ok(installed('commit'))
  })

  it('preserves a customized references/conventions.md across updates', () => {
    run('install', '--yes')
    const conventions = path.join(project, '.claude', 'skills', 'commit', 'references', 'conventions.md')
    fs.mkdirSync(path.dirname(conventions), { recursive: true })
    fs.writeFileSync(conventions, 'custom convention: no ticket scope required')

    run('update', '--yes')

    assert.equal(fs.readFileSync(conventions, 'utf8'), 'custom convention: no ticket scope required')
    assert.ok(installed('commit'), 'the rest of the skill folder is still refreshed')
  })

  it('does not fabricate references/conventions.md when none exists', () => {
    run('install', '--yes')

    run('update', '--yes')

    const conventions = path.join(project, '.claude', 'skills', 'commit', 'references', 'conventions.md')
    assert.ok(!fs.existsSync(conventions), 'creating the convention file is the skill\'s job, not the CLI\'s')
  })

  it('preserves a customized references/pr_template.md across updates', () => {
    run('install', '--yes')
    const template = path.join(project, '.claude', 'skills', 'create-pr', 'references', 'pr_template.md')
    fs.mkdirSync(path.dirname(template), { recursive: true })
    fs.writeFileSync(template, 'custom PR template: Summary / Steps to Test / Demo')

    run('update', '--yes')

    assert.equal(fs.readFileSync(template, 'utf8'), 'custom PR template: Summary / Steps to Test / Demo')
    assert.ok(installed('create-pr'), 'the rest of the skill folder is still refreshed')
  })

  it('does not fabricate references/pr_template.md when none exists', () => {
    run('install', '--yes')

    run('update', '--yes')

    const template = path.join(project, '.claude', 'skills', 'create-pr', 'references', 'pr_template.md')
    assert.ok(!fs.existsSync(template), 'creating the template file is the skill\'s job, not the CLI\'s')
  })

  it('updates every installed skill', () => {
    run('install', '--yes')

    const { stdout } = run('update', '--yes')

    assert.match(stdout, /Updated "commit"/)
    assert.match(stdout, /Updated "code-review"/)
    assert.match(stdout, new RegExp(`${AVAILABLE.length - DEPRECATED.length} skills updated`))
  })

  it('reports skills available but not installed', () => {
    run('install', '--yes')

    const { stdout } = run('update', '--yes')

    assert.match(stdout, /New skills available: frontend-expert, rails-expert\./)
    assert.match(stdout, /Install with "tardis-ai install"/)
  })

  it('skips an installed skill that no longer exists upstream', () => {
    run('install', '--yes')
    const orphan = path.join(project, '.claude', 'skills', 'retired-skill')
    fs.mkdirSync(orphan, { recursive: true })

    const { stdout } = run('update', '--yes')

    assert.match(stdout, /Skipped "retired-skill" — no longer part of ai-tardis-skills/)
    assert.ok(fs.existsSync(orphan), 'an orphan is reported, never deleted')
  })

  it('requires an interactive terminal without --yes or a skill name', () => {
    run('install', '--yes')

    const { status, stderr } = run('update')

    assert.equal(status, 1)
    assert.match(stderr, /tardis-ai update requires an interactive terminal/)
  })

  it('rejects a skill name and points to the wizard', () => {
    run('install', '--yes')

    for (const arg of ['commit', 'all']) {
      const { status, stderr } = run('update', arg)

      assert.equal(status, 1)
      assert.match(stderr, /tardis-ai update no longer takes a skill name/)
    }
  })

  it('fails when nothing is installed', () => {
    const { status, stderr } = run('update', '--yes')

    assert.equal(status, 1)
    assert.match(stderr, /No skills installed in \.claude\/skills \(claude\)/)
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

  it('documents the --yes escape hatch', () => {
    const { stdout } = run('help')

    assert.match(stdout, /--yes, -y/)
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
