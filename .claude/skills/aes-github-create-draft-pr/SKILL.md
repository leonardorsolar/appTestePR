---
name: aes-github-create-draft-pr
description: Cria (ou reaproveita, se já existir) um Pull Request de rascunho no GitHub para uma tarefa `.aes/tasks/<slug>/` em andamento — verifica pré-requisitos via aes-gh-preflight, garante a branch `feature/<slug>`, envia (push) a branch, abre o PR em modo rascunho usando o template padrão do projeto (linkando as tarefas de `_tasks.md`), e devolve a URL para visualização. Use quando o usuário pedir para "criar um PR de rascunho", "abrir um draft PR", "abrir PR em progresso", ou ao final de uma tarefa antes da etapa de revisão de código (aes-review-round) — trabalho ainda incompleto, só quer um lugar pra acompanhar. Do NOT use quando a feature já está pronta pra shipar / revisão final de verdade (nesse caso use `ship-pr`), nem para push/commit isolado sem abrir PR, nem para promover um PR de rascunho já aberto para "ready for review" (isso é passo do fluxo de `aes-review-round`/`aes-fix-reviews`, não desta skill).
---

# aes-github-create-draft-pr

## Objetivo

Abrir (ou, se já existir para a branch, reaproveitar) um Pull Request em modo rascunho no GitHub garantindo que exista a branch `feature/<slug>` da tarefa, com o corpo do PR já estruturado a partir do template padrão do projeto e das tarefas rastreadas em `.aes/tasks/<slug>/`. Serve como ponte entre a implementação (`aes-execute-task` / `aes-loop-tasks`) e a revisão de código (`aes-review-round`), dando ao revisor uma página real para acompanhar o trabalho — nunca o PR final pronto pra merge (isso é `ship-pr`).

## Pré-requisitos

- Invoca **`aes-gh-preflight`** logo no início. Se qualquer checagem falhar (`gh` ausente, não autenticado, detached HEAD), a skill **para** e repassa a orientação retornada pela preflight — não tenta seguir com o ambiente incompleto.
- Assume um slug de tarefa já conhecido (`<slug>`, o mesmo nome de diretório usado em `.aes/tasks/<slug>/` pelo resto do catálogo — `aes-one-call-lite`, `aes-execute-task`, `aes-review-round`). Se o chamador não informar o slug, derivá-lo do nome da tarefa/PRD em andamento, nunca inventar um novo.

## Passos

### 1. Rodar a `aes-gh-preflight`

Chama a skill e recebe o objeto (ver `aes-gh-preflight/SKILL.md` para o contrato completo):

```json
{
  "gh_installed": true,
  "gh_authenticated": true,
  "current_branch": "main",
  "is_default_branch": true,
  "needs_new_branch": true,
  "detached_head": false
}
```

- Se `gh_installed: false`, `gh_authenticated: false` ou `detached_head: true` → parar e repassar a orientação da preflight.
- Se tudo certo → seguir para o passo 2 usando `needs_new_branch` e `current_branch`.

### 2. Resolver a branch padrão (base do PR)

A preflight não garante devolver o *nome* da branch padrão (só booleanos). Resolver localmente, sempre:

```bash
default_branch=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')
default_branch=${default_branch:-main}
```

Esse é o valor usado como `<branch-padrão>` no passo 6 (`--base`).

### 3. Garantir a branch `feature/<slug>`

Mesma convenção de nomenclatura e reaproveitamento usada por `aes-one-call-lite` — **nunca** criar uma branch com nome diferente pra mesma tarefa:

- Se `feature/<slug>` já é a branch atual → não faz nada.
- Se `feature/<slug>` já existe mas não está checked out → `git checkout feature/<slug>` (reaproveita).
- Se não existe → `git checkout -b feature/<slug>` (funciona tanto a partir de `main` quanto de outra branch).

Nunca gerar um novo slug/branch para uma tarefa que já tem uma `feature/<slug>` em andamento — isso duplicaria o trabalho e quebraria o rastreamento em `.aes/tasks/<slug>/`.

### 4. Verificar se há algo pra propor como PR

```bash
git log <default_branch>..feature/<slug> --oneline
```

- Se vazio (nenhum commit ainda na branch) → **parar** e reportar que não há mudanças commitadas; não faz sentido abrir PR de uma branch idêntica à base.

