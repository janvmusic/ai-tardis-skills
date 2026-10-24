# Tardis Skills

[![npm version](https://img.shields.io/npm/v/ai-tardis-skills.svg)](https://www.npmjs.com/package/ai-tardis-skills)

![Tardis](src/tardis.png)

Skills for AI coding agents (Claude Code, OpenCode, Codex), installed with the `tardis-ai` CLI from npm package [ai-tardis-skills](https://www.npmjs.com/package/ai-tardis-skills).

## Quick start

```bash
npx ai-tardis-skills@latest install
```

The wizard asks for scope (Project or Global), AI agent and skills, then copies them into place.

## Skills

Every skill except `commit` and `create-pr` runs only when you invoke it by name (`/code-review` in Claude Code, `$code-review` in Codex).

| Skill | What it does |
| --- | --- |
| [code-review](skills/code-review/SKILL.md) | Reviews branch changes for bugs, performance, security, quality, architecture and tests |
| [commit](skills/commit/SKILL.md) | Creates a conventional commit. Loads automatically |
| [create-pr](skills/create-pr/SKILL.md) | Opens a GitHub PR with a structured description. Loads automatically |
| [plan-review](skills/plan-review/SKILL.md) | A Staff Engineer and a Software Architect critique a plan with numbered, leveled feedback |
| [unravel](skills/unravel/SKILL.md) | Interviews you about a plan until every decision branch is resolved |
| [root-cause-investigator](skills/root-cause-investigator/SKILL.md) | Finds the root cause of a bug with 5-Why before proposing fixes |
| [read-jira-ticket](skills/read-jira-ticket/SKILL.md) | Loads a Jira ticket via ACLI and summarizes it |

Beta (behavior may change): [polish](skills/polish/SKILL.md) cleans up style in a changelist without changing behavior.

Deprecated (will be removed): [rails-expert](skills/rails-expert/SKILL.md) and [frontend-expert](skills/frontend-expert/SKILL.md).

OpenCode has no per-skill flag. To require approval before these load, add to `opencode.json`:

```json
{
  "permission": {
    "skill": {
      "code-review": "ask",
      "plan-review": "ask",
      "unravel": "ask",
      "root-cause-investigator": "ask",
      "read-jira-ticket": "ask",
      "polish": "ask"
    }
  }
}
```

## Install the CLI

```bash
npm install -g ai-tardis-skills
```

Or with Homebrew (pulls in `node`):

```bash
brew tap janvmusic/tardis https://github.com/janvmusic/ai-tardis-skills
brew install tardis-ai
```

Or run without installing: `npx ai-tardis-skills list`, `bunx ai-tardis-skills list` or `npx github:janvmusic/ai-tardis-skills list` (unreleased `main`).

## Commands

```bash
tardis-ai list              # available skills
tardis-ai list --installed  # installed skills (--ai=<name> to target one)
tardis-ai install           # wizard: scope, agent, skills, confirm
tardis-ai update            # wizard: re-sync installed skills
tardis-ai remove            # wizard: pick skills to remove (alias: delete)
```

`install`, `update` and `remove` are interactive only and exit with an error without a terminal.

`update` and `remove` offer only the scope and agent combinations that already have skills. `update` replaces each skill folder, so local edits are overwritten and files dropped upstream disappear. Skills removed upstream are reported and skipped, never deleted. Upgrade the CLI first (`npm install -g ai-tardis-skills@latest` or `brew upgrade tardis-ai`) to get new skill content.

| AI | Project directory | Global directory |
| --- | --- | --- |
| `claude` (default) | `.claude/skills` | `~/.claude/skills` |
| `opencode` | `.opencode/skill` | `~/.config/opencode/skills` |
| `agents` (Codex, AGENTS.md) | `.agents/skills` | `~/.agents/skills` |

## Install with a prompt

Paste into your coding agent:

```text
Install the Tardis skills in this project.

1. Run: npx -y ai-tardis-skills@latest install
2. Follow the prompts: pick Project or Global, pick your AI agent, then
   check off the skills you want.
3. Confirm the skills landed where the wizard said, and tell me how to
   invoke each one.
```

## Contributing

1. Pick or open an [issue](https://github.com/janvmusic/ai-tardis-skills/issues).
2. Branch off `main`. New skills go in `skills/{skill-name}/SKILL.md` with `name` and `description` frontmatter and get a row in the table above.
3. Run `npm test` (Node >= 20.12.0). Changes to `bin/cli.js` need matching coverage in `test/cli.test.js`. The wizard UI itself needs manual testing.
4. Open a PR titled in conventional commit format (`feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `perf`, `ci`). The title lands verbatim in release notes. Fill in the template: Summary, Steps to Test, Demo.

Do not edit `Formula/tardis-ai.rb`. The release workflow owns it.
