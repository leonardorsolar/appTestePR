---
name: aes-security-harden
description: Reads .aes/tasks/<slug>/_security_audit.md, prioritizes findings into P0-P3, implements P0 fixes immediately, and tracks P1-P3 as issues; generates .aes/tasks/<slug>/_harden_plan.md. Use after aes-security-audit produces _security_audit.md with findings, to prioritize, fix P0 issues immediately, and track P1-P3 as issues. Do not use before aes-security-audit has produced _security_audit.md, and do not use for general bug fixing unrelated to a security audit finding.
---

# Security Hardening

Turn `_security_audit.md` findings into a prioritized fix plan, implement the fixes that can't wait, and track the rest.

This project runs a static-only security cycle: `_security_audit.md` is the only source report. There is no dynamic pentest report and no AI threat-model report to correlate against — priority is decided from the static audit alone.

## Required Inputs

- Feature name identifying `.aes/tasks/<slug>/`.
- `.aes/tasks/<slug>/_security_audit.md` produced by `aes-security-audit`, with at least one finding.

## Workflow

0. Confirm the project root.
   - The working directory must be the project root — the directory containing `AGENTS.md`, `CLAUDE.md`, or `.cursorrules` (in a workspace with subfolders like `backend/`/`frontend/`, these live one level above, never inside them). If the current directory isn't that root (e.g. the terminal opened inside `backend/`), locate it and change into it before touching `.aes/`.
   - Only when no such marker file exists anywhere above, fall back to the directory that already contains `.aes/tasks/`; only when neither signal exists, treat the current directory as root.

1. Aggregate findings.
   - Derive the slug from the feature name; the target directory is `.aes/tasks/<slug>/`.
   - Read `.aes/tasks/<slug>/_security_audit.md`. This is the sole source of findings.
   - If the file does not exist, stop and report that `aes-security-audit` must run first.
   - Build a finding list ordered by severity (Critical, High, Medium, Low/Informational), noting for each whether the audit attached a functional PoC.

2. Prioritize.
   - Apply this triage logic to every finding:

     | Priority | Condition |
     |---|---|
     | **P0 — Fix now** | Critical or High severity **with** a confirmed PoC in the static audit |
     | **P1 — Fix this sprint** | Critical or High severity **without** a documented PoC (tracked as accepted risk until fixed) |
     | **P2 — Fix next sprint** | Medium severity, any origin |
     | **P3 — Backlog** | Low severity or Informational |

3. Generate `_harden_plan.md`.
   - Create `.aes/tasks/<slug>/_harden_plan.md` using the template in `reference/plan-template.md`.
   - Fill in every P0/P1 fix with the before/after code and a regression test; abbreviate P2 to description + approach; list P3 only.
   - If any P0 fix requires a new architectural decision (not just a local code change — e.g. switching an auth strategy, introducing a new trust boundary, changing how secrets are stored), record it as an ADR: read `../../development/aes-create-prd/references/adr-template.md`, determine the next number from the files already in `.aes/tasks/<slug>/adrs/`, fill the template, and write `.aes/tasks/<slug>/adrs/adr-NNN.md` (zero-padded 3-digit number). A P0 fix that is a straightforward code patch does not need an ADR.

4. Implement P0 fixes directly.
   - For each P0 finding: edit the affected file, write or update the corresponding test, and verify it passes with the project's real test command.
   - Add a code comment referencing the finding, e.g. `// Security: CWE-89 — use parameterized query (hardened in {issue})`.
   - Keep security patches surgical — do not bundle them with feature changes.

5. Schedule P1–P3 fixes as issues.
   - For each P1 and P2 finding, create a GitHub issue via `gh issue create` linking back to `_harden_plan.md` and `_security_audit.md`.
   - P3 findings are listed in `_harden_plan.md` only; create issues for them only if the user asks.

6. Update CLAUDE.md learnings.
   - Append one specific, actionable lesson per confirmed P0/P1 finding under `## Learnings`, e.g. "Always validate JWT algorithm claim — alg:none bypass found in {issue}".

7. Handoff.
   - Report to the user the path of the generated `_harden_plan.md`, how many P0 findings were fixed (with their regression tests), and how many P1–P3 findings were turned into tracked issues (with links, if `gh issue create` succeeded).
   - If any ADR was written in step 3, point to its path in the same report.

8. Verify and report next step.
   - Confirm the Verification Checklist in `_harden_plan.md` (see `reference/plan-template.md`) is satisfied: all new regression tests pass, and `aes-security-audit` has been re-run to confirm `_security_audit.md`'s static findings are resolved.
   - Once P0 fixes are verified, state that the flow proceeds directly to `aes-deploy-plan` — there is no re-pentest step in this cycle.

## Critical Rules

- Do not read or reference a pentest report or an AI threat-model report — they do not exist in this workflow.
- Do not implement P1–P3 fixes inline in this run; P0 only gets immediate code changes. P1–P3 become tracked issues.
- Do not bundle security patches with unrelated feature changes.
- Do not mark a finding resolved in `_harden_plan.md` without a passing regression test.
- Do not write an ADR for a P0 fix that is a straightforward code patch with no new architectural decision behind it.

## Error Handling

- If `.aes/tasks/<slug>/_security_audit.md` does not exist, stop and report that `aes-security-audit` must run first.
- If `_security_audit.md` reports zero findings, report that hardening is not needed and the flow proceeds directly to `aes-deploy-plan`.
- If a P0 fix's test cannot pass after reasonable effort, document the blocker in `_harden_plan.md` and downgrade the item to P1 with an explanation rather than leaving it in an unverified P0 state.
- If `gh issue create` fails (no remote, no auth), note the failure and list the P1/P2/P3 findings directly in the handoff instead.
