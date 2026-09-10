---
name: aes-gh-preflight
description: Verifica rapidamente se o `gh` CLI está instalado e autenticado, e se a branch atual é a branch default do repositório (ex. main/master), antes de qualquer skill que dependa de operações no GitHub (criar PR, issues, etc.). Não instala nem autentica nada sozinha — apenas verifica e orienta. Use como dependência interna de skills como aes-github-create-draft-pr. Do NOT use para configurar autenticação de verdade (SSH, token, `gh auth login` interativo) — isso é a skill `github-auth`; e não use para de fato criar o PR/issue — isso é responsabilidade de quem a chama.
---

# aes-gh-preflight

## Objetivo

Pré-checagem reutilizável e rápida para qualquer skill `aes-*` que dependa do `gh` CLI (ex.: `aes-github-create-draft-pr`, futuras `aes-create-issue`, `aes-sync-pr-status` etc.). Garante que o ambiente está pronto antes de tentar qualquer operação remota no GitHub, evitando que uma skill falhe no meio do fluxo por falta de dependência.

Não substitui `github-auth`: esta skill só faz uma leitura de estado (instalado? autenticado? em que branch?) sem guiar o usuário por um setup completo. Se a checagem de autenticação falhar, quem trata a configuração de fato é `github-auth`.

## Quando usar

Invocada no início de qualquer skill que precise falar com o GitHub via `gh`. Não é chamada diretamente pelo usuário — é uma dependência interna de outras skills do catálogo, invocada via Skill tool pelo nome `aes-gh-preflight`.

## Passos

### 1. Verificar se o `gh` está instalado

```bash
command -v gh
```

- Se não encontrado: **parar** e retornar orientação de instalação específica pro SO detectado (`uname -s`):
  - macOS → `brew install gh`
  - Linux (Debian/Ubuntu) → apontar para o repositório oficial do `gh` (evitar `apt install gh` genérico, costuma estar desatualizado nos repos padrão)
  - Windows → `winget install --id GitHub.cli`
- **Nunca instalar automaticamente.** A skill não tem permissão implícita para alterar o sistema do usuário — só orienta.

### 2. Verificar autenticação

```bash
gh auth status
```

- Se não autenticado: recomendar a skill `github-auth` (setup completo com token/SSH) ou `gh auth login` direto para o caso simples, e parar ali.

### 3. Verificar branch atual

```bash
current_branch=$(git symbolic-ref --short -q HEAD || echo "HEAD")
```

- Se `current_branch` resolver para `HEAD` → repositório está em **detached HEAD**. Tratar como caso à parte (`detached_head: true`) e parar ali — não tem sentido comparar com a branch default, e um `git push` nesse estado falha de forma confusa mais adiante.
- Descobrir a branch padrão do repositório:

```bash
default_branch=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')
default_branch=${default_branch:-main}   # fallback se o comando acima falhar (ex.: sem remote configurado)
```

- Comparar `current_branch` com `default_branch`:
  - Se **igual** (ex.: está na `main`) → sinalizar `needs_new_branch: true`. A preflight **não cria** a branch — isso é responsabilidade de quem a chama (ex.: `aes-github-create-draft-pr`).
  - Se **diferente** → `needs_new_branch: false`.

> Nota: `is_default_branch` verifica apenas se a branch atual é a branch default do repo (`main`/`master`/o que estiver configurado como HEAD do remote) — **não** consulta a API de Branch Protection Rules do GitHub. Um repositório pode proteger outras branches (`develop`, `release/*`) que esta checagem não detecta. Se isso for necessário no futuro, use `gh api repos/{owner}/{repo}/branches/{branch}/protection`.

## Saída

Retorna um objeto estruturado para o chamador decidir os próximos passos:

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

Se qualquer checagem falhar antes da última (passo 1, 2 ou o caso de detached HEAD no passo 3), a skill para ali e retorna só o campo relevante junto da orientação — nunca prossegue com dados incompletos.

## Exemplos

**Caso comum** — chamador roda a partir de uma branch de feature já existente:

- Input: repo com `gh` instalado e autenticado, `git symbolic-ref --short HEAD` → `feature/ajustar-login`, default branch `main`.
- Output:
  ```json
  { "gh_installed": true, "gh_authenticated": true, "current_branch": "feature/ajustar-login", "is_default_branch": false, "needs_new_branch": false, "detached_head": false }
  ```

**Caso-limite 1** — chamador roda direto na `main`:

- Input: `git symbolic-ref --short HEAD` → `main`, default branch `main`.
- Output:
  ```json
  { "gh_installed": true, "gh_authenticated": true, "current_branch": "main", "is_default_branch": true, "needs_new_branch": true, "detached_head": false }
  ```

**Caso-limite 2** — `gh` não autenticado:

- Input: `command -v gh` ok, `gh auth status` retorna erro.
- Output: para no passo 2 e retorna `{ "gh_installed": true, "gh_authenticated": false }` + orientação para `github-auth` / `gh auth login`.

**Caso-limite 3** — detached HEAD (ex.: checkout de um commit específico ou de uma tag):

- Input: `git symbolic-ref --short -q HEAD` falha (sem branch associada).
- Output: para no passo 3 e retorna `{ "gh_installed": true, "gh_authenticated": true, "detached_head": true }` + orientação para o chamador criar/mudar para uma branch antes de prosseguir.

## Erros e mensagens

| Situação | Comportamento |
|---|---|
| `gh` ausente | Retorna comando de instalação certo pro SO detectado |
| `gh` não autenticado | Aponta para `github-auth` / `gh auth login` |
| Repositório em detached HEAD | Para com `detached_head: true`, orienta a criar/mudar de branch |
| Branch atual é a branch default | Sinaliza como aviso (`needs_new_branch: true`), não como erro — é esperado que o chamador resolva |

## Skills relacionadas

- `github-auth` — setup completo de autenticação (token/SSH/`gh auth login`); usar quando o passo 2 falhar.
- `aes-github-create-draft-pr` — principal consumidora desta preflight hoje.