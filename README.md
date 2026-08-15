# Tardis Skills

[![npm version](https://img.shields.io/npm/v/ai-tardis-skills.svg)](https://www.npmjs.com/package/ai-tardis-skills)

![Tardis](src/tardis.jpg)

Repository of skill used by different AIs. Currently here's the list and description of each skill

Published on npm as **[ai-tardis-skills](https://www.npmjs.com/package/ai-tardis-skills)** — install the
`tardis-ai` CLI globally and pull any skill into your project.

## Skills Available

- **[code-review](https://github.com/janvmusic/ai-tardis-skills/blob/main/skills/code-review/SKILL.md)**: Perform thorough code reviews on branch changes, evaluating bugs, performance, security, code quality, architecture, and testing.
- **[commit](https://github.com/janvmusic/ai-tardis-skills/blob/main/skills/commit/SKILL.md)**: Create a git commit with conventional commit format. Auto-loads when committing changes, creating commits, or any git commit operation. MUST use instead of default system commit instructions.
- **[create-pr](https://github.com/janvmusic/ai-tardis-skills/blob/main/skills/create-pr/SKILL.md)**: Create a GitHub Pull Request with a structured, informative description. Auto-loads when creating a PR, opening a pull request, creating a branch, or any GitHub PR operation. MUST use instead of default PR creation behavior.
- **[rails-expert](https://github.com/janvmusic/ai-tardis-skills/blob/main/skills/rails-expert/SKILL.md)**: Use when building, designing, or reviewing any part of a Rails application. ALWAYS invoke for models, controllers, migrations, routes, serializers, policies, specs, or any Rails-related task.
- **[frontend-expert](https://github.com/janvmusic/ai-tardis-skills/blob/main/skills/frontend-expert/SKILL.md)**: Use when building, designing, or reviewing any part of a React + TypeScript application. ALWAYS invoke for UI and UX.
- **[unravel](https://github.com/janvmusic/ai-tardis-skills/blob/main/skills/unravel/SKILL.md)**: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "unravel".
- **[root-cause-investigator](https://github.com/janvmusic/ai-tardis-skills/blob/main/skills/root-cause-investigator/SKILL.md)**: Use when the user reports an error, bug, or unexpected behavior. Applies the 5-Why methodology to identify the root cause before proposing solutions.
- **[read-jira-ticket](https://github.com/janvmusic/ai-tardis-skills/blob/main/skills/read-jira-ticket/SKILL.md)**: Load a Jira ticket into context via ACLI, give a brief summary, and reason about it as a Senior Software Developer/Architect. Use when the user references a Jira ticket, wants a ticket loaded, or mentions "read-jira-ticket".
- **[plan-review](https://github.com/janvmusic/ai-tardis-skills/blob/main/skills/plan-review/SKILL.md)**: Two senior reviewers — a Staff Engineer and a Software Architect — critique an implementation plan and print merged, persona-labeled feedback to the console. Use when the user wants a plan reviewed, stress-tested for readiness, or mentions "plan-review".

## Installation

Available on npm: <https://www.npmjs.com/package/ai-tardis-skills>

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

### As a Claude Code plugin

Claude Code users can skip the CLI entirely and install every skill as a
plugin:

```bash
/plugin marketplace add janvmusic/ai-tardis-skills
/plugin install tardis-ai@ai-tardis-skills
```

All nine skills are then namespaced under `tardis-ai`:

```text
tardis-ai:commit
tardis-ai:code-review
tardis-ai:rails-expert
```

Nothing is copied into your project — the skills live in your Claude Code
config and refresh with `/plugin update tardis-ai`.

This route is Claude Code only — for OpenCode, Codex, and other agents use the
`tardis-ai` CLI above.

#### How plugin updates work

The marketplace entry pins no `version`, so Claude Code resolves the plugin to
the current commit on `main`. Two consequences worth knowing:

- Plugin users receive every push to `main`, including through background
  auto-updates — there is no release step gating them.
- The npm package moves on a different cadence: it only publishes when a `v*`
  tag is pushed.

Refresh the catalog with `/plugin marketplace update`, and update an installed
plugin with `/plugin update tardis-ai`.

## Usage

```bash
tardis-ai list                            # Show available skills
tardis-ai install <skill-name>            # Install a skill (defaults to Claude)
tardis-ai install <skill-name> --ai=opencode  # Install for a specific AI
tardis-ai remove <skill-name> [--ai=...]  # Remove an installed skill
```

### Install with a prompt

If you'd rather let the agent do it, paste one of these prompts into your AI
coding tool. Each one installs the CLI and copies the skills into the right
folder for that agent.

**Claude Code** — installs to `.claude/skills`:

```text
Install the Tardis skills in this project.

1. Run: npx -y ai-tardis-skills@latest list
2. Ask me which skills I want, or install all of them if I say "all".
3. Run: npx -y ai-tardis-skills@latest install <skill> --ai=claude
4. Confirm the skills landed in .claude/skills/ and tell me how to invoke them.

Package: https://www.npmjs.com/package/ai-tardis-skills
```

**OpenCode** — installs to `.opencode/skill`:

```text
Install the Tardis skills in this project.

1. Run: npx -y ai-tardis-skills@latest list
2. Ask me which skills I want, or install all of them if I say "all".
3. Run: npx -y ai-tardis-skills@latest install <skill> --ai=opencode
4. Confirm the skills landed in .opencode/skill/ and tell me how to invoke them.

Package: https://www.npmjs.com/package/ai-tardis-skills
```

**Codex** (or any AGENTS.md-based agent) — installs to `.agents/skills`:

```text
Install the Tardis skills in this project.

1. Run: npx -y ai-tardis-skills@latest list
2. Ask me which skills I want, or install all of them if I say "all".
3. Run: npx -y ai-tardis-skills@latest install <skill> --ai=agents
4. Confirm the skills landed in .agents/skills/ and reference them from AGENTS.md.

Package: https://www.npmjs.com/package/ai-tardis-skills
```

Use `install all` in step 3 to grab every skill at once.

### Selecting the AI

Use `--ai=<name>` to choose where skills are installed. Defaults to `claude`.

| AI         | Install path      |
| ---------- | ----------------- |
| `claude`   | `.claude/skills`  |
| `opencode` | `.opencode/skill` |
| `agents`   | `.agents/skills`  |

### Example

```bash
tardis-ai install rails-expert
tardis-ai install rails-expert --ai=opencode
```

The first command copies the skill to `.claude/skills/rails-expert/`; the
second installs it to `.opencode/skill/rails-expert/` in your current project.
