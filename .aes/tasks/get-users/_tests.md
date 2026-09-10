# Especificação de Testes: GET /users

Contrato de teste canônico para `GET /users`. Complementa [_techspec.md](_techspec.md).
Derivado de [_user_stories.md](_user_stories.md) (comportamento) e `_techspec.md` (componentes).

IDs continuam a sequência já usada no código (`UT-001`–`UT-004` em `health.test.js`,
`IT-001`–`IT-008` em `app.test.js`) para evitar colisão de identificadores no projeto:
esta funcionalidade começa em `UT-005` e `IT-009`.

## Estratégia

- Frameworks e harnesses: Jest 30 + Supertest 7, sobre módulos ESM nativos
  (`node --experimental-vm-modules`) — mesmo harness de `health.test.js`/`app.test.js`. Sem
  fakes/mocks de módulo: os dados são uma constante em memória, não há limite de I/O externo a
  isolar.
- Execução: `npm test` roda toda a suíte via Jest; cada teste cria sua própria instância com
  `createApp()`, sem estado compartilhado entre testes (mesma convenção já usada no projeto).
- Convenções: testes de rota ficam colocados junto do arquivo que testam
  (`src/routes/users.test.js`), seguindo `health.test.js`; testes que cruzam rota + geração de
  spec Swagger ficam em `src/app.test.js`, seguindo o padrão já usado para `/health`.

## Matriz de Cobertura

| Fonte | Comportamento | Unitário | Integração | E2E |
|---|---|---|---|---|
| US-001 | Listar usuários (200, array `{id,nome,email}`, sem auth) | UT-005, UT-007, UT-008 | — | — |
| US-001.EC-1 | Query param não suportado é ignorado | UT-009 | — | — |
| US-001.EC-2 | Lista vazia → 200 com `[]`, nunca erro | UT-006 | — | — |
| US-001.EC-3 | Sem paginação/limite | — (não aplicável: decisão de escopo do [ADR-001](adrs/adr-001.md), sem parâmetro a testar) | — | — |
| US-001.EC-4 | Sem autenticação/autorização exigida | UT-008 | — | — |
| US-001.EC-5 | Concorrência: duas requisições simultâneas são independentes | — (não aplicável: leitura pura de constante em memória, sem estado compartilhado entre requisições nem escrita; garantido estruturalmente pelo design do [ADR-002](adrs/adr-002.md), não por um teste dedicado) | — | — |
| US-001.EC-6 | Interrupção de conexão do cliente | — (não aplicável: comportamento padrão do Express/HTTP, sem lógica de retomada nesta funcionalidade) | — | — |
| US-001.EC-7 | Repetição (retry) é idempotente | UT-007 | — | — |
| US-001.EC-8 | Escala: volume fixo e pequeno | — (não aplicável: volume fixo por decisão de escopo do [ADR-001](adrs/adr-001.md), sem operação de escrita) | — | — |
| US-002 | Descobrir `/users` via Swagger UI e spec bruto | — | IT-009, IT-011 | — |
| US-002.EC-1 | Bloco `@openapi` ausente/malformado → endpoint some da doc | — (não aplicável a esta feature: comportamento já conhecido do projeto, não introduzido por `GET /users`; coberto indiretamente por IT-009, que confirma o bloco presente aparecendo corretamente) | — | — |
| `usersHandler` / `users.js` (TechSpec: Interfaces Principais) | Handler responde 200 + array, sem branch sobre conteúdo | UT-005, UT-006 | — | — |
| `app.js` (TechSpec: Visão Geral dos Componentes) | Registro da rota `/users` não quebra rotas existentes | — | IT-012 | — |
| `swaggerSpec.js` (TechSpec: Visão Geral dos Componentes) | Inclusão automática de `/users` via glob | — | IT-009, IT-010, IT-011 | — |

## Testes Unitários

### `users.js` — `GET /users` (TechSpec: Interfaces Principais, Endpoints de API)

- **UT-005** (happy): `GET /users` via `createApp()` + Supertest — dado o app criado, responde `200`, `Content-Type: application/json`, e corpo `[{ id: 1, nome: 'Ana Silva', email: 'ana.silva@example.com' }, { id: 2, ... }, { id: 3, ... }]` (array exato de 3 registros, na ordem declarada).
- **UT-006** (boundary): `usersHandler(req, res)` chamado diretamente com um `res` mockado (`{ status: jest.fn().mockReturnThis(), json: jest.fn() }`) — não há branch condicional sobre o tamanho do array: `res.status` é chamado com `200` e `res.json` com o array, independentemente do conteúdo, cobrindo estruturalmente o caso "lista vazia responde 200" (EC-2) sem exigir mutar o módulo.
- **UT-007** (idempotency): duas chamadas sequenciais `GET /users` via Supertest — ambas retornam status `200` e corpos `toEqual` idênticos, na mesma ordem (AC-4/EC-7).
- **UT-008** (happy): `GET /users` sem header `Authorization` — responde `200` normalmente, endpoint público (AC-3/EC-4).
- **UT-009** (boundary): `GET /users?filtro=x` — responde `200` com o array completo e inalterado; o parâmetro não suportado é ignorado (EC-1).

## Testes de Integração

### `/api-docs.json` reflete `/users` (TechSpec: Visão Geral dos Componentes — `swaggerSpec.js`)

- **IT-009**: configure `createApp()`; faça `GET /api-docs.json`; espere `response.body.paths['/users']` definido, com a resposta `200` documentada e um `example` de array de usuários no `content['application/json']`.
- **IT-010**: configure `createApp()`; faça `GET /api-docs.json`; espere `Object.keys(response.body.paths)` igual à lista exata de endpoints reais, sem endpoint fantasma e sem endpoint real faltando (substitui a asserção antiga que esperava apenas `['/health']`). **Nota de implementação**: a ordem exata depende de como `swagger-jsdoc` resolve o glob de `src/routes/*.js` (não é ordem alfabética garantida) — verificada empiricamente durante a Task 2 como `['/users', '/health']`; a asserção deve usar essa ordem real, não assumir alfabética.
- **IT-011**: configure `createApp()`; faça `GET /api-docs.json`; espere que `paths['/users'].get.responses` tenha exatamente a chave `'200'` — sem erros inventados na documentação.

### Regressão de rotas existentes (TechSpec: Análise de Impacto)

- **IT-012**: configure `createApp()`; faça `GET /health`; espere `200` com `{ status: 'ok' }` inalterado, confirmando que registrar `/users` em `app.js` não quebra a rota existente.

## Testes Ponta a Ponta

Não aplicável como suíte separada (ver TechSpec, Abordagem de Testes): o projeto não tem UI nem
cliente real, e a chamada HTTP direta via Supertest em UT-005 e IT-009–IT-011 já exercita a
superfície pública exatamente como um consumidor da API faria, cobrindo integralmente as jornadas
de US-001 e US-002.
