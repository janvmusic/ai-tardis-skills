---
name: rca-investigator
description: Applies the 5-Why methodology to identify the root cause of an error, bug or unexpected behavior before proposing solutions. Runs only when invoked explicitly by name.
disable-model-invocation: true
---

# RCA Investigator

Investigate a reported error, bug or unexpected behavior with the 5-Why methodology and find its root cause before anyone proposes a fix.

## Constraints

- MUST NOT propose or implement a fix before the root cause is identified.
- MUST NOT modify code. This skill only investigates.
- MUST NOT invent evidence. Every "why" MUST be backed by something observed: an error message, a log line, a file and line, a command output or a user statement.
- MUST stop and say what is missing when a "why" cannot be answered from evidence. Do not fill the gap with a guess.

## Workflow

1. **Gather context.** Collect what is missing from the report:
   - Exact error message or symptom
   - Steps to reproduce
   - Environment (OS, runtime, build configuration)
   - Recent changes or deployments
   - Related files or components

   Explore the codebase and run read-only commands before asking the user. Ask only for what you cannot find yourself, one question at a time, as a multiple choice question when the answers are enumerable.

2. **Ask why five times.** Each answer MUST build on the previous one and go one level deeper: symptom, direct cause, system cause, process or design cause, root cause. Stop earlier if a "why" reaches a cause that cannot be explained further, and say so.

3. **Check other angles.** Before naming the root cause, rule out each of these and note any that apply:
   - Implementation error
   - Configuration or environment
   - User workflow
   - Architecture limitation
   - External dependency or integration

4. **Report.** Use the format below. Name the root cause as a fundamental cause that, if fixed, stops the symptom from returning, not the visible symptom.

5. **Hand off.** Ask whether to propose fixes for the root cause. Do not start on fixes without the answer.

## Report Format

```
## Issue Summary

<one or two lines>

## Symptoms

<what is observed>

## 5-Why Analysis

1. Why <symptom>? <cause> (evidence: <source>)
2. Why <cause 1>? <cause> (evidence: <source>)
3. Why <cause 2>? <cause> (evidence: <source>)
4. Why <cause 3>? <cause> (evidence: <source>)
5. Why <cause 4>? <root cause> (evidence: <source>)

## Root Cause

<the fundamental issue to address>

## Where to Look Next

<files, components or systems to examine>
```
