# Hardening Plan — get-users

**Generated**: 2026-09-10
**Source report**: [_security_audit.md](_security_audit.md)
**Total findings**: 3 (Critical: 0 | High: 0 | Medium: 0 | Low: 2 | Informational: 1)

## Fix Summary

| Priority | Finding | CWE | Affected File | Effort |
|---|---|---|---|---|
| P3 | SEC-01 — dado com forma de PII sem marcação de sintético | CWE-200 (informativo) | `src/routes/users.js` | 5min |
| P3 | SEC-02 — ausência de rate limiting em `GET /users` | CWE-770 | `src/app.js` | 30min |
| P3 | SEC-03 — ausência de headers de segurança HTTP (nível de app) | CWE-693 | `src/app.js` | 1h |

Nenhum finding Critical, High ou Medium foi reportado por `_security_audit.md` — não há P0, P1 ou P2 nesta rodada.

## P0 Fixes — Implement Immediately

Nenhum. `_security_audit.md` não reportou finding Critical/High com PoC.

## P1 Fixes — This Sprint

Nenhum. `_security_audit.md` não reportou finding Critical/High sem PoC.

## P2 Fixes — Next Sprint

Nenhum. `_security_audit.md` não reportou finding Medium.

## P3 Backlog

- **SEC-01** — Adicionar comentário no array `users` em `src/routes/users.js` deixando explícito que os registros (`nome`/`email`) são dados fictícios de exemplo, não PII real, evitando confusão futura ao estender a feature.
- **SEC-02** — Avaliar rate limiting em `GET /users` apenas se a fonte de dados deixar de ser um array estático em memória (ex.: se passar a consultar um banco de dados); hoje o custo do handler é O(1) e o risco é baixo.
- **SEC-03** — Avaliar headers de segurança HTTP (`helmet`, CSP, HSTS) ao nível de aplicação; é débito pré-existente (vale também para `/health`), fora do escopo desta feature — endereçar apenas quando o projeto sair do estado de "fundação mínima" (ver Boundaries em AGENTS.md).

Nenhum destes foi convertido em issue do GitHub nesta rodada — a skill só abre issues automaticamente para P1/P2, e cria issues P3 apenas se o usuário pedir explicitamente.

## Verification Checklist

- [x] Nenhuma regressão a testar — nenhum código foi alterado (todos os findings são P3, sem fix imediato exigido).
- [x] `_security_audit.md` já reflete o estado atual (0 Critical/High/Medium) — não há finding estático pendente de resolução.
- [ ] Atualizar CLAUDE.md com lições aprendidas — não aplicável nesta rodada (regra da skill: apenas para findings P0/P1 confirmados, e não houve nenhum).

## Próximo Passo

Como não há P0 pendente de fix nem P1/P2 pendente de tracking, o fluxo segue direto para `aes-deploy-plan` (que já existe em [_deploy_plan.md](_deploy_plan.md) para esta feature) — sem etapa de re-pentest neste ciclo estático.
