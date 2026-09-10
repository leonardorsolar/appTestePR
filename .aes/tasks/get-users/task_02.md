---
status: completed
title: Testes unitários e de integração de GET /users
type: test
complexity: low
---

# Task 2: Testes unitários e de integração de GET /users

## Visão Geral

Implementa toda a cobertura de teste automatizado de `GET /users` — unitária sobre o handler/rota e de integração sobre a inclusão automática de `/users` no spec Swagger — além de atualizar as asserções existentes de `app.test.js` que hoje esperam apenas `/health`. Depende da Task 1 já estar concluída, pois exercita a rota e o registro em `app.js` criados lá.

<critical>
- ALWAYS READ the PRD, the TechSpec, and their catalogs (`_user_stories.md`, `_tests.md`) before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — implement every test case assigned in ## Testes
</critical>

<requirements>
- MUST create `src/routes/users.test.js`, colocated with the route file, using Jest + Supertest over `createApp()` — no mocks/fakes of the data module, following the exact conventions of `src/routes/health.test.js`
- MUST cover UT-005 through UT-009 exactly as specified in `_tests.md`, including the direct-handler-call boundary case (UT-006, mocked `res`) without mutating the module-level `users` array
- MUST update `src/app.test.js` to replace the exact-path assertion (currently `expect(Object.keys(response.body.paths)).toEqual(['/health'])`) with the new `['/health', '/users']` expectation (IT-010), and add IT-009, IT-011, and IT-012 as new cases
- MUST update `src/docs/swaggerSpec.test.js` (UT-004, feature `documentacao-swagger`), whose `expect(Object.keys(spec.paths)).toEqual(['/health'])` assertion breaks for the same reason as IT-003 the moment `/users` is registered — gap discovered during Task 1 execution, not originally listed in the TechSpec's Impact Analysis, but the same class of regression and squarely test-only
- MUST NOT modify `src/routes/users.js` or `src/app.js` beyond what Task 1 already delivered — this task is test-only
- MUST leave existing `/health` test cases (UT-001–UT-004, IT-001–IT-008) unchanged and passing
</requirements>

## Subtarefas

- [x] 2.1 Criar `src/routes/users.test.js` com blocos `describe`/`it` seguindo a convenção de `health.test.js`
- [x] 2.2 Implementar UT-005 (happy path via Supertest, corpo exato dos 3 registros na ordem declarada)
- [x] 2.3 Implementar UT-006 (chamada direta de `usersHandler` com `res` mockado, cobrindo estruturalmente o caso de lista vazia sem mutar o módulo)
- [x] 2.4 Implementar UT-007 (idempotência entre duas chamadas sequenciais)
- [x] 2.5 Implementar UT-008 (200 sem header `Authorization`)
- [x] 2.6 Implementar UT-009 (query param não suportado, ex. `?filtro=x`, é ignorado)
- [x] 2.7 Atualizar `src/app.test.js`: substituir a asserção exata de paths (antiga `['/health']`) pelo caso IT-010 — ordem real e determinística verificada como `['/users', '/health']` (ver Nota de Acompanhamento)
- [x] 2.8 Adicionar IT-009 em `src/app.test.js` (path `/users` presente em `/api-docs.json`, resposta 200 documentada, exemplo do array de usuários)
- [x] 2.9 Adicionar IT-011 em `src/app.test.js` (`paths['/users'].get.responses` com exatamente a chave `'200'`)
- [x] 2.10 Adicionar IT-012 em `src/app.test.js` (regressão: `GET /health` continua respondendo `200` com `{ status: 'ok' }` após o registro de `/users`)
- [x] 2.11 Atualizar `src/docs/swaggerSpec.test.js` (UT-004): substituir `toEqual(['/health'])` por `toEqual(['/users', '/health'])` — gap descoberto na Task 1, fora do Impact Analysis original do TechSpec
- [x] 2.12 Rodar `npm test` e confirmar que toda a suíte (existente + nova) passa, sem nenhuma falha

## Detalhes de Implementação

Ver `_tests.md` para a definição exata de cada caso (input, condição, resultado esperado) — não duplicar aqui. `users.test.js` é colocado junto de `users.js` (convenção do projeto: teste ao lado do arquivo testado, não em pasta `__tests__/`). Os casos de integração (IT-009–IT-012) entram em `src/app.test.js`, nos `describe` blocks já existentes (`GET /api-docs.json`, mais um novo caso de regressão dentro de `GET /health (regressão pós rotas de documentação)`).

### Arquivos Relevantes

- `src/routes/health.test.js` — padrão de referência exato para testes unitários de rota via `createApp()` + Supertest
- `src/app.test.js` — já contém os `describe` blocks de `/api-docs.json` e de regressão de `/health` que recebem os novos casos IT-009–IT-012
- `src/routes/users.js` — arquivo sob teste (criado pela Task 1)
- `src/app.js` — registra a rota exercida pelos casos de integração (modificado pela Task 1)

### Arquivos Dependentes

- `src/app.test.js` — a asserção existente de path exato (IT-003, `toEqual(['/health'])`) quebra assim que `/users` estiver registrado (feito na Task 1); esta task é responsável por atualizá-la

### ADRs Relacionados

- [ADR-002: Dados de usuários inline em routes/users.js](adrs/adr-002.md) — nota explicitamente (seção "Notas de Implementação") que as asserções de path exato em `app.test.js` precisam ser atualizadas quando a rota for implementada

## Entregáveis

- `src/routes/users.test.js` criado com UT-005 a UT-009 implementados
- `src/app.test.js` atualizado com IT-009, IT-010, IT-011 e IT-012, e a asserção antiga de path exato substituída
- Todo caso de teste atribuído implementado e passando **(OBRIGATÓRIO)**
- `npm test` passa integralmente (suíte existente + novos casos), sem regressão em `/health`

## Testes

Casos atribuídos a partir de `_tests.md` — leia a definição completa de cada ID lá antes de escrever os testes.

- [ ] UT-005, UT-006, UT-007, UT-008, UT-009 — handler/rota `GET /users` (happy path, boundary de lista vazia, idempotência, ausência de auth, query param ignorado)
- [ ] IT-009, IT-010, IT-011, IT-012 — inclusão de `/users` no spec Swagger e regressão de `/health`

## Critérios de Sucesso

- Todo caso de teste atribuído implementado e passando
- `npm test` executa sem falhas, cobrindo suíte existente + nova
- Nenhuma modificação em `src/routes/users.js` ou `src/app.js` além do que a Task 1 já entregou

## Nota de Acompanhamento

- Ao mockar `jest.fn()` em `users.test.js` (UT-006), foi necessário `import { jest } from '@jest/globals'` — o harness ESM (`node --experimental-vm-modules`) não injeta o global `jest` automaticamente para testes puramente síncronos que não passam por `createApp()`/Supertest primeiro.
- A ordem de `Object.keys(paths)` em `/api-docs.json` (IT-010) e em `buildSwaggerSpec()` (UT-004 de `swaggerSpec.test.js`) não é alfabética — `swagger-jsdoc` resolve o glob de `src/routes/*.js` e retorna `['/users', '/health']`, não `['/health', '/users']` como `_tests.md` assumia. `_tests.md` foi corrigido para registrar essa nota; nenhuma mudança em `swaggerSpec.js` foi necessária (consistente com o TechSpec, que não previa alteração nesse arquivo).
