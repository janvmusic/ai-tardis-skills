---
name: create-pr
description: Create a GitHub Pull Request with a structured, informative description. Auto-loads when creating a PR, opening a pull request, creating a branch, or any GitHub PR operation. MUST use instead of default PR creation behavior.
---

# Pull Request Skill

Create a focused, well-structured pull request that gives reviewers full context.

## Instructions

1. **Ask for ticket ID**: If not provided, ask the user for the ticket ID before proceeding
2. **Create branch**: Create and checkout a branch using the ticket ID
3. **Invoke commit skill**: Ensure all changes are committed using the `commit` skill
4. **Analyze commits**: Run `git log origin/main..HEAD --oneline` to summarize what changed
5. **Analyze diff**: Run `git diff origin/main..HEAD --stat` to understand scope of changes
6. **Write PR**: Follow the structure below
7. **Present and wait**: Show the proposed PR title and body and wait for approval
8. **Create PR**: Mark as ready for review

## Branch Naming Format

{type}/{ticket-id}-{short-description}

### Examples

```
feat/BLA-101-add-book-search
fix/BLA-202-borrowing-due-date
refactor/BLA-303-extract-auth-concern
```

### Rules

- All lowercase
- Hyphens as separators, no underscores
- Short description mirrors the eventual PR title
- Ask the user for the type and short description if not clear from context

## Execution Steps

### Phase 1 — Branch Setup

1. Ask user for ticket ID if not already provided
2. Ask user for branch type and short description if not clear from context
3. Create and checkout the branch:

```bash
   git checkout -b {type}/{ticket-id}-{short-description}
```

4. Confirm branch was created:

```bash
   git branch --show-current
```

### Phase 2 — Commit

1. Check working tree status:

```bash
   git status
```

2. If there are uncommitted changes, **invoke the `commit` skill** to
   stage and commit them following conventional commit conventions
3. If the working tree is clean, skip to Phase 3

### Phase 3 — PR Creation

1. Run `git log origin/main..HEAD --oneline` to see commits
2. Run `git diff origin/main..HEAD --stat` to see changed files
3. Compose PR title and body following the structure below
4. Present the full PR to the user and wait for approval
5. Create the PR as ready for review:

```bash
   gh pr create --title "{title}" --body "{body}"
```

6. Output the PR URL once created

## PR Title Format

{type}({ticket-id}): {description}

### Rules

- Single line, under 72 characters
- Lowercase imperative mood
- No period at the end

## PR Body Structure

```markdown
## What

Brief description of what this PR does. 1-3 sentences max.

## Why

Why this change is needed. Reference ticket: {ticket-id}

## How

Key technical decisions or approach. Skip if obvious from the diff.

## Testing

How to verify this works. Include:

- Relevant RSpec spec paths to run
- Manual steps if needed

## Notes (optional)

Anything the reviewer should know: follow-ups, known limitations,
deployment considerations.
```

## Rules

- NEVER create the branch or PR without user approval at each phase
- NEVER create the PR without first completing Phase 1 and Phase 2
- NEVER duplicate commit logic — always delegate to the `commit` skill
- NEVER include unrelated changes in the description
- ALWAYS invoke the `commit` skill before creating the PR
- If working tree is clean, skip the commit skill and proceed to Phase 3
- Keep the body scannable — use short paragraphs and bullet points
- If `gh` CLI is not available, output the title and body for manual use
- One PR per logical change — flag if commits appear to span multiple concerns
- Always mark PR as ready for review, never as draft
