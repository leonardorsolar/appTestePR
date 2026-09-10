# User Stories: GET /users

Catálogo canônico de comportamento para o endpoint `GET /users`. Complementa `_prd.md`; consumido por
`_techspec.md` (mapeamento de componentes) e `_tests.md` (matriz de cobertura).

## Resumo

| Story                                      | Critério de Aceite Principal                                                          |
| ------------------------------------------- | --------------------------------------------------------------------------------------- |
| US-001: Listar usuários                    | GET /users retorna 200 com array JSON de usuários (id, nome, email), sem autenticação. |
| US-002: Descobrir o endpoint via Swagger   | GET /users aparece documentado em /api-docs e /api-docs.json com exemplo de resposta.  |

## Personas

- **Consumidor(a) da API** — desenvolvedor(a) externo(a) ou interno(a) que integra com o backend via
  HTTP, sem acesso ao código-fonte, dependendo do contrato HTTP e da documentação Swagger para saber
  como chamar cada endpoint.

## Índice de Stories

| ID     | Área da Funcionalidade | Persona              | Story                                                          |
| ------ | ------------------------ | --------------------- | ---------------------------------------------------------------- |
| US-001 | Listagem de usuários     | Consumidor(a) da API | Obter a lista completa de usuários em uma única requisição     |
| US-002 | Documentação             | Consumidor(a) da API | Descobrir o contrato de GET /users pela documentação Swagger   |

## Listagem de usuários

### US-001: Listar usuários

**Como** consumidor(a) da API, **eu quero** obter a lista completa de usuários cadastrados, **para que** eu possa exibir ou processar esses dados na minha aplicação.

Critérios de aceite:

- AC-1: Dado que existem usuários na lista de exemplo, quando faço `GET /users`, então recebo `200` com um array JSON onde cada item tem `id`, `nome` e `email`.
- AC-2: Dado que não informo nenhum parâmetro na requisição, quando faço `GET /users`, então recebo a lista completa de uma só vez, sem paginação.
- AC-3: Dado que faço a requisição sem qualquer token ou credencial, quando faço `GET /users`, então recebo a resposta normalmente (endpoint público, sem autenticação).
- AC-4: Dado que faço duas requisições `GET /users` seguidas, então ambas retornam exatamente os mesmos registros, na mesma ordem.

Casos de borda:

- EC-1 (Entrada inválida): Requisição inclui query params não suportados (ex. `?filtro=x`) → parâmetro é ignorado, resposta continua sendo a lista completa normal.
- EC-2 (Vazio/ausente): Lista de usuários fica vazia → resposta é `200` com array vazio (`[]`), nunca erro ou `404`.
- EC-3 (Limites): Não há paginação nem limite de tamanho de resposta — não aplicável por decisão de escopo ([ADR-001](adrs/adr-001.md)).
- EC-4 (Permissões): Requisição chega sem cabeçalho de autenticação/autorização → tratada como qualquer outra, retorna `200` normalmente (endpoint intencionalmente público).
- EC-5 (Concorrência): Duas requisições `GET /users` simultâneas → cada uma recebe a lista completa de forma independente, sem interferência entre si (leitura pura, sem escrita compartilhada).
- EC-6 (Interrupção): Conexão do cliente cai antes da resposta completa chegar → cliente não recebe o corpo completo; comportamento padrão do Express/HTTP, sem lógica de retomada nesta funcionalidade.
- EC-7 (Repetição): Cliente repete a mesma requisição (retry) qualquer número de vezes → operação é idempotente, sempre retorna o mesmo resultado, sem efeito colateral.
- EC-8 (Escala): Volume de dados é a lista fixa de exemplo definida em [ADR-001](adrs/adr-001.md) (poucos registros) → resposta é rápida e completa; comportamento com volumes maiores está fora de escopo, pois os dados não crescem nesta iteração (sem operações de escrita).

## Documentação

### US-002: Descobrir o contrato de GET /users pela documentação Swagger

**Como** consumidor(a) da API, **eu quero** encontrar `GET /users` documentado na Swagger UI, **para que** eu saiba como chamá-lo e o que esperar da resposta sem precisar ler o código-fonte.

Critérios de aceite:

- AC-1: Dado que acesso `GET /api-docs`, quando procuro pelo endpoint, então encontro `GET /users` listado com resumo, resposta `200` e exemplo do corpo (array de usuários).
- AC-2: Dado que acesso `GET /api-docs.json`, quando inspeciono o spec bruto, então o path `/users` está presente com o mesmo contrato descrito na UI.

Casos de borda:

- EC-1 (Vazio/ausente): Bloco `@openapi` do endpoint está ausente ou malformado → endpoint não aparece na documentação (comportamento já conhecido do projeto, não um bug desta feature) — por isso a documentação é obrigatória, não opcional, para esta story ser aceita.
