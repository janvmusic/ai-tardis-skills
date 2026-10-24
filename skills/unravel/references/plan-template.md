# Plan Template

The plan MUST contain **all** of the sections below, in this order. A section is never dropped for brevity. If one genuinely does not apply, keep the heading and write a single line explaining why — an explicit "not applicable, because …" is acceptable; silence is not.

## 1. Overview

2-4 lines: what we are building and why. No restating of the interview.

## 2. Decisions

The decisions we resolved during the interview, as a short list of `<decision> — <chosen option>`. This is the record of what was settled, so the implementer does not reopen it.

## 3. Implementation Slices

**REQUIRED.** Break the work into ordered, independently shippable slices — not a flat wall of tasks. Each slice MUST have:

- **Goal** — one line: what is true after this slice that was not true before.
- **Files / areas touched** — concrete paths where known.
- **Steps** — numbered, concrete actions.
- **Done when** — an observable condition, not "code is written".

Sequence slices so each one leaves the system in a working state. Call out dependencies between slices explicitly. If the work is genuinely one slice, say so and still use this shape.

## 4. Tests

**REQUIRED.** The automated tests to write or update:

- What each test covers, and which slice it belongs to.
- New test files vs. existing ones to extend.
- Edge cases and failure modes that MUST be covered.

"Add tests" is not an acceptable entry — name them.

## 5. Manual Test

**REQUIRED.** A human-runnable verification script, separate from the automated tests:

- Preconditions / setup (data, env, feature flags, seeded state).
- Numbered steps to perform.
- The expected observable result for each step.

Written so someone who did not build the feature can follow it.

## 6. Risks & Open Questions

Known risks, rollback considerations, and anything still genuinely unresolved. Empty is fine — say "none" rather than omitting the heading.
