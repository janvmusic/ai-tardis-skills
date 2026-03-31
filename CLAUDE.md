# CLAUDE.md — ai-tardis-skills

This repository is a centralized collection of skill definitions for Claude Code. Skills are specialized instruction sets that guide AI behavior for specific tasks and domains.

## Repository Structure

```bash
skills/
└── {skill-name}/
    ├── SKILL.md          # Required — skill metadata and instructions
    └── references/       # Optional — supporting reference documents
```

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
- Valid types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `perf`
- Keep commit messages under 72 characters, single-line, imperative mood, lowercase
- Stage files individually — never use `git add -A`

## Adding a New Skill

1. Create a new directory under `skills/` with a hyphenated name
2. Add a `SKILL.md` with required frontmatter and instructions
3. Optionally add a `references/` folder for supporting documentation
4. Add the skill to `README.md` following the existing list format:

```markdown
- **[skill-name](skills/skill-name/SKILL.md)**: {description}
```
