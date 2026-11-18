---
name: ticket-writer
description: Write Jira ticket descriptions in the Summary plus Acceptance Criteria format. Use when the user asks to write, draft or rewrite a ticket, story or task description.
disable-model-invocation: true
---

# Ticket Writer

Produce a clean Jira description with exactly two sections: Summary and AC.

## Summary

One short paragraph. State what changes, where (service, endpoint, component) and why or which upstream tickets it depends on. Reference related tickets by key. No background essays.

## AC

A flat list. Each item is one testable statement. Cover, in this order when relevant:

a. Primary behavior: inputs accepted, outputs returned, filtering or transformation rules.
b. Conditional behavior: what happens when an optional input is present.
c. Backward compatibility: what stays unchanged when the input is missing or empty.
d. Error cases: status codes for invalid values or types (for example 422).
e. Reuse constraints: existing logic or module that must be reused, no duplicated rules.
f. Deliverables: tests (request specs, unit specs) and docs (Swagger, README).

## Rules

- Concrete values, field names, endpoints and enum values in code formatting.
- One behavior per AC. No implementation steps, no vague wording like "works correctly".
- No headers beyond Summary and AC, no tables, no filler sections.
- Title format when asked for one: `<number>. <Component>: <verb phrase>`.
- Create or update via acli when the user asks: `acli jira workitem create` or `acli jira workitem edit`.
- Show the draft first when the scope is ambiguous; ask one blocking question only if needed.

## Example

Summary
Make core-service-api `POST /hospitals/search` honor `eligible_lanes` (the lanes returned by TEC-9887 for the selected patient factors) and return each COE's lanes for the Bundle / P4P badges (TEC-9872).

AC
- `POST /hospitals/search` accepts optional `eligible_lanes` (array of `bundle` / `p4p`).
- `["p4p"]` returns only COEs that are P4P-capable for at least one searched `offered_procedure_ids`; any list containing `bundle` does not narrow.
- When `eligible_lanes` is sent, each hospital includes `lanes` = lanes it supports ∩ eligible lanes.
- Missing or empty `eligible_lanes`: response unchanged.
- 422 for unknown lane values or a non-array value.
- Reuses the `EligibleLanesNarrowing` logic from `offered_procedures/:id/hospitals`; no duplicated lane rules.
- Request specs plus Swagger docs added.
