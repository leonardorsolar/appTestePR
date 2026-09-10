# Template de User Stories

Estrutura para `_user_stories.md` — o catálogo canônico de user stories que acompanha o `_prd.md`. Toda story, critério de aceite e caso de borda da funcionalidade vive aqui e só aqui; a seção User Stories do PRD é um índice para este arquivo. Consumidores downstream dependem dele: `_techspec.md` mapeia stories para componentes, `_tests.md` constrói sua matriz de cobertura sobre os IDs das stories, e os rounds de revisão validam a implementação contra os critérios de aceite registrados aqui.

## Regras de ID

- Stories são `US-NNN` (zero-padded, sequencial). Critérios de aceite e casos de borda são numerados dentro da sua story e referenciados externamente como `US-NNN.AC-N` e `US-NNN.EC-N`.
- IDs são permanentes uma vez escritos: documentos downstream os referenciam, então nunca renumere ou reutilize um ID. Aposente uma story descartada marcando-a `(withdrawn)` no índice em vez de apagar o número.

## Esqueleto do Documento

```markdown
# User Stories: [Nome da Funcionalidade]

Catálogo canônico de comportamento para [funcionalidade]. Complementa `_prd.md`; consumido por
`_techspec.md` (mapeamento de componentes) e `_tests.md` (matriz de cobertura).

## Personas

- **[Nome da persona]** — [quem é, seu contexto, o que precisa desta funcionalidade]

## Índice de Stories

| ID     | Área da Funcionalidade | Persona   | Story                        |
| ------ | ------------------------ | --------- | ----------------------------- |
| US-001 | [área]                   | [persona] | [resumo da story em 1 linha] |

## [Área da Funcionalidade 1]

### US-001: [Título curto]

**Como** [persona], **eu quero** [capacidade], **para que** [resultado].

Critérios de aceite:

- AC-1: Dado [contexto inicial], quando [ação], então [resultado observável].
- AC-2: Dado [contexto], quando [ação], então [resultado observável].

Casos de borda:

- EC-1: [condição] → [comportamento esperado observado pelo usuário].
- EC-2: [condição] → [comportamento esperado].
```

## Varredura de Casos de Borda

Teste cada story contra cada classe abaixo e registre cada achado como uma entrada `EC` com seu comportamento esperado. Só pule uma classe para uma story depois de efetivamente testá-la — a maioria dos vereditos de "não se aplica" se mostra errada, e uma classe não testada é como comportamento não tratado chega à produção.

| Classe              | Verificação                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------ |
| Entrada inválida      | Malformada, tipo errado, fora do intervalo, não parseável, hostil.                        |
| Vazio / ausente       | Coleções vazias, strings em branco, dado opcional ausente, estado de primeira execução.   |
| Limites               | Tamanhos máximos, cotas, truncamento, limites de paginação, rate limits.                  |
| Permissões            | Usuário não autorizado, sessão expirada, papel insuficiente, acesso cross-tenant.          |
| Concorrência          | Mesma ação duas vezes em voo, dois atores no mesmo recurso, leituras obsoletas.            |
| Interrupção           | Cancelar no meio do fluxo, perda de conexão, reinício de processo, conclusão parcial.      |
| Repetição             | Retry após sucesso, submissão duplicada, replay — a ação é idempotente?                    |
| Ordenação             | Passos fora de ordem, pré-requisito pulado, navegação para trás, deep links.               |
| Transições de estado  | Ação em entidades excluídas/fechadas/arquivadas, saltos de estado inválidos.               |
| Escala                | Comportamento com zero itens, com volume típico, e com 100× o volume típico.               |

## Regras de Escrita

- Descreva o comportamento que o usuário observa, nunca a implementação ("vê o último rascunho salvo", não "lê da tabela de rascunhos").
- Uma story por capacidade. Dividir mantém os critérios de aceite testáveis; fundir stories para encurtar o catálogo esconde comportamento.
- Todo AC deve ser verificável contra o produto entregue — alguém consegue marcá-lo como verdadeiro ou falso usando a funcionalidade.
- Todo EC declara condição **e** comportamento esperado ("upload acima do limite de tamanho → rejeitado com mensagem de limite de tamanho", nunca só "uploads grandes").
- Dê às personas secundárias (admin, operador, integrador) suas próprias stories — a maioria dos casos de borda não tratados vive nos fluxos delas.
