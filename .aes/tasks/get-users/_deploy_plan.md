# Deploy Plan: GET /users

aaa
Plano de implantação para a funcionalidade `GET /users` (`.aes/tasks/get-users/`). Task 01 e Task 02 estão `completed` em [_tasks.md](_tasks.md), os 31 testes da suíte passam (`npm test`), e o PR #2 (`feat: add GET /users endpoint with in-memory user list`) já foi mergeado em `main` — tratado como revisado/aprovado por confirmação do engenheiro (sem `reviewDecision` formal registrado no GitHub e sem pasta `reviews/`/`qa/` neste workflow).

**Nota de escopo**: este repositório não tem pipeline de CI (`.github/workflows/` não existe), nem Dockerfile/orquestrador, nem infraestrutura de deploy definida — `npm start` inicia o processo Node diretamente. Este plano assume o mesmo processo de implantação manual usado para a fundação `servidor-backend` (não há um mecanismo diferente a documentar).

## Pre-Deployment Checklist

- [x] Todos os testes passam localmente — `npm test`: 5 suítes, 31 testes, 0 falhas.
- [x] Código já mergeado em `main` via PR #2 (`cac5b24`).
- [ ] QA / System Testing formal — não há pasta `qa/` neste workflow; validado apenas pela suíte automatizada (UT-005–UT-009, IT-009–IT-012 em [_tests.md](_tests.md)).
- [x] Migrações de banco de dados — N/A, sem banco de dados (dados em memória em `src/routes/users.js`).
- [x] Variáveis de ambiente — nenhuma nova; `PORT` continua opcional (default 3000), sem mudança de configuração.
- [x] Feature flags — N/A, sem feature flag neste projeto.
- [ ] Monitoramento/alerting — N/A confirmado: projeto não tem logging, métricas ou alerting hoje (mesmo nível de observabilidade de `/health`, decisão explícita do PRD/ADR-001 da fundação).
- [ ] Runbook/playbook — este documento é o primeiro runbook do projeto; nenhum anterior a atualizar.
- [ ] Stakeholders notificados — pendente, ver Plano de Comunicação abaixo.

## Cost Impact

N/A — non-cloud change. Sem provisionamento de recursos novos: rota adicional em um processo Node já existente, dados em memória, sem banco de dados nem serviço externo.

## Rollout Strategy

**Estratégia escolhida: Big Bang.**

Justificativa: a mudança é de baixo risco por natureza — leitura pura (`res.status(200).json(users)`), sem estado mutável, sem I/O externo, sem autenticação, sem migração de dados, e replica exatamente o padrão já em produção para `GET /health`. Não há justificativa técnica para rollout gradual (feature flag, canary) neste projeto, que não tem infraestrutura para servir tráfego percentual ou múltiplas versões simultâneas do processo. Adicionar essa complexidade contrariaria a decisão de escopo mínimo do PRD/ADR-001.

Passos do rollout (sem estágios percentuais — implantação única):

1. Deploy do commit já mergeado em `main` (`cac5b24` ou posterior) no ambiente-alvo.
2. Reiniciar o processo Node (`npm start` / equivalente do processo em execução) — obrigatório: `swaggerSpec` é montado uma vez no import (`src/docs/swaggerSpec.js`), então `/users` só aparece em `/api-docs` e `/api-docs.json` após o restart (comportamento documentado em AGENTS.md).
3. Critério de sucesso para considerar o deploy bem-sucedido: todos os smoke tests da seção "Post-Deployment Verification" passam na primeira tentativa, sem necessidade de retry.
4. Sinal a observar: nenhum sinal automatizado existe (sem monitoramento) — a verificação é manual, imediatamente após o restart.

## Rollback Procedure

### Triggers (when to rollback)

- `GET /users` não retorna `200` ou não retorna um array JSON (ex. erro 500, corpo vazio, `Content-Type` diferente de `application/json`).
- `GET /api-docs.json` deixa de responder `200`, ou seu campo `paths` não inclui `/users` após o restart do processo.
- `GET /health` (endpoint pré-existente) para de responder `200` após o deploy — sinal de que o processo não subiu corretamente.
- O processo falha ao iniciar (`npm start` encerra com erro / `server.once('error', ...)` em `src/server.js` é acionado).

### Steps

1. Reverter para o commit anterior a `cac5b24` (`70e1865` ou o commit estável anterior ao merge do PR #2) — `git revert` do merge commit, ou checkout do commit anterior no ambiente de deploy.
2. Reiniciar o processo Node com o código revertido.
3. Confirmar que `GET /health` volta a responder `200` e que `GET /api-docs.json` volta a listar apenas `/health` (estado anterior conhecido).
4. Confirmar que `GET /users` deixa de existir (404), validando que o rollback foi completo.

### Verification

- Repetir os smoke tests da seção "Post-Deployment Verification" contra o código revertido — devem refletir o comportamento pré-`/users` (apenas `/health` documentado).
- Sem dados persistidos nesta funcionalidade (array em memória, somente leitura) — não há checagem de consistência de dados a fazer; nada para migrar de volta.

### Communication

- Notificar quem solicitou o deploy (o engenheiro responsável, `leonardorsolar`) sobre o rollback e o motivo (qual trigger foi acionado).
- Registrar o rollback como comentário no PR #2 ou em um novo PR/issue, referenciando o commit revertido — não há status page ou canal formal de comunicação configurado neste projeto para atualizar externamente.

## Post-Deployment Verification

Smoke tests (executar manualmente logo após o restart, na ausência de CI/monitoramento):

1. `curl -i http://<host>:<port>/health` → `200`, corpo `{"status":"ok"}`.
2. `curl -i http://<host>:<port>/users` → `200`, `Content-Type: application/json`, corpo é um array de 3 objetos com exatamente os campos `id`, `nome`, `email` (ver exemplo em [_techspec.md](_techspec.md)).
3. `curl -s http://<host>:<port>/api-docs.json | jq '.paths | keys'` → inclui tanto `/health` quanto `/users`.
4. Abrir `http://<host>:<port>/api-docs` no navegador → confirmar que `GET /users` aparece na Swagger UI com o exemplo de resposta documentado.
5. Repetir a chamada a `GET /users` duas vezes seguidas → resposta idêntica (idempotência, conforme regra de negócio do PRD).

Não há métricas para observar por 24h (sem infraestrutura de monitoramento) — a verificação acima é o critério de aceite completo do deploy.

## Communication Plan

**Changelog** (não há arquivo `CHANGELOG.md` no projeto; usar a descrição do PR como registro):

```
feat: GET /users — retorna a lista de usuários de exemplo (id, nome, email)
em memória, documentada via Swagger em /api-docs e /api-docs.json.
```

**Notificação interna**: informar a equipe (ou o próprio solicitante, dado que este é um projeto de uma pessoa) que `/users` está no ar após o restart do processo, apontando para `/api-docs` como fonte do contrato.

**Release notes para consumidores da API**: a própria Swagger UI (`/api-docs`) já serve como release note viva do endpoint — não há canal de release notes separado neste projeto; nenhuma ação adicional necessária além de garantir que o restart do passo de rollout já foi feito antes de anunciar o endpoint como disponível.
