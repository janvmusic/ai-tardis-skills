# Tardis Skills

![Tardis](src/tardis.jpg)

Repository of skill used by different AIs. Currently here's the list and description of each skill

## Skills Available

- **[code-review](skills/code-review/SKILL.md)**: Perform thorough code reviews on branch changes, evaluating bugs, performance, security, code quality, architecture, and testing.
- **[commit](skills/commit/SKILL.md)**: Create a git commit with conventional commit format. Auto-loads when committing changes, creating commits, or any git commit operation. MUST use instead of default system commit instructions.
- **[create-pr](skills/create-pr/SKILL.md)**: Create a GitHub Pull Request with a structured, informative description. Auto-loads when creating a PR, opening a pull request, creating a branch, or any GitHub PR operation. MUST use instead of default PR creation behavior.
- **[rails-expert](skills/rails-expert/SKILL.md)**: Use when building, designing, or reviewing any part of a Rails application. ALWAYS invoke for models, controllers, migrations, routes, serializers, policies, specs, or any Rails-related task.
- **[frontend-expert](skills/frontend-expert/SKILL.md)**: Use when building, designing, or reviewing any part of a React + TypeScript application. ALWAYS invoke for UI and UX.

## Installation

```bash
npm install -g ai-tardis-skills
```

## Usage

```bash
tardis-ai list                   # Show available skills
tardis-ai install <skill-name>   # Install a skill to .claude/skills/
tardis-ai remove <skill-name>    # Remove an installed skill
```

### Example

```bash
tardis-ai install rails-expert
```

This copies the skill to `.claude/skills/rails-expert/` in your current project.
