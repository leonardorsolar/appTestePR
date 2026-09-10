# Schemas de Metadados de Task

Os metadados de task são parseados do frontmatter YAML pela função `ParseTaskFile()` do Compozy em `internal/core/tasks/parser.go`.
A execução paralela de tasks também lê o manifesto canônico do grafo em `_tasks.md`.

## Manifesto do Grafo de `_tasks.md`

O arquivo `_tasks.md` é o dono das relações de dependência de toda a suíte de tasks. Ele deve começar com frontmatter no seguinte formato:

```yaml
schema_version: "aes.tasks/v2"
workflow: feature-name
graph:
  nodes:
    - id: task_01
      file: task_01.md
  edges:
    - from: task_01
      to: task_02
```

Regras do grafo:

- `schema_version` DEVE ser `aes.tasks/v2`.
- `workflow` DEVE corresponder ao nome do diretório da feature/task.
- `graph.nodes` DEVE incluir toda task gerada exatamente uma vez.
- Os valores de `id` do node DEVEM ser identidades canônicas `task_NN`.
- Os valores de `file` do node DEVEM corresponder ao id do node, ex.: `task_01.md`.
- `graph.edges` armazena somente relações de dependência. Cada edge significa que `from` deve terminar antes de `to` poder começar.
- Use `edges: []` quando não houver dependências.
- O grafo DEVE ser acíclico.

## Frontmatter de Task Individual

Arquivos de task individuais são donos apenas dos próprios metadados de task. Eles não são donos da topologia do grafo.

### Campos Obrigatórios

- `status`: Estado do ciclo de vida da task.
- `title`: Título legível da task. Deve corresponder ao primeiro H1 no corpo da task.
- `type`: Slug do tipo de trabalho permitido. Use `[tasks].types` de `.aes/config.toml` quando configurado; caso contrário use os padrões embutidos `frontend`, `backend`, `docs`, `test`, `infra`, `refactor`, `chore`, `bugfix`.
- `complexity`: Classificação de risco. Deve ser um de: `low`, `medium`, `high`, `critical`. Complexidade classifica risco de implementação (superfície de regressão, concorrência, coordenação entre tasks), não tamanho — uma task grande mas bem especificada pode ser `low`, e uma classificação alta nunca é motivo para dividir a task.

Não inclua `dependencies` no frontmatter de tasks individuais para suítes `aes.tasks/v2`. Dependências pertencem somente a `_tasks.md`, sob `graph.edges`.

## Valores de Status

Valores válidos de `status`:

- `pending` - a task ainda não foi iniciada.
- `in_progress` - a task está sendo trabalhada no momento.
- `completed` - a task está finalizada e verificada.
- `done` - tratado como completed.
- `finished` - tratado como completed.

## Nomenclatura de Arquivos

Arquivos de task devem corresponder ao padrão `task_\d+\.md` com números zero-padded:

- `task_01.md`, `task_02.md`, `task_10.md`, `task_99.md`

O prefixo com underscore é reservado para documentos meta:

- `_prd.md` - Documento de Requisitos de Produto
- `_user_stories.md` - Catálogo de user stories (complementar ao PRD)
- `_techspec.md` - Especificação Técnica
- `_tests.md` - Contrato de teste (complementar à TechSpec)
- `_tasks.md` - Manifesto do grafo de tasks

## Compatibilidade do Parser

O Compozy lê arquivos de task que correspondem ao regex `^task_\d+\.md$`. Arquivos com o prefixo antigo `_task_` não são reconhecidos. O arquivo DEVE começar com frontmatter YAML para que `ParseTaskFile()` consiga ler os metadados.
