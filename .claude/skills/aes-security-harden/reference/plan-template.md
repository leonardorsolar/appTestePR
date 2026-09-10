# _harden_plan.md Template

Reference material for `aes-security-harden`. Create `.aes/tasks/<slug>/_harden_plan.md` following this structure.

```markdown
# Hardening Plan — {issue}

**Generated**: {date}
**Source report**: _security_audit.md
**Total findings**: {X} (Critical: X | High: X | Medium: X | Low: X)

## Fix Summary

| Priority | Finding | CWE | Affected File | Effort |
|---|---|---|---|---|
| P0 | SQL Injection in /api/users | CWE-89 | src/routes/users.ts | 1h |
| P0 | Auth bypass via JWT alg:none | CWE-347 | src/auth/verify.ts | 2h |
| P1 | Missing CSRF protection | CWE-352 | src/middleware/ | 3h |
...

## P0 Fixes — Implement Immediately

### Fix 1: {finding title}

**Finding**: {brief description}
**File**: {path}
**Root cause**: {why this exists}

**Before** (vulnerable):
```{language}
{vulnerable code snippet}
```

**After** (hardened):
```{language}
{fixed code snippet}
```

**Regression test**:
```{language}
{test that proves the fix works}
```

{Repeat for each P0 finding}

## P1 Fixes — This Sprint

{Same format as P0}

## P2 Fixes — Next Sprint

{Abbreviated format — description + recommended approach}

## P3 Backlog

{List only — link to GitHub issues if applicable}

## Verification Checklist

After implementing all P0/P1 fixes:
- [ ] All new regression tests pass
- [ ] Re-run aes-security-audit — confirm static findings resolved
- [ ] Update CLAUDE.md with lessons learned (e.g., "Always use parameterized
      queries — raw string interpolation caused SQLi in {issue}")
```

## Notes

- There is no Correlation section in this template — the static audit is the
  only source report, so there is no dynamic-testing data to cross-reference
  against.
- P0/P1 use the full before/after/regression-test format; P2 is abbreviated
  to description + approach; P3 is a list only.
