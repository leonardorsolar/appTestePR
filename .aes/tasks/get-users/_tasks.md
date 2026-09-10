---
schema_version: "aes.tasks/v2"
workflow: get-users
graph:
  nodes:
    - id: task_01
      file: task_01.md
    - id: task_02
      file: task_02.md
  edges:
    - from: task_01
      to: task_02
---

# Lista de Tasks de GET /users

| Task | Título | Tipo | Complexidade | Depende de | Testes atribuídos |
|---|---|---|---|---|---|
| task_01 | Implementar rota GET /users com dados em memória e documentação Swagger | backend | low | — | — (ver task_02) |
| task_02 | Testes unitários e de integração de GET /users | test | low | task_01 | UT-005–UT-009, IT-009–IT-012 |

## Ordem de execução

1. **task_01** cria `src/routes/users.js` (dados em memória, `usersHandler`, bloco `@openapi`) e registra a rota em `src/app.js`.
2. **task_02** depende de task_01 estar concluída — escreve `src/routes/users.test.js` e atualiza `src/app.test.js`, cobrindo todos os 9 casos de `_tests.md` (UT-005 a UT-009, IT-009 a IT-012).

Sem execução paralela: task_02 exige que a rota já exista e esteja registrada antes de ser testada.
