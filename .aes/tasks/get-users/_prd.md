# PRD: GET /users

## Resumo

Um endpoint `GET /users` que retorna a lista completa de usuários de exemplo cadastrados no backend, para consumidores da API que precisam ler esses dados. É a primeira funcionalidade de domínio de negócio real deste backend — até aqui, o projeto expunha apenas um health check e sua própria documentação. A motivação é atender ao pedido explícito de disponibilizar um método de leitura de usuários, estabelecendo "usuário" como o primeiro conceito de domínio do projeto.

## Visão Geral

O backend hoje é minimalista: um único endpoint (`GET /health`) e a documentação Swagger que o acompanha, sem qualquer entidade de negócio definida. Esta funcionalidade introduz `GET /users`, que retorna a lista de usuários cadastrados no sistema.

- **Que problema ela resolve**: hoje não existe nenhuma forma de um consumidor da API obter dados de usuários — o conceito nem existe no backend.
- **Para quem é**: consumidores da API (aplicações ou desenvolvedores que integram via HTTP) que precisam ler a lista de usuários.
- **Por que é valiosa**: é o primeiro passo de domínio de negócio real do backend, permitindo que qualquer cliente HTTP obtenha essa lista de forma simples e previsível.

## Objetivos

- Consumidores da API passam a poder listar todos os usuários cadastrados com uma única requisição `GET /users`, o que hoje é impossível (o conceito de usuário não existe no backend).
- O sistema passa a garantir uma resposta determinística: mesma lista, mesmos campos (`id`, `nome`, `email`), na mesma ordem, a cada chamada.
- A listagem se torna automática e imediata — não exige autenticação, parâmetros ou configuração prévia por parte de quem consome.

## User Stories

- US-001 a US-002: listagem de usuários e descoberta do contrato via documentação Swagger. [User stories completas](_user_stories.md)

## Funcionalidades Principais

- **Listar usuários (`GET /users`)**: retorna a lista completa de usuários cadastrados como um array JSON. Cada item traz `id`, `nome` e `email`. Não há paginação, filtro ou busca — a resposta é sempre a lista inteira, de uma vez. Requisito funcional: responder `200` com o array, mesmo quando a lista estiver vazia.
- **Documentação do endpoint**: `GET /users` é documentado inline via bloco `@openapi` (mesmo padrão de [health.js](../../../src/routes/health.js)), aparecendo tanto na Swagger UI (`/api-docs`) quanto no spec bruto (`/api-docs.json`). É a única fonte de documentação deste projeto — sem essa anotação, o endpoint não aparece documentado, ainda que funcione.

Não há interação entre funcionalidades além da relação padrão do projeto (toda rota nova precisa de sua própria documentação Swagger).

## Regras de Negócio

- Um usuário é representado exatamente pelos campos `id`, `nome` e `email` — nenhum campo adicional (ex. senha, papel/role, telefone) faz parte desta funcionalidade.
- A fonte dos dados é uma lista fixa em memória, com registros de exemplo/demonstração definidos no próprio backend — não há criação, edição ou exclusão de usuários nesta funcionalidade (ver Não-Objetivos).
- A resposta é sempre a lista completa: não existem parâmetros de paginação, filtro, busca ou ordenação customizada. A ordem retornada é sempre a mesma (ordem de definição da lista).
- O endpoint é público — não exige autenticação nem autorização, consistente com o único endpoint existente hoje (`/health`).
- Se a lista de usuários estiver vazia, a resposta é `200` com array vazio (`[]`) — nunca um erro.

## Experiência do Usuário

- **Persona principal**: Consumidor(a) da API — desenvolvedor(a) que integra via HTTP, sem acesso ao código-fonte do backend.
- **Fluxo principal**: o consumidor faz `GET /users` (diretamente, ou após descobrir o contrato em `/api-docs`) e recebe imediatamente um array JSON com os usuários de exemplo, sem precisar se autenticar ou configurar nada.
- **Descoberta**: como não há frontend neste repositório, a única via de descoberta do endpoint é a documentação Swagger (`/api-docs` e `/api-docs.json`) — por isso a documentação inline é parte obrigatória da entrega, não um extra.
- Não há requisitos de UI, já que este é um backend sem interface própria.

## Restrições Técnicas de Alto Nível

- Deve seguir o padrão de rota e documentação já estabelecido pelo projeto (handler simples + bloco `@openapi` inline, registrado em `createApp()`), conforme [AGENTS.md](../../../AGENTS.md).
- Não deve introduzir autenticação, validação de ambiente, tratamento de erro global ou qualquer estrutura para features futuras — decisão de escopo mínimo já registrada no projeto (Não-Objetivo confirmado nesta sessão, alinhado ao ADR-001 da fundação `servidor-backend`).
- Não deve introduzir persistência real (banco de dados) — os dados de exemplo vivem em memória, no próprio código do backend.

## Não-Objetivos (Fora de Escopo)

- **Criar, editar ou excluir usuários** (`POST`/`PUT`/`DELETE`) — usuário confirmou escopo restrito à leitura (`GET /users`) nesta PRD.
- **Buscar um usuário individual por id** (`GET /users/:id`) — usuário confirmou que não é necessário nesta iteração.
- **Filtros ou busca** (por nome, email, etc.) na listagem — usuário confirmou que a listagem deve sempre retornar o conjunto completo.
- **Paginação** — usuário optou por retornar a lista inteira de uma vez, dado o volume pequeno e fixo de dados de exemplo.
- **Autenticação/autorização** no endpoint — usuário confirmou que o endpoint deve ficar público, como `/health` hoje.
- **Persistência real (banco de dados)** — usuário optou por lista fixa em memória, mantendo o backend sem dependências novas de infraestrutura de dados.

## Registro de Decisões de Produto

- [ADR-001: Introduzir "usuário" como primeiro domínio de negócio do backend, via GET /users somente-leitura](adrs/adr-001.md) — estabelece "usuário" como domínio real, com listagem pública, sem paginação, sobre dados fixos em memória.

## Glossário

| Termo | Definição |
|---|---|
| Consumidor(a) da API | Aplicação, script ou desenvolvedor(a) que faz requisições HTTP a este backend, sem acesso direto ao código-fonte. |
| Lista de usuários de exemplo | Conjunto fixo de registros de usuário definido no código do backend, sem persistência em banco de dados. |
| Endpoint público | Rota que responde a qualquer requisição, sem exigir autenticação ou autorização. |

## Perguntas em Aberto

Nenhuma — todas as decisões estruturais desta funcionalidade foram resolvidas durante o brainstorming e registradas em [ADR-001](adrs/adr-001.md).
