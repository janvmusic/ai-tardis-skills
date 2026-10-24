# Plan Template

The plan MUST start with a title, then contain **all** six sections below, in this order. A section is never dropped for brevity. If one genuinely does not apply, keep the heading and write one line explaining why: "Not applicable, because ..." is acceptable, silence is not.

## Formatting Rules

The plan is read by people before it is read by an agent. These rules apply to every section.

1. Every numbered or bulleted item sits on its own line. Never run items together in a paragraph.
2. Leave a blank line before and after every list, table and code block.
3. Use headings for structure. Do not use bold text as a stand-in for a heading.
4. Open each decision, step and risk with a short bold lead sentence, then the detail.
5. Keep paragraphs to 3 lines or fewer. Prefer a list over a long sentence with many clauses.
6. Write plain sentences. Name the thing (file, function, endpoint) instead of saying "it" or "this".
7. Give every code block a language tag.
8. Use a table only for a comparison or a mapping. Align its columns.
9. Use a diagram only when a flow of 3 or more steps is hard to say in words.

## Title

```markdown
# {ticket}: {short title}
```

If no ticket number is known, use the short title alone.

On the line below the title, add `Planned by: {model name, e.g. "Claude" or "Codex"}`, naming the model that wrote the plan.

## 1. Overview

Four subsections, in this order:

- **What we are building**: one short paragraph.
- **Why it matters**: the problem it solves and who feels it.
- **How it works**: the main flow in a few lines. Add a plain-text diagram when the flow has 3 or more steps.
- **Release**: include only when shipping depends on other tickets, deploys or flags. List the dependencies as a numbered list.

No restating of the interview.

## 2. Decisions

The decisions resolved during the interview. This is the record of what was settled, so the implementer does not reopen it.

- Group decisions under topic headings (for example "Where the feature appears" or "Error handling").
- Number decisions continuously across the whole section (1, 2, 3, ...), never restarting per group, so other sections can cite "Decision 7".
- Start each with a bold lead sentence stating the choice. Put the reason and the concrete names or paths in sub-bullets.

## 3. Implementation Slices

**REQUIRED.** Break the work into ordered, independently shippable slices, not a flat wall of tasks.

Start with a short intro that says how the slices map to commits and to the pull request.

Give each slice the heading `### Slice N: {title}` and these parts, in this order:

1. **Depends on**: the slices it needs, or "none".
2. **Goal**: one line saying what is true after this slice that was not true before.
3. **Files**: one bullet per path, marked `(new)` when created.
4. **Steps**: a numbered list of concrete actions. Add a code snippet to a step when the exact shape matters. Add a small table or block showing resulting states when behavior depends on input.
5. **Done when**: an observable condition, never "code is written".

Sequence slices so each one leaves the system working. If the work is one slice, say so and still use this shape.

## 4. Tests

**REQUIRED.** The automated tests to write or update, grouped by slice.

- Under each slice, list each test file as `path (new)` or `path (extend)`.
- Under each file, give a numbered list of cases, one per line, each naming what it covers.
- Add a short label above a group of cases when a file has several themes (for example "Starting values" or "Failures").
- Cover the edge cases and failure modes that matter.

"Add tests" is not an acceptable entry. Name every case.

## 5. Manual Test

**REQUIRED.** A verification script a person can follow without having built the feature, separate from the automated tests.

Use these subsections:

1. **Setup**: a numbered list of preconditions (data, environment, flags, seeded state). Put commands in code blocks.
2. **Steps**: a numbered list of actions. Under each step, one `**Expect:**` bullet per observable result.
3. **Release acceptance**: one short paragraph naming which steps must pass before the change ships.
4. **Cleanup**: the step that restores any state changed during Setup. Include it as the last numbered step.

## 6. Risks & Open Questions

Two subsections:

1. **Open questions**: what is still unresolved. Write "None." when there are none.
2. **Risks**: a numbered list. Each risk starts with a bold lead sentence, then what could go wrong and what was decided about it.
