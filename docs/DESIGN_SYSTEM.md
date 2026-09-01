# FluxoCit — Design System

Referência de implementação: Tailwind CSS (tokens abaixo mapeiam para
`tailwind.config` — cores customizadas, escala de espaçamento padrão do
Tailwind, fontes). Ver `docs/UX.md` para diretrizes de interação.

## 1. Identidade visual

FluxoCit é uma ferramenta técnica e profissional — a interface deve
transmitir precisão e clareza, não decoração. Referência de tom:
software de engenharia/planejamento, não um app de consumo lúdico.

Princípios:
- **Neutro por padrão, cor com propósito** — a UI de chrome (painéis,
  botões, texto) é neutra (cinza/slate); cor é reservada para
  categorias de objetos no canvas, estados (sucesso/erro/aviso) e ações
  primárias.
- **Canvas é o protagonista** — a UI ao redor do canvas deve ocupar o
  mínimo de espaço necessário, especialmente no mobile.
- **Alvos de toque generosos** — nunca menor que 40×40px para controles
  interativos.

## 2. Cores

### 2.1 Paleta de interface (chrome)

| Token | Valor (light) | Uso |
|-------|---------------|-----|
| `--color-bg` | `#F7F8FA` | Fundo geral da aplicação. |
| `--color-surface` | `#FFFFFF` | Painéis, cards, barra superior. |
| `--color-surface-alt` | `#EEF1F5` | Fundo do canvas (fora dos limites do layout). |
| `--color-border` | `#DCE0E6` | Bordas de painéis, divisores. |
| `--color-text-primary` | `#1A1F27` | Texto principal. |
| `--color-text-secondary` | `#5B6472` | Texto secundário/legendas. |
| `--color-text-disabled` | `#9AA2AD` | Texto/ícones desabilitados. |
| `--color-primary` | `#2563EB` | Ação primária, seleção, foco. |
| `--color-primary-hover` | `#1D4ED8` | Hover/active do primário. |
| `--color-success` | `#16A34A` | Confirmações, "salvo". |
| `--color-warning` | `#D97706` | Avisos (ex.: conflito espacial futuro). |
| `--color-danger` | `#DC2626` | Exclusão, erros. |

Modo escuro (`--color-bg: #0F1115`, `--color-surface: #171A21`,
`--color-border: #262B33`, `--color-text-primary: #E8EAED`, demais
tokens ajustados para contraste ≥ 4.5:1) é uma extensão planejada,
implementada quando o design system estiver estável — o token system
acima já é preparado para isso (variáveis, não valores fixos no código
de componentes).

### 2.2 Cores por categoria de objeto (canvas)

Cada categoria tem uma cor de identificação, usada como contorno/preenchimento leve dos objetos no canvas — permite reconhecimento rápido sem depender só do ícone:

| Categoria | Cor | Token |
|-----------|-----|-------|
| Estrutura (paredes, portas, docas) | Cinza-chumbo `#3F4753` | `--cat-structure` |
| Armazenagem (racks, porta-paletes, corredores) | Âmbar `#B45309` | `--cat-storage` |
| Paletes | Marrom-madeira `#8B5E34` | `--cat-pallet` |
| Equipamentos (empilhadeira, paleteira) | Azul `#2563EB` | `--cat-equipment` |
| Áreas (recebimento, expedição, picking...) | Verde-água `#0D9488` (variação de matiz por subtipo de área, ver 2.3) | `--cat-area` |
| Fluxos (rotas, setas) | Roxo `#7C3AED` | `--cat-flow` |
| Outros/personalizado | Cinza-azulado `#64748B` | `--cat-other` |

### 2.3 Cores de subtipos de área

Áreas usam preenchimento translúcido (~12% de opacidade) da mesma
família de cor, com borda tracejada na cor cheia, para não competir
visualmente com objetos sólidos por cima delas:

| Área | Cor base |
|------|----------|
| Recebimento | `#0D9488` (teal) |
| Expedição | `#2563EB` (azul) |
| Picking | `#7C3AED` (roxo) |
| Staging | `#D97706` (âmbar) |
| Quarentena | `#DC2626` (vermelho) |
| Devolução | `#DB2777` (rosa) |
| Armazenagem | `#B45309` (âmbar escuro) |
| Circulação | `#64748B` (cinza-azulado) |
| Administrativa | `#0EA5E9` (azul claro) |
| Personalizada | cor escolhida pelo usuário dentre uma paleta fixa |

