---
tipo: classe
tarefa: geral
feature: get-users
gerado_com_techspec_versao: 18ea5d352fa0
gerado_em: 2026-09-10T16:15:01Z
---

```mermaid
classDiagram
    class User {
        +int id
        +string nome
        +string email
    }
    class UsersRoute {
        +usersHandler(req: Request, res: Response) void
    }
    UsersRoute ..> User
```
