---
name: aes-create-diagram-techspec
description: Gera os diagramas cuja fonte já existe assim que o aes-create-techspec termina — banco de dados (ER), classe, sequência e, se aplicável, estado — extraídos de _techspec.md e salvos em .aes/tasks/<slug>/diagrams/. Não gera atividade, grafo de dependência nem rastreabilidade ADR→tarefa, porque essas dependem de _tasks.md/task_NN.md, que ainda não existem nesta fase. Use logo após o aes-create-techspec finalizar, ou quando o usuário pedir diagramas de banco/classe/sequência antes de decompor em tarefas. Reaproveita as regras de conversão e de formato de arquivo já definidas em devmentor-dados — não use esta skill para gerar diagrama de atividade, grafo de tarefas, rastreabilidade ou o board Excalidraw completo com todas as camadas: use devmentor-dados para isso, depois que aes-create-tasks rodar.
---

# Create Diagram — TechSpec

Recorte de `devmentor-dados` para o momento exato em que o `_techspec.md` acabou de ser escrito, mas `_tasks.md` e os `task_NN.md` ainda não existem. Nesta fase, os únicos diagramas com fonte real são os que vêm direto do TechSpec — o resto (atividade, grafo de dependência, rastreabilidade ADR→tarefa) fica para quando `aes-create-tasks` rodar e `devmentor-dados` puder gerar a suíte completa.

Esta skill não reescreve as regras de tradução Mermaid nem o formato de arquivo — usa exatamente as mesmas de `devmentor-dados`, nos mesmos arquivos de referência (`references/mermaid-conversion-rules.md` e `references/output-format.md`). O que muda aqui é só o **recorte**: quais diagramas fazem sentido pedir nesta fase, e em que escopo.

<HARD-GATE>
- Nunca inventa entidade, classe, endpoint ou estado que não esteja em `_techspec.md`. Fonte insuficiente para uma parte de um diagrama → omite essa parte e aponta a lacuna, nunca completa com suposição.
- Como `_tasks.md` ainda não existe nesta fase, todo diagrama gerado aqui é de escopo `geral` (feature inteira) — nunca escopado a uma tarefa, porque não há tarefa ainda para escopar.
- Se `.aes/tasks/<slug>/diagrams/spec-<slug>.excalidraw` já existir (como no seu caso atual), esta skill não toca nele — a regra de não-sobrescrita do board pertence a `devmentor-dados` e vale igual aqui. Só cria o `.excalidraw` se ele ainda não existir.
</HARD-GATE>

## Entrada

- `slug` (obrigatório) — identifica `.aes/tasks/<slug>/`.

Sem parâmetro de `tarefa`: nesta fase não há `task_NN.md` para escopar, então a pergunta "qual tarefa" nem se aplica.

## Passo 0 — Validação de Entrada

1. Confirma que `.aes/tasks/<slug>/_techspec.md` existe — recusa continuar se não existir: "Não encontrei `_techspec.md` em `.aes/tasks/<slug>/`. Rode `aes-create-techspec` primeiro."
2. Se `.aes/tasks/<slug>/_tasks.md` já existir, avisa e sugere `devmentor-dados` no lugar: "Esta feature já tem `_tasks.md` — os diagramas de atividade, grafo de dependência e rastreabilidade já podem ser gerados. Recomendo `devmentor-dados` para a suíte completa; ainda assim, quer só os diagramas de TechSpec?"

## Diagramas Gerados

Todos de escopo `geral`, seguindo a prioridade de fonte e as regras de tradução de `references/mermaid-conversion-rules.md`:

1. **Banco de dados (ER)** → `geral.banco.md` — seção 1 do arquivo de referência.
2. **Classe** → `geral.classe.md` — seção 2.
3. **Sequência** → `geral.sequencia.md` — seção 3, um diagrama por endpoint principal (ou agrupado quando os endpoints compartilham exatamente as mesmas camadas).
4. **Estado** *(condicional)* → `geral.estado.md` — seção 8, só se o TechSpec (ou o PRD) descrever um ciclo de vida com estados nomeados.
5. **Board Excalidraw** → `spec-<slug>.excalidraw` — seção 6, **só se ainda não existir**. Já existindo, pula e informa isso no fechamento.

Não gerados aqui, por falta de fonte nesta fase: atividade, grafo de dependência das tarefas, mapa de rastreabilidade ADR→tarefa. Se o usuário pedir explicitamente um desses, responde que a fonte (`_tasks.md`/`task_NN.md`) ainda não existe e aponta `aes-create-tasks` como próximo passo antes de tentar de novo.

## Formato, Local e Regra de Regravação

Iguais a `devmentor-dados`, sem alteração — ver `references/output-format.md`: frontmatter obrigatório em cada `.md`, checagem de versão do TechSpec antes de regravar, detecção de edição manual, e a regra própria de não-sobrescrita do `.excalidraw`.

`_manifest.md` é atualizado ao final desta execução do mesmo jeito que `devmentor-dados` atualiza — reflete o estado atual de tudo que existe em `diagrams/` no momento, não só o que esta execução gerou.

## Validação Antes de Salvar

Mesma checagem de `devmentor-dados`: todo bloco Mermaid fechado corretamente, toda entidade/classe/participante referenciada foi declarada antes no mesmo diagrama. Falhou → tenta gerar de novo uma vez; falhou de novo → para e mostra o erro, sem gravar arquivo quebrado.

## Ao Final

Confirma: "Gerados [N] diagramas de TechSpec para [slug] em `.aes/tasks/<slug>/diagrams/`: [lista de arquivos]." Se algum diagrama foi pulado (por falta de fonte, ou por já existir no caso do Excalidraw), aponta o motivo. Fecha lembrando: "Depois que as tarefas forem criadas (`aes-create-tasks`), rode `devmentor-dados` para os diagramas de atividade, grafo de dependência e rastreabilidade."
