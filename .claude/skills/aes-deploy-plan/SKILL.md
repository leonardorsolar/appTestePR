---
name: aes-deploy-plan
description: Produces a deployment strategy (_deploy_plan.md) for an already-implemented and reviewed feature — pre-deployment checklist, rollout strategy, database migration plan, rollback playbook, post-deployment verification, and communication plan — saved under .aes/tasks/<workflow>/. SDD-cycle equivalent of the sdlc/planning cycle's /deploy-plan command (09_DEPLOY_PLAN.md). Use when a task suite has passed QA/System Testing and code review and needs a concrete rollout/rollback plan before shipping. Do not use for writing the feature itself, for code review (use pr-review), or for QA execution.
---

# Deploy Plan

Turns an implemented, tested, and reviewed feature into a concrete deployment strategy. This is the SDD-cycle (`.aes/tasks/<workflow>/`) counterpart of the `sdlc/planning` cycle's `/deploy-plan` command — same content contract, different home directory and file name (`_deploy_plan.md` instead of `09_DEPLOY_PLAN.md`).

<HARD-GATE>
- Deploy plan comes last: `_deploy_plan.md` MUST NOT be written until `_tasks.md`'s tasks are complete, QA (System Testing) has passed, and code review is approved. If any of these are missing, stop and tell the engineer what to finish first — never draft a rollout plan against unfinished or unreviewed work.
- No code: this skill never edits implementation files. It reads the codebase and existing `.aes/tasks/<workflow>/` artifacts read-only and writes only `_deploy_plan.md`.
- Concrete, not generic: rollout strategy, rollback triggers, and verification steps must be specific to this feature (real thresholds, real endpoints, real migration order) — never a placeholder like "deploy to production" or "revert the deploy".
</HARD-GATE>

## Directory & Files

```
.aes/tasks/<workflow>/
  _techspec.md / spec.md   (existing, input — infra & non-functional requirements)
  _plan.md                 (existing, input — Files that change)
  _tasks.md, task_NN.md    (existing, input — must be complete)
  _deploy_plan.md          (this skill's output)
```

`<workflow>` defaults to `servidor-backend` when the user doesn't name a feature/workflow explicitly, same convention as `aes-plan-build`/`aes-create-tasks`.

## Required Inputs

- Feature name or workflow slug (default: `servidor-backend`).
- `.aes/tasks/<workflow>/` with a complete `_tasks.md` graph (all tasks `completed`).
- `_techspec.md`/`spec.md` for infrastructure context and non-functional requirements.
- Confirmation that QA (System Testing) passed and code review is approved — read `reviews`/`qa` items in the workflow directory if present, otherwise ask the engineer to confirm.

## Workflow

0. **Confirm the project root.** Same convention as `aes-plan-build`: the directory containing `AGENTS.md`, `CLAUDE.md`, or `.cursorrules`. Locate and change into it before touching `.aes/`.

1. **Determine the workflow directory.** Derive `<workflow>` from the feature name given, or default to `servidor-backend`. Target directory: `.aes/tasks/<workflow>/`.

2. **Verify pre-conditions.** All of the following must hold before drafting anything:
   - `_tasks.md`'s tasks are all `completed` (check task frontmatter / `task_files` status).
   - QA/System Testing items exist and are approved, if the workflow has a QA folder.
   - Code review items are approved, if the workflow has a `reviews/` folder.
   - If any pre-condition fails, stop and name exactly what is missing — do not draft `_deploy_plan.md` against incomplete work.

3. **Load context.**
   - `_techspec.md`/`spec.md` — infrastructure context, non-functional requirements (SLAs, data-consistency constraints).
   - `_plan.md` — the approved **Files that change**, to identify migration-bearing files (schema, config, feature flags).
   - Read-only codebase scan for existing CI checks, health-check endpoints, and monitoring hooks to reference by name (not invented).

