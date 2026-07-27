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
   - If NO ticket was provided, ask for it using the `question` tool before proceeding. Do not guess.

2. **Load the ticket into context** using `acli`:

   ```bash
   acli jira workitem view <TICKET-KEY>
   ```

   Read the summary, description, acceptance criteria, comments, and linked issues.

3. **Give a quick, brief summary** — 2 or 3 lines maximum. State what the ticket is asking for in plain language. No fluff.

4. **Analyze as a Senior Developer/Architect.** Briefly flag anything that stands out: unclear requirements, missing acceptance criteria, scope concerns, or technical risks.

5. **Offer to unravel.** Ask the user (via the `question` tool) whether they want to start the `unravel` skill to stress-test and plan the work.
   - If yes, load and follow the `unravel` skill.
   - If no, stop and await further instruction.

## Asking Questions

Always use the `question` tool for user input (ticket key, whether to unravel), never plain prose, so the user can answer with a single click.

## Notes

- Keep the summary genuinely brief — the goal is fast context loading, not a full report.
- Do not invent ticket details. Everything must come from the `acli` output.
