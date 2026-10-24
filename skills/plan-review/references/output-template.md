# Output Template

```
## Plan Review

### Feedback

1. [Blocker] [Staff Engineer] <problem and fix>
2. [Should-fix] [Software Architect] <problem and fix>
3. [Nit] [Staff Engineer] <problem and fix>

### Readiness Verdict

<Ready | Ready with changes | Not ready>, <one-line rationale naming the counts>
```

Example:

```
1. [Blocker] [Staff Engineer] The plan says every user must send an account ID, but the ticket asks for it only from guests. Members should default to their own account. Make it required for guests only and keep the existing 403 for another account.
2. [Should-fix] [Software Architect] A nearby gold clinic for service A can hide silver clinics needed for service B. Decide whether that is intended and add a mixed-service test.
3. [Nit] [Staff Engineer] Slice 3 and slice 4 use different names for the same endpoint. Pick one.

### Readiness Verdict

Not ready, 1 blocker and 1 should-fix.
```
