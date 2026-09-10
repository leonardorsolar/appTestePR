---
name: aes-pr-ready-gate
description: Confere se o loop aes-review-round ↔ aes-fix-reviews de uma tarefa `.aes/tasks/<slug>/` já chegou a zero issues em aberto (status `pending` ou `valid` em qualquer `reviews-NNN/issue_NNN.md`) e, se sim, promove o PR de rascunho existente para pronto via `gh pr ready` — nunca mergeia, nunca dispara deploy. Se ainda houver issues em aberto, não mexe no PR e devolve quantas restam (com a quebra por status/severidade) orientando rodar `aes-fix-reviews` de novo. Use quando o usuário pedir para "promover o PR", "tirar o PR do rascunho", "marcar como pronto pra revisão", ou ao final do loop de code review antes da aprovação humana. Do NOT use para criar o PR de rascunho (isso é `aes-github-create-draft-pr`), rodar a revisão em si (`aes-review-round`), corrigir issues (`aes-fix-reviews`), mergear o PR, ou disparar qualquer pipeline de deploy — nenhuma dessas ações é responsabilidade desta skill.
---

# aes-pr-ready-gate

## Objetivo

Ser o portão (gate) entre o loop de revisão manual (`aes-review-round` ↔ `aes-fix-reviews`) e a aprovação humana: só promove o PR de rascunho para "pronto para revisão" quando não sobra nenhuma issue em aberto. Nunca mergeia o PR e nunca dispara deploy — essas continuam sendo etapas separadas, decididas por um humano (branch protection) e pela etapa de implantação (`aes-deploy-plan`), não por esta skill.

## Pré-requisitos

- Invoca **`aes-gh-preflight`** logo no início, igual a `aes-github-create-draft-pr`. Se qualquer checagem falhar (`gh` ausente, não autenticado, detached HEAD), a skill **para** e repassa a orientação retornada pela preflight.
- Assume um slug de tarefa já conhecido (`<slug>`, o mesmo nome de diretório usado em `.aes/tasks/<slug>/` pelo resto do catálogo). Se o chamador não informar o slug, derivá-lo da tarefa/PRD em andamento, nunca inventar um novo.
- Assume que já existe um PR de rascunho aberto para `feature/<slug>` (criado por `aes-github-create-draft-pr`). Esta skill não cria PR — só promove um que já existe.

## O que conta como "issue em aberto"

Cada `issue_NNN.md` dentro de `.aes/tasks/<slug>/reviews-NNN/` tem, no frontmatter, um campo `status` que percorre o ciclo `pending → valid|invalid → resolved` (ver `aes-review-round/references/issue-template.md`):

- `pending` — ainda não triada pelo `aes-fix-reviews`. **Em aberto.**
- `valid` — triada como problema real; pelo workflow do `aes-fix-reviews`, o fix já foi aplicado no mesmo passo em que o status vira `valid`, mas a issue só é finalizada como `resolved` por um processo externo ao catálogo de skills (fora do escopo desta ferramenta). Até lá, **conta como em aberto** — é a definição conservadora: preferir barrar um PR que na prática já foi corrigido a promover um PR com pendência real.
- `invalid` — triada como não-problema. **Não conta.**
- `resolved` — finalizada. **Não conta.**

Portanto: `issues_em_aberto = issues com status "pending" OU "valid"`, somando **todas** as rodadas (`reviews-001/`, `reviews-002/`, ...), não só a mais recente — uma issue `valid` de uma rodada antiga que nunca foi finalizada ainda representa um risco não confirmado como corrigido de fato.

## Passos

### 1. Rodar a `aes-gh-preflight`

Chama a skill e recebe o objeto de status (ver `aes-gh-preflight/SKILL.md`). Se `gh_installed: false`, `gh_authenticated: false` ou `detached_head: true` → parar e repassar a orientação da preflight.

### 2. Localizar as rodadas de revisão

- Verificar que `.aes/tasks/<slug>/` existe. Se não existir, parar e reportar o diretório ausente.
- Listar os subdiretórios `reviews-NNN/` (padrão `reviews-\d+`). Se nenhum existir, não há issues a triar — pular direto para o passo 4 com `issues_em_aberto = 0`.

### 3. Contar as issues em aberto

Para cada `reviews-NNN/issue_*.md` encontrado, ler o campo `status` do frontmatter:

```bash
for f in .aes/tasks/<slug>/reviews-*/issue_*.md; do
  awk -F': ' '/^status:/{print $2; exit}' "$f"
done
```

