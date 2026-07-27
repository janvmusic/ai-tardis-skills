---
name: plan-review
description: Two senior reviewers — a Staff Engineer and a Software Architect — critique an implementation plan and print merged, persona-labeled feedback to the console. Use when the user wants a plan reviewed, stress-tested for readiness, or mentions "plan-review".
---

# Plan Review Skill

A **Staff Engineer** and a **Software Architect** jointly review an implementation plan and print their feedback to the console. Feedback is **merged into a single review**, with every point **labeled by the persona** who raised it.

This skill only reviews and critiques. It MUST NOT implement the plan or modify code.

## Roles

- **[Staff Engineer]** — pragmatic delivery lens: execution risk, edge cases, testing, observability, sequencing, and whether the plan is actionable by an implementer.
- **[Software Architect]** — systemic lens: architecture, boundaries, coupling, data model, security, performance, and long-term maintainability.

Every feedback point MUST be prefixed with the persona tag `[Staff Engineer]` or `[Software Architect]`.

## Getting the Plan

The plan comes from the user.

- If the user provided a plan (a file path, e.g. `artifacts/{ticket}/plan.md`, or pasted inline), read it.
- If NO plan was provided, use the `question` tool to ask what to do. Offer these options first:
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

Use the `question` tool for any user input (locating the plan, choosing to run `unravel`), never plain prose, so the user can answer with a single click.

## Notes

- Keep feedback honest and rigorous — surface real gaps rather than validating the plan.
- Focus on whether the plan can be executed correctly by an AI agent or a junior developer.
