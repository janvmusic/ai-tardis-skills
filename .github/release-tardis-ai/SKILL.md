---
name: release-tardis-ai
description: Create a new release, tag and release the npm package. Use when the user wants to publish a new version of the tardis-ai CLI to npm.
---

# Release Tardis AI Skill

Guide the user through releasing a new patch version of `ai-tardis-skills` to npm — bumping the version, tagging, pushing, and publishing.

## Pre-flight Checks

Before doing anything else, verify all of the following. If any check fails, stop and tell the user what needs to be fixed.

1. **Current branch is `main`** — run `git branch --show-current` and confirm the output is `main`
2. **Working tree is clean** — run `git status --porcelain` and confirm there are no staged or unstaged changes
3. **npm auth** — run `npm whoami` and confirm the user is logged in; if it fails, instruct them to run `npm login` first

## Workflow

### Phase 1 — Present the Plan

Show the user the full release plan before executing anything:

```
Release Plan:
  1. Bump version: npm version patch (x.x.X → x.x.X+1)
  2. Push commit and tag to origin/main
  3. Publish to npm

Current version: <read from package.json>
New version:     <current + 1 patch>
```

Ask: **"Shall we proceed with this release plan?"** — MUST wait for explicit confirmation before continuing.

### Phase 2 — Bump Version

1. Run `npm version patch` — this updates `package.json`, commits the change, and creates the git tag
2. Show the user the new version number and the tag that was created
3. Ask: **"Version bumped to X.X.X and tag vX.X.X created. Ready to push to origin?"** — MUST wait for confirmation

### Phase 3 — Push

1. Run `git push origin main --tags`
2. Confirm the push succeeded

### Phase 4 — Publish

1. Run `npm pack --dry-run` and show the full file list to the user
2. Ask: **"These are the files that will be published. Push complete. Ready to publish to npm?"** — MUST wait for explicit confirmation
3. Run `npm publish`
4. Confirm success and show the user the published package URL: `https://www.npmjs.com/package/ai-tardis-skills`

## Notes

- Only `patch` bumps are supported by this skill
- Each destructive step (push, publish) requires explicit user confirmation
- If any step fails, stop immediately and report the error — do not proceed to the next step
