# AGENTS.md

Guia para agentes de IA (e humanos) trabalhando neste repositório.

## O que é este projeto

Backend mínimo em Express (`app`, `package.json`), ainda **sem domínio de
negócio definido** — confirmado explicitamente no PRD da fundação
([.aes/tasks/servidor-backend/_prd.md](.aes/tasks/servidor-backend/_prd.md)):
"repositório novo, sem stack técnica definida e sem um produto específico
associado ainda".

Duas fundações já implementadas via o pipeline Compozy (PRD → TechSpec →
Tasks):

1. **Servidor backend** — um único endpoint `GET /health` que confirma que o
   servidor está no ar (`.aes/tasks/servidor-backend/`).
2. **Documentação Swagger/OpenAPI** — UI interativa em `/api-docs` e
   especificação bruta em `/api-docs.json`, geradas a partir de anotações
   `@openapi` inline nas rotas (`.aes/tasks/documentacao-swagger/`).

- Não há frontend neste repositório.
- Propósito de negócio além dessas duas fundações: **não confirmado** — sem
  domínio de produto definido ainda, não infira além do que o código mostra.

## Estrutura

```
src/
  app.js              # createApp() — factory, monta Express + rotas + Swagger
  server.js            # startServer(port) — entrypoint quando rodado direto
  routes/
    health.js          # GET /health, documentado com JSDoc @openapi
  docs/
    swaggerSpec.js      # buildSwaggerSpec() — swagger-jsdoc, glob src/routes/*.js
```

Testes ficam colocados junto do arquivo que testam (`*.test.js` ao lado do
`*.js` correspondente), não em uma pasta `__tests__/` separada.

`app.js` também expõe a UI Swagger (`/api-docs` via `swagger-ui-express`) e a
especificação bruta (`/api-docs.json`).

## Comandos

```bash
npm install
npm start   # node src/server.js — porta 3000, ou $PORT se definida
npm test    # jest via --experimental-vm-modules (necessário: "type": "module" no package.json)
```

Não há scripts de `lint`, `format` ou `build` definidos em `package.json`.

Health check: `GET /health` → `{ status: 'ok' }`.
Documentação: `GET /api-docs` (UI) · `GET /api-docs.json` (spec bruta).

## Stack

- HTTP: Express 5.2.1 (ESM — `"type": "module"` no `package.json`).
- Documentação: `swagger-jsdoc` 6.3.0 (gera o spec a partir de anotações
  `@openapi` em `src/routes/*.js`) + `swagger-ui-express` 5.0.1 (serve a UI).
- Testes: Jest 30 + `supertest` 7, rodando sobre módulos ESM nativos
  (`node --experimental-vm-modules`).
- Sem TypeScript, sem ORM/banco de dados, sem ESLint/Prettier configurados.
- Node observado no ambiente: v24.18.0 — não há `engines` no `package.json`,
  então não é um requisito confirmado, apenas o que foi usado até aqui.

## Convenções observadas

- `createApp()` é uma factory (não singleton) — cada teste chama
  `createApp()` para obter uma instância nova do Express, evitando estado
  compartilhado entre testes.
- Documentação de rota é inline, via bloco JSDoc `@openapi` logo acima do
  handler (ver [health.js](src/routes/health.js)) — `swaggerSpec.js` varre
  `src/routes/*.js` com glob para montar o spec. Uma rota sem anotação não
  aparece na documentação (comportamento intencional, não um bug).
- `buildSwaggerSpec()` resolve o glob de rotas a partir de
  `dirname(fileURLToPath(import.meta.url))`, não de `process.cwd()` —
  garante que a spec encontra as rotas mesmo se o processo for iniciado de
  outro diretório (coberto pelo teste UT-006 em
  [swaggerSpec.test.js](src/docs/swaggerSpec.test.js)).
- Nomes de teste carregam identificadores (`UT-XXX`, `IT-XXX`) que
  rastreiam para os contratos de teste em
  `.aes/tasks/<slug>/_tests.md` — ao adicionar/alterar um teste, mantenha
  esse rastreamento se a task ainda estiver ativa.

## Armadilhas / inconsistências conhecidas

- Não há middleware de tratamento de erro registrado — respostas de erro
  (ex. 404 em rota inexistente) são o comportamento padrão do Express, não
  um formato customizado.
- Não há validação de variáveis de ambiente na inicialização — `PORT`
  inválido ou ausente cai silenciosamente no default (3000) via
  `port ?? process.env.PORT ?? 3000`.
- `swaggerSpec` é construído uma vez no import de `swaggerSpec.js`
  (`export const swaggerSpec = buildSwaggerSpec()`), não recalculado por
  requisição — isso é intencional (mesma spec durante todo o processo), mas
  quer dizer que adicionar uma rota nova exige reiniciar o processo para a
  documentação refletir a mudança.

## Boundaries

**Sempre**

- Rode `npm test` antes de considerar uma mudança pronta.
- Documente rotas novas com um bloco `@openapi` inline, seguindo o padrão de
  [health.js](src/routes/health.js) — é a única fonte da documentação
  Swagger deste projeto.

**Pergunte antes de agir**

- Antes de introduzir qualquer funcionalidade de domínio de negócio
  (módulos, camadas, entidades) — o PRD da fundação
  ([ADR-001](.aes/tasks/servidor-backend/adrs/adr-001.md)) documenta a
  decisão explícita de manter o backend mínimo até que um domínio real seja
  definido; isso não é uma lacuna a preencher por iniciativa própria.
- Antes de adicionar tratamento de erro global, validação de ambiente, ou
  estrutura para futuras features — mesma decisão de escopo mínimo, listada
  como Não-Objetivo no PRD.
- Antes de adicionar ferramentas de lint/format/CI — não existem hoje;
  confirme se é o momento certo em vez de assumir que faltam por descuido.

**Nunca**

- Nunca assuma um domínio de negócio (ex: "gestão de tarefas", "usuários")
  para este backend — não há PRD, TechSpec ou código que defina um; a
  fundação é deliberadamente genérica.
- Nunca documente no Swagger um endpoint que não existe no código, nem
  omita um endpoint real já anotado — regra de negócio explícita do PRD de
  documentação.

## Skills de agente disponíveis

Este repositório usa o pipeline Compozy (skills em `.agents/skills/`,
espelhadas em `.claude/skills/` — que também tem `aes-distill-learnings` e
`devmentor-dados`, ausentes de `.agents/skills/`). Ver
[.agents/skills/aes/SKILL.md](.agents/skills/aes/SKILL.md) para o índice
completo antes de iniciar uma feature nova pelo pipeline formal.

## Referências

- [.aes/tasks/servidor-backend/](.aes/tasks/servidor-backend/) — PRD,
  TechSpec e ADR da fundação do servidor.
- [.aes/tasks/documentacao-swagger/](.aes/tasks/documentacao-swagger/) —
  PRD, TechSpec e roteiro de teste manual da documentação Swagger.
- Não há `.aes/project/_architecture.md` / `_overview.md` neste repositório
  (a skill `aes-init` ainda não rodou aqui) — **não confirmado**, gere com
  `aes-init` se precisar de uma visão de projeto mais ampla.
