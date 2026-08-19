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
- It uses Node's built-in `node:test` runner and has no dependencies. Keep it
  that way — the package ships with none, runtime or dev.
- Tests spawn the real `bin/cli.js` against a temp directory, since the CLI runs
  its `switch` at module load. Assert on stdout, stderr, exit code, and the
  files left on disk.
- Any change to `bin/cli.js` needs matching coverage in the spec.

### The CLI

- `bin/cli.js` is dependency-free Node using only stdlib. Keep it that way.
- Commands: `list`, `install`, `update`, `remove`/`delete`, `version`, `help`.
- `--ai=<name>` selects where skills land, and is parsed from any argument
  position in both `--ai=x` and `--ai x` forms:

  | AI                          | Directory         |
  | --------------------------- | ----------------- |
  | `claude` (default)          | `.claude/skills`  |
  | `opencode`                  | `.opencode/skill` |
  | `agents` (Codex, AGENTS.md) | `.agents/skills`  |

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
