# Security Audit (Static): GET /users

Auditoria de segurança estática da feature `GET /users` (`.aes/tasks/get-users/`), conforme `aes-security-audit`. Complementa [_techspec.md](_techspec.md) e os ADRs referenciados.

## Pré-condições

- **Rodada de code review (`reviews-NNN/`)**: não encontrada em `.aes/tasks/get-users/`. A feature foi integrada via PR do GitHub (#2, `merge pull request #2 from leonardorsolar/metodo-get-users`), mas não passou pelo fluxo formal `aes-review-round`/`aes-fix-reviews`. Prosseguir com o audit foi confirmado explicitamente pelo usuário.
- `_techspec.md`: presente, usado para mapear componentes e limites (seção "Arquitetura do Sistema").

## Componentes e Limites Auditados

| Componente | Papel |
|---|---|
| `src/routes/users.js` | Handler `usersHandler` + array `users` em memória + bloco `@openapi` |
| `src/app.js` | Registro da rota `GET /users` no Express, sem middleware adicional |
| `src/docs/swaggerSpec.js` (efeito indireto) | Expõe o mesmo array de exemplo via `/api-docs` e `/api-docs.json` |
| Cliente HTTP → Express → `usersHandler` → `res.json(users)` | Único fluxo de dados; sem DB, sem serviço externo, sem autenticação |

## 1. Threat Modeling (STRIDE)

| Threat | Análise | Mitigação | Status |
|--------|---------|-----------|--------|
| **S**poofing | Não há identidade de chamador a ser forjada — endpoint público por decisão de produto ([ADR-001](adrs/adr-001.md)), sem sessão/credencial. | N/A — fora do modelo de ameaça aceito para esta feature. | ✓ (aceito) |
| **T**ampering | `users` é `const`, nunca mutado por nenhum caminho de código; não há endpoint de escrita. Dado não pode ser alterado via request. | Imutabilidade estrutural (array `const`, sem rota `POST`/`PUT`). | ✓ |
| **R**epudiation | Nenhum log de acesso é gerado (decisão explícita de escopo, ver AGENTS.md — sem middleware de log no projeto). Não é possível provar quem chamou o endpoint. | Aceito — mesmo nível de observabilidade de `/health`; fora do escopo desta feature (ADR-001 da fundação `servidor-backend`). | ✓ (aceito, não é regressão introduzida por esta feature) |
| **I**nformation Disclosure | Array retornado tem forma de PII (`nome`, `email`), mas os valores são fixture (`@example.com`, nomes fictícios) sem controle de acesso. Mesmo dado é duplicado em `/api-docs.json` como exemplo do schema. | Ver finding SEC-01 abaixo. | ⚠ |
| **D**enial of Service | Handler é síncrono, O(1), sem I/O — custo por request é trivial. Não há rate limiting. | Ver finding SEC-02 abaixo (severidade baixa dado o custo do handler). | ⚠ |
| **E**levation of Privilege | Não existem níveis de privilégio na aplicação; não há recurso a ser escalado. | N/A. | ✓ |

## 2. OWASP Top 10 Checklist

- [x] **Injection**: Não aplicável — `usersHandler` não lê `req` (nem query, nem body, nem headers); não há superfície de injeção.
- [x] **Broken Authentication**: Não aplicável por design — endpoint público, decisão de produto documentada em [ADR-001](adrs/adr-001.md).
- [⚠] **Sensitive Data Exposure**: dados com forma de PII expostos sem controle — ver SEC-01. Confirmado que são dados fictícios (domínio `example.com`), risco real é baixo.
- [x] **XML/XXE**: Não aplicável — nenhum processamento de XML no projeto.
- [x] **Broken Access Control**: Ausência de controle de acesso é decisão de produto explícita e documentada (ADR-001), não uma lacuna acidental — não haveria "controle esperado" a validar.
- [⚠] **Security Misconfiguration**: nenhum header de segurança (`helmet`, CSP, HSTS, etc.) configurado em `app.js` — pré-existente ao nível da aplicação (já vale para `/health`), não introduzido por esta feature; ver Riscos Aceitos.
- [x] **XSS**: Resposta é `application/json` via `res.json()`, sem renderização HTML; sem vetor de XSS.
- [x] **Insecure Deserialization**: Não aplicável — nenhuma deserialização de entrada não confiável.
- [x] **Known Vulnerabilities**: `npm audit` executado — 0 vulnerabilidades (ver seção 3).
- [x] **Insufficient Logging**: Ausência de logging é decisão de escopo já documentada (AGENTS.md), não regressão desta feature.

## 3. Dependency Audit

```
$ npm audit --json
{
  "vulnerabilities": {},
  "metadata": {
    "vulnerabilities": { "info": 0, "low": 0, "moderate": 0, "high": 0, "critical": 0, "total": 0 },
    "dependencies": { "prod": 110, "dev": 319, "optional": 41, "peer": 1, "peerOptional": 0, "total": 429 }
  }
}
```

**Resultado**: 0 vulnerabilidades em todas as severidades. Nenhum ecossistema Python/outro presente no repositório (apenas Node.js).

## 4. Code-Level Security Review

- [x] Input validation: N/A — `usersHandler` não consome nenhum dado externo (query params ignorados por design, EC-1 de US-001).
- [x] Output encoding: `res.json()` do Express aplica `Content-Type: application/json` corretamente; sem risco de encoding.
- [x] Authentication required: N/A por design (endpoint público, ADR-001).
- [x] Authorization at resource level: N/A — não há parâmetro de recurso (`:id` etc.) nesta rota.
- [⚠] Rate limiting: nenhum rate limiting em `GET /users` — ver SEC-02.
- [x] CORS: nenhum middleware CORS configurado; comportamento padrão do Express (restritivo para chamadas cross-origin via browser) é aceitável dado que não há dado sensível real.
- [x] Secrets: nenhum secret hardcoded — não há uso de credenciais nesta feature.
- [x] SQL parameterizado: N/A — sem banco de dados.
- [x] File uploads: N/A — não há upload nesta feature.
- [x] Error messages: N/A — handler síncrono sem caminho de erro possível (sem I/O, sem parsing), conforme `_techspec.md`.

## 5. Data Privacy

- [⚠] **PII identificada**: campos `nome`/`email` têm forma de PII. Valores são fixture fabricado (`ana.silva@example.com`, `bruno.costa@example.com`, `carla.souza@example.com`) — uso do domínio reservado `example.com` (RFC 2606) é um sinal forte de dado sintético, não real. Ver SEC-03 (recomendação apenas documental).
- [x] Retenção: N/A — array estático em memória, recriado a cada boot do processo, sem persistência.
- [x] Consentimento: N/A — nenhum dado de usuário real é coletado ou armazenado.
- [x] Exportação/exclusão (GDPR/CCPA): N/A — não há dado real de titular a exportar ou excluir.

## 6.5 Business Logic Checklist

- [x] **Resource-level authorization**: N/A — nenhum endpoint da feature recebe ID de recurso.
- [x] **Rate limiting em endpoints sensíveis**: `GET /users` não é um endpoint sensível (leitura pública de dado estático fictício, sem estado, sem custo); ver SEC-02 apenas como hardening de baixa prioridade.
- [x] **Validação de estado em fluxo multi-etapa**: N/A — não há fluxo multi-etapa nesta feature (uma única chamada, sem estado entre requests).

## Findings

### SEC-01 — Baixo — Dado com forma de PII exposto sem marcação explícita de sintético
**Onde**: `src/routes/users.js:1-5`
**Descrição**: O array `users` usa campos `nome`/`email` que se parecem com PII real. Embora o domínio `example.com` já sinalize dado fictício, não há nenhum comentário no código afirmando isso — um mantenedor futuro pode confundir com dado real ao estender a feature.
**Recomendação**: Adicionar um comentário curto acima do array afirmando que são dados de exemplo fixos (não PII real), evitando dúvida futura. Não bloqueia o merge; puramente documental.

### SEC-02 — Baixo — Ausência de rate limiting em `GET /users`
**Onde**: `src/app.js:10`
**Descrição**: Nenhum middleware de rate limiting está registrado para `GET /users` (nem globalmente na aplicação). O custo do handler é trivial (O(1), sem I/O), então o risco de DoS real é baixo, mas o endpoint é irrestrito quanto a volume de chamadas.
**Recomendação**: Aceitar como risco de baixa severidade dado o custo trivial do handler; reavaliar apenas se a fonte de dados deixar de ser um array em memória fixo (ex.: se `/users` passar a consultar um banco de dados).

### SEC-03 — Informativo — Ausência de headers de segurança HTTP (nível de aplicação, não introduzido por esta feature)
**Onde**: `src/app.js` (toda a aplicação, não específico de `/users`)
**Descrição**: Não há `helmet` nem headers de segurança (CSP, HSTS, X-Content-Type-Options) configurados em nenhuma rota, incluindo `/health` já existente. Isso é um estado pré-existente da aplicação, não uma regressão desta feature.
**Recomendação**: Fora do escopo desta auditoria de feature — registrar como risco aceito ao nível de aplicação; endereçar separadamente se/quando o projeto sair do estado "fundação mínima" (ver Boundaries em AGENTS.md sobre não adicionar estrutura para features futuras sem confirmação).

Nenhum finding Critical ou High foi identificado — nenhum PoC é necessário (regra: PoC obrigatório apenas para Critical/High).

## Security Audit Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 0 |
| 🟡 High | 0 |
| 🔵 Medium | 0 |
| ⚪ Low | 2 (SEC-01, SEC-02) |
| ℹ️ Informational | 1 (SEC-03) |

## Verdict: ⚠ CONDITIONAL PASS

### Required Remediations
Nenhuma remediação obrigatória — todos os findings são Low/Informational.

### Accepted Risks
1. **SEC-01** — dado fictício com forma de PII sem comentário explícito: aceito, recomendação documental não bloqueante.
2. **SEC-02** — sem rate limiting: aceito dado o custo trivial do handler e a ausência de estado/persistência.
3. **SEC-03** — ausência de headers de segurança HTTP: aceito como débito pré-existente de nível de aplicação, fora do escopo desta feature (decisão de escopo mínimo documentada em AGENTS.md/ADR-001 da fundação).
4. **Ausência de rodada `aes-review-round`**: aceito mediante confirmação explícita do usuário antes de rodar este audit.
