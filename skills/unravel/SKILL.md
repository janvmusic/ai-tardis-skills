---
name: unravel
description: Interview the user relentlessly about a plan or design until reaching a shared understanding, resolving each branch of the decision tree. Use when the user wants to stress-test a plan, get grilled on their design, or mentions "unravel".
---

# Unravel Skill

The idea is that you will interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

## When to Use This vs `plan-review`

- Use **`unravel`** to **build or harden a plan** through interactive interviewing, when the plan does not exist yet or is still forming.
- Use **`plan-review`** when a **finished plan already exists** and you only want a one-shot, non-interactive critique of it (Staff Engineer + Architect feedback). Do not use `unravel` for that — recommend `plan-review` instead.

After unravel produces and saves a plan, you may suggest running `plan-review` on it for a final readiness check.

Ask the questions one at a time.

If a question can be answered by exploring the codebase, explore the codebase instead.

## Asking Questions

Ask every question using the `question` tool (multiple choice), never as plain prose, so I can answer with a single click. For each question:

- Provide the concrete options you see for that decision.
- Put your recommended option **first** and append " (Recommended)" to its label.
- In each option's description, give the one-line reasoning/trade-off for that choice.
- Do NOT add "Other" or catch-all options — the tool already appends a "Type your own answer" escape hatch.
- Before the tool call, write 1-3 sentences of context: what branch of the design tree we're on, why it matters, and what depends on it.
- Use `multiple: true` only when several options can legitimately be combined (e.g. selecting which folders are in scope).

If a decision is genuinely open-ended (no enumerable options) or is better answered by reading the codebase, explore first and come back with a narrowed-down set of choices rather than an open question.

## Roles

For this task, you and I are going to be a team. The hats you are going to be using are:

- PM
- Tech Lead
- Architect

## Workflow

1. I'll give you a summary of what kind of work I want to do.
2. There should not be any ambiguity; if there are or you detect an unclear requirement, your duty is to ask questions to clarify these situations. 
3. Once you are ready, you will document the plan to implement the new feature or project.
   - Use the `question` tool to ask in which format I want the plan (console, markdown, or another format).
4. Ask whether to save the plan to a file.
   - Use the `question` tool. Put the default save option **first**: save to `artifacts/{ticket}/plan.md`, where `{ticket}` is the ticket number (e.g. `artifacts/PROJ-1234/plan.md`).
   - If no ticket number is known, ask for it, or fall back to a short kebab-case slug derived from the plan's title.
   - If I decline, keep the plan in the console only and do not write any file.
   - When saving, create the `artifacts/{ticket}/` directory if it does not exist.
5. If the project is growing in scope and complexity, then provide insights on how we can split it into different smaller projects. 
6. Explain the requirements to be handled by an AI Agent or a JR Developer

## Plan Structure

The plan MUST contain **all** of the sections below, in this order. A section is never dropped for brevity. If one genuinely does not apply, keep the heading and write a single line explaining why — an explicit "not applicable, because …" is acceptable; silence is not.

### 1. Overview

2-4 lines: what we are building and why. No restating of the interview.

### 2. Decisions

The decisions we resolved during the interview, as a short list of `<decision> — <chosen option>`. This is the record of what was settled, so the implementer does not reopen it.

### 3. Implementation Slices

**REQUIRED.** Break the work into ordered, independently shippable slices — not a flat wall of tasks. Each slice MUST have:

- **Goal** — one line: what is true after this slice that was not true before.
- **Files / areas touched** — concrete paths where known.
- **Steps** — numbered, concrete actions.
- **Done when** — an observable condition, not "code is written".

Sequence slices so each one leaves the system in a working state. Call out dependencies between slices explicitly. If the work is genuinely one slice, say so and still use this shape.

### 4. Tests

**REQUIRED.** The automated tests to write or update:

- What each test covers, and which slice it belongs to.
- New test files vs. existing ones to extend.
- Edge cases and failure modes that MUST be covered.

"Add tests" is not an acceptable entry — name them.

### 5. Manual Test

**REQUIRED.** A human-runnable verification script, separate from the automated tests:

- Preconditions / setup (data, env, feature flags, seeded state).
- Numbered steps to perform.
- The expected observable result for each step.

Written so someone who did not build the feature can follow it.

### 6. Risks & Open Questions

Known risks, rollback considerations, and anything still genuinely unresolved. Empty is fine — say "none" rather than omitting the heading.

### Before presenting the plan

Verify every one of the six sections is present and populated, and that sections 3, 4, and 5 are specific rather than placeholders. If any is missing or vague, fix it **before** showing me the plan — do not present a partial plan and offer to fill in the rest afterwards.

## Notes
A developer will likely work on this plan. If you have any suggestions or comments that can help with the flow or AI implementation, then give them.
