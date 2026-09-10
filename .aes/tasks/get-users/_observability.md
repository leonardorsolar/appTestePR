# Observability Strategy: GET /users

Estratégia de observabilidade para a funcionalidade `GET /users` (`.aes/tasks/get-users/`), gerada após o deploy plan ([_deploy_plan.md](_deploy_plan.md)) que já colocou a rota em produção via o rollout Big Bang do commit `cac5b24`.

**Nota de escopo, importante**: hoje o projeto **não tem nenhuma infraestrutura de observabilidade** — nenhum middleware de log, nenhuma biblioteca de métricas, nenhum coletor de tracing, nenhum monitoramento sintético (confirmado em [_techspec.md](_techspec.md), seção "Monitoramento e Observabilidade: Não aplicável", e em [AGENTS.md](../../../AGENTS.md), decisão de escopo mínimo do ADR-001 da fundação `servidor-backend`). Este documento define a estratégia-alvo — o que deveria existir para que os gatilhos de rollback do deploy plan tenham um sinal automatizado em vez de verificação manual — mas **não implementa nada**: nenhum código de logging/métricas/alerting é adicionado por este skill. A implementação real (escolher e instalar uma lib de logging estruturado, um agente de métricas, um serviço de alerting) é uma decisão de escopo que precisa ser confirmada com o engenheiro antes de qualquer código ser escrito, seguindo a mesma regra de "pergunte antes de agir" do AGENTS.md.

## Key Metrics

### RED (rotas HTTP)

| Metric | Description | Target | Alert Threshold |
|--------|-------------|--------|-----------------|
| Rate | Requisições/s em `GET /users` e `GET /health` | Sem baseline de tráfego definido (endpoint novo, uso interno/API de referência) | N/A — sem SLA de volume; usado apenas para detectar quedas abruptas (rate → 0 com tráfego histórico > 0) |
| Errors | % de respostas não-200 em `GET /users` e `GET /health` | < 1% | > 5% por 5 min consecutivos |
| Duration | p50/p95/p99 de latência de `GET /users` e `GET /health` | p99 < 100ms (leitura pura em memória, sem I/O externo) | p99 > 500ms por 5 min consecutivos |

### USE (processo Node — sem banco de dados, sem infraestrutura própria)

| Resource | Utilization | Saturation | Errors |
|----------|-------------|------------|--------|
| CPU (processo Node) | % de CPU do processo `node src/server.js` | Event loop lag (ms) | N/A — sem métrica de erro de CPU aplicável |
| Memória (heap) | Heap usado / heap total (`process.memoryUsage()`) | Heap usado se aproximando do limite (`--max-old-space-size` ou memória do container) | Eventos de `OOMKilled` / crash do processo por falta de memória |
| Conexões de rede | Conexões TCP abertas na porta `PORT` | Conexões enfileiradas além do backlog do Express/OS | Falhas de bind na porta (`EADDRINUSE`, etc.) |

Não há linha de "Database connections" — `GET /users` não usa banco de dados (dados em memória, conforme [_techspec.md](_techspec.md)).

### Business Metrics

N/A confirmado — `GET /users` é dado de referência somente-leitura (3 registros fixos, sem criação/edição/exclusão, sem fluxo de conversão ou funil no PRD). Os gatilhos de rollback do deploy plan são sinais técnicos de disponibilidade/corretude, não métricas de negócio (mapeados na seção Alerting Rules abaixo) — nenhum número de negócio é inventado aqui.

## Structured Logging

| Event | Level | Fields | When |
|-------|-------|--------|------|
| `users:list:success` | INFO | `correlationId`, `method`, `path` (`/users`), `statusCode` (200), `durationMs`, `resultCount` | A cada resposta bem-sucedida de `GET /users` |
| `users:list:failure` | ERROR | `correlationId`, `method`, `path` (`/users`), `statusCode`, `durationMs`, `errorMessage` | Qualquer resposta não-200 de `GET /users` (hoje só ocorreria por erro de framework/infra — o handler em si não tem caminho de falha, conforme [_techspec.md](_techspec.md)) |
| `health:check:success` | INFO | `correlationId`, `method`, `path` (`/health`), `statusCode` (200), `durationMs` | A cada resposta bem-sucedida de `GET /health` |
| `health:check:failure` | ERROR | `correlationId`, `method`, `path` (`/health`), `statusCode`, `durationMs`, `errorMessage` | Qualquer resposta não-200 de `GET /health` — sinal direto de gatilho de rollback |
| `process:startup:failure` | ERROR | `correlationId` (N/A/gerado no boot), `port`, `errorMessage`, `errorCode` | `server.once('error', ...)` disparado em `src/server.js`, ou processo encerra com código de saída não-zero |

