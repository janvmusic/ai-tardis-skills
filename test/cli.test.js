const { describe, it, beforeEach, after } = require('node:test')
const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const CLI = path.join(__dirname, '..', 'bin', 'cli.js')
const SKILLS_SRC = path.join(__dirname, '..', 'skills')
const PKG = require('../package.json')

const AVAILABLE = fs
  .readdirSync(SKILLS_SRC)
  .filter(f => fs.statSync(path.join(SKILLS_SRC, f)).isDirectory())

// cli.js runs its switch at module load, so every case is exercised by
// spawning the real binary against a throwaway project directory.
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
})

describe('install', () => {
  it('copies a single skill into .claude/skills by default', () => {
    const { status, stdout } = run('install', 'commit')

    assert.equal(status, 0)
    assert.match(stdout, /Installed "commit" to \.claude\/skills\/commit \(claude\)/)
    assert.ok(installed('commit'))
  })

  it('copies nested reference files, not just SKILL.md', () => {
    // rails-expert is the skill that ships a references/ subdirectory.
    const withRefs = AVAILABLE.find(s =>
      fs.existsSync(path.join(SKILLS_SRC, s, 'references'))
    )
    assert.ok(withRefs, 'expected at least one skill with a references/ folder')

    run('install', withRefs)

    const src = path.join(SKILLS_SRC, withRefs, 'references')
    const dest = path.join(project, '.claude', 'skills', withRefs, 'references')
    assert.deepEqual(fs.readdirSync(dest).sort(), fs.readdirSync(src).sort())
  })

  it('installs everything when the skill name is omitted', () => {
    const { status } = run('install')

    assert.equal(status, 0)
    for (const skill of AVAILABLE) {
      assert.ok(installed(skill), `${skill} should be installed`)
    }
  })

  it('installs everything for "all"', () => {
    run('install', 'all')

    for (const skill of AVAILABLE) {
      assert.ok(installed(skill), `${skill} should be installed`)
    }
  })

  it('rejects an unknown skill without creating anything', () => {
    const { status, stderr } = run('install', 'no-such-skill')

    assert.equal(status, 1)
    assert.match(stderr, /Skill "no-such-skill" not found/)
    assert.deepEqual(fs.readdirSync(project), [])
  })

  it('is idempotent', () => {
    run('install', 'commit')
    const { status } = run('install', 'commit')

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
      const { status } = run('install', 'commit', `--ai=${name}`)

      assert.equal(status, 0)
      assert.ok(installed('commit', dir))
    })

    it(`accepts the spaced form --ai ${name}`, () => {
      run('install', 'commit', '--ai', name)

      assert.ok(installed('commit', dir))
    })
  }

  it('reads --ai from anywhere in the arguments', () => {
    run('--ai=opencode', 'install', 'commit')

    assert.ok(installed('commit', path.join('.opencode', 'skill')))
  })

  it('rejects an unknown AI', () => {
    const { status, stderr } = run('install', 'commit', '--ai=emacs')

    assert.equal(status, 1)
    assert.match(stderr, /Unknown AI "emacs"/)
    assert.match(stderr, /claude, opencode, agents/)
  })
})

describe('remove', () => {
  it('deletes an installed skill', () => {
    run('install', 'commit')
    const { status, stdout } = run('remove', 'commit')

    assert.equal(status, 0)
    assert.match(stdout, /Removed "commit" from \.claude\/skills\/commit \(claude\)/)
    assert.ok(!installed('commit'))
  })

  it('leaves other installed skills alone', () => {
    run('install', 'commit')
    run('install', 'code-review')
    run('remove', 'commit')

    assert.ok(!installed('commit'))
    assert.ok(installed('code-review'))
  })

  it('honours --ai', () => {
    run('install', 'commit', '--ai=opencode')
    const { status } = run('remove', 'commit', '--ai=opencode')

    assert.equal(status, 0)
    assert.ok(!installed('commit', path.join('.opencode', 'skill')))
  })

  it('fails when the skill is not installed', () => {
    const { status, stderr } = run('remove', 'commit')

    assert.equal(status, 1)
    assert.match(stderr, /Skill "commit" is not installed for claude\./)
  })

  it('fails without a skill name', () => {
    const { status, stderr } = run('remove')

    assert.equal(status, 1)
    assert.match(stderr, /Usage: tardis-ai remove <skill-name> \[--ai=<name>\]/)
  })
})

