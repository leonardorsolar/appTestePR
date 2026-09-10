---
name: aes-create-excalidraw
description: Gera um arquivo .excalidraw com até quatro diagramas que tornam um PRD rápido de entender visualmente — jornada do usuário, esboço de UI dos momentos-chave da jornada (condicional, só quando o PRD descreve UI concreta), camadas de software com as funcionalidades dentro, e regras de negócio apontando para a camada que as aplica — lendo _prd.md e _user_stories.md. Use depois que o PRD estiver escrito, antes ou em paralelo ao aes-create-techspec. Não use para gerar código, apenas artefatos visuais de entendimento.
---

# Create Excalidraw Board

Gera `.aes/tasks/<slug>/diagrams/spec-<slug>.excalidraw` — o mesmo caminho que o botão "Board Excalidraw" da interface (painel de resumo de tarefas) já lê — a partir dos documentos de produto já existentes da task. Até quatro diagramas (o segundo, esboço de UI, é condicional), um board, pensados para serem lidos em sequência: primeiro a experiência de quem usa, depois um esboço de como essa experiência aparece na tela quando o PRD descreve UI concreta, depois onde cada parte vive no sistema, depois o que restringe cada parte.

<HARD-GATE>
- Nunca invente passo de jornada, camada, funcionalidade, regra, tela ou componente de UI que não esteja escrito no `_prd.md` ou no `_user_stories.md`. Se a informação não existir, pule o diagrama e registre a lacuna no handoff em vez de supor.
- O arquivo de saída é sempre `.aes/tasks/<slug>/diagrams/spec-<slug>.excalidraw` (crie o diretório `diagrams/` se não existir). Esse caminho é lido literalmente pelo backend e pelo botão "Board Excalidraw" do frontend — um nome ou local diferente deixa o board invisível na interface mesmo tendo sido gerado corretamente.
- Os diagramas compartilham o mesmo board, dispostos na ordem Jornada → Esboço de UI (quando gerado) → Camadas → Regras, com as setas do diagrama de Regras efetivamente apontando para dentro do diagrama de Camadas — não são diagramas soltos, é uma leitura contínua.
- O Esboço de UI (Diagrama 2) é condicional e é um wireframe de baixa fidelidade — caixas e rótulos curtos, nunca uma peça de design visual: sem cor de marca, sem ícone, sem tentativa de pixel-perfect. Só gere se o PRD descrever elementos concretos de interface; caso contrário pule e registre a lacuna, não force um layout genérico.
- Simplicidade acima de completude: cada diagrama deve caber num olhar. Se uma jornada tem mais de 6-7 passos, resuma para os pontos de decisão; detalhe fica no `_user_stories.md`, não no diagrama. O Esboço de UI nunca ilustra mais de 3-4 momentos — escolha os pontos de decisão, não tente desenhar uma tela por passo da jornada.
</HARD-GATE>

## Entradas

- `.aes/tasks/<slug>/_prd.md` (obrigatório)
- `.aes/tasks/<slug>/_user_stories.md` (obrigatório)

## Workflow

1. **Ler os dois documentos** e extrair, sem reescrever ou resumir o conteúdo original:
   - De "Experiência do Usuário" (Fluxo Principal e Fluxos de Erro) e das personas em `_user_stories.md` → os passos da jornada.
   - De "Fluxo principal, passo a passo" (nomes de tela/página/painel citados) e de "Considerações de UI/UX" (estados que precisam se destacar visualmente, elementos sempre visíveis, restrições de interação) → os elementos estruturais de cada esboço de UI, quando existirem. Se o fluxo só descreve chamadas de API/CLI/job em lote, não há material para este diagrama.
   - De "Funcionalidades Principais" e "Restrições Técnicas de Alto Nível" → a lista de camadas citada (ex.: Controller → Service → Repository) e a qual camada cada Funcionalidade Principal pertence.
   - De "Regras de Negócio" → cada invariante, validação e regra de ciclo de vida, junto com a camada onde ela naturalmente se aplica (uma validação de formato de campo é da camada que recebe o dado; uma regra de unicidade é da camada que persiste).

2. **Diagrama 1 — Jornada do usuário.** Uma sequência simples e linear de passos, da entrada até o resultado, com o ponto de decisão principal destacado (o momento em que o fluxo pode desviar para um Fluxo de Erro). Cada passo é curto — a ação que a pessoa toma ou o que ela vê, não a implementação. Quando houver mais de uma persona com jornadas diferentes, uma jornada por persona, uma abaixo da outra, não misturadas na mesma linha.

