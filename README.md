# Tardis Skills

![Tardis](src/tardis.jpg)

Repository of skill used by different AIs. Currently here's the list and description of each skill

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

```bash
npm install -g ai-tardis-skills
```

## Usage

```bash
tardis-ai list                            # Show available skills
tardis-ai install <skill-name>            # Install a skill (defaults to Claude)
tardis-ai install <skill-name> --ai=opencode  # Install for a specific AI
tardis-ai remove <skill-name> [--ai=...]  # Remove an installed skill
```

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
