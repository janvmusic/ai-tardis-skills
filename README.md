# Tardis Skills

[![npm version](https://img.shields.io/npm/v/ai-tardis-skills.svg)](https://www.npmjs.com/package/ai-tardis-skills)

![Tardis](src/tardis.jpg)

Repository of skills used by different AIs. Published on npm as
**[ai-tardis-skills](https://www.npmjs.com/package/ai-tardis-skills)** — install
the `tardis-ai` CLI and pull any skill into your project. Below is the list and
description of each skill.

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

## Installing Skills

The sections above install the `tardis-ai` CLI. Installing the skills
themselves into a project is a separate step:

```bash
tardis-ai list                            # Show available skills
tardis-ai install <skill-name>            # Install a skill (defaults to Claude)
tardis-ai install <skill-name> --ai=opencode  # Install for a specific AI
tardis-ai update [skill-name] [--ai=...]  # Refresh installed skills in place
tardis-ai remove <skill-name> [--ai=...]  # Remove an installed skill
```

Use `--ai=<name>` to choose where skills land. Omit it and they go to
`.claude/skills`.

| AI                          | Skills directory  |
| --------------------------- | ----------------- |
| `claude` (default)          | `.claude/skills`  |
| `opencode`                  | `.opencode/skill` |
| `agents` (Codex, AGENTS.md) | `.agents/skills`  |

```bash
tardis-ai install rails-expert                 # -> .claude/skills/rails-expert/
tardis-ai install rails-expert --ai=opencode   # -> .opencode/skill/rails-expert/
tardis-ai install all --ai=agents              # every skill -> .agents/skills/
```

## Updating Skills

`update` re-syncs skills you already installed, leaving the rest of the project
untouched:

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
