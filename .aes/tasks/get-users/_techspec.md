# TechSpec: GET /users

Especificação técnica para `GET /users`. Complementa [_prd.md](_prd.md) e [_user_stories.md](_user_stories.md); consumida por [_tests.md](_tests.md) e pela decomposição em tarefas subsequente.

## Resumo Executivo

`GET /users` é implementado como um único arquivo de rota, `src/routes/users.js`, seguindo exatamente o padrão já estabelecido por `src/routes/health.js`: um array de usuários de exemplo declarado inline como constante em memória, um handler síncrono que o retorna como JSON, e um bloco `@openapi` inline documentando o contrato. Não há camada de serviço, módulo de dados separado, banco de dados ou middleware novo — a rota é registrada em `createApp()` (`src/app.js`) exatamente como `/health`, e a documentação Swagger é gerada automaticamente pelo glob já existente em `swaggerSpec.js`, sem nenhuma mudança nesse arquivo.

O principal trade-off técnico é deliberado: manter os dados inline no arquivo da rota (em vez de um módulo `data/` separado) prioriza a simplicidade e a consistência com o único precedente do projeto, ao custo de exigir uma extração futura caso uma segunda rota precise dos mesmos dados — cenário fora de escopo hoje. Ver [ADR-002](adrs/adr-002.md).

## Arquitetura do Sistema

### Visão Geral dos Componentes

| Componente | Responsabilidade | Limites |
|---|---|---|
| `src/routes/users.js` (novo) | Define `usersHandler`, o array `users` em memória, e o bloco `@openapi` que documenta a rota. | Não lê nem escreve nada fora do próprio módulo; não depende de request body, query params ou headers. |
| `src/app.js` (modificado) | Registra `GET /users` no Express, importando `usersHandler` de `users.js`. | Apenas registro de rota — nenhuma lógica de negócio. |
| `src/docs/swaggerSpec.js` (não modificado, efeito indireto) | Varre `src/routes/*.js` via glob e monta o spec OpenAPI, incluindo `users.js` automaticamente por já casar com o padrão de glob existente. | Nenhuma mudança de código necessária; o efeito é automático assim que `users.js` existir com um bloco `@openapi` válido. |

Fluxo de dados: `Cliente HTTP → Express → GET /users → usersHandler → array `users` em memória → res.json(users)`. Não há chamada a sistemas externos, banco de dados ou outro processo.

## Design de Implementação

### Interfaces Principais

```javascript
/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} nome
 * @property {string} email
 */

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {void}
 */
export function usersHandler(req, res) {
  res.status(200).json(users);
}
```

- `usersHandler` não recebe parâmetros de negócio — `req` não é inspecionado (query params não suportados são ignorados por definição, conforme EC-1 de US-001).
- Não há tratamento de erro: a operação é uma leitura pura de uma constante em memória, sem caminho de falha possível (sem I/O, sem parsing de entrada).

### Modelos de Dados

- **Entidade `User`** (ver typedef acima): `id` (number, sequencial a partir de 1), `nome` (string), `email` (string). Nenhum campo adicional, conforme Regras de Negócio do PRD.
- **Armazenamento**: array `const users = [...]` declarado no topo de `users.js`, com 3 registros de exemplo fixos. Não é mutado por nenhum caminho de código desta funcionalidade — leitura pura.
- **Response**: array JSON plano de `User` (`User[]`), sem envelope (`{ data: [...] }`) nem metadados — decisão de produto já registrada em [ADR-001](adrs/adr-001.md).

### Endpoints de API

**`GET /users`**

- **Request**: sem parâmetros obrigatórios, sem body, sem headers obrigatórios. Query params não suportados são ignorados (EC-1).
- **Response 200**: `application/json`, corpo `User[]`. Exemplo:
  ```json
  [
    { "id": 1, "nome": "Ana Silva", "email": "ana.silva@example.com" },
    { "id": 2, "nome": "Bruno Costa", "email": "bruno.costa@example.com" },
    { "id": 3, "nome": "Carla Souza", "email": "carla.souza@example.com" }
  ]
  ```
- Não há outro status code documentado para esta rota — não há caminho de erro de negócio (lista vazia também responde `200 []`, nunca `404` ou `500`, conforme EC-2 de US-001).

## Pontos de Integração

Não aplicável — a funcionalidade não se integra com nenhum serviço externo, banco de dados ou API de terceiros (dados em memória, sem autenticação).

## Análise de Impacto

| Componente | Tipo de Impacto | Descrição e Risco | Ação Necessária |
|---|---|---|---|
| `src/routes/users.js` | Novo | Arquivo novo com handler, dados e documentação da rota. Risco baixo — isolado, sem dependências de outros módulos além do Express. | Criar o arquivo. |
| `src/app.js` | Modificado | Adicionar uma linha de registro de rota (`app.get('/users', usersHandler)`) e o import correspondente. Risco baixo — mesmo padrão já usado para `/health`. | Adicionar import e registro. |
| `src/docs/swaggerSpec.js` | Efeito indireto, sem modificação de código | O glob já configurado passa a incluir `users.js` automaticamente assim que o arquivo existir com bloco `@openapi`. Risco baixo, mas é preciso reiniciar o processo para o spec refletir a nova rota (comportamento já documentado em AGENTS.md). | Nenhuma — comportamento automático. |
| `src/app.test.js` | Modificado | As asserções IT-002/IT-003 (`Object.keys(response.body.paths)`) hoje esperam exatamente `['/health']` — precisam passar a incluir `/users`, senão quebram assim que a rota existir. | Atualizar asserções de path exato para incluir `/users` (rastreado como UT/IT em `_tests.md`). |

