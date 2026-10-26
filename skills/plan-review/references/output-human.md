# Human Output Template

For a human reader: verdict first, points grouped by level, each point with a title and two labeled lines. Number the points continuously across the groups so a reader can say "do 2 and 4".

## Wording

1. **Title:** 8 words or fewer, with the plan location in parentheses and the persona that raised it after a middle dot, for example `(Decision 20) · Software Architect`.
2. **Problem:** one sentence saying who sees what go wrong, for example "CNs see no COEs on every cancer episode".
3. **Fix:** one sentence starting with a verb. When several points were merged, name every distinct fix in this sentence.
4. **Consequences:** state them in the sentence. Do not point at another decision to explain them.
5. **Contradictions:** quote the conflicting plan text so the reader does not have to look up both places.

## Shape

```markdown
## Plan Review

Reviewed by: {model name, e.g. "Claude" or "Codex"}

### Verdict

**<Ready | Ready with changes | Not ready>**: <one-line rationale naming the counts>

**Fix first:** <point numbers, 2 or 3 at most>

### Blockers

#### 1. <short title> (<plan location>) · <Staff Engineer | Software Architect>

- **Problem:** <who sees what go wrong>
- **Fix:** <verb-first fix>

### Should-fix

#### 2. <short title> (<plan location>) · <Staff Engineer | Software Architect>

- **Problem:** <who sees what go wrong>
- **Fix:** <verb-first fix>

### Nits

3. **<short title> (<plan location>) · <Staff Engineer | Software Architect>.** <problem and fix in one or two sentences>
```

Omit the `Fix first` line when there is only one point or none.

## Example

```markdown
### Verdict

**Not ready**: 1 blocker, 1 should-fix and 1 nit.

**Fix first:** 1 and 2.

### Blockers

#### 1. Account ID rule contradicts the ticket (Decision 4) · Staff Engineer

- **Problem:** The plan says "every user must send an account ID", but the ticket asks for it only from guests.
- **Fix:** Require it for guests only and keep the existing 403 for another account.

### Should-fix

#### 2. Nearby gold clinics can hide needed silver clinics (Slice 2, step 3) · Software Architect

- **Problem:** Search can hide the silver clinics a patient needs for service B behind a nearby gold clinic for service A.
- **Fix:** Decide whether that is intended and add a mixed-service test.

### Nits

3. **Endpoint named two ways (Slices 3 and 4) · Staff Engineer.** The two slices use different names for the same endpoint. Pick one.
```
