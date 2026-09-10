---
name: aes-create-prd
description: Creates a Product Requirements Document plus its companion user-story catalog (_user_stories.md) and an Excalidraw understanding board (diagrams/spec-<slug>.excalidraw, via aes-create-excalidraw) through interactive brainstorming with parallel codebase and web research. Use when starting a new feature or product, building a PRD, brainstorming requirements, or cataloging user stories and edge cases. Do not use for technical specifications, task breakdowns, or code implementation.
---

# Create PRD

Create a business-focused Product Requirements Document and its companion user-story catalog through structured brainstorming.

Both documents are written for the LLM agents that consume them downstream (`aes-create-techspec`, `aes-create-tasks`, review rounds). Their job is to supply business rules, domain behavior, and product intent. KPIs, success metrics, timelines, and rollout phases have no consumer in this pipeline — leave them out.

<HARD-GATE>
- Research before questions: every PRD MUST be enriched with codebase and market context.
- Questions before writing: the user MUST shape the PRD by answering clarifying questions — for every PRD, however simple. "Simple" features are where unexamined business assumptions cause the most rework; brief brainstorming is fine, skipped brainstorming is not.
- Decide, then write: once the questions are answered and the ADRs are recorded, write the files directly. The user reviews the generated files and requests changes afterward — no approach menus, no draft-approval loops.
</HARD-GATE>

## Full Scope, One PRD

Capture the complete scope the user wants in this single PRD, however large it grows. Agents run long and `aes-create-tasks` decomposes the work later, so document size is never a reason to trim, defer, or stage anything.

- A capability leaves the PRD only when the user decides against it — record that in Não-Objetivos (Fora de Escopo).
- YAGNI applies to invention: challenge features the user never asked for; keep every one they did.
- When the user adds scope mid-conversation, fold it in and keep going.

## Asking Questions

Ask every question through the runtime's dedicated interactive question tool — the mechanism that presents a question and pauses execution until the user responds. If the runtime has no such tool, present the question as the complete message and stop generating; never answer a question on the user's behalf.

- One question per message: exactly one question mark, then stop. A topic that needs more exploration gets its follow-up in the next message, after the user answers.
- Lead with a recommendation: state which option you would pick and why in one line, so the user reacts to a position instead of facing a blank menu.
- Multiple-choice whenever the options can be predetermined: labeled options (A, B, C) with your recommendation first, plus a fallback ("D) Other — describe"). Open-ended only when the answer space is genuinely unbounded.
- For features with many dimensions, ask about one dimension at a time ("Which aspect of team collaboration matters most first? A) Shared workspaces B) Real-time presence C) Permission controls D) Activity feeds").

## Business Focus

The PRD owns WHAT users need, WHY it provides value, and WHO the users are; HOW belongs to the TechSpec. When the feature name sounds technical ("webhook notifications", "CSV export", "API rate limiting"), translate it into the user-experience question behind it:

- WRONG: "Should we use WebSockets or polling for notifications?" (implementation)
- RIGHT: "Which events should trigger a notification to the user?" (user need)

## Required Inputs

- Feature name or product idea.
- Optional: existing `_idea.md` file as primary input for context.
- Optional: existing `_prd.md` file for update mode.

## Workflow

Track each step as a task in the runtime's task tracker when one is available, and complete the steps in order.

0. Confirm the project root.
   - The working directory must be the project root — the directory containing `AGENTS.md`, `CLAUDE.md`, or `.cursorrules` (in a workspace with subfolders like `backend/`/`frontend/`, these live one level above, never inside them). If the current directory isn't that root (e.g. the terminal opened inside `backend/`), locate it and change into it before touching `.aes/`.
   - Only when no such marker file exists anywhere above, fall back to the directory that already contains `.aes/tasks/`; only when neither signal exists, treat the current directory as root.

1. Determine the project and working directory.
   - Derive the slug from the feature name; the target directory is `.aes/tasks/<slug>/`.
   - Create the directory and its `adrs/` subdirectory if missing.
   - If `_idea.md` exists there, read it as primary context.
   - If `_prd.md` exists, read it and operate in update mode.

2. Classificar a complexidade da feature (gate de complexidade).
   - **Trivial**: CRUD simples de leitura/escrita, sem regra de negócio nova, sem decisão arquitetural e sem conceito de domínio novo — ex.: endpoint que apenas lê ou grava um registro existente, sem lógica adicional.
   - **Padrão**: qualquer coisa que não se encaixe integralmente nos critérios de Trivial acima — o pipeline completo descrito nos passos seguintes. Em caso de dúvida entre Trivial e Padrão, classifique como Padrão.
   - Essa classificação só ajusta a profundidade da pesquisa (passo 3) e o formato do ADR (passo 5), ambos marcados abaixo com **[Trivial]**. Ela não afeta o pacote de artefatos gerado — PRD, User Stories, ADR e Board continuam todos obrigatórios — nem a etapa de perguntas (passo 4), que permanece obrigatória mesmo em features triviais.