## Abordagem de Testes

- **Framework**: Jest 30 + Supertest 7, sobre módulos ESM nativos (`node --experimental-vm-modules`), mesmo harness já usado por `health.test.js` e `app.test.js`. Sem fakes/mocks — os dados já são uma constante em memória, não há limite de I/O a isolar.
- **Unit**: `src/routes/users.test.js` (colocado com o arquivo da rota, seguindo a convenção do projeto) — testa `GET /users` via `createApp()` + Supertest, cobrindo status, `Content-Type`, forma exata do array, ausência de autenticação, idempotência entre chamadas e ignorância de query params não suportados.
- **Integration**: `src/app.test.js` recebe casos novos cobrindo `/api-docs.json` com `/users` presente no spec (path, resposta 200 documentada, exemplo do array) e a atualização das asserções de lista exata de paths para incluir `/users`.
- **E2E**: não aplicável como suíte separada — o fluxo do usuário (`US-001`/`US-002`) é inteiramente coberto pelos testes de integração via Supertest, já que não há UI nem cliente real neste repositório; a chamada HTTP direta via Supertest já exercita a superfície pública tal como um consumidor da API faria.
- Nenhuma dependência de ambiente ou dado externo — cada teste cria sua própria instância via `createApp()`, sem estado compartilhado (mesma convenção de `health.test.js`).

## Sequenciamento de Desenvolvimento

### Ordem de Construção

1. `src/routes/users.js` — dados em memória, handler e bloco `@openapi` — sem dependências.
2. `src/app.js` — registrar `GET /users`, depende do passo 1 (precisa de `usersHandler` para importar).
3. `src/routes/users.test.js` — testes unitários da rota, depende dos passos 1 e 2 (usa `createApp()` já com a rota registrada).
4. `src/app.test.js` — atualizar asserções de `/api-docs.json` para refletir a nova rota, depende dos passos 1 e 2 (o spec só inclui `/users` depois que o arquivo existir com `@openapi` válido).

### Dependências Técnicas

Nenhuma — não há infraestrutura, serviço externo ou entrega de outra equipe bloqueando esta implementação. Todas as dependências (Express, swagger-jsdoc, Jest, Supertest) já estão instaladas no projeto.

## Monitoramento e Observabilidade

Não aplicável — o projeto não tem hoje nenhuma infraestrutura de logging, métricas ou alerting (nenhum middleware de log é registrado em `app.js`), e introduzi-la está fora do escopo desta funcionalidade por decisão explícita do PRD (Restrições Técnicas de Alto Nível) e do ADR-001 da fundação `servidor-backend`. `GET /users` segue o mesmo nível de observabilidade de `GET /health` hoje: nenhum.

## Considerações Técnicas

### Decisões-Chave

- **Decisão**: dados inline em `users.js`, sem módulo de dados nem camada de serviço. **Justificativa**: replica o único padrão existente no projeto (`health.js`), sem introduzir convenções novas para 3 registros fixos e somente-leitura. **Trade-offs**: reuso futuro exigiria extração. **Alternativas rejeitadas**: módulo `data/users.js` separado; camada de serviço. Ver [ADR-002](adrs/adr-002.md).
- **Decisão**: `id` como número inteiro sequencial. **Justificativa**: mais simples de ler em testes e no exemplo Swagger; não há criação de usuários que exigisse um formato de id mais robusto. **Trade-offs**: nenhum relevante neste escopo. **Alternativas rejeitadas**: id como string. Ver [ADR-002](adrs/adr-002.md).
- **Decisão**: resposta como array JSON plano, sem paginação, sem autenticação. **Justificativa**: decisão de produto já tomada no PRD. **Trade-offs**: contrato precisará de revisão se a base crescer muito no futuro. **Alternativas rejeitadas**: envelope com metadados/paginação. Ver [ADR-001](adrs/adr-001.md).

### Riscos Conhecidos

- **Risco**: asserções de path exato em `app.test.js` (IT-002/IT-003) quebram assim que `/users` for registrado, se não forem atualizadas junto. **Probabilidade**: certa, não é hipotética. **Mitigação**: atualizar essas asserções no mesmo PR que introduz a rota (rastreado na Análise de Impacto e em `_tests.md`).
- **Risco**: nenhum outro risco técnico relevante — funcionalidade é leitura pura, sem estado compartilhado, sem concorrência de escrita, sem I/O externo.

## Registro de Decisões Arquiteturais

- [ADR-001: Introduzir "usuário" como primeiro domínio de negócio do backend, via GET /users somente-leitura](adrs/adr-001.md) — estabelece o domínio, a fonte de dados em memória, os campos do usuário e o formato de resposta (array plano, sem paginação, sem autenticação).
- [ADR-002: Dados de usuários inline em routes/users.js, sem módulo de dados ou camada de serviço separados](adrs/adr-002.md) — decide onde os dados vivem no código, o formato do `id` (número sequencial) e a ausência de camada de serviço.
