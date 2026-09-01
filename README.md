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
- [ ] Fase 6 — Refinamento do editor
- [ ] Fase 7 — Funcionalidades logísticas (áreas, fluxos, regras espaciais)
- [ ] Fase 8 — QA
- [ ] Fase 9 — Segurança e performance
- [ ] Fase 10 — Deploy e documentação final

## Biblioteca de objetos (MVP)

Estrutura (parede, porta, doca) · Armazenagem (porta-paletes, corredor)
· Paletes (pallet) · Equipamentos (empilhadeira, paleteira) · Áreas
(recebimento, expedição, picking, staging, quarentena, devolução,
armazenagem, circulação, administrativa, personalizada).
