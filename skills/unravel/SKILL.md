---
name: unravel
description: Interview the user relentlessly about a plan or design until reaching a shared understanding, resolving each branch of the decision tree. Runs only when invoked explicitly by name.
disable-model-invocation: true
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

Every question MUST be **multiple choice**, never open-ended prose.

**How to ask depends on the CLI you are running in.** Use the interactive tool when one exists, so I can answer with a single keystroke:

| CLI                                        | Tool                                                    |
| ------------------------------------------ | ------------------------------------------------------- |
| Claude Code                                | `AskUserQuestion`                                       |
| OpenCode                                   | `question`                                              |
| Codex — Plan mode                          | its interactive choices selector (`request_user_input`) |
| Codex — Default mode, or any other harness | none — use the text fallback                            |

**Text fallback:** print the question, then a **numbered list** of options, and ask me to reply with a number.

Rules that hold in every CLI:

- MUST NOT call a question tool that is not available in the current CLI. If you are unsure whether one exists, use the text fallback — it always works.
- **MUST NOT answer your own question.** Never assume a default, infer my preference, or continue past an unanswered question. If the tool is missing or the call fails, fall back to text and wait for my reply. A plan built on decisions you invented on my behalf is worse than no plan.

For each question, regardless of the mechanism:

- Provide the concrete options you see for that decision.
- Put your recommended option **first** and append " (Recommended)" to its label.
- Give a one-line reasoning/trade-off for each option.
- Do NOT add "Other" or catch-all options — the interactive tool already appends a "Type your own answer" escape hatch, and in the text fallback I can always type my own answer.
- Before asking, write 1-3 sentences of context: what branch of the design tree we're on, why it matters, and what depends on it.
- Allow multiple selections only when several options can legitimately be combined (e.g. selecting which folders are in scope). With the interactive tool use its multi-select option; in the text fallback say explicitly that I may pick more than one number.

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
   - The plan MUST follow **Plan Structure** below — every section, every time.
   - Ask in which format I want the plan (console, markdown, or another format), following **Asking Questions** above. The format controls how the plan is _rendered_, never which sections it contains. A console plan is not an abridged plan.
4. Ask whether to save the plan to a file.
   - Ask following **Asking Questions** above. Put the default save option **first**: save to `artifacts/{ticket}/plan.md`, where `{ticket}` is the ticket number (e.g. `artifacts/PROJ-1234/plan.md`).
   - If no ticket number is known, ask for it, or fall back to a short kebab-case slug derived from the plan's title.
   - If I decline, keep the plan in the console only and do not write any file.
   - When saving, create the `artifacts/{ticket}/` directory if it does not exist.
5. If the project is growing in scope and complexity, then provide insights on how we can split it into different smaller projects.
6. Explain the requirements to be handled by an AI Agent or a JR Developer

## Plan Structure

The plan MUST follow `references/plan-template.md`: the title, then all six sections in order, every time, formatted by its Formatting Rules so a person can read it.

### Before presenting the plan

Verify the title, the `Planned by` line and every one of the six sections are present and populated, that sections 3, 4, and 5 are specific rather than placeholders, that decisions are numbered continuously, that every manual test step has an Expect, and that every list item sits on its own line. If any is missing or vague, fix it **before** showing me the plan — do not present a partial plan and offer to fill in the rest afterwards.

## Notes

A developer will likely work on this plan. If you have any suggestions or comments that can help with the flow or AI implementation, then give them.
