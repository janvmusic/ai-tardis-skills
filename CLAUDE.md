# CLAUDE.md — ai-tardis-skills

This repository is a centralized collection of skill definitions for Claude Code. Skills are specialized instruction sets that guide AI behavior for specific tasks and domains.

## Communication

- Be brief. Default to the shortest answer that fully covers the question.
- Lead with the result or the decision; supporting detail comes after, and only
  if it changes what the reader does next.
- Prefer a short list or table over prose. Skip preamble, restatement of the
  request, and closing summaries of what was just said.
- Do not narrate process. Report what changed and what needs a decision.
- Flag genuine problems plainly in a sentence — do not pad them into paragraphs.
- **ELI5 on request.** When the user asks for "ELI5", explain it in plain
  language with no jargon, using everyday analogies and short sentences. Offer
  ELI5 when a topic is unavoidably technical and the user has not signalled
  familiarity with it.

## Repository Structure

```bash
bin/cli.js               # The tardis-ai CLI — the shipped product
skills/
└── {skill-name}/
    ├── SKILL.md         # Required — skill metadata and instructions
    └── references/      # Optional — supporting reference documents
test/cli.test.js         # Spec for the CLI
Formula/tardis-ai.rb     # Homebrew formula — bot-maintained, do not edit by hand
.github/workflows/       # CI: tests, PR title validation, release chain
```

Skills ship inside the npm package, so the CLI and the skills release together.

## Skill Frontmatter Format

Every `SKILL.md` must begin with YAML frontmatter:

```yaml
---
name: { skill-name }
description: { one-line description used for triggering and discovery }
---
```

## Conventions

### Naming

- Skill directories: lowercase with hyphens (e.g., `rails-expert`, `code-review`)
- Main file: always `SKILL.md`
- Reference files: placed in a `references/` subdirectory within the skill folder

### Writing Skills

- Use prescriptive language: **MUST**, **MUST NOT**, **SHOULD**
- Number steps and organize workflows into phases when order matters
- Include concrete examples and code snippets
- Document constraints explicitly (what the skill should and should not do)
- For operational skills (commit, create-pr): require user approval before destructive or irreversible actions
- For reference/expert skills (rails-expert, frontend-expert): provide detailed patterns and best practices

### Git & Commits

- Follow conventional commit format: `{type}({ticket}): {description}`
- Valid types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `perf`, `ci`
- Keep commit messages under 72 characters, single-line, imperative mood, lowercase
  (a convention for humans — CI does not measure length)
- Stage files individually — never use `git add -A`

### Pull Requests

- PR titles follow the same conventional commit format as commits, and CI
  validates the type and subject. Length is not checked.
- The title matters beyond review: it becomes the squashed commit message on
  `main` and feeds `--generate-notes` in the release workflow, so it lands in
  published release notes verbatim.
- `.github/pull_request_template.md` pre-fills every PR with Summary (including
  a `Closes #` line), Steps to Test, and Demo. Fill in all three.

### Testing

- The CLI has a spec at `test/cli.test.js`. Run it with `npm test`.
- It uses Node's built-in `node:test` runner. `test/cli.test.js` itself has no
  dependencies — it only spawns the built CLI and never imports `bin/cli.js`'s
  own runtime dependency directly (though it does `require` the file for a
  handful of pure-function unit tests; see below).
- Tests spawn the real `bin/cli.js` against a temp directory for CLI-surface
  behavior (`bin/cli.js` runs its `switch` inside `main()`, guarded behind
  `require.main === module`, so requiring the file never triggers it).
  Assert on stdout, stderr, exit code, and the files left on disk.
- A handful of pure helpers (`copyDir`, `resolveDestFor`, `destLabelFor`, ...)
  are exported from `bin/cli.js` and unit-tested directly, without spawning a
  process — use this for logic that doesn't need the interactive wizard.
- Any change to `bin/cli.js` needs matching coverage in the spec. The
  interactive install/remove wizard itself (raw-mode arrow-key UI) can't be
  driven through `spawnSync`-based specs, since piped stdin isn't a real TTY —
  that part is manual-test-only.

### The CLI

- `bin/cli.js` has one real runtime dependency: `@clack/prompts`, for the
  interactive install/remove wizard (scope, AI agent, skill checklist,
  confirm). It requires Node >= 20.12.0 — reflected in `package.json`'s
  `engines` field. Don't add further dependencies without good reason; this
  one exists because hand-rolling raw-mode terminal UI from scratch is a much
  larger maintenance burden than one well-maintained library.
- Commands: `list`, `install`, `update`, `remove`/`delete`, `version`, `help`.
- `install`, `update` and `remove`/`delete` are wizard-only — no more `install <skill>`,
  `install all`, or bulk positional names. Each always walks: scope (Project
  or Global) → AI agent (Claude/OpenCode/Codex) → skill checklist → summary →
  confirm. `install --yes` / `remove --yes` skip the wizard entirely and
  reproduce the old default behavior non-interactively (Project scope, the
  resolved `--ai` target; install = every non-deprecated skill, remove =
  everything installed) — this is what CI and the specs use.
- `update` is wizard-only like the others: it offers only the scope/agent
  combinations that have skills installed, then a checklist. `update --yes`
  refreshes everything installed at the Project/`--ai` target. A skill name
  or `all` errors.
- `--ai=<name>` selects where skills land for `update`, `list --installed`,
  and the `--yes` forms, parsed from any argument position in both `--ai=x`
  and `--ai x` forms. The wizard asks for the agent interactively instead.

  | AI                          | Project directory | Global directory            |
  | --------------------------- | ----------------- | --------------------------- |
  | `claude` (default)          | `.claude/skills`  | `~/.claude/skills`          |
  | `opencode`                  | `.opencode/skill` | `~/.config/opencode/skills` |
  | `agents` (Codex, AGENTS.md) | `.agents/skills`  | `~/.agents/skills`          |

  Note OpenCode's Global path is XDG (`~/.config/opencode/skills`, plural),
  not `~/.opencode/` — it genuinely differs in shape from its own Project
  path, this isn't a typo.

- `list --installed` shows what's actually present in the Project/`--ai`
  target. Plain `list` is unchanged — names only, no descriptions or status.
- `update` replaces a skill folder rather than merging, so files dropped
  upstream disappear. A skill that no longer exists upstream is reported and
  skipped, never deleted.

## Releasing

The release chain is automated and easy to break. Do not run these by hand.

1. Bump `version` in `package.json` and merge to `main`.
2. `update-github-version.yml` sees the bump and cuts a GitHub release.
3. `publish-npm.yml` runs on that workflow completing, and publishes to npm.
4. The same workflow then recomputes the tarball sha256 and commits a bump to
   `Formula/tardis-ai.rb`.

Consequences worth knowing:

- **Never hand-edit `Formula/tardis-ai.rb`** — step 4 owns it.
- A release is triggered by the `package.json` version alone; nothing else.
- PR titles reach published release notes verbatim via `--generate-notes`.
- A tag created by `GITHUB_TOKEN` cannot trigger a `push: tags` run, which is
  why the chain uses `workflow_run` instead. See #6 and #7.

## Adding a New Skill

1. Create a new directory under `skills/` with a hyphenated name
2. Add a `SKILL.md` with required frontmatter and instructions
3. Optionally add a `references/` folder for supporting documentation
4. Add the skill to `README.md` following the existing list format:

```markdown
- **[skill-name](skills/skill-name/SKILL.md)**: {description}
```