3. **Diagrama 2 — Esboço de UI (condicional).** Gere este diagrama só quando `_prd.md` descrever elementos concretos de interface — nomes de tela/página/painel no "Fluxo principal, passo a passo", ou requisitos visuais explícitos em "Considerações de UI/UX" (ex.: "precisa se destacar visualmente", "sempre visível", "sem exigir navegação para outra tela"). Se o fluxo descrever só chamadas de API/CLI/job em lote, sem nada visual, pule e registre a lacuna no handoff — não invente uma tela que o PRD não pede.
   - Escolha de 2 a 4 momentos-chave da jornada do Diagrama 1: o estado inicial, cada ponto de decisão que "Considerações de UI/UX" destaca como precisando de distinção visual, e o estado final.
   - Para cada momento, desenhe um wireframe de baixa fidelidade: um `frame` com o nome do momento (ex.: "Prévia de findings"), e dentro dele só os retângulos das regiões estruturais citadas no texto — lista, painel de status, botão, badge de estado — cada um com um `text` curto como rótulo. Se o PRD não nomeia um elemento, não desenhe; não preencha lacunas com achismo de layout.
   - Posicione os wireframes lado a lado na mesma ordem da jornada; uma `arrow` simples entre um e o próximo indica a progressão, na mesma direção de leitura do Diagrama 1.

4. **Diagrama 3 — Camadas com as funcionalidades dentro.** Uma faixa horizontal ou vertical por camada, na ordem em que a requisição atravessa o sistema. Dentro de cada faixa, só o nome de cada Funcionalidade Principal que vive ali — sem descrever o que ela faz, isso já está no PRD. O objetivo do diagrama é responder "onde isso mora", não "como isso funciona".

5. **Diagrama 4 — Regras de negócio apontando para as camadas.** Cada regra de negócio vira um retângulo pequeno e independente, posicionado ao redor do Diagrama 3. Uma linha conecta cada retângulo à camada correspondente no Diagrama 3. Regras que restringem mais de uma camada (ex.: uma invariante que a Service valida e a Repository garante no banco) apontam para ambas. O texto de cada retângulo é a regra em uma frase curta — a versão completa fica no PRD.

6. **Montar o board.** Posicionar os diagramas na ordem Jornada → Esboço de UI (quando gerado) → Camadas → Regras, de cima para baixo ou da esquerda para a direita, com espaço suficiente entre eles para que as setas do Diagrama 4 alcancem o Diagrama 3 sem cruzar por cima dos diagramas anteriores. Criar `.aes/tasks/<slug>/diagrams/` se não existir e escrever em `.aes/tasks/<slug>/diagrams/spec-<slug>.excalidraw`.

7. **Verificar antes de escrever.** Rode o script de validação da seção "Formato do arquivo .excalidraw" contra o JSON montado. Só escreva o arquivo se ele passar sem `MISSING`.

8. **Handoff.** Confirmar o caminho do arquivo e listar quais dos diagramas (jornada, esboço de UI, camadas, regras) foram gerados e quais foram pulados por falta de fonte no PRD, com o motivo de cada um pulado. Lembrar que o board já aparece no botão "Board Excalidraw" do painel de resumo de tarefas sem nenhum passo extra.

## Formato do arquivo .excalidraw

```json
{ "type": "excalidraw", "version": 2, "source": "aes-create-excalidraw",
  "elements": [ /* ver campos abaixo */ ], "appState": { "viewBackgroundColor": "#ffffff" }, "files": {} }
```

<HARD-GATE>
Todo elemento PRECISA ter o conjunto completo de campos-base abaixo — não só os visuais (`x`/`y`/`width`/`height`/`strokeColor`). O visualizador chama a API imperativa `updateScene` do Excalidraw diretamente (`frontend/public/excalidraw/index.js`), que **não** roda a normalização `restoreElements`/`convertToExcalidrawElements`. Um elemento incompleto não gera erro nenhum — ele silenciosamente não renderiza (formas somem, texto não aparece) e trava a edição (clique/seleção lança exceção interna ao acessar um campo ausente, ex. `boundElements`/`groupIds` undefined). Isso já quebrou em produção duas vezes por causa disso — sempre inclua todos os campos, nunca escreva um elemento "minimalista só com o visual".
</HARD-GATE>