### 5. Enviar (push) a branch

```bash
git push -u origin feature/<slug>
```

- **Nunca usar `--force`/`--force-with-lease`** — se o push for rejeitado (non-fast-forward), parar e reportar o conflito; não é responsabilidade desta skill resolver histórico divergente.

### 6. Checar se já existe PR aberto para a branch (idempotência)

```bash
gh pr view feature/<slug> --json url,isDraft,state -q .
```

- Se já existir um PR aberto (`state: "OPEN"`) para essa branch → **pular os passos 7 e 8**, ir direto pra "Saída" reaproveitando a URL encontrada. Não tentar criar um segundo PR para a mesma branch.
- Se não existir (`gh pr view` retorna erro "no pull requests found") → seguir para o passo 7.

### 7. Montar o corpo do PR a partir do template

- Ler `references/pr-template.md`.
- Preencher automaticamente os campos que podem ser inferidos do contexto da tarefa:
  - **Visão Geral** — resumo objetivo a partir de `.aes/tasks/<slug>/_prd.md` (ou do título/descrição da tarefa, se o PRD não existir).
  - **Tarefas Vinculadas** — listar as tasks de `.aes/tasks/<slug>/_tasks.md` cobertas nesta branch (referenciar pelo ID/arquivo `task_NN.md`, não assumir que existe uma issue do GitHub correspondente).
  - **Categoria da Mudança** — marcar o checkbox com base no tipo predominante dos commits (conventional commits: `feat` → Nova funcionalidade, `fix` → Correção de bug, `refactor` → Refatoração, `docs` → Documentação, `style` → Ajuste de estilo); se os commits misturarem tipos sem um predominante claro, marcar "Outro" e descrever.
  - **Alterações Realizadas** — um item por commit/mudança relevante (`git log <default_branch>..feature/<slug> --oneline`).
- Campos que dependem de validação humana — **Roteiro de Testes**, **Evidências Visuais**, **Checklist**, **Notas para o Revisor** — ficam em branco no template, para o autor completar depois de o PR estar aberto.

### 8. Criar o PR de rascunho

```bash
gh pr create --draft --base "$default_branch" --title "<título>" --body-file <arquivo-com-corpo-preenchido>
```

### 9. Obter e devolver a URL

```bash
gh pr view --json url -q .url
```

- Devolve a URL estruturada para o chamador/frontend renderizar como link ou botão clicável.
- **Não** tenta abrir o navegador via `open`/`xdg-open` — a skill pode rodar num terminal embutido sem acesso ao navegador do usuário; quem decide como exibir o link é a camada que a invocou.

## Saída

```json
{
  "pr_url": "https://github.com/org/repo/pull/123",
  "branch": "feature/<slug>",
  "draft": true,
  "already_existed": false
}
```

`already_existed: true` quando o passo 6 encontrou um PR já aberto e a skill só devolveu a URL, sem criar nada novo.

Se qualquer passo falhar antes do fim, a skill para ali e retorna o campo relevante junto da causa — ver tabela abaixo.

## Erros e mensagens

| Situação | Comportamento |
|---|---|
| `aes-gh-preflight` reporta `gh` ausente/não autenticado/detached HEAD | Para e repassa a orientação da preflight, sem tentar os passos seguintes |
| Branch sem commits novos em relação à base (passo 4) | Para e reporta que não há mudanças pra propor como PR |
| Push rejeitado (non-fast-forward) | Para e reporta o conflito; nunca força o push |
| Já existe PR aberto pra essa branch (passo 6) | Não é erro — reaproveita a URL existente (`already_existed: true`) |
| `gh pr create` falha por falta de permissão no repo | Para e reporta a mensagem de permissão do `gh` tal como recebida |
| `gh pr create` falha por rate limit da API | Para e reporta para tentar novamente mais tarde, sem retry automático |

## Referências

- `references/pr-template.md` — template padrão de descrição de PR usado pelo projeto.

## Skills relacionadas

- `aes-gh-preflight` — dependência, roda antes de qualquer coisa.
- `aes-review-round` — etapa seguinte no fluxo, consome o PR aberto por esta skill.
- `ship-pr` — contraparte para quando o trabalho está **pronto pra shipar** (não em rascunho); use essa, não `aes-github-create-draft-pr`, quando a feature já está completa.