Princípios aplicados:
- JSON estruturado, um `correlationId` por requisição (hoje inexistente — precisaria de um middleware novo, fora do escopo deste documento).
- Nenhum campo de log inclui `nome` ou `email` dos registros de `users` — apenas `resultCount` (quantidade), nunca o corpo da resposta, evitando expor os dados de exemplo em texto de log mesmo sendo fictícios.
- Nível `ERROR` reservado a falhas reais (resposta não-200, crash de processo); sucesso é sempre `INFO`.

## Distributed Tracing

Omitido — `GET /users` é single-service (processo Express único, sem chamada a outro serviço, banco de dados ou API externa), conforme [_techspec.md](_techspec.md) ("Pontos de Integração: Não aplicável").

## Alerting Rules

Cada gatilho de rollback definido em [_deploy_plan.md](_deploy_plan.md) tem um alerta correspondente:

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| `GET /users` fora do ar ou malformado | Verificação sintética de `GET /users` retorna status ≠ 200, corpo que não é array JSON, ou `Content-Type` ≠ `application/json`, em 2 checagens consecutivas | P1 | Pagear on-call; seguir "Rollback Procedure" do [_deploy_plan.md](_deploy_plan.md) (gatilho 1) |
| `/api-docs.json` sem `/users` após restart | Verificação sintética de `GET /api-docs.json` retorna status ≠ 200, ou `paths` não inclui `/users`, por > 5 min após o restart do deploy | P2 | Notificar o engenheiro responsável; confirmar se o restart do passo 2 do Rollout Strategy realmente ocorreu antes de escalar (gatilho 2) |
| `GET /health` fora do ar | Verificação de `GET /health` retorna status ≠ 200 em 1 checagem | P1 | Pagear on-call imediatamente; seguir "Rollback Procedure" do [_deploy_plan.md](_deploy_plan.md) (gatilho 3) — sinal de que o processo não subiu corretamente |
| Processo falha ao iniciar | Processo não abre a porta `PORT` dentro de 30s do `npm start`, ou `server.once('error', ...)` é acionado | P1 | Pagear on-call; não prosseguir com o rollout; investigar log de `process:startup:failure` (gatilho 4) |
| Alta latência (adicional, não é gatilho do deploy plan) | p99 de `GET /users` ou `GET /health` > 500ms por 10 min | P2 | Notificar canal da equipe; investigar antes que vire indisponibilidade |
| Alta taxa de erro (adicional) | > 5% de respostas não-200 em `GET /users` ou `GET /health` por 5 min | P1 | Pagear on-call; correlacionar com `users:list:failure`/`health:check:failure` |

Princípios aplicados: alertas disparam em sintomas (status code, latência, ausência de rota no spec), não em causas; nenhum alerta sem ação definida; toda severidade P1 aponta de volta ao runbook em [_deploy_plan.md](_deploy_plan.md).

## Dashboard Specification

```markdown
## Dashboard: get-users

### Row 1: Health Overview
- Panel: Request rate — GET /users e GET /health (graph, janela de 5m)
- Panel: Error rate — GET /users e GET /health (graph, janela de 5m)
- Panel: Latência p50/p95/p99 — GET /users e GET /health (graph, janela de 5m)

### Row 2: Feature-Specific (gatilhos de rollback)
- Panel: Disponibilidade de /api-docs.json com /users no spec (stat binário: presente/ausente)
- Panel: resultCount de GET /users ao longo do tempo (stat — confirma que a resposta segue tendo os 3 registros esperados)

### Row 3: Infrastructure
- Panel: CPU do processo Node (graph)
- Panel: Uso de heap / memória do processo (graph)
- Panel: Event loop lag (graph)
```

## SLI/SLO

Omitido — [_techspec.md](_techspec.md) não define SLA explícito para `GET /users` (apenas menciona "Monitoramento e Observabilidade: Não aplicável"); nenhum número de SLO é inventado aqui.
