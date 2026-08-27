# Personal Preferences

`personal/` holds the preference files that sit above the skills: tone,
language rules, accuracy standards and coding conventions. Skills say how to do
a task, preferences say how to talk and how to write code across every task.

```
personal/
├── CLAUDE.md    # preferences, the file to edit
└── AGENTS.md -> CLAUDE.md   # same content for the AGENTS.md convention
```

`AGENTS.md` is a symlink, so the two conventions cannot drift apart. Edit
`CLAUDE.md`. The CLI does not install either one, so copy the name you need by
hand:

```bash
cp personal/CLAUDE.md ~/.claude/CLAUDE.md   # every project
cp personal/AGENTS.md ./AGENTS.md           # just this project
```

Treat this repository as the source of truth: edit the file here, then copy it
out again.