4. **Draft the Pre-Deployment Checklist.**
   - [ ] All tests pass on CI
   - [ ] Code review approved
   - [ ] QA / System Testing passed
   - [ ] Database migrations tested (if any)
   - [ ] Environment variables documented and configured
   - [ ] Feature flags configured (if applicable)
   - [ ] Monitoring/alerting updated
   - [ ] Runbook/playbook updated
   - [ ] Stakeholders notified
   - **Cost impact** (only if the change provisions cloud resources): note the expected monthly delta if known, or `N/A — non-cloud change` / `Skipped — {reason}` otherwise. This cycle has no dedicated cost-estimate artifact to embed — state the figure inline with its source (ticket, spreadsheet, prior estimate).

5. **Choose and detail the Rollout Strategy.** Pick one and justify the choice against this specific change's risk profile:

   | Strategy | When to Use |
   |----------|--------------|
   | **Big Bang** | Low-risk, simple changes |
   | **Feature Flag** | High-risk, needs gradual rollout |
   | **Canary** | Performance-sensitive, needs production validation |
   | **Blue-Green** | Zero-downtime required |
   | **Rolling** | Stateless services, gradual replacement |

   Include: rollout percentage stages (e.g. 1% → 10% → 50% → 100%), duration at each stage, success criteria to advance, monitoring signals to watch at each stage.

6. **Database Migration Plan** (if `_plan.md`'s Files that change touch schema/migrations):
   - Migration scripts and their order.
   - Backwards compatibility during rollout (old and new code paths coexisting).
   - Data backfill strategy, if needed.
   - Estimated migration duration.
   - Rollback migration scripts.
   - Omit this section entirely (do not leave a stub) if no migration is involved.

7. **Rollback Playbook**, with concrete triggers and steps — never "revert the deploy" as a stand-in:

   ```markdown
   ## Rollback Procedure

   ### Triggers (when to rollback)
   - Error rate exceeds {threshold}
   - Latency exceeds {threshold}
   - {specific business metric} degrades by {amount}

   ### Steps
   1. {step 1}
   2. {step 2}
   3. ...

   ### Verification
   - How to confirm rollback was successful
   - Data consistency checks after rollback

   ### Communication
   - Who to notify
   - Status page update template
   ```

8. **Post-Deployment Verification.** Smoke tests to run immediately after deploy, health-check endpoints to monitor, key metrics to watch for 24h, user-facing functionality to manually verify.

9. **Communication Plan.** Changelog entry draft, internal team notification, user-facing release notes (if applicable).

10. **Write `_deploy_plan.md`** to `.aes/tasks/<workflow>/_deploy_plan.md` with all sections above (`## Pre-Deployment Checklist`, `## Cost Impact` when applicable, `## Rollout Strategy`, `## Database Migration Plan` when applicable, `## Rollback Playbook`, `## Post-Deployment Verification`, `## Communication Plan`).

11. **Report.** Confirm the file was written, restate the chosen rollout strategy and rollback triggers in one line each, and suggest the next step (ship / monitor).

## Quality Gates

- Rollout strategy is specific to this change's risk profile, not a generic "deploy to production".
- Rollback playbook has concrete, numbered steps and measurable triggers.
- Success criteria at each rollout stage are measurable.
- Pre-deployment checklist references actual commands/tools/endpoints from this codebase, not placeholders.
- Database Migration Plan section is present only when the change actually touches migrations.

## Error Handling

- Any pre-condition from step 2 fails (tasks incomplete, QA not passed, review not approved): stop, name what's missing, do not write `_deploy_plan.md`.
- `_techspec.md`/`spec.md` missing: proceed with what `_plan.md` and the codebase scan provide, but flag the gap in the report — do not invent non-functional requirements.
- Change does not provision cloud resources: mark Cost Impact `N/A — non-cloud change` rather than omitting the line.
- Change does not touch migrations: omit the Database Migration Plan section entirely.
- Target directory does not exist: stop — a workflow directory with a completed `_tasks.md` is a pre-condition, not something this skill creates.
- `_deploy_plan.md` already exists: read it, confirm with the engineer whether to revise in place or treat this as a new deploy plan version, never overwrite silently.
