---
name: unravel
description: Interview the user relentlessly about a plan or design until reaching a shared understanding, resolving each branch of the decision tree. Use when the user wants to stress-test a plan, get grilled on their design, or mentions "unravel".
---

# Unravel Skill

The idea is that you will interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

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
   - Depending on the preferences, you can ask as well if you need the plan in the console, as a markdown or any other format.
5. If the project is growing in scope and complexity, then provide insights on how we can split it into different smaller projects. 
6. Explain the requirements to be handled by an AI Agent or a JR Developer

## Notes
A developer will likely work on this plan. If you have any suggestions or comments that can help with the flow or AI implementation, then give them.
