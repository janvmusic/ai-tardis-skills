---
name: commit-asks-format-first-time
description: >
  First-time invocation of the commit skill in a project with no
  references/conventions.md must ask the format question before proposing
  a message. Does not test the write-and-reuse side (see #43): the skill's
  own convention file resolves relative to SKILL.md's own directory, which
  in an eval run is this repo's real on-disk skills/commit/, not a
  per-run copy — seeding or writing there is unsafe to eval automatically.
plugins: ["../.."]
allowed_tools: [Skill, Read, Glob]
max_turns: 12
runs: 3
---

I have staged changes ready to commit. Help me write the commit message.
Don't actually run `git commit` — just get as far as proposing the message.
