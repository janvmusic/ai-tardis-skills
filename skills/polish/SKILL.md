---
name: polish
description: Clean up style and structure in a changelist — uncommitted changes by default, or a named path/file or a PR — against rules the user has documented per language, accumulating a rule set meant to eventually graduate into the project's AGENTS.md/CLAUDE.md. Use when the user says "polish this", "clean this up", or wants a pass over code they (or an agent) just wrote before committing, or over the files in a PR. Never changes behavior and never hunts for bugs — use code-review for that.
---

# Polish Skill

Apply user-documented style and structure rules to a changelist —
uncommitted changes by default, or a named path/file or a PR's changed
files. Naming, ordering, dead code, redundant branches, formatting the
linter does not catch, comment policy, idiomatic constructs — nothing else.

The point of recording rules in `.tardis/polish/{language}.md` rather than
applying them ad hoc is to build a durable, example-backed rule set. Once a
rule has proven itself over a few runs, its natural next step is promotion
into the project's `AGENTS.md` or `CLAUDE.md`, so agents follow it from the
start instead of needing a polish pass every time. That promotion is a
manual, user-driven edit outside this skill — this skill only accumulates
the candidates.

## Constraints

- MUST NOT change behavior. If a "cleanup" would alter what the code does,
  skip it and say so instead of applying it.
- MUST NOT hunt for bugs or flag correctness issues — that is `code-review`'s
  job, not this skill's.
- MUST NOT invent rules. Only apply what the user has actually documented in
  `.tardis/polish/{language}.md`. Never guess a preference and apply it.

## Rules File

Rules live in `.tardis/polish/{language}.md`. Check two locations, in order:

1. `.tardis/polish/{language}.md` relative to the project root (cwd) —
   checked into the project's own repo so a team shares the same rules.
2. `~/.tardis/polish/{language}.md` — global rules that apply across
   projects.

Use the first one found. New rules authored during a run (step 3 or step 7
below) are always written to the project-level file, never the global one —
promoting a rule to global is a manual, explicit action outside this skill.

Each rules file is plain markdown: one entry per rule, each with a one-line
rule statement plus the bad/good example pair it was derived from:

````markdown
## Prefer early returns over nested conditionals

**Bad:**

```ruby
def process(user)
  if user
    if user.active?
      do_thing(user)
    end
  end
end
```

**Good:**

```ruby
def process(user)
  return unless user&.active?
  do_thing(user)
end
```
````

## Direct Instruction Mode

If the user invokes this skill with an explicit instruction (e.g. "polish
this file, use full-path imports" or "polish src/foo.ts: no default
exports"), skip the interview in step 3 below entirely:

1. **Resolve the target file**: an explicit path or `@`-mention wins; "this
   file" or no file named resolves to whatever file is already active in the
   conversation (the one most recently opened, edited, or discussed). Ask
   only if there is genuinely no file in context and none was named.
2. **Resolve the language** from the target file's extension (ask if this
   extension hasn't been resolved yet this run, per step 2 below).
3. **Derive the bad/good pair from the instruction itself**: the target
   file's current relevant content is the "bad" example; apply the
   instruction to produce the "good" example. Derive a one-line rule
   statement from the instruction's own wording.
4. **Record and apply immediately**: write the new entry to
   `.tardis/polish/{language}.md` (same format as step 3 below), then apply
   it to the target file, then continue at step 5 (summarize) with just this
   one file in the batch.

This is the same recording mechanism as the reactive flows below — it just
skips asking for examples because the user already supplied the rule and the
file to derive it from.

## Workflow

1. **Resolve scope**, in this order:
   - An explicit path, file, or `@`-mention named by the user wins outright.
   - A PR reference (a number like `PR #123` or `#123`, or a GitHub PR URL)
     resolves via `gh pr diff <ref> --name-only` for the changed file list —
     use `gh pr diff <ref>` for the actual diff content if you need it for
     language grouping or applying rules against the PR's version of a file
     rather than the local one.
   - Otherwise, default to uncommitted changes — `git status` for tracked
     modifications and untracked files, same signal the `commit` skill reads.
2. **Resolve language per file**: group the scoped files by extension. For
   each distinct extension not yet resolved this run, ask the user what
   language it is (free-text — languages aren't a fixed enumerable set). Ask
   once per distinct extension, not once per file.
3. **Load or author rules, per language**:
   - Check project-level `.tardis/polish/{language}.md` first, then
     `~/.tardis/polish/{language}.md` if the project-level file doesn't
     exist.
   - If either exists, read it and use its rules for that language's files.
   - If neither exists: stop for that language, tell the user no rules
     exist yet, and ask for one bad example and one good example. From that
     pair, derive a one-line rule statement. Write a new entry to the
     project-level `.tardis/polish/{language}.md` (creating `.tardis/polish/`
     if needed) containing the derived statement plus both raw snippets, in
     the format shown above. Continue this same run using the rule just
     recorded — do not require a second invocation.
4. **Apply rules**: for every file whose language has a loaded (or
   just-authored) rules file, produce the polished version in memory.
   - Any file whose language still has no rules file (the user declined to
     author one in step 3) is left untouched and listed as deferred.
5. **Summarize once**: show every planned per-file change (diff-style) in a
   single message, plus a "Deferred (no rules yet)" list for any language
   still without rules. Do not show changes file-by-file with separate gates.
6. **Get one approval for the whole batch**:
   - If the user's request indicates they just want to see the changes
     (a dry run), stop here — do not write anything, regardless of any
     response to the summary.
   - Otherwise, ask for a single yes/no approval covering the entire batch.
     On approval, write every file in the batch. On decline, write nothing.
7. **Capture corrections**: if the user's response to the summary rejects a
   specific file's change and states what it should be instead, offer to
   record it — treat the rejected change as the "bad" example and the
   user's correction as the "good" example, derive a rule statement, and
   append a new entry to that language's rules file (same format as step 3).
   Apply the user's correction instead of the original suggestion for that
   file, still within the same batch.

## Rules

- NEVER apply a rule that isn't documented in that language's rules file.
- NEVER touch a file whose language has no rules file — defer it instead.
- NEVER write any file without the batch-level approval from step 6, except
  when the run is a dry run, in which case NEVER write any file at all.
- One summary, one approval — not a gate per file.
