# Template de Especificação de Testes

Estrutura para `_tests.md` — o contrato de teste canônico que acompanha o `_techspec.md`. Todo caso de teste da funcionalidade vive aqui com um ID estável: `aes-create-tasks` atribui cada ID a exatamente uma task, os implementadores escrevem exatamente os casos atribuídos, e os rounds de revisão checam a suíte entregue contra este documento. Um comportamento sem um ID de teste aqui é um comportamento que ninguém se comprometeu a verificar.

## Regras de ID

- `UT-NNN` unit, `IT-NNN` integration, `E2E-NNN` end-to-end — zero-padded, sequencial dentro de cada prefixo.
- IDs são permanentes uma vez que tasks os referenciam: nunca renumere ou reutilize. Marque um caso descartado como `(withdrawn)` no lugar, em vez de apagar o número.

## Esqueleto do Documento

```markdown
# Especificação de Testes: [Nome da Funcionalidade]

Contrato de teste canônico para [funcionalidade]. Complementa `_techspec.md`.
Derivado de `_user_stories.md` (comportamento) e `_techspec.md` (componentes).

## Estratégia

- Frameworks e harnesses: [framework de teste, estratégia de fixtures, fakes nos limites de I/O]
- Execução: [como as suítes unit / integration / e2e rodam neste repositório]
- Convenções: [estilo table-driven, paralelismo, padrões de nomenclatura a seguir]

## Matriz de Cobertura

| Fonte          | Comportamento    | Unitário       | Integração  | E2E     |
| -------------- | ---------------- | -------------- | ----------- | ------- |
| US-001         | [resumo da story]| UT-001, UT-002 | IT-001      | E2E-001 |
| US-001.EC-1    | [caso de borda]  | UT-003         | —           | —       |
| [Componente A] | [responsabilidade]| UT-010–UT-014 | IT-002      | —       |

## Testes Unitários

### [Componente A] (TechSpec: [nome da seção])

- **UT-001** (happy): [função/comportamento alvo] — dado [input/estado concreto], produz [output esperado concreto].
- **UT-002** (error): [alvo] — dado [input inválido], retorna [o erro específico].
- **UT-003** (boundary): [alvo] — no [valor de limite exato], se comporta [resultado esperado].

## Testes de Integração

### [Limite ou fluxo]

- **IT-001**: [componentes conectados entre si] — configure [fixtures/estado]; faça [ação]; espere [resultado observável através do limite].

## Testes Ponta a Ponta

### [Jornada do usuário] (US-001, US-003)

- **E2E-001**: [ponto de entrada] → [passos visíveis ao usuário] → [resultado observável final].
```

## Exigências de Cobertura

A matriz é o gate de conclusão deste documento:

- Toda story `US-NNN` **e** todo caso de borda `US-NNN.EC-N` de `_user_stories.md` tem sua própria linha com pelo menos um ID de teste.
- Todo componente e interface na TechSpec tem uma linha com cobertura unitária que inclui seus caminhos de erro — um componente cujos únicos casos são happy-path está descoberto.
- Todo endpoint de API, verbo de CLI, ou contrato de mensagem na TechSpec tem casos para seu formato de sucesso e cada formato de falha documentado.
- Toda jornada do usuário tem pelo menos um caso end-to-end ou de integração acompanhando-a do início ao fim.
- Uma célula vazia em uma linha populada é aceitável; uma linha sem nenhum ID é um buraco — preencha-a ou anote a linha com o motivo de não precisar de teste.

## Regras de Escrita de Casos

- Concreto ou nada: nomeie a função, rota ou comando real, os valores de input reais, e o output ou erro esperado exato. "Verificar tratamento de erro" não é um caso; "POST /runs com um workflow id desconhecido retorna 404 com code=workflow_not_found" é.
- Marque todo caso unitário com sua classe: `happy`, `error`, `boundary`, `concurrency`, `idempotency`, `ordering`, ou `state`.
- Um comportamento observável por caso — um caso que precisa de "e" duas vezes são dois casos.
- Casos unitários fazem fake somente dos limites de I/O. Casos de integração usam conexão real entre componentes. Casos E2E passam pela superfície pública (CLI, API, UI) exatamente como um usuário faria.
- Cubra caminhos de falha em todo nível, não só no unitário: fluxos interrompidos, negações de permissão, e atores concorrentes espelham as classes de caso de borda de `_user_stories.md`.