## 3. Tipografia

- Fonte: **Inter** (via `fonts.googleapis.com`), fallback
  `system-ui, sans-serif` — legível em telas pequenas, boa para
  números (painel de propriedades usa muitos valores numéricos).
- Escala (mobile-first, cresce em telas maiores via classes
  responsivas do Tailwind):

| Token | Tamanho | Uso |
|-------|---------|-----|
| `text-xs` | 12px | Legendas, rótulos de campo. |
| `text-sm` | 14px | Texto padrão de UI (painéis, listas). |
| `text-base` | 16px | Corpo, inputs (16px evita zoom automático em iOS). |
| `text-lg` | 18px | Títulos de painel/seção. |
| `text-xl` | 22px | Títulos de página. |
| `text-2xl` | 28px | Título principal (ex.: tela de login). |

Peso: `font-medium` (500) para rótulos e botões, `font-semibold` (600)
para títulos, `font-normal` (400) para corpo.

## 4. Espaçamento e grid de layout de UI

Escala padrão do Tailwind (múltiplos de 4px): `1` (4px), `2` (8px), `3`
(12px), `4` (16px), `6` (24px), `8` (32px). Painéis usam `padding: 16px`
(mobile) / `24px` (desktop ≥1024px).

## 5. Componentes base

- **Botão primário** — fundo `--color-primary`, texto branco, altura
  mínima 44px (mobile) / 36px (desktop), cantos `rounded-md` (6px).
- **Botão secundário** — fundo `--color-surface`, borda
  `--color-border`, mesmo padding do primário.
- **Botão de ícone** (ações rápidas do editor: duplicar, excluir,
  girar) — quadrado 44×44px (mobile) / 36×36px (desktop), ícone
  centralizado, estado ativo com fundo `--color-primary`/10%.
- **Input numérico** (painel de propriedades) — largura fixa curta,
  sufixo de unidade (`m`, `°`) exibido dentro do campo, alinhado à
  direita; incrementos por toque longo/setas quando no desktop.
- **Painel (Panel)** — `--color-surface`, borda `--color-border`,
  sombra leve (`shadow-sm`), cantos `rounded-lg` (8px).
- **Bottom sheet (mobile)** — painel deslizante a partir da base da
  tela, alça de arraste no topo, usado para biblioteca de objetos e
  propriedades em telas pequenas.
- **Badge de status de salvamento** — texto pequeno + ícone
  (`Salvando…`, `Salvo`, `Erro ao salvar` em `--color-danger`).
- **Item de biblioteca de objetos** — miniatura da representação 2D do
  objeto + rótulo, em grade responsiva (2 colunas mobile, 3–4 desktop).

## 6. Iconografia

- Biblioteca: `lucide-react` (ícones de linha, consistentes,
  leves) para UI de chrome (menus, ações, navegação).
- Representações de objetos do canvas **não** usam ícones genéricos de
  biblioteca — são desenhos vetoriais próprios (formas Konva),
  desenhados para parecerem reconhecíveis na escala do canvas (ver
  `docs/UX.md` § representação de objetos).

## 7. Estados e feedback

- **Seleção no canvas:** contorno azul (`--color-primary`) de 2px +
  handles de transformação nos cantos/lados + handle de rotação acima
  do objeto.
- **Hover (desktop):** leve realce (sombra ou contorno a 40% de
  opacidade) antes de clicar.
- **Snap ativo:** linha-guia tracejada `--color-primary` cruzando o
  canvas no eixo alinhado, some ao soltar.
- **Carregando:** skeleton simples (blocos cinza pulsantes) em listas;
  spinner discreto em ações pontuais.
- **Erro:** texto em `--color-danger` + ícone, nunca apenas cor (também
  para acessibilidade/daltonismo).

## 8. Acessibilidade

- Contraste mínimo AA (4.5:1) para texto normal, 3:1 para texto
  grande/ícones essenciais.
- Nenhuma informação de estado transmitida **só** por cor (categoria de
  objeto também tem forma distinta; erro também tem ícone/texto).
- Todos os controles interativos alcançáveis por teclado no desktop
  (foco visível usando `--color-primary`).