- Classificar cada arquivo como `pending`, `valid`, `invalid` ou `resolved`.
- `issues_em_aberto` = soma de `pending` + `valid`.
- Guardar também a severidade (`severity:`) de cada issue em aberto, para o relatório do passo 4b.

### 4. Decidir com base na contagem

#### 4a. Se `issues_em_aberto == 0`

- Resolver o PR da branch `feature/<slug>` (ou da branch atual, se já estiver nela):

  ```bash
  gh pr view feature/<slug> --json url,isDraft,state -q .
  ```

- Se nenhum PR for encontrado → **parar** e reportar que não há PR de rascunho para promover; orientar rodar `aes-github-create-draft-pr` primeiro. Não criar um PR aqui.
- Se o PR já não estiver em rascunho (`isDraft: false`) → não é erro; reportar que já está pronto (idempotente), sem chamar `gh pr ready` de novo.
- Se o PR estiver em rascunho (`isDraft: true`) → promover:

  ```bash
  gh pr ready feature/<slug>
  ```

  - **Nunca** rodar `gh pr merge`, nem qualquer comando de deploy/publish — isso está fora do escopo desta skill mesmo com o gate verde.
- Devolver a URL do PR e confirmar que ele está pronto para revisão humana.

#### 4b. Se `issues_em_aberto > 0`

- **Não** chamar `gh pr ready` nem tocar no PR de forma alguma.
- Reportar o total de issues em aberto, com a quebra:
  - Quantas em `pending` (ainda não triadas) vs. quantas em `valid` (triadas, fix aplicado, aguardando finalização).
  - Quantas por severidade (`critical`, `high`, `medium`, `low`).
  - Os arquivos (`reviews-NNN/issue_NNN.md`) envolvidos.
- Orientar a rodar `aes-fix-reviews` novamente sobre as issues `pending` restantes (as `valid` já foram corrigidas pelo `aes-fix-reviews`, mas ainda contam como em aberto até serem finalizadas).

## Saída

Gate aprovado:

```json
{
  "gate": "passed",
  "issues_open": 0,
  "pr_url": "https://github.com/org/repo/pull/123",
  "promoted": true,
  "already_ready": false
}
```

Gate bloqueado:

```json
{
  "gate": "blocked",
  "issues_open": 3,
  "pending": 1,
  "valid": 2,
  "by_severity": { "critical": 0, "high": 1, "medium": 2, "low": 0 },
  "issue_files": [
    ".aes/tasks/<slug>/reviews-002/issue_002.md",
    ".aes/tasks/<slug>/reviews-002/issue_004.md",
    ".aes/tasks/<slug>/reviews-003/issue_001.md"
  ],
  "promoted": false
}
```

## Critical Rules

- Nunca rodar `gh pr merge` ou qualquer variante de merge automático — a aprovação e o merge continuam sendo de um Code Owner humano via branch protection.
- Nunca disparar pipeline de deploy, comando de release, ou qualquer ação além de `gh pr ready`.
- Nunca editar o conteúdo ou o `status` de nenhum `issue_NNN.md` — essa skill só lê, quem escreve é `aes-fix-reviews`.
- Nunca criar um PR novo — se não existir PR de rascunho, parar e orientar `aes-github-create-draft-pr`.
- Ser conservadora na contagem: na dúvida entre contar ou não uma issue como em aberto (ex. `status` ausente ou valor não reconhecido), tratar como em aberto e parar o gate, nunca promover no escuro.

## Erros e mensagens

| Situação | Comportamento |
|---|---|
| `aes-gh-preflight` reporta `gh` ausente/não autenticado/detached HEAD | Para e repassa a orientação da preflight |
| `.aes/tasks/<slug>/` não existe | Para e reporta o diretório ausente |
| Nenhum `reviews-NNN/` encontrado | Trata como zero issues em aberto e segue para promover o PR |
| Issues em aberto (`pending` ou `valid`) > 0 | Não promove; reporta a contagem e orienta rodar `aes-fix-reviews` |
| Nenhum PR encontrado para a branch | Para e orienta rodar `aes-github-create-draft-pr` primeiro |
| PR já não está em rascunho | Reporta como já pronto (idempotente), não chama `gh pr ready` de novo |
| `gh pr ready` falha por permissão/rate limit | Para e reporta a mensagem do `gh` tal como recebida |

## Skills relacionadas

- `aes-gh-preflight` — dependência, roda antes de qualquer coisa.
- `aes-github-create-draft-pr` — cria o PR de rascunho que esta skill promove; rodar antes se ainda não existir PR.
- `aes-review-round` / `aes-fix-reviews` — geram e triam as issues que este gate conta; rodar `aes-fix-reviews` de novo é a orientação padrão quando o gate bloqueia.
