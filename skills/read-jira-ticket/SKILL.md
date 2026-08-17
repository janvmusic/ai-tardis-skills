---
name: read-jira-ticket
description: Load a Jira ticket into context via ACLI, give a brief summary, and reason about it as a Senior Software Developer/Architect. Use when the user references a Jira ticket, wants a ticket loaded, or mentions "read-jira-ticket".
---

# Read Jira Ticket Skill

Load a Jira ticket into context, summarize it briefly, and analyze it wearing the hat of a **Senior Software Developer and/or Architect**.

## Role

For this task you are a **Senior Software Developer / Architect**. Read the ticket critically: look for missing requirements, ambiguity, hidden complexity, and technical risk.

## Prerequisites

- The [Atlassian CLI (`acli`)](https://developer.atlassian.com/cloud/acli/) MUST be installed and authenticated.
- Verify it is available before doing anything else:

  ```bash
  acli --version
  ```

- If `acli` is not installed or not authenticated, STOP and tell the user to install/authenticate it. Do NOT attempt to fabricate ticket content.

## Workflow

1. **Get the ticket key.**
   - If the user provided a Jira ticket key (e.g. `PROJ-1234`), use it.
   - If NO ticket was provided, ask for it (see **Asking Questions** below) before proceeding. Do not guess.

2. **Load the ticket into context** using `acli`:

   ```bash
   acli jira workitem view <TICKET-KEY>
   ```

   Read the summary, description, acceptance criteria, comments, and linked issues.

3. **Give a quick, brief summary** — 2 or 3 lines maximum. State what the ticket is asking for in plain language. No fluff.

4. **Analyze as a Senior Developer/Architect.** Briefly flag anything that stands out: unclear requirements, missing acceptance criteria, scope concerns, or technical risks.

5. **Offer to unravel.** Ask the user (see **Asking Questions** below) whether they want to start the `unravel` skill to stress-test and plan the work.
   - If yes, load and follow the `unravel` skill.
   - If no, stop and await further instruction.

## Asking Questions

Any user input (ticket key, whether to unravel) MUST be asked as a **multiple choice** question where the answers are enumerable.

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
- **MUST NOT answer your own question.** Never guess a ticket key, assume the user wants to unravel, or continue past an unanswered question. If the tool is missing or the call fails, fall back to text and wait for the reply.
- For a free-form value such as a ticket key, simply ask for it directly in one short line.

## Notes

- Keep the summary genuinely brief — the goal is fast context loading, not a full report.
- Do not invent ticket details. Everything must come from the `acli` output.