3. Discover context through two parallel research tracks. Both MUST finish before any question is asked; run them in parallel (e.g., two Agent tool calls).
   - Track A — Codebase: search for files, patterns, data models, and integration points related to the request; summarize in 3-5 bullets. **[Trivial]** Substitua o sweep completo por uma única busca direcionada ao registro/endpoint em questão.
   - Track B — Market: perform 3-5 web searches on trends, competing products, and user expectations; summarize in 3-5 bullets. If web search tools are unavailable, note the limitation and proceed with Track A only. **[Trivial]** Pule esta trilha inteiramente.
   - Present the merged findings from both tracks to the user before moving to questions.

4. Grill the requirements.
   - Read `references/question-protocol.md` and apply its Grilling Method through its phases, resolving the load-bearing product decisions branch by branch.
   - Done when every branch that shapes the PRD is resolved or explicitly parked for Open Questions — the question count is an output of the decision tree, not a budget.
   - Obrigatório independentemente da classificação do passo 2 — nunca pule ou reduza esta etapa para features triviais.

5. Decide the product approach and record ADRs.
   - Choose the strongest direction yourself from the answers and research.
   - Read `references/adr-template.md`, determine the next number from the files in `.aes/tasks/<slug>/adrs/`, fill the template (chosen direction as Decisão, weighed alternatives with trade-offs as Alternativas Consideradas, outcomes as Consequências; Status "Aceita", Date today), and write `adrs/adr-NNN.md` (zero-padded 3-digit number). **[Trivial]** Em vez do template completo, escreva apenas uma nota de uma linha em `adrs/adr-NNN.md` registrando "sem trade-off arquitetural relevante — decisão trivial" seguida da decisão tomada. Não pule o ADR — apenas reduza seu formato.
   - Record any additional significant scope decision that surfaced during clarification as its own ADR.

6. Write the user-story catalog.
   - Read `references/user-stories-template.md` and write `.aes/tasks/<slug>/_user_stories.md`.
   - Comece pela tabela-resumo (obrigatória, ver template) antes do detalhamento completo de cada story.
   - Cover every persona — secondary ones included — and every core feature.
   - Run the template's edge-case sweep against every story.
   - Done when every core feature has stories, every story has verifiable acceptance criteria plus edge cases with expected behavior, and every edge-case class has been probed against every story.

7. Write the PRD.
   - Read `references/prd-template.md` and fill every section with the decided direction and confirmed answers; the template carries the per-section rules.
   - Comece pela seção `## Resumo` (obrigatória, ver template), logo após o título e antes do restante do conteúdo.
   - List every ADR from this session in the Registro de Decisões de Produto section.
   - Prefer active voice and definite, specific language; every sentence earns its place. Language: Portuguese (Brazil).
   - Self-check before writing the file: no core feature or story left without a home in a PRD section, no domain term left undefined, every Non-Goal traceable to a decision the user actually made in this conversation — not an assumption.
   - Write `.aes/tasks/<slug>/_prd.md`.

8. Generate the visual board.
   - Automatically invoke `aes-create-excalidraw` for the same `<slug>` — no separate user request needed, this is part of finishing a PRD.
   - It reads the `_prd.md`, `_user_stories.md`, and `adrs/*.md` just written and produces `.aes/tasks/<slug>/diagrams/spec-<slug>.excalidraw`.
   - If it fails or skips frames for missing source data, note that in the handoff — never block the PRD handoff on the board.

9. Hand off.
   - Confirm all file paths to the user (PRD, user stories, ADRs, and the Excalidraw board) and invite change requests directly on the generated files.
   - Point to `aes-create-techspec` as the next step.

## Error Handling

- Insufficient context for a section: note it in Open Questions rather than guessing.
- Web research tools unavailable: proceed with codebase findings and state the limitation.
- Target directory cannot be created: stop and report the filesystem error.
- Update mode: preserve sections the user has not asked to change, and mirror any story change into `_user_stories.md` so the catalog and the PRD stay in sync. Re-run `aes-create-excalidraw` in update mode too, so the board reflects the revised PRD.
- `aes-create-excalidraw` fails: report the failure in the handoff and proceed — the PRD and user-story catalog are still complete and usable without the board.
