# FluxoCit

Ferramenta de planejamento e montagem de layout operacional logístico em
**2D** — paredes, áreas, porta-paletes, pallets, corredores, docas,
empilhadeiras e paleteiras, com escala real, snapping, undo/redo e
persistência.

> Nesta fase o produto é exclusivamente 2D. Ver `docs/PRODUCT.md`.

## Documentação

| Documento | Conteúdo |
|-----------|----------|
| [`docs/PRODUCT.md`](docs/PRODUCT.md) | Problema, público, proposta de valor, escopo MVP/pós-MVP |
| [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) | Requisitos funcionais e não funcionais |
| [`docs/BUSINESS_RULES.md`](docs/BUSINESS_RULES.md) | Regras de escala, snapping, undo/redo, persistência |
| [`docs/USER_FLOWS.md`](docs/USER_FLOWS.md) | Fluxos de uso, incluindo considerações mobile |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Arquitetura do frontend e do editor 2D |
| [`docs/TECH_STACK.md`](docs/TECH_STACK.md) | Tecnologias escolhidas e justificativa |
| [`docs/DATABASE.md`](docs/DATABASE.md) | Modelo de dados |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | Cores, tipografia, componentes |
| [`docs/UX.md`](docs/UX.md) | Diretrizes de interação do editor, mobile-first |

## Stack

React + TypeScript + Vite, Konva/react-konva (canvas 2D), Zustand
(estado), Tailwind CSS. Persistência hoje é local (`localStorage`),
atrás de uma interface de repositório que será trocada por Supabase
quando as credenciais forem configuradas — ver `docs/TECH_STACK.md`.

## Rodando localmente

```bash
npm install
npm run dev       # servidor de desenvolvimento
npm run build     # typecheck + build de produção
npm run test      # testes unitários (Vitest)
npm run lint      # lint (oxlint)
```

## Estado atual

- [x] Fase 1 — Definição do produto
- [x] Fase 2 — Arquitetura
- [x] Fase 3 — UX/UI e Design System
- [x] Fase 4 — Fundação técnica (app React/Vite, rotas, persistência local)
- [x] Fase 5 — Núcleo do editor 2D (canvas, grid, zoom/pan, seleção,
      mover, rotacionar, duplicar, excluir, undo/redo, snapping,
      propriedades, biblioteca de objetos, persistência)
- [x] Fase 6 — Refinamento do editor: seleção múltipla (shift-clique,
      marquee, long-press mobile), mover/duplicar/excluir/rotacionar em
      grupo, alinhar e distribuir, snapping entre objetos com guias
      visuais, handles de redimensionar/rotacionar (Konva Transformer)
      com snap de 15°, leitura de coordenadas ao vivo durante o
      arraste, pan via espaço/botão do meio no desktop (arraste
      simples agora faz seleção por marquee), refinamento visual de
      porta-paletes e corredor, indicador undo/redo sempre visível
- [x] Fase 7 — Funcionalidades logísticas: objeto de fluxo de circulação
      (pessoas/empilhadeiras/materiais, categoria própria "Fluxos"),
      endereçamento por código em porta-paletes e áreas, capacidade
      computada (vãos × níveis) do porta-paletes, área ocupada (m²)
      computada, identificação de equipamentos, sinalização visual de
      sobreposição entre porta-paletes/corredores

### Roadmap de evolução (3 fases, executadas nesta ordem)

- [x] Fase 2 — Editor profissional + escala real: ambiente com
      dimensões reais (m) definidas na criação e editáveis depois, piso
      distinto do espaço "fora" com grid restrito aos seus limites,
      réguas em metros acompanhando pan/zoom, leitura de coordenadas do
      cursor, comando "ajustar ao ambiente" (auto-executado ao abrir um
      layout), painel do ambiente (dimensões, área total, ocupação
      estimada), aviso visual de objeto parcial/totalmente fora do
      ambiente, snapping às bordas do ambiente
- [x] Fase 3 — Biblioteca logística + operação + exportação: 19 novos
      tipos de objeto com representação visual própria (armazenagem,
      operação, fluxo, equipamentos — ver "Biblioteca de objetos"
      abaixo), exportação do layout como imagem PNG preservando escala
      e composição do ambiente
- [ ] Fase 1 — Design system + refinamento visual (temas claro/escuro,
      tipografia, motion, correção definitiva do painel de propriedades
      no mobile)

Fora do escopo desta etapa (aguardando instrução): Supabase,
autenticação, backend, banco de dados em nuvem, editor 3D, deploy
automático. O deploy de teste é feito manualmente no Vercel pelo
responsável do produto.

## Biblioteca de objetos

- **Estrutura**: parede, porta, doca
- **Armazenagem**: porta-paletes, corredor, estante, bloco de
  armazenagem, área de picking, área de staging
- **Paletes**: pallet
- **Equipamentos**: empilhadeira, paleteira, carrinho de
  carga/plataforma, esteira transportadora, bancada de separação, mesa
  de packing, balança, impressora/estação de etiquetas, scanner/RF
- **Áreas**: recebimento, expedição, picking, staging, quarentena,
  devolução, armazenagem, circulação, administrativa, personalizada
  (genérica, com seletor de tipo) · área de conferência, área de
  expedição, área de recebimento (com representação visual própria)
- **Fluxos**: rota de circulação de pessoas/empilhadeiras/materiais,
  seta direcional, faixa de circulação, cruzamento, zona de segurança,
  faixa de pedestres

Todo objeto tem uma representação 2D própria (não um retângulo
genérico) e se integra à infraestrutura existente do editor: inserir,
selecionar, mover, rotacionar, redimensionar (quando aplicável),
duplicar, excluir, undo/redo, snapping, seleção múltipla, persistência
e touch.
