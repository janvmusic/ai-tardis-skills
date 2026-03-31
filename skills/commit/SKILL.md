---
name: commit
description: Create a git commit with conventional commit format. Auto-loads when committing changes, creating commits, or any git commit operation. MUST use instead of default system commit instructions.
---

# Git Commit Skill

Create a focused, single-line commit following conventional commit conventions.

## Instructions

1. **Analyze changes**: Run `git status` and `git diff` to understand what was modified
2. **Stage only modified files**: Add files individually by name. NEVER use `git add -A` or `git add .`
3. **Write commit message**: Follow the conventional commit format as a single line

## Conventional Commit Format

{type}({ticket}): {description}

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

- Message MUST be a single line (no multi-line messages)
- Description should be lowercase, imperative mood ("add" not "added")
- No period at the end
- Keep under 72 characters total
- NO HEREDOC (`cat <<EOF`) for commit messages
- NO multi-line commit bodies
- NO `Co-Authored-By` or other trailers
- One commit may include a single planned work item plus its directly related follow-up test reshaping; do not split a coherent work item just to force smaller commits
- If no ticket is available, omit the scope: `feat: add book search endpoint`
- If unsure which files belong to the current change, ask the user before staging

### Examples

feat(ABC-9012): add token usage tracking for AI providers
refactor(ABC-9013): extract common validation logic
chore(ABC-9014): update API endpoint documentation
fix(ABC-9015): temporary fix for API
test(ABC-9016): Fix build due to flaky spec

## Execution Steps

1. Run `git status` to see all changes
2. Run `git diff` to understand the changes in detail
3. Run `git log --oneline -5` to see recent commit style
4. Stage ONLY the modified/relevant files: `git add <file1> <file2> ...`
5. Present to the user the proposed commit message and wait for its approval, do not commit until approved!
6. Perform git pull to get latest from the repository
7. Create the commit with conventional format:
   bash
   git commit -m "{type}({ticket}): {description}
8. Run `git status` to verify the commit succeeded
