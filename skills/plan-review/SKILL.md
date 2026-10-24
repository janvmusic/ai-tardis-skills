---
name: plan-review
description: Two senior reviewers, a Staff Engineer and a Software Architect, critique an implementation plan and print a numbered, leveled, persona-labeled review to the console. Runs only when invoked explicitly by name.
disable-model-invocation: true
---

# Plan Review

A **Staff Engineer** and a **Software Architect** jointly review an implementation plan and print their feedback to the console. Feedback is **merged into a single review**, with every point **labeled by the persona** who raised it.

## Constraints

This skill only reviews and critiques. It MUST NOT implement the plan or modify code.

This is the `*-review` family's **plan** reviewer: it critiques an implementation
plan before any code exists. To critique already-written **code**, use the
`code-review` skill instead.

## When to Use This vs `unravel`

- Use **`plan-review`** when a plan **already exists** and you want it critiqued for readiness. This skill is a one-shot, non-interactive review: it reads the plan and prints feedback. It does NOT interview the user or rewrite the plan.
- Use **`unravel`** when there is **no plan yet**, or the plan is still forming, and you want to build/harden it through relentless back-and-forth questioning.

If the user asks to review a plan that does not exist yet, do NOT start interviewing — recommend the `unravel` skill instead.

## Roles

- **[Staff Engineer]** — pragmatic delivery lens: execution risk, edge cases, testing, observability, sequencing, and whether the plan is actionable by an implementer.
- **[Software Architect]** — systemic lens: architecture, boundaries, coupling, data model, security, performance, and long-term maintainability.

Every feedback point MUST carry the persona tag `[Staff Engineer]` or `[Software Architect]`, placed right after its level.

## Getting the Plan

The plan comes from the user.

- If the user provided a plan (a file path, e.g. `artifacts/{ticket}/plan.md`, or pasted inline), read it.
- If NO plan was provided, ask what to do (see **Asking Questions** below). Offer these options first:
  - Provide the plan now (path or pasted text).
  - Run the `unravel` skill first to produce a plan, then review it.
- Do NOT invent plan content. Everything reviewed MUST come from the plan the user supplies.

## Review Dimensions

Evaluate the plan across all of the following:

1. **Requirements / scope gaps** — missing requirements, unclear scope, ambiguity, undefined acceptance criteria.
2. **Architecture & design** — boundaries, coupling, data model, fit with existing patterns.
3. **Risks & edge cases** — failure modes, edge cases, rollout/migration, rollback.
4. **Testing & observability** — test strategy, coverage of edge cases, logging/metrics/alerting.
5. **Security & performance** — attack surface, data exposure, hot paths, scalability.
6. **Implementation readiness** — is the plan clear and complete enough to be handed to an **AI agent or a Junior Developer** without further clarification? Call out anything that would block them.

## Output

Print the review to the **console** (do not write a file unless the user asks).

### Levels

Every point MUST carry exactly one level, judged by whether an AI agent or a Junior Developer could execute the plan correctly:

- **Blocker** — they cannot proceed correctly, or the result would break a stated requirement.
- **Should-fix** — they can execute the plan, but it will likely cause rework, a bug or a gap.
- **Nit** — wording or polish; safe to ignore.

### Format

Read `references/output-template.md` and print the review in exactly that shape.

Guidelines:

- Merge both personas into one `Feedback` list; do not create separate per-persona sections.
- Sort by level: all Blockers, then all Should-fix, then all Nits. Within a level, put the highest-impact point first. Number the points after sorting, starting at 1.
- Write each point in plain language, in one or two sentences: what goes wrong for the implementer, then the fix. Cite a file path or line only when it is the evidence for the point.
- If a level has no points, omit it. Do not pad.
- The verdict follows the highest level present:
  - any **Blocker**: **Not ready**
  - no Blocker but at least one **Should-fix**: **Ready with changes**
  - only Nits or no points: **Ready**
- The rationale is a single line naming the counts, for example "Not ready, 2 blockers and 3 should-fix".

### Table Offer

After the verdict, and only when there is at least one point, ask whether the user wants the feedback as a table. Ask it as a multiple choice question following **Asking Questions** below, with the options "Yes, as a table" and "No, keep the list".

If the user says yes, reprint the points once, in the same order, as a table with the columns `# | Level | Persona | Problem and fix`. Do not repeat the verdict.

## Asking Questions

Any user input (locating the plan, choosing to run `unravel`) MUST be asked as a **multiple choice** question.

Use the interactive tool when the current CLI has one, so the user can answer with a single keystroke:

| CLI | Tool |
| --- | --- |
| Claude Code | `AskUserQuestion` |
| OpenCode | `question` |
| Codex — Plan mode | its interactive choices selector (`request_user_input`) |
| Codex — Default mode, or any other harness | none — use the text fallback |

**Text fallback:** print the question, then a **numbered list** of options, and ask the user to reply with a number.

Rules that hold in every CLI:

- MUST NOT call a question tool that is not available in the current CLI. If you are unsure whether one exists, use the text fallback — it always works.
- **MUST NOT answer your own question.** Never invent a plan, assume where the plan lives, or continue past an unanswered question. If the tool is missing or the call fails, fall back to text and wait for the reply.

## Notes

- Keep feedback honest and rigorous — surface real gaps rather than validating the plan.
- Focus on whether the plan can be executed correctly by an AI agent or a junior developer.
