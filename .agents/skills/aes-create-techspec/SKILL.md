---
name: aes-create-techspec
description: Creates a Technical Specification plus its companion test contract (_tests.md) and its TechSpec-scope diagrams (diagrams/geral.banco.md, geral.classe.md, geral.sequencia.md, and conditionally geral.estado.md and spec-<slug>.excalidraw, via aes-create-diagram-techspec) by translating PRD business requirements into implementation designs through interactive technical clarification. Use when a PRD exists and needs a technical plan, when technical architecture decisions need documentation, or when a feature needs its exhaustive test-case catalog. Do not use for PRD creation, task breakdown, or direct code implementation.
---

# Create TechSpec

Translate business requirements into a detailed technical specification and its companion test contract.

<HARD-GATE>
- Explore before designing: every TechSpec MUST be informed by the existing architecture.
- Questions before writing: the user MUST shape the design by answering technical clarification questions — for every TechSpec, however simple. "Simple" changes are where unexamined architecture assumptions cause the most integration failures; brief review is fine, skipped review is not.
- Decide, then write: once the questions are answered and the ADRs are recorded, write the files directly. The user reviews the generated files and requests changes afterward — no draft-approval loops.
</HARD-GATE>

## Full Scope, One Design

Design for the complete PRD scope in this single TechSpec. Agents run long and `aes-create-tasks` decomposes the work later, so design size is never a reason to trim scope or stage the design into phases.

Design minimalism still applies — to the design, never to the scope: include no component, interface, or abstraction the design does not strictly need, and prefer adding a file to an existing package over proposing new packages or directories.

## Asking Questions

Ask every question through the runtime's dedicated interactive question tool — the mechanism that presents a question and pauses execution until the user responds. If the runtime has no such tool, present the question as the complete message and stop generating; never answer a question on the user's behalf.

- One question per message: exactly one question mark, then stop; follow-ups go in the next message, after the user answers.
- Lead with a recommendation: state which option you would pick and why in one line, so the user reacts to a position instead of facing a blank menu.
- Multiple-choice whenever the options can be predetermined, with your recommendation first and a fallback option ("D) Other — describe").
- Never spend a question on what the codebase can answer: explore first; user answers are for genuine trade-offs — priorities, risk appetite, and the product intent behind technical choices.

## Required Inputs

- Feature name identifying the `.aes/tasks/<name>/` directory.
- Optional: existing `_prd.md` and `_user_stories.md` as primary input.
- Optional: existing `_techspec.md` for update mode.

## Workflow

Track each step as a task in the runtime's task tracker when one is available, and complete the steps in order.

0. Confirm the project root.
   - The working directory must be the project root — the directory containing `AGENTS.md`, `CLAUDE.md`, or `.cursorrules` (in a workspace with subfolders like `backend/`/`frontend/`, these live one level above, never inside them). If the current directory isn't that root (e.g. the terminal opened inside `backend/`), locate it and change into it before touching `.aes/`.
   - Only when no such marker file exists anywhere above, fall back to the directory that already contains `.aes/tasks/`; only when neither signal exists, treat the current directory as root.

1. Gather context.
   - Read `_prd.md` and `_user_stories.md` from `.aes/tasks/<name>/` as the primary input. If no PRD exists, ask the user for a description of what needs technical specification.
   - Read existing ADRs from `.aes/tasks/<name>/adrs/` (create the directory if missing) to understand decisions already made.
   - Spawn an Agent tool call to explore the codebase for architecture patterns, existing components, dependencies, and technology stack.
   - If `_techspec.md` already exists, read it and operate in update mode.

2. Grill the design.
   - Focus on HOW to implement, WHERE components live, and WHICH technologies to use. Map the load-bearing technical decisions into a decision tree — architecture approach and component boundaries, data models and storage, API design and integration points, testing strategy and performance requirements — and walk it branch by branch, resolving dependencies between decisions one at a time.
   - Chase vague answers until each branch is concrete; a load-bearing decision left fuzzy resurfaces as an integration failure.
   - Keep grilling until every branch that shapes the design is resolved or explicitly parked — the question count is an output of the tree, not a budget.

3. Record ADRs for significant technical decisions.
   - For each significant decision (architecture pattern, technology choice, data model approach): read `references/adr-template.md`, determine the next number from the files in `adrs/`, fill the template (chosen design as Decisão, rejected alternatives as Alternativas Consideradas, trade-offs as Consequências; Status "Aceita", Date today), and write `adrs/adr-NNN.md` (zero-padded 3-digit sequential number).
   - Even simple features get at least one ADR documenting the primary technical approach chosen and the alternatives rejected.

4. Write the TechSpec.
   - Read `references/techspec-template.md` and fill every applicable section; the template carries the per-section rules.
   - Map every PRD goal and every story in `_user_stories.md` to a technical component; reference PRD sections by name without duplicating business context.
   - Interfaces Principais must show the primary type other components depend on, in the project's primary language.
   - List every ADR in the Registro de Decisões Arquiteturais section; if step 3 produced none, go back and create at least one first.
   - Prefer active voice and definite, specific language; every sentence earns its place. Language: Portuguese (Brazil).
   - Self-check before writing the file: no PRD goal or user story left without a mapped technical component, no interface referenced elsewhere in the document without a full definition in Interfaces Principais, no significant design decision left without a backing ADR.
   - Write `.aes/tasks/<name>/_techspec.md`.

5. Write the test contract.
   - Read `references/tests-template.md` and write `.aes/tasks/<name>/_tests.md`.
   - Derive unit cases from every component and interface in the TechSpec, including every error path; integration cases from every component boundary and external integration; end-to-end cases from every user journey in `_user_stories.md`.
   - Done when the coverage matrix satisfies the template's Coverage Demands and every case meets its Case-Writing Rules.

6. Generate technical diagrams.
   - Automatically invoke `aes-create-diagram-techspec` for the same `<name>` — no separate user request needed, this is part of finishing a TechSpec.
   - It reads the `_techspec.md` just written and produces `.aes/tasks/<name>/diagrams/geral.banco.md`, `geral.classe.md`, and `geral.sequencia.md`, plus `geral.estado.md` if the TechSpec (or PRD) describes a named-state lifecycle, and `spec-<name>.excalidraw` if it doesn't already exist (e.g. from `aes-create-prd`'s board).
   - If it fails or skips a diagram for missing source data, note that in the handoff — never block the TechSpec handoff on the diagrams.

7. Hand off.
   - Confirm all file paths to the user (TechSpec, test contract, and the generated diagrams) and invite change requests directly on the generated files.
   - Point to `aes-create-tasks` as the next step, and note that once tasks exist, `devmentor-dados` generates the remaining diagrams (atividade, grafo de dependência, rastreabilidade ADR→tarefa) that have no source before that.

## Error Handling

- PRD missing: proceed with user-provided context and note the absence in the Resumo Executivo.
- `_user_stories.md` missing: derive journeys from the PRD's User Stories section and note the coverage gap in `_tests.md`.
- Conflicting architectural patterns in the codebase: document both and recommend one with rationale.
- Target directory missing: create it.
- Update mode: preserve sections the user has not asked to change, and mirror any behavior or interface change into `_tests.md` so the contract stays in sync. Re-run `aes-create-diagram-techspec` in update mode too, so the diagrams reflect the revised TechSpec.
- `aes-create-diagram-techspec` fails: report the failure in the handoff and proceed — the TechSpec and test contract are still complete and usable without the diagrams.
