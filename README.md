# Tardis Skills

[![npm version](https://img.shields.io/npm/v/ai-tardis-skills.svg)](https://www.npmjs.com/package/ai-tardis-skills)

![Tardis](src/tardis.png)

Repository of skills used by different AIs. Published on npm as
**[ai-tardis-skills](https://www.npmjs.com/package/ai-tardis-skills)** — install
the `tardis-ai` CLI and pull any skill into your project. Below is the list and
description of each skill.

## Skills Available

- **[code-review](https://github.com/janvmusic/ai-tardis-skills/blob/main/skills/code-review/SKILL.md)**: Perform thorough code reviews on branch changes, evaluating bugs, performance, security, code quality, architecture, and testing.
- **[commit](https://github.com/janvmusic/ai-tardis-skills/blob/main/skills/commit/SKILL.md)**: Create a git commit with conventional commit format. Auto-loads when committing changes, creating commits, or any git commit operation. MUST use instead of default system commit instructions.
- **[create-pr](https://github.com/janvmusic/ai-tardis-skills/blob/main/skills/create-pr/SKILL.md)**: Create a GitHub Pull Request with a structured, informative description. Auto-loads when creating a PR, opening a pull request, creating a branch, or any GitHub PR operation. MUST use instead of default PR creation behavior.
- **[unravel](https://github.com/janvmusic/ai-tardis-skills/blob/main/skills/unravel/SKILL.md)**: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "unravel".
- **[root-cause-investigator](https://github.com/janvmusic/ai-tardis-skills/blob/main/skills/root-cause-investigator/SKILL.md)**: Use when the user reports an error, bug, or unexpected behavior. Applies the 5-Why methodology to identify the root cause before proposing solutions.
- **[read-jira-ticket](https://github.com/janvmusic/ai-tardis-skills/blob/main/skills/read-jira-ticket/SKILL.md)**: Load a Jira ticket into context via ACLI, give a brief summary, and reason about it as a Senior Software Developer/Architect. Use when the user references a Jira ticket, wants a ticket loaded, or mentions "read-jira-ticket".
- **[plan-review](https://github.com/janvmusic/ai-tardis-skills/blob/main/skills/plan-review/SKILL.md)**: Two senior reviewers — a Staff Engineer and a Software Architect — critique an implementation plan and print merged, persona-labeled feedback to the console. Use when the user wants a plan reviewed, stress-tested for readiness, or mentions "plan-review".

## Beta Skills

These skills are still being shaped by real use — behavior and file formats may change before they stabilize.

- **[polish](https://github.com/janvmusic/ai-tardis-skills/blob/main/skills/polish/SKILL.md)**: Clean up style and structure in a changelist — uncommitted changes by default, or a named path/file or a PR — against rules the user has documented per language, accumulating a rule set meant to eventually graduate into the project's AGENTS.md/CLAUDE.md. Use when the user says "polish this", "clean this up", or wants a pass over code they (or an agent) just wrote before committing, or over the files in a PR. Never changes behavior and never hunts for bugs — use code-review for that.

## Deprecated Skills

These skills will be removed in a future release. Avoid adopting them for new projects.

- **[rails-expert](https://github.com/janvmusic/ai-tardis-skills/blob/main/skills/rails-expert/SKILL.md)**: Use when building, designing, or reviewing any part of a Rails application. ALWAYS invoke for models, controllers, migrations, routes, serializers, policies, specs, or any Rails-related task.
- **[frontend-expert](https://github.com/janvmusic/ai-tardis-skills/blob/main/skills/frontend-expert/SKILL.md)**: Use when building, designing, or reviewing any part of a React + TypeScript application. ALWAYS invoke for UI and UX.

## Installation

### npm

```bash
npm install -g ai-tardis-skills
```

### Homebrew

```bash
brew tap janvmusic/tardis https://github.com/janvmusic/ai-tardis-skills
brew install tardis-ai
```

The formula installs the published npm package, so it needs `node` (Homebrew
pulls it in automatically). Upgrade with `brew upgrade tardis-ai`.

### Without installing

Any npm-compatible client can run the CLI directly — no global install:

```bash
npx ai-tardis-skills list   # npm
bunx ai-tardis-skills list  # Bun
```

You can also run straight from this repository, skipping the registry
entirely — useful for trying unreleased skills on `main`:

```bash
npx github:janvmusic/ai-tardis-skills list
```

### With a prompt

If you'd rather let the agent do it, paste one of these prompts into your AI
coding tool. Each one installs the CLI and copies the skills into the right
folder for that agent.

**Claude Code**, **OpenCode**, or **Codex/AGENTS.md**: paste this in your
coding agent's chat, it works the same for all three —

```text
Install the Tardis skills in this project.

1. Run: npx -y ai-tardis-skills@latest install
2. Follow the prompts: pick Project or Global, pick your AI agent, then
   check off the skills you want.
3. Confirm the skills landed where the wizard said, and tell me how to
   invoke each one.

Package: https://www.npmjs.com/package/ai-tardis-skills
```

## Installing Skills

The sections above install the `tardis-ai` CLI. Installing the skills
themselves into a project (or globally) is a separate step, and is
interactive:

```bash
tardis-ai list              # Show available skills
tardis-ai install           # Wizard: scope -> AI agent -> pick skills -> confirm
tardis-ai remove            # Wizard: scope -> AI agent -> pick skills to remove -> confirm
tardis-ai delete            # Alias for remove
tardis-ai list --installed  # Show what's actually installed (--ai=<name> to target one)
```

The wizard asks where to install: **Project** (this directory only) or
**Global** (available in every project), then which AI agent, then lets you
check off any combination of skills — deprecated ones are listed too, marked
`(deprecated)`, since the wizard is the only way to install one now.

| AI                          | Project directory | Global directory            |
| ---------------------------- | ------------------ | ---------------------------- |
| `claude` (default)          | `.claude/skills`  | `~/.claude/skills`           |
| `opencode`                  | `.opencode/skill` | `~/.config/opencode/skills` |
| `agents` (Codex, AGENTS.md) | `.agents/skills`  | `~/.agents/skills`           |

### Non-interactive / CI

`install --yes` and `remove --yes` skip the wizard: `install --yes` adds every
non-deprecated skill to the Project `--ai` target (`claude` by default),
`remove --yes` removes everything installed there.

```bash
tardis-ai install --yes                 # every non-deprecated skill -> .claude/skills/
tardis-ai install --yes --ai=opencode   # same, but -> .opencode/skill/
tardis-ai remove --yes                  # remove everything installed -> .claude/skills/
```

## Updating Skills

`update` re-syncs skills you already installed, leaving the rest of the project
untouched. Unlike `install`/`remove`, it isn't wizard-based — it still takes
an optional skill name directly:

```bash
tardis-ai update                  # every installed skill (defaults to Claude)
tardis-ai update rails-expert     # just one skill
tardis-ai update --ai=opencode    # every skill installed under .opencode/skill
```

Each skill folder is replaced rather than merged, so files removed upstream
disappear instead of lingering — any local edits inside an installed skill are
overwritten. Skills you never installed are left alone; `update` just lists them
so you can pick them up with `install`. A skill that no longer exists upstream is
reported and skipped, never deleted.

Skills ship inside the npm package, so `update` copies whatever version of the
CLI you have. Upgrade it first to get newly published skill content:

```bash
npm install -g ai-tardis-skills@latest   # or: brew upgrade tardis-ai
tardis-ai update
```

`update` checks the registry and tells you when your CLI is behind. `npx` and
`bunx` users are always on the version they invoked, so
`npx ai-tardis-skills@latest update` is a single-step refresh.

## Development

### Testing

Tests run on Node's built-in test runner and have no dependencies of their
own — they spawn the built CLI rather than importing its runtime dependency:

```bash
npm test
```

The spec in `test/cli.test.js` spawns `bin/cli.js` against a throwaway
directory per test and asserts on stdout, stderr, exit codes, and the files
left on disk, plus a handful of direct unit tests against pure helpers
exported from `bin/cli.js` (`copyDir`, `resolveDestFor`, `destLabelFor`). The
interactive install/remove wizard's raw-mode UI itself isn't covered by
specs — piped stdin isn't a real TTY — so changes there need manual testing.
Node >= 20.12.0 is required (the CLI's `@clack/prompts` dependency needs it).

## Contribution

Pick up an open issue at
[janvmusic/ai-tardis-skills/issues](https://github.com/janvmusic/ai-tardis-skills/issues),
or open one first if you are proposing something new.

Then:

1. Branch off `main` and make the change. New skills go in
   `skills/{skill-name}/SKILL.md` with `name` and `description` frontmatter, and
   get listed in this README.
2. Run `npm test`. Any change to `bin/cli.js` needs matching coverage in
   `test/cli.test.js`.
3. Open a PR. Titles follow conventional commits (`feat`, `fix`, `refactor`,
   `docs`, `style`, `test`, `chore`, `perf`, `ci`) and CI validates them. The
   title becomes the squashed commit and lands in the release notes verbatim, so
   write it for a reader.
4. Fill in the PR template: Summary, Steps to Test, Demo.

Do not edit `Formula/tardis-ai.rb`. The release workflow owns it.
