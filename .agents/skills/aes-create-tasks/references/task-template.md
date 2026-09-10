# Template de Arquivo de Task

Use esta estrutura para todo arquivo de task individual. O arquivo deve começar com frontmatter YAML contendo os metadados parseáveis.

Os headers estruturais abaixo (`## Visão Geral`, `<critical>`, `<requirements>`, `## Contrato Visual`, `## Subtarefas`, `## Detalhes de Implementação`, `### Arquivos Relevantes`, `### Arquivos Dependentes`, `### ADRs Relacionados`, `## Entregáveis`, `## Testes`, `## Critérios de Sucesso`) são o contrato que `aes-execute-task`, `aes-review-round`, `aes-web-docs-impact` e `aes-tasks-tail-qa-pair` leem por nome exato — traduzidos para português e fixos nesta forma; não os traduza de volta nem varie a grafia entre tasks. As tags `<critical>`/`<requirements>` e o conteúdo do bloco `<critical>` permanecem em inglês verbatim, como convenção compartilhada com outras skills do ecossistema (ex.: `aes-spec-preflight`). Traduza apenas o texto de exemplo/placeholder entre colchetes e a prosa ao redor.

```markdown
---
status: pending
title: [Título da task]
type: [um de frontend, backend, docs, test, infra, refactor, chore, bugfix, ou um override específico do projeto em [tasks].types]
complexity: [low, medium, high, critical]
---

# Task N: [Título]

## Visão Geral

[2-3 frases: qual fatia do sistema esta task entrega e por que isso importa no contexto do projeto.]

<critical>
- ALWAYS READ the PRD, the TechSpec, and their catalogs (`_user_stories.md`, `_tests.md`) before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — implement every test case assigned in ## Testes
</critical>

<requirements>
- [Requisito 1 — requisito técnico específico usando linguagem MUST/SHOULD]
- [Requisito 2 — ex.: "MUST authenticate users via JWT tokens"]
- [Requisito 3]
</requirements>

## Contrato Visual

[Inclua esta seção somente quando a task implementa UI visível a partir de uma
referência visual nomeada. Enumere todo estado e viewport exigidos; não use uma
linha coringa "todos os estados".]

| ID    | Artefato de referência + estado      | Alvo de implementação + estado | Viewport | Fidelidade | Diferenças autorizadas + autoridade |
| ----- | ------------------------------------ | ------------------------------- | -------- | ---------- | ------------------------------------ |
| VC-01 | `path/to/reference.html` — populado  | `/route` — fixture populada     | 1440×900 | normativa  | Nenhuma                              |

Evidência para cada linha: `.aes/tasks/<workflow>/evidence/visual/<task-id>/<contract-id>/{reference.png,implementation.png,side-by-side.png,diff.png,comparison.json,review.md}` (ou `<QA_OUTPUT_PATH>/qa/visual-contract/<task-id>/...` para QA isolada).

## Subtarefas

- [ ] N.1 [Descrição da subtask — O QUE realizar]
- [ ] N.2 [Descrição da subtask]
- [ ] N.3 [Descrição da subtask]

## Detalhes de Implementação

[Caminhos de arquivo a criar ou modificar e pontos de integração.
Referencie a seção de implementação da TechSpec para padrões de código e designs de interface.]

### Arquivos Relevantes

- `path/to/file` — [breve motivo pelo qual este arquivo é relevante]

### Arquivos Dependentes

- `path/to/dependency` — [breve motivo pelo qual este arquivo é afetado]

### ADRs Relacionados

- [ADR-NNN: Título](../adrs/adr-NNN.md) — Relevância para esta task

## Entregáveis

- [Output concreto 1]
- [Output concreto 2]
- Todo caso de teste atribuído em `## Testes` implementado e passando **(OBRIGATÓRIO)**
- [Somente UI visível com referência nomeada: toda linha do Contrato Visual tem um evidence bundle durável aprovado **(OBRIGATÓRIO)**]

## Testes

Casos atribuídos a partir de `_tests.md`, o contrato de teste — leia a definição completa de cada ID lá antes de escrever os testes.

- [ ] UT-NNN, UT-NNN, UT-NNN — [componente/comportamento que estes cobrem]
- [ ] IT-NNN — [fluxo que este cobre]
- [ ] E2E-NNN — [jornada que este cobre]

[Quando o workflow não tem `_tests.md`, liste casos concretos inline em vez disso — input exato, condição, e resultado esperado por caso.]

## Critérios de Sucesso

- Todo caso de teste atribuído implementado e passando
- [Resultado mensurável 1]
- [Resultado mensurável 2]
- [Somente UI visível com referência nomeada: toda linha do Contrato Visual está `PASS` com zero divergência bloqueante não resolvida]
```

## Diretrizes

- Escreva uma subtask por unidade coerente de trabalho — O QUE realizar, não COMO; tasks robustas tipicamente carregam de 5 a 12.
- Regras de dimensionamento, independência e atribuição de teste vivem no SKILL.md; o bloco `<critical>` acima é embarcado verbatim em todo arquivo de task gerado.
