# FluxoCit — Regras de Negócio

## 1. Escala e unidades

- BR-01: Toda dimensão física (posição, comprimento, largura) é
  armazenada internamente em **centímetros** (inteiro ou decimal) para
  evitar erros de arredondamento de ponto flutuante em metros; a
  interface exibe valores em **metros com 2 casas decimais** (ex.:
  `2,70 m`).
- BR-02: Cada layout possui uma **escala de referência** (pixels do
  canvas por metro real), usada para converter entre coordenadas de
  desenho (canvas) e coordenadas reais (mundo). A escala é uma
  propriedade do layout, não de cada objeto.
- BR-03: O grid do canvas representa sempre uma unidade real fixa (ex.:
  1 m por célula principal, com subdivisões de 0,1 m), independente do
  nível de zoom — o zoom altera o tamanho em pixels da célula, não o
  significado dela.
- BR-04: A rotação de um objeto é armazenada em graus, no intervalo
  `[0, 360)`, sentido horário, com `0°` como orientação padrão de
  fábrica do tipo de objeto.

## 2. Objetos de layout

- BR-10: Todo objeto de layout pertence a exatamente um **tipo de
  objeto** (catálogo), do qual herda: categoria, dimensões padrão,
  representação visual base e quais propriedades são editáveis.
- BR-11: Um objeto pode sobrescrever as dimensões padrão do seu tipo
  apenas se o tipo permitir dimensão variável (ex.: parede e área
  permitem; pallet e empilhadeira têm dimensão fixa por padrão, mas
  podem ter variantes de tamanho pré-definidas no catálogo).
- BR-12: Todo objeto de layout tem posição `(x, y)` referente ao **canto
  superior esquerdo do seu bounding box antes da rotação**, mais o
  ângulo de rotação aplicado em torno do centro do bounding box. Isso
  mantém consistência entre o modelo de dados e a renderização.
- BR-13: Objetos do tipo "área" (recebimento, expedição, picking,
  staging, quarentena, devolução, armazenagem, circulação,
  administrativa, personalizada) são polígonos/retângulos que podem
  conter outros objetos visualmente sobrepostos — área nunca bloqueia a
  inserção de outros objetos sobre ela.
- BR-14: Excluir um objeto é uma ação reversível durante a sessão via
  undo; não existe "lixeira" persistente entre sessões no MVP.

## 3. Snapping e grid

- BR-20: Quando o snap à grade está ativo, a posição de um objeto é
  arredondada para o múltiplo mais próximo do passo de grid configurado
  (padrão: 0,1 m; configurável pelo usuário entre valores pré-definidos,
  ex.: 0,05 m / 0,1 m / 0,5 m / 1 m).
- BR-21: O snap entre objetos (quando implementado) tem prioridade sobre
  o snap à grade quando ambos se aplicam a uma distância menor que o
  limiar de snap (ex.: 10px na tela, independente do zoom).
- BR-22: O usuário pode desativar temporariamente o snapping (ex.:
  mantendo uma tecla/modificador pressionado, ou alternando um
  controle) para posicionamento livre.

## 4. Undo/Redo

- BR-30: Toda ação que altera o estado do layout (criar, mover,
  rotacionar, redimensionar, duplicar, excluir, editar propriedade) gera
  uma entrada no histórico de undo.
- BR-31: Ações de navegação (zoom, pan, seleção) **não** geram entrada
  no histórico de undo.
- BR-32: O histórico de undo é limitado a um tamanho máximo razoável
  (ex.: 100 ações) por questão de performance/memória; ao exceder,
  descarta-se a entrada mais antiga.
- BR-33: O histórico de undo é válido apenas durante a sessão de edição
  corrente; não é persistido entre sessões.

## 5. Persistência e propriedade dos dados

- BR-40: Um layout pertence a uma organização (workspace); usuários só
  acessam layouts de organizações às quais pertencem.
- BR-41: Autosave ocorre em intervalos curtos (ex.: a cada alteração
  relevante, com debounce de ~1–2s) e/ou ao perder foco/fechar o editor;
  o usuário também pode forçar salvar manualmente.
- BR-42: Nenhuma alteração é considerada "perdida" silenciosamente — se
  o autosave falhar, a interface deve comunicar o estado de erro ao
  usuário.

## 6. Nomenclatura e identificação

- BR-50: Cada layout tem um nome definido pelo usuário, não vazio.
- BR-51: Objetos podem ter um nome/identificação opcional definido pelo
  usuário (ex.: "Rack A-01"); quando ausente, a interface exibe o nome
  padrão do tipo (ex.: "Porta-paletes").

## 7. Regras espaciais

- BR-60 (implementada, Fase 7 — escopo reduzido): porta-paletes e
  corredores não deveriam ocupar a mesma área física — o sistema detecta
  sobreposição por bounding box (considerando rotação) entre esses dois
  tipos e sinaliza visualmente (contorno tracejado vermelho no objeto +
  aviso no painel de propriedades), sem bloquear a ação do usuário.
  Deliberadamente **não** aplicada a paredes/portas/docas/equipamentos:
  docas ficam sobre paredes por definição, paredes se encontram em
  cantos, e equipamentos são móveis — incluir essas combinações geraria
  falsos positivos. Ver `src/shared/lib/spatialRules.ts`.
- BR-61 (futuro): Corredores têm uma largura mínima recomendada
  associada ao tipo de equipamento que circula neles — regra a ser
  parametrizada quando uma fase de regras espaciais mais completa for
  priorizada.

## 8. Endereçamento e capacidade

- BR-70: Porta-paletes e áreas podem ter um código de endereço/local
  (`code`) em texto livre (ex.: `A-01-03`), sem formato imposto pelo
  sistema — cada operação tem sua própria convenção de endereçamento.
- BR-71: A capacidade de um porta-paletes (em posições de pallet) é
  sempre `vãos × níveis`, computada automaticamente e somente exibida
  (não editável diretamente) — evita a capacidade divergir da
  configuração real do rack.
- BR-72: A área ocupada (m²) de um objeto do tipo "área" é sempre
  computada a partir de largura × comprimento, nunca armazenada
  separadamente, para nunca divergir das dimensões reais do objeto.
