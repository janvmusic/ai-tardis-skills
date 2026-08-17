---
name: plan-review
description: Two senior reviewers — a Staff Engineer and a Software Architect — critique an implementation plan and print merged, persona-labeled feedback to the console. Use when the user wants a plan reviewed, stress-tested for readiness, or mentions "plan-review".
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

Every feedback point MUST be prefixed with the persona tag `[Staff Engineer]` or `[Software Architect]`.

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

Structure the output as follows:

```
## Plan Review

### Feedback

- [Staff Engineer] <point>
- [Software Architect] <point>
- [Staff Engineer] <point>
...

### Readiness Verdict

<Ready | Ready with changes | Not ready> — <one-line rationale>
```

Guidelines:

- Merge both personas into one `Feedback` list; do not create separate per-persona sections.
- Order points by importance (highest-impact first), not by persona.
- Each point should be specific and actionable: state the concern and, where useful, a concrete suggestion.
- If a dimension has no issues, do not pad — omit it.
- The verdict is one of **Ready**, **Ready with changes**, or **Not ready**, followed by a single-line rationale.

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
