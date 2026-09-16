---
name: create-pr
description: Create a GitHub Pull Request with a structured, informative description. Auto-loads when creating a PR, opening a pull request, creating a branch, or any GitHub PR operation. MUST use instead of default PR creation behavior.
---

# Pull Request Skill

Create a focused, well-structured pull request that gives reviewers full context.

## Workflow

1. **Resolve the branch**: ask whether to use the current branch or create a
   new one.
   - Current branch: continue with it as-is.
   - New branch: ask for ticket ID, type, and short description if not
     already clear from context, then create and check it out using the
     format in **Branch Naming Format** below.
2. **Ensure changes are committed**: run `git status`. If there are
   uncommitted changes, invoke the `commit` skill to stage and commit them.
   If the working tree is clean, continue.
3. **Resolve the title format**: see **PR Title Format** below.
4. **Resolve the body template**: see **PR Body Template** below.
5. **Analyze the change**: run `git log origin/main..HEAD --oneline` and
   `git diff origin/main..HEAD --stat`.
6. **Compose the PR**: fill in the resolved template with the title and body.
7. **Resolve draft vs ready**: ask whether this PR should be a draft or ready
   for review (default: ready for review).
8. **Present and wait**: show the full title and body and wait for approval.
   Do not create the PR until approved.
9. **Create the PR**:

   ```bash
   gh pr create --title "{title}" --body "{body}" [--draft]
   ```

10. **Output the PR URL** once created.

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

## PR Title Format

- If the `commit` skill is installed alongside this one, read
  `../commit/references/conventions.md` and derive the title format from its
  `{type}(scope): description` rule — same type list, same single-line,
  lowercase, imperative-mood, no-trailing-period constraints.
- If that file is not present (the `commit` skill isn't installed, or hasn't
  been used yet in this project), fall back to this skill's own default:
  `{type}({ticket-id}): {description}`, single line, under 72 characters as
  guidance, lowercase imperative mood, no trailing period. If no ticket ID is
  available, omit the scope: `{type}: {description}`.

This keeps the PR title consistent with the project's commit convention
without hardcoding a duplicate definition here — the PR title becomes the
squashed commit on `main` and feeds `--generate-notes`, so it lands in
published release notes verbatim.

## PR Body Template

1. Check `.github/pull_request_template.md`. If it exists, use it — fill in
   its placeholders, do not ask anything.
2. Else check `.github/PULL_REQUEST_TEMPLATE/*.md`. If any exist, use one —
   do not ask anything.
3. Else check whether `references/pr_template.md` exists next to this file.
   If it exists, use it — do not ask anything.
4. Else ask the user (multiple choice): "How should this PR's body be
   structured?"
   - **Use the default template**: write the **Default Template** below to
     `references/pr_template.md` verbatim (everything from "### Sections"
     onward, not this instruction), then use it.
   - **Describe a custom format**: ask what sections/structure to use, write
     the derived structure to `references/pr_template.md`, then use it.
   - **Mirror an example PR**: ask for the PR's URL, fetch its body (e.g.
     `gh pr view <url> --json body`), derive its section structure, write
     that to `references/pr_template.md`, then use it.

Whichever branch runs, the result is written to `references/pr_template.md`
so this question is never asked again in the same project.

## Default Template

The content from "### Sections" below is what gets written to
`references/pr_template.md` when the user picks "use the default template" —
nothing above that line is part of the file.

### Sections

```markdown
## Summary

Brief description of what this PR does. 1-3 sentences max.

Closes #{ticket-id}

## Why

Why this change is needed.

## How

Key technical decisions or approach. Skip if obvious from the diff.

## Testing

How to verify this works. Manual steps if needed.

## Notes (optional)

Anything the reviewer should know: follow-ups, known limitations,
deployment considerations.
```

## Rules

- NEVER create the branch or PR without user approval at each step
- NEVER include unrelated changes in the description
- ALWAYS invoke the `commit` skill to handle uncommitted changes — never
  duplicate its logic here
- Keep the body scannable — use short paragraphs and bullet points
- If `gh` CLI is not available, output the title and body for manual use
- One PR per logical change — flag if commits appear to span multiple
  concerns
