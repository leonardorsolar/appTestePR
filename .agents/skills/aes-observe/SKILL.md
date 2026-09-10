---
name: aes-observe
description: Defines the observability strategy (_observability.md) for an already-deployed feature — RED/USE key metrics, structured logging events, distributed tracing, alerting rules with actions, a dashboard specification, and SLI/SLO definitions — saved under .aes/tasks/<workflow>/. SDD-cycle equivalent of the sdlc/planning cycle's /observe command (10_OBSERVABILITY.md). Use after aes-deploy-plan's deploy plan exists and the feature is live, when the team needs concrete metrics/alerts/dashboards instead of "we'll monitor it". Do not use for writing the feature itself, for the deploy plan (use aes-deploy-plan), or for incident response.
---

# Observe

Turns a deployed feature into a concrete observability strategy. This is the SDD-cycle (`.aes/tasks/<workflow>/`) counterpart of the `sdlc/planning` cycle's `/observe` command — same content contract, different home directory and file name (`_observability.md` instead of `10_OBSERVABILITY.md`).

<HARD-GATE>
- Observability comes after deploy: `_observability.md` MUST NOT be written until `_deploy_plan.md` exists (aes-deploy-plan's output). If missing, stop and tell the engineer to run aes-deploy-plan first — alert thresholds and rollback triggers must line up with the actual rollout plan, not be invented independently.
- No code: this skill never edits implementation files. It reads `.aes/tasks/<workflow>/` artifacts and the codebase read-only and writes only `_observability.md`.
- Specific, not generic: metrics, alert thresholds, and log events must name this feature's actual endpoints/operations/business metric — never a bare template row left as `...`.
- Every alert traces back to an action: an alert with no runbook link or on-call action is not done.
</HARD-GATE>

## Directory & Files

```
.aes/tasks/<workflow>/
  _techspec.md / spec.md   (existing, input — components, SLAs)
  _deploy_plan.md          (existing, input — rollback triggers to wire alerts to)
  _observability.md        (this skill's output)
```

`<workflow>` defaults to `servidor-backend` when the user doesn't name a feature/workflow explicitly, same convention as `aes-plan-build`/`aes-deploy-plan`.

## Required Inputs

- Feature name or workflow slug (default: `servidor-backend`).
- `.aes/tasks/<workflow>/_deploy_plan.md` — required; its Rollback Playbook triggers are the anchor for this skill's alert rules.
- `_techspec.md`/`spec.md`, if present — system components and non-functional requirements/SLAs.

## Workflow

0. **Confirm the project root.** Same convention as `aes-deploy-plan`: the directory containing `AGENTS.md`, `CLAUDE.md`, or `.cursorrules`. Locate and change into it before touching `.aes/`.

1. **Determine the workflow directory.** Derive `<workflow>` from the feature name given, or default to `servidor-backend`. Target directory: `.aes/tasks/<workflow>/`.

2. **Verify pre-conditions.** `_deploy_plan.md` must exist. If missing, stop and tell the engineer to run aes-deploy-plan first.

3. **Load context.**
   - `_deploy_plan.md` — Rollback Playbook's triggers (error rate, latency, business-metric thresholds) — every one of these gets a matching alert here.
   - `_techspec.md`/`spec.md` — system components, SLAs.
   - Read-only codebase scan for the feature's actual endpoints/operations and any existing logging/metrics conventions, so metric and event names match reality instead of being invented.

4. **Define Key Metrics** using RED (Request-oriented, for services) and USE (Resource-oriented, for infra), plus Business Metrics:

   **RED:**
   | Metric | Description | Target | Alert Threshold |
   |--------|-------------|--------|-----------------|
   | Rate | Requests per second | ... | ... |
   | Errors | Error rate percentage | < N% | > N% for M minutes |
   | Duration | p50, p95, p99 latency | < Nms | p99 > Nms for M minutes |

   **USE:**
   | Resource | Utilization | Saturation | Errors |
   |----------|-------------|------------|--------|
   | CPU | ... | ... | ... |
   | Memory | ... | ... | ... |
   | Database connections | ... | ... | ... |

   **Business Metrics:** the metric `_deploy_plan.md`'s rollback trigger names (e.g. checkout completion rate), with baseline and alert threshold filled in — never left as `...`.

5. **Define Structured Logging events**, one row per success/failure path, `{feature}:{action}:{result}` naming:

   | Event | Level | Fields | When |
   |-------|-------|--------|------|
   | `feature:action:success` | INFO | ... | ... |
   | `feature:action:failure` | WARN | ... | ... |

   Principles: structured JSON, correlation IDs on all requests, no PII in log fields (or explicitly redacted), appropriate levels (not everything `ERROR`).

6. **Distributed Tracing**, only if the feature crosses service boundaries: span definitions for new operations, context propagation, trace sampling strategy. Omit this section entirely if the feature is single-service.

7. **Alerting Rules** — every row must have a clear action and, where the deploy plan defines a matching rollback trigger, an explicit link back to it:

   | Alert | Condition | Severity | Action |
   |-------|-----------|----------|--------|
   | High error rate | > N% errors for 5 min | P1 | Page on-call — matches `_deploy_plan.md` rollback trigger |
   | High latency | p99 > Nms for 10 min | P2 | Notify channel |

   Principles: alerts fire on symptoms not causes, no alert without an action (no alert fatigue), every alert description links a runbook.

8. **Dashboard Specification** — panels grouped in rows:

   ```markdown
   ## Dashboard: {feature-name}

   ### Row 1: Health Overview
   - Panel: Request rate (graph, 5m window)
   - Panel: Error rate (graph, 5m window)
   - Panel: Latency p50/p95/p99 (graph, 5m window)

   ### Row 2: Business Metrics
   - Panel: {metric} (graph/stat)

   ### Row 3: Infrastructure
   - Panel: CPU/Memory utilization
   - Panel: Database query latency
   ```

9. **SLI/SLO Definitions**, if the feature has explicit SLAs in `_techspec.md`/`spec.md`:

   | SLI | SLO | Measurement |
   |-----|-----|-------------|
   | Availability | 99.9% | Successful requests / total requests |
   | Latency | p99 < 500ms | Request duration histogram |

   Omit this section entirely if no SLA context exists — do not invent SLO numbers.

10. **Write `_observability.md`** to `.aes/tasks/<workflow>/_observability.md` with `## Key Metrics`, `## Structured Logging`, `## Distributed Tracing` (when applicable), `## Alerting Rules`, `## Dashboard Specification`, `## SLI/SLO` (when applicable).

11. **Report.** Confirm the file was written, restate the P1 alerts and their actions in one line, and note any `_deploy_plan.md` rollback trigger that still has no matching alert.

## Quality Gates

- Every new API endpoint/operation this feature adds has RED metrics defined.
- Every alert condition is specific (a number and a window), never a vague threshold.
- Every alert has an associated action; every `_deploy_plan.md` rollback trigger has a matching alert.
- Logging events cover both success and failure paths.
- No PII appears in log field definitions.
- Dashboard has at least health, business, and infrastructure rows.

## Error Handling

- `_deploy_plan.md` missing: stop, do not write `_observability.md` — ask the engineer to run aes-deploy-plan first.
- Feature is single-service: omit Distributed Tracing rather than leaving a stub section.
- No explicit SLA in `_techspec.md`/`spec.md`: omit SLI/SLO rather than inventing numbers.
- Target directory does not exist: stop — a workflow directory with `_deploy_plan.md` is a pre-condition, not something this skill creates.
- `_observability.md` already exists: read it, confirm with the engineer whether to revise in place or treat this as a new version, never overwrite silently.
