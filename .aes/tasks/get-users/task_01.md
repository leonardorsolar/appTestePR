---
status: completed
title: Implementar rota GET /users com dados em memória e documentação Swagger
type: backend
complexity: low
---

# Task 1: Implementar rota GET /users com dados em memória e documentação Swagger

## Visão Geral

Entrega o handler e os dados em memória de `GET /users`, registrado em `app.js` e documentado via bloco `@openapi` inline — a fatia de implementação que estabelece "usuário" como primeiro domínio de negócio real do backend ([ADR-001](adrs/adr-001.md)), seguindo exatamente o padrão de `health.js` ([ADR-002](adrs/adr-002.md)). Os testes automatizados que validam este comportamento são cobertos pela Task 2, que depende desta.

<critical>
- ALWAYS READ the PRD, the TechSpec, and their catalogs (`_user_stories.md`, `_tests.md`) before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — implement every test case assigned in ## Testes
</critical>

<requirements>
- MUST create `src/routes/users.js` exporting `usersHandler`, mirroring the shape and JSDoc pattern already used in `src/routes/health.js`
- MUST declare `users` as an in-memory array literal of exactly 3 example records with fields `id` (sequential integer starting at 1), `nome` (string), `email` (string) — no other fields
- MUST have `usersHandler` respond with `res.status(200).json(users)`, with no request-body/query/header inspection, no branching, and no mutation of `users`
- MUST document `/users` via an inline `@openapi` JSDoc block directly above `usersHandler`, including the `200` response with `application/json` content and an example array — this is the only source of Swagger documentation for this project (see AGENTS.md)
- MUST register the route in `src/app.js` as `app.get('/users', usersHandler)`, importing `usersHandler` from `./routes/users.js`, following the exact pattern already used for `/health`
- MUST NOT introduce a `data/` or `services/` directory, error handling, authentication, environment validation, pagination, or filtering — out of scope per ADR-001, ADR-002, and AGENTS.md
</requirements>

## Subtarefas

- [x] 1.1 Criar `src/routes/users.js` com o array `users` (3 registros de exemplo) declarado como constante no topo do arquivo
- [x] 1.2 Implementar `usersHandler`, que responde `res.status(200).json(users)`, sem parâmetros de negócio nem tratamento de erro
- [x] 1.3 Escrever o bloco `@openapi` inline documentando `GET /users` (summary, resposta 200, `application/json`, exemplo do array), seguindo o padrão de `health.js`
- [x] 1.4 Importar `usersHandler` em `src/app.js` e registrar `app.get('/users', usersHandler)`, no mesmo local onde `/health` já é registrado
- [x] 1.5 Rodar `npm start` localmente e confirmar manualmente que `GET /users` responde 200 com o array esperado, e que `/api-docs` passa a listar `/users` (verificação manual; os testes automatizados formais ficam na Task 2)

## Detalhes de Implementação

Ver TechSpec, seções "Interfaces Principais" e "Endpoints de API", para a assinatura exata de `usersHandler` e o exemplo de resposta. Ver "Modelos de Dados" para os campos e tipos de `User`. O registro em `app.js` segue exatamente o padrão já usado para `healthHandler` (import + `app.get(...)`), sem nenhuma outra mudança estrutural no arquivo.

### Arquivos Relevantes

- `src/routes/health.js` — padrão de referência exato para estrutura de handler + bloco `@openapi` inline
- `src/app.js` — ponto de registro da nova rota, mesmo padrão de `/health`
- `src/docs/swaggerSpec.js` — não precisa ser modificado; o glob já existente inclui `users.js` automaticamente assim que o arquivo existir com bloco `@openapi` válido

### Arquivos Dependentes

- `src/app.js` — recebe o import de `usersHandler` e uma nova linha de registro de rota
- `src/app.test.js` — as asserções de path exato (`Object.keys(response.body.paths)`) passam a incluir `/users` assim que esta task for concluída; a atualização em si é responsabilidade da Task 2

### ADRs Relacionados

- [ADR-001: Introduzir "usuário" como primeiro domínio de negócio do backend](adrs/adr-001.md) — define o domínio, os campos do usuário e o formato de resposta
- [ADR-002: Dados de usuários inline em routes/users.js](adrs/adr-002.md) — define onde os dados vivem no código, o formato do `id` e a ausência de camada de serviço

## Entregáveis

- `src/routes/users.js` criado com dados em memória, `usersHandler` e bloco `@openapi`
- `src/app.js` atualizado com o import e o registro de `GET /users`
- `GET /users` responde 200 com o array de 3 usuários de exemplo, verificado manualmente
- `/api-docs` e `/api-docs.json` passam a listar `/users` automaticamente (sem mudança em `swaggerSpec.js`)

## Testes

Nenhum caso de teste automatizado é atribuído a esta task. A cobertura completa (UT-005–UT-009, IT-009–IT-012) é implementada na Task 2, que depende da conclusão desta task.

## Critérios de Sucesso

- `src/routes/users.js` e `src/app.js` implementados conforme os Requisitos acima
- Verificação manual de `GET /users` e `/api-docs` bem-sucedida (Subtarefa 1.5)
- Task 2 pode iniciar imediatamente após esta task ser concluída, sem bloqueios adicionais

## Nota de Acompanhamento

Ao registrar `/users`, `npm test` quebra 2 asserções pré-existentes de lista exata de paths (esperado, ver ADR-002 "Notas de Implementação" e TechSpec "Riscos Conhecidos"):

- `src/app.test.js` (IT-003) — já previsto no TechSpec e coberto pela Task 2 (IT-010).
- `src/docs/swaggerSpec.test.js` (UT-004, feature `documentacao-swagger`) — **gap não previsto** no Impact Analysis do TechSpec (só citava `app.test.js`). Mesma classe de regressão; fica registrado como item adicional para a Task 2 corrigir, por ser puramente uma atualização de asserção de teste.
