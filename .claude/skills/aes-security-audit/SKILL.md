---
name: aes-security-audit
description: Performs a static security audit of an implemented feature — STRIDE threat modeling, OWASP Top 10 checklist, dependency scanning, code-level review, business-logic review, and data privacy checklist — and generates .aes/tasks/<slug>/_security_audit.md. Use after a code review round (aes-review-round/aes-fix-reviews) is resolved and before aes-deploy-plan, to run a static security audit of the implemented feature. Do not use for dynamic/runtime pentesting against a live or staging environment, for AI/LLM-specific threat modeling, or as a substitute for aes-review-round's general code-quality review — this skill is security-focused and static-only.
---

# Security Audit (Static)

Perform a static security audit of an implemented feature and produce `.aes/tasks/<slug>/_security_audit.md`, the single source of findings that `aes-security-harden` consumes.

This project runs a static-only security cycle: no dynamic/staging pentest and no AI/LLM red-team phase. The **Business Logic Checklist** in step 3 exists specifically to compensate for the absence of a dynamic pentest — it forces manual verification of the classes of bug that runtime probing would otherwise catch.

## Required Inputs

- Feature name identifying `.aes/tasks/<slug>/`.
- A resolved code review round under `.aes/tasks/<slug>/reviews-NNN/` (produced by `aes-review-round`, closed out by `aes-fix-reviews`), with no issue left `pending`.

## Workflow

0. Confirm the project root.
   - The working directory must be the project root — the directory containing `AGENTS.md`, `CLAUDE.md`, or `.cursorrules` (in a workspace with subfolders like `backend/`/`frontend/`, these live one level above, never inside them). If the current directory isn't that root (e.g. the terminal opened inside `backend/`), locate it and change into it before touching `.aes/`.
   - Only when no such marker file exists anywhere above, fall back to the directory that already contains `.aes/tasks/`; only when neither signal exists, treat the current directory as root.

1. Verify pre-conditions.
   - Derive the slug from the feature name; the target directory is `.aes/tasks/<slug>/`.
   - Verify the directory exists. If it does not, stop and report the missing directory.
   - List `reviews-NNN/` subdirectories under `.aes/tasks/<slug>/`. Take the highest-numbered round.
     - If no review round exists, warn that no code review round was found and confirm with the user before proceeding — never silently skip this gate.
     - If a round exists, read every `issue_NNN.md` file's frontmatter `status`. If any issue is still `pending`, stop and report that the round must be resolved via `aes-fix-reviews` before running a security audit. Issues already `valid` or `invalid` do not block.
     - Treat any issue in that round that is security-relevant as already-known — do not re-flag it as a new finding in step 3; reference it by its issue file instead.
   - Read `.aes/tasks/<slug>/_techspec.md` for system design and the component/trust-boundary map.

2. Map components and boundaries.
   - From `_techspec.md`, list every component, service boundary, data store, and external integration touched by the feature.
   - If `_techspec.md` is missing, warn that boundary context is limited and derive the list from `git diff main...HEAD --name-only` instead.
   - This list drives the STRIDE table in step 3.

3. Perform the audit.
   - Read `reference/checklist.md` for the full STRIDE table template, OWASP Top 10 checklist, dependency audit commands, code-level review checklist, data privacy checklist, and the Business Logic Checklist.
   - Complete STRIDE threat modeling for every component/boundary identified in step 2.
   - Work through the OWASP Top 10 checklist against the implementation.
   - Run dependency scanners for every applicable ecosystem in the repo and record vulnerability counts by severity. Do not skip this — it must actually run, not be assumed.
   - Work through the code-level security review checklist (input validation, output encoding, resource-level authorization, rate limiting, secrets, parameterized queries, upload validation, error messages).
   - Work through the **Business Logic Checklist** (`reference/checklist.md`) — authorization by resource, rate limiting on sensitive endpoints, and state validation in multi-step flows.
   - Work through the data privacy checklist (PII handling, retention, consent, export/delete).
   - For every Critical or High finding, build a functional PoC (a request, script, or concrete repro steps) proving it is actually exploitable. A Critical/High finding without a working PoC must be downgraded or marked "needs verification" — never reported as confirmed.

4. Generate `_security_audit.md`.
   - Create `.aes/tasks/<slug>/_security_audit.md`.
   - Include the completed STRIDE table, OWASP checklist results, dependency audit results, code-level and business-logic checklist results, data privacy checklist results, and a Summary using the template in `reference/checklist.md`.
   - Assign a verdict: PASSED (zero findings), CONDITIONAL PASS (only Medium/Low findings), or FAILED (any unresolved Critical/High finding).

5. Handoff.
   - Report to the user the path of the generated `_security_audit.md`, the finding counts by severity, and the verdict.
   - If any findings exist, regardless of severity, state that `aes-security-harden` should run next to triage and fix them.
   - If the verdict is PASSED with zero findings, state that the flow proceeds directly to `aes-deploy-plan`.

## Critical Rules

- Every Critical/High finding must carry a functional PoC; never report one as confirmed without it.
- Do not perform dynamic/runtime exploitation against a live or staging environment — this skill is static-only.
- Do not modify source code. This is an audit-only skill; `aes-security-harden` owns remediation.
- Do not skip the dependency scan or leave the STRIDE table or OWASP checklist partially completed.
- Do not re-flag issues already recorded as security-relevant in a resolved `reviews-NNN/` round; reference them instead.

## Error Handling

- If `.aes/tasks/<slug>/` does not exist, stop and report the missing directory.
- If the latest review round has any issue still `status: pending`, stop and report that it must be resolved via `aes-fix-reviews` first.
- If no review round exists at all, warn and get explicit confirmation from the user before proceeding.
- If `_techspec.md` is missing, warn about limited boundary context but proceed using the diff to infer components.
- If dependency scanners are unavailable or fail to run, note the failure in the Summary and proceed with the rest of the audit — do not skip it silently.