describe('delete (alias for remove)', () => {
  it('deletes an installed skill', () => {
    run('install', 'commit')
    const { status, stdout } = run('delete', 'commit')

    assert.equal(status, 0)
    assert.match(stdout, /Removed "commit" from \.claude\/skills\/commit \(claude\)/)
    assert.ok(!installed('commit'))
  })

  it('honours --ai', () => {
    run('install', 'commit', '--ai=agents')
    run('delete', 'commit', '--ai=agents')

    assert.ok(!installed('commit', path.join('.agents', 'skills')))
  })

  it('fails when the skill is not installed', () => {
    const { status, stderr } = run('delete', 'commit')

    assert.equal(status, 1)
    assert.match(stderr, /Skill "commit" is not installed for claude\./)
  })

  it('names the typed command in the usage error, not "remove"', () => {
    const { status, stderr } = run('delete')

    assert.equal(status, 1)
    assert.match(stderr, /Usage: tardis-ai delete <skill-name> \[--ai=<name>\]/)
    assert.doesNotMatch(stderr, /tardis-ai remove/)
  })
})

describe('update', () => {
  it('refreshes an installed skill', () => {
    run('install', 'commit')
    const { status, stdout } = run('update', 'commit')

    assert.equal(status, 0)
    assert.match(stdout, /Updated "commit" in \.claude\/skills\/commit \(claude\)/)
    assert.match(stdout, new RegExp(`1 skill updated to ai-tardis-skills v${PKG.version}\\.`))
  })

  it('replaces the skill folder instead of merging into it', () => {
    run('install', 'commit')
    const stray = path.join(project, '.claude', 'skills', 'commit', 'stray.md')
    fs.writeFileSync(stray, 'left over from an older release')

    run('update', 'commit')

    assert.ok(!fs.existsSync(stray), 'files dropped upstream should not linger')
    assert.ok(installed('commit'))
  })

  it('updates every installed skill when the name is omitted', () => {
    run('install', 'commit')
    run('install', 'code-review')

    const { stdout } = run('update')

    assert.match(stdout, /Updated "commit"/)
    assert.match(stdout, /Updated "code-review"/)
    assert.match(stdout, /2 skills updated/)
  })

  it('does not install skills the project never had', () => {
    run('install', 'commit')

    run('update')

    assert.ok(!installed('code-review'))
  })

  it('reports skills available but not installed', () => {
    run('install', 'commit')

    const { stdout } = run('update')

    assert.match(stdout, /New skills available:/)
    assert.match(stdout, /Install with "tardis-ai install <skill>"/)
  })

  it('skips an installed skill that no longer exists upstream', () => {
    run('install', 'commit')
    const orphan = path.join(project, '.claude', 'skills', 'retired-skill')
    fs.mkdirSync(orphan, { recursive: true })

    const { stdout } = run('update')

    assert.match(stdout, /Skipped "retired-skill" — no longer part of ai-tardis-skills/)
    assert.ok(fs.existsSync(orphan), 'an orphan is reported, never deleted')
  })

  it('fails when nothing is installed', () => {
    const { status, stderr } = run('update')

    assert.equal(status, 1)
    assert.match(stderr, /No skills installed in \.claude\/skills \(claude\)/)
  })

  it('fails when the named skill is not installed', () => {
    run('install', 'commit')

    const { status, stderr } = run('update', 'code-review')

    assert.equal(status, 1)
    assert.match(stderr, /Skill "code-review" is not installed for claude/)
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

    assert.match(stdout, /^ {2}delete <skill> {4}Alias for remove$/m)
  })

  it('documents every --ai target', () => {
    const { stdout } = run('help')

    assert.match(stdout, /claude {3}-> \.claude\/skills/)
    assert.match(stdout, /opencode -> \.opencode\/skill/)
    assert.match(stdout, /agents {3}-> \.agents\/skills/)
  })

  it('falls back to help for an unknown command', () => {
    const { status, stdout } = run('frobnicate')

    assert.equal(status, 0)
    assert.match(stdout, /Usage: tardis-ai <command> \[skill-name\]/)
  })

  it('falls back to help with no arguments', () => {
    const { status, stdout } = run()

    assert.equal(status, 0)
    assert.match(stdout, /Usage: tardis-ai <command> \[skill-name\]/)
  })
})