Campos-base — todo elemento, qualquer tipo:

```json
{
  "angle": 0, "strokeColor": "#1e1e1e", "backgroundColor": "transparent",
  "fillStyle": "solid", "strokeWidth": 1, "strokeStyle": "solid",
  "roughness": 1, "opacity": 100, "roundness": null,
  "groupIds": [], "frameId": null, "boundElements": [],
  "seed": 1, "version": 1, "versionNonce": 1, "index": null,
  "isDeleted": false, "updated": 0, "link": null, "locked": false
}
```

Campos extras por tipo, além dos campos-base:

- **frame**: `"name": "<título do diagrama>"`. No Diagrama 2, cada momento de UI é o seu próprio `frame` (ex.: `"name": "Prévia de findings"`).
- **rectangle**: nenhum extra (ajuste `strokeColor`/`backgroundColor`/`roundness` para a cor e o arredondamento desejados; `roundness: {"type": 3}` para cantos arredondados). No Diagrama 2, use `roundness` para diferenciar levemente botões (cantos arredondados) de painéis/listas (cantos retos) — é só uma convenção visual, não crie uma legenda de cores para isso.
- **text**: `"text"`, `"fontSize"`, `"fontFamily": 1`, `"textAlign": "left"`, `"verticalAlign": "top"`, `"containerId": null`, `"originalText"` (igual a `text`), `"lineHeight": 1.25`, `"autoResize": true`.
- **arrow**: `"points": [[0,0],[dx,dy]]` (relativo a `x`/`y` do próprio elemento), `"lastCommittedPoint": null`, `"startBinding": null`, `"endBinding": null`, `"startArrowhead": null`, `"endArrowhead": "arrow"`. No Diagrama 4, conecta um retângulo de regra à camada correspondente no Diagrama 3. No Diagrama 2, conecta um momento de UI ao próximo, na ordem da jornada.

`index: null` é válido — o `updateScene` roda `syncInvalidIndices` e atribui o índice fracionário real ao carregar. `seed`/`versionNonce`/`updated` podem ser qualquer placeholder estável — só importam para variação visual do roughjs e reconciliação multiplayer.

### Script de validação (rodar antes de escrever o arquivo)

```bash
python3 -c "
import json, sys
data = json.load(open(sys.argv[1]))
base = {'id','type','x','y','width','height','angle','strokeColor','backgroundColor','fillStyle',
        'strokeWidth','strokeStyle','roughness','opacity','groupIds','frameId','roundness','seed',
        'version','versionNonce','index','isDeleted','boundElements','updated','link','locked'}
extra = {
    'frame': {'name'},
    'text': {'text','fontSize','fontFamily','textAlign','verticalAlign','containerId','originalText','lineHeight','autoResize'},
    'arrow': {'points','lastCommittedPoint','startBinding','endBinding','startArrowhead','endArrowhead'},
}
bad = False
for e in data['elements']:
    need = base | extra.get(e['type'], set())
    missing = need - set(e.keys())
    if missing:
        bad = True
        print('MISSING', e.get('id'), missing)
print('FAIL' if bad else 'OK')
" \"$ARQUIVO\"
```

## Error Handling

- PRD sem seção "Experiência do Usuário" com fluxo descrito → pular Diagrama 1 e Diagrama 2 (o esboço de UI depende da jornada), registrar no handoff.
- PRD com jornada mas sem elemento de UI concreto (fluxo só descreve chamadas de API/CLI/job em lote, sem tela/painel/botão, e "Considerações de UI/UX" ausente ou só sobre comportamento de backend) → pular Diagrama 2, registrar no handoff.
- PRD sem "Restrições Técnicas de Alto Nível" citando um padrão de camadas → pular Diagramas 3 e 4 (não há onde ancorar as regras), registrar no handoff.
- PRD com camadas mas sem "Regras de Negócio" explícitas → gerar só Diagrama 1, o Diagrama 2 se aplicável, e o Diagrama 3, registrar no handoff.
- Regra de negócio que não se encaixa claramente em nenhuma camada → não force o encaixe; liste-a à parte no diagrama com uma nota "sem camada clara" em vez de apontar para a camada errada.
- Script de validação acusa `MISSING` → corrija os campos ausentes no elemento apontado antes de escrever o arquivo; nunca entregue um board que falhou na validação.
