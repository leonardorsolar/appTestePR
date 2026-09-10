# Protocolo de Perguntas

Referência de questionamento para a criação do PRD: como conduzir a conversa desde a ideia até a direção decidida. A mecânica das perguntas — ferramenta interativa, uma pergunta por mensagem, múltipla escolha liderada por recomendação — está definida no SKILL.md e se aplica a toda fase aqui.

## Método de Grelha ("Grilling Method")

Entreviste o usuário sem trégua até o entendimento compartilhado: toda decisão de produto estrutural resolvida, não um número fixo de perguntas feitas.

- Mapeie a funcionalidade em uma árvore de decisão — quais decisões existem, e quais dependem de quais.
- Percorra a árvore ramo por ramo: faça primeiro a pergunta que desbloqueia mais decisões subsequentes, e resolva as dependências uma de cada vez.
- Persiga respostas vagas: "depende" vira "depende de quê?", "provavelmente" vira algo concreto. Um ramo estrutural deixado nebuloso ressurge como retrabalho depois que o PRD é lançado.
- Explore antes de perguntar: quando o código, o `_idea.md`, ou as trilhas de pesquisa já respondem a uma pergunta, pegue a resposta de lá e vá para o próximo ramo. Perguntas ao usuário são para incógnitas genuínas — intenção, prioridades, trade-offs.
- Pare quando a árvore estiver resolvida: todo ramo ou tem uma decisão confirmada, ou está explicitamente estacionado em Perguntas em Aberto com o consentimento do usuário.

## Fases

### 1. Descoberta

Reúna o contexto inicial sobre a ideia ou o espaço do problema.

- Qual é o problema ou oportunidade principal?
- Quem são os usuários afetados?
- O que motivou esta iniciativa?

### 2. Entendimento

Aprofunde o conhecimento de requisitos e restrições.

- QUAIS funcionalidades específicas os usuários precisam?
- POR QUE isso gera valor de negócio?
- QUEM são os usuários-alvo e quais são os fluxos de trabalho atuais deles?
- O que precisa ser verdade quando isso for lançado — critério de aceite em termos comportamentais, não em métricas?
- Quais são as restrições conhecidas (conformidade, integrações obrigatórias, privacidade)?

### 3. Refinamento

Depois que a direção é decidida e seu ADR registrado (passo 4 do fluxo de trabalho do SKILL.md), faça follow-up só onde algo for genuinamente ambíguo.

- Esclareça os limites de escopo: o que está dentro, e o que o usuário exclui.
- Confirme o comportamento esperado de cada funcionalidade principal.
- Resolva qualquer pergunta em aberto restante.

## Portões de Progressão

- Complete pelo menos uma rodada completa de Entendimento antes de a direção ser decidida.
- Decida a direção somente quando todo ramo do qual ela depende estiver resolvido: propósito, restrições e comportamento esperado.

## Fronteiras de Foco

- As perguntas focam em O QUÊ, POR QUÊ e QUEM; tópicos de implementação (bancos de dados, APIs, estrutura de código, frameworks, estratégias de teste, padrões de arquitetura, deploy) pertencem à conversa de TechSpec — traduza-os conforme "Business Focus" do SKILL.md.
