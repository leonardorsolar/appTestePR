# Template de PRD

Use este template para estruturar todo Documento de Requisitos de Produto. O PRD é consumido por agentes LLM downstream (`aes-create-techspec`, `aes-create-tasks`, `aes-execute-task`, rounds de revisão): ele existe para fornecer a eles regras de negócio, comportamento de domínio e intenção de produto.

Preencha cada seção com base nos resultados do brainstorming. Deixe orientação de placeholder nas seções em que a informação for insuficiente e anote isso em Perguntas em Aberto.

## Visão Geral

Visão geral de alto nível da funcionalidade ou produto. Descreva:

- Que problema ela resolve
- Para quem ela é
- Por que ela é valiosa

## Objetivos

Resultados de produto declarados como comportamento observável, não como métricas:

- O que os usuários passam a poder fazer depois que isso for lançado, e não podiam antes
- O que o sistema passa a garantir ou impor depois que a funcionalidade existir
- O que se torna desnecessário, automático ou impossível para os usuários

## User Stories

Índice para `_user_stories.md`, o catálogo canônico de stories — não repita as stories aqui:

- Uma linha por área de funcionalidade: a faixa de `US-NNN` que ela cobre e seu tema
- Link para o catálogo: [User stories completas](_user_stories.md)

## Funcionalidades Principais

Principais funcionalidades do produto:

- Nome da funcionalidade: o que ela faz, por que é importante, comportamento de alto nível
- Requisitos funcionais de cada funcionalidade
- Interação entre funcionalidades

## Regras de Negócio

Regras de domínio que a implementação deve impor, declaradas com precisão:

- Invariantes que devem sempre valer (ex.: "uma execução pertence a exatamente um workspace")
- Regras de validação e seus resultados voltados ao usuário
- Regras de permissão e visibilidade por persona
- Regras de ciclo de vida e transição de estado (quais estados existem, o que pode mover para onde, e quando)
- Cálculos, limites e valores padrão com seus valores exatos

## Experiência do Usuário

Jornada do usuário do primeiro contato ao uso regular:

- Personas principais e seus objetivos
- Fluxos de usuário principais, passo a passo
- Considerações de UI/UX e requisitos de acessibilidade
- Onboarding e descobribilidade

## Restrições Técnicas de Alto Nível

Limites obrigatórios que moldam o produto sem prescrever a implementação:

- Integrações obrigatórias com sistemas existentes
- Mandatos de conformidade ou requisitos regulatórios
- Metas de performance do ponto de vista do usuário
- Requisitos de privacidade e segurança de dados

Escolhas de implementação — bancos de dados, frameworks, designs de API, padrões de arquitetura — pertencem ao TechSpec.

## Não-Objetivos (Fora de Escopo)

Capacidades que o usuário decidiu que esta funcionalidade não vai incluir:

- Problemas adjacentes que não serão tratados, e por quê
- Limites deste esforço

Exclusões registram decisões do usuário, nunca gestão de tamanho: uma capacidade desejada permanece no escopo não importa o quanto o documento cresça.

## Registro de Decisões de Produto

ADRs documentando decisões-chave tomadas durante o brainstorming:

- [ADR-NNN: Título](adrs/adr-NNN.md) — Resumo de uma linha da decisão

## Glossário

Todo termo de domínio, sigla ou conceito interno usado acima, definido para que um leitor de primeira viagem não precise de contexto externo:

| Termo | Definição |
|---|---|

## Perguntas em Aberto

Itens pendentes que precisam de esclarecimento:

- Requisitos pouco claros
- Casos de borda que exigem input do stakeholder
- Dependências de decisões ainda não tomadas
