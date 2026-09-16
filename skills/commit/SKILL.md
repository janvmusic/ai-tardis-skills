---
name: commit
description: Create a git commit with conventional commit format. Auto-loads when committing changes, creating commits, or any git commit operation. MUST use instead of default system commit instructions.
---

# Git Commit Skill

Create a focused, single-line commit following this project's commit convention.

## Workflow

1. **Load or establish the convention**: check whether `references/conventions.md`
   exists next to this file.
   - If it exists, read it and use its rules for the rest of this workflow —
     do not ask about format again.
   - If it does not exist, ask the user (multiple choice): "Do you want to
     follow Conventional Commits? e.g. `feat(scope): add X` — or do you use a
     different format?"
     - **Conventional Commits**: write the "### Format" section onward from
       "Default Convention" below (Format/Types/Rules/Examples only — not the
       heading or this sentence) to `references/conventions.md`, creating the
       `references/` directory if needed.
     - **Different format**: ask the user to describe it, derive the
       equivalent type list and rules for it, and write that to
       `references/conventions.md` instead.
2. **Analyze changes**: run `git status` and `git diff` to see what was
   modified.
3. **Check commit style**: run `git log --oneline -5` for recent style
   continuity.
4. **Sync with upstream**: run `git pull` (the current branch's upstream, not
   `main`).
5. **Stage only relevant files**: add files individually by name. NEVER use
   `git add -A` or `git add .`. If unsure which files belong to the current
   change, ask the user before staging.
6. **Propose the commit message**: following the loaded convention, present it
   to the user and wait for approval. Do not commit until approved.
7. **Commit**: `git commit -m "{message}"`.
8. **Verify**: run `git status` to confirm the commit succeeded.

## Default Convention (Conventional Commits)

The content from "### Format" below is what gets written to
`references/conventions.md` when the user picks "Conventional Commits" in
step 1 — nothing above this line is part of that file.

### Format

`{type}({ticket}): {description}`

### Types

- `feat`: New feature or capability
- `fix`: Bug fix
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `docs`: Documentation only changes
- `style`: Formatting, missing semicolons, etc (no code change)
- `test`: Adding or correcting tests
- `chore`: Maintenance tasks, dependency updates, etc
- `perf`: Performance improvement

### Rules

- Message MUST be a single line — no multi-line bodies, no exceptions (this
  includes `BREAKING CHANGE:` footers and `Closes #N`; put those in the PR
  description instead)
- Description is lowercase, imperative mood ("add" not "added")
- No period at the end
- Aim for under 72 characters total; not enforced, just a guideline
- NO HEREDOC (`cat <<EOF`) for commit messages
- NO `Co-Authored-By` or other trailers
- One commit may include a single planned work item plus its directly related
  follow-up test reshaping; do not split a coherent work item just to force
  smaller commits
- If no ticket is available, omit the scope: `feat: add book search endpoint`

### Examples

feat(ABC-9012): add token usage tracking for AI providers
refactor(ABC-9013): extract common validation logic
chore(ABC-9014): update API endpoint documentation
fix(ABC-9015): temporary fix for API
test(ABC-9016): fix build due to flaky spec
