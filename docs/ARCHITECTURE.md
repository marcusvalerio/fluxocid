# FluxoCit — Arquitetura

Ver também `docs/TECH_STACK.md` (escolhas de tecnologia e justificativa)
e `docs/DATABASE.md` (modelo de dados).

## 1. Visão geral

FluxoCit é uma aplicação **web SPA** (Single Page Application) escrita em
React + TypeScript, com o **editor 2D como núcleo do produto**. O
backend é um serviço gerenciado (Supabase: Postgres + Auth), acessado
diretamente pelo frontend através de uma camada de repositório — não há
servidor de aplicação próprio no MVP.

```
┌─────────────────────────────────────────────────────────┐
│                        Navegador                          │
│  ┌───────────────────────────────────────────────────┐   │
│  │  React App (Vite)                                   │   │
│  │  ┌───────────┐  ┌───────────────────────────────┐  │   │
│  │  │  Rotas /   │  │  Feature: editor                │  │   │
│  │  │  Auth      │  │  ┌─────────┐ ┌───────────────┐ │  │   │
│  │  │  Layouts   │  │  │ Canvas   │ │ Object catalog │ │  │   │
│  │  │  list      │  │  │ (Konva)  │ │ (extensível)   │ │  │   │
│  │  └───────────┘  │  └─────────┘ └───────────────┘ │  │   │
│  │                  │  ┌─────────┐ ┌───────────────┐ │  │   │
│  │                  │  │ Editor   │ │ Properties     │ │  │   │
│  │                  │  │ store    │ │ panel          │ │  │   │
│  │                  │  │ (Zustand)│ └───────────────┘ │  │   │
│  │                  │  └─────────┘                     │  │   │
│  │                  └───────────────────────────────────┘  │   │
│  │                     ▲                                    │   │
│  │                     │ LayoutRepository (interface)       │   │
│  └─────────────────────┼────────────────────────────────────┘   │
└────────────────────────┼────────────────────────────────────────┘
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
   Implementação local          Implementação Supabase
   (IndexedDB — usada até        (Postgres + Auth —
   credenciais serem             ativada quando o usuário
   fornecidas)                   fornecer credenciais)
```

## 2. Frontend

### 2.1 Camadas

- **`app/`** — bootstrap: providers (roteador, tema, store raiz),
  definição de rotas, layout de página (shell com navegação).
- **`features/auth/`** — telas e lógica de login/cadastro/logout,
  proteção de rotas autenticadas.
- **`features/layouts/`** — listagem, criação, renomeação, exclusão de
  layouts (projetos). Consome `LayoutRepository`.
- **`features/editor/`** — o núcleo do produto (detalhado na seção 4).
- **`shared/ui/`** — componentes de design system (botões, inputs,
  painéis, ícones) reutilizáveis em toda a aplicação.
- **`shared/lib/`** — utilitários puros: conversão de unidades
  (cm↔m↔px), geometria (bounding box, rotação, distância), helpers de
  snapping.
- **`shared/data/`** — camada de repositório (`LayoutRepository` e suas
  implementações local/Supabase).
- **`types/`** — tipos compartilhados do modelo de objetos do editor.

### 2.2 Gerenciamento de estado

Dois domínios de estado, deliberadamente separados:

1. **Estado de aplicação** (sessão do usuário, lista de layouts,
   navegação) — Zustand, escopo simples, sem necessidade de histórico.
2. **Estado do editor** (objetos do layout corrente, seleção, câmera do
   canvas, histórico de undo/redo) — Zustand dedicado ao editor
   (`useEditorStore`), criado/destruído por sessão de edição (um layout
   aberto = uma instância de estado).

O estado do editor é a fonte única de verdade para o que é renderizado
no canvas **e** para o que é persistido — o Konva apenas reflete esse
estado (renderização controlada, não "canvas como dono do dado").

### 2.3 Camada de persistência (`LayoutRepository`)

Interface única consumida pelas features:

```ts
interface LayoutRepository {
  listLayouts(): Promise<LayoutSummary[]>;
  getLayout(id: string): Promise<Layout>;
  createLayout(input: NewLayoutInput): Promise<Layout>;
  renameLayout(id: string, name: string): Promise<void>;
  deleteLayout(id: string): Promise<void>;
  saveLayoutObjects(id: string, objects: LayoutObject[]): Promise<void>;
}
```

- **Implementação local (`LocalLayoutRepository`)** — usa IndexedDB,
  ativa desde a Fase 4, sem dependências externas nem credenciais.
- **Implementação Supabase (`SupabaseLayoutRepository`)** — implementada
  quando o usuário fornecer as credenciais do projeto Supabase (ver
  `TECH_STACK.md` § Backend); mesma interface, troca por configuração,
  sem alterar `features/editor` ou `features/layouts`.

Isso garante que o núcleo do editor nunca dependa diretamente de
Supabase, IndexedDB ou qualquer detalhe de infraestrutura.

## 3. Autenticação e autorização

- Autenticação delegada ao Supabase Auth (e-mail/senha no MVP) quando
  ativada; até lá, a aplicação roda em **modo local/single-user**
  (sem tela de login obrigatória), para não bloquear o desenvolvimento
  e o uso do editor antes da credencial existir. Essa transição é uma
  decisão de baixo risco reversível — a UI de login já é construída na
  Fase 4 estrutural, apenas "desligada" até a credencial existir.
- Autorização (RF-05, BR-40) é aplicada em duas camadas quando Supabase
  estiver ativo: Row Level Security no Postgres (linha de defesa
  principal) e checagem de posse de `organization_id` no frontend
  (defesa em profundidade / UX, nunca a única barreira).

## 4. Arquitetura do editor 2D

### 4.1 Modelo de objetos do canvas

Todo objeto do layout é uma instância de `LayoutObject`:

```ts
interface LayoutObject {
  id: string;
  objectType: ObjectTypeKey;   // ex.: "pallet", "rack", "wall", "forklift"
  category: ObjectCategory;    // "structure" | "storage" | "pallet" | "equipment" | "area" | "flow" | "other"
  name?: string;
  x: number;        // cm, canto superior-esquerdo do bounding box pré-rotação
  y: number;        // cm
  width: number;     // cm
  length: number;    // cm
  rotationDeg: number; // [0, 360)
  zIndex: number;
  properties: Record<string, unknown>; // específico do tipo
}
```

### 4.2 Catálogo de tipos (extensível)

Cada tipo de objeto é definido uma vez em um catálogo central
(`ObjectTypeDefinition`), não espalhado pelo código:

```ts
interface ObjectTypeDefinition {
  key: ObjectTypeKey;
  category: ObjectCategory;
  label: string;
  defaultWidth: number;   // cm
  defaultLength: number;  // cm
  resizable: boolean;
  render: (obj: LayoutObject, ctx: RenderContext) => ReactNode; // componente Konva
  propertyFields: PropertyFieldDefinition[]; // o que aparece no painel de propriedades
}
```

Adicionar um novo objeto = adicionar uma entrada no catálogo + um
componente de renderização — **não** exige alterar o núcleo do canvas,
seleção, drag, undo/redo ou persistência. Isso cumpre RF-44/RNF-06.

### 4.3 Núcleo do canvas

- **Stage/Layer (Konva):** uma `Stage` por editor; camadas separadas
  para: grid (estático, redesenha só no zoom/pan), objetos (dinâmico),
  overlay de seleção/transformação (alças, guias de snap).
- **Câmera:** estado `{ x, y, zoomLevel }` independente dos objetos;
  transforma coordenadas de mundo (cm) → coordenadas de tela (px) via
  `scale_px_per_meter` do layout combinada ao `zoomLevel` da sessão.
- **Seleção:** conjunto de IDs selecionados no `useEditorStore`; o
  `Transformer` do Konva é anexado aos nós selecionados para
  mover/rotacionar/redimensionar com feedback visual imediato.
- **Snapping:** função pura (`shared/lib/snap.ts`) aplicada durante o
  `dragMove`/`transform`, antes de commitar a posição final no estado —
  primeiro tenta snap a outros objetos (limiar em px de tela), depois
  snap à grade (BR-20/BR-21).
- **Undo/Redo:** middleware de histórico que grava um snapshot
  (ou diff) do array de `LayoutObject[]` a cada ação "committada"
  (mouseup/touchend de drag, edição de propriedade, inserir, duplicar,
  excluir) — nunca durante o arraste em si, para não poluir o histórico
  (BR-30/BR-31).
- **Persistência:** `useEditorStore` expõe os objetos atuais;
  `saveLayoutObjects` é chamado por um efeito com debounce (autosave) e
  por ação explícita do usuário (RF-16, BR-41).

### 4.4 Por que Konva.js (não SVG/Canvas puro)

- Suporte nativo a hit-testing por forma (necessário para seleção
  precisa em objetos rotacionados).
- `Transformer` pronto para mover/rotacionar/redimensionar com
  handles, incluindo suporte a touch.
- Melhor performance que SVG puro para centenas de objetos (RNF-03),
  sem a complexidade de gerenciar um canvas HTML5 imperativo à mão.
- Não introduz nenhuma dependência 3D — é estritamente 2D, alinhado à
  regra de não implementar 3D nesta fase (RNF-04).

## 5. Interação touch/mobile

- Gestos do Konva (`onTouchStart/Move/End`) tratam pan de um dedo e
  drag de objeto; pinça (dois dedos) é tratada manualmente para zoom,
  com `preventDefault` restrito à área do canvas para não capturar
  scroll da página fora dele.
- Painéis (biblioteca de objetos, propriedades) são componentes de UI
  fora do canvas (HTML/React normal), não desenhados dentro do Konva —
  mantém acessibilidade e reaproveita o design system.

## 6. Segurança

- Nenhum segredo no código-fonte; variáveis de ambiente (`SUPABASE_URL`,
  `SUPABASE_ANON_KEY`) via `.env` não versionado (`.env.example`
  versionado como referência).
- Validação de entrada no frontend (formulários) **e** políticas RLS no
  banco como barreira real (o frontend nunca é a única defesa).
- Chave usada no frontend é sempre a `anon key` pública do Supabase,
  nunca a `service_role key`.

## 7. Preparação para regras espaciais e fluxos (futuro)

- O modelo `LayoutObject` já carrega `category` e bounding box
  suficientes para, no futuro, rodar checagem de sobreposição
  (bounding box / polígono) sem remodelar dados.
- Objetos de categoria `flow` (rotas, setas de sentido) podem ser
  adicionados ao catálogo como um novo tipo de objeto (ex.: polilinha)
  sem alterar o núcleo — a arquitetura de catálogo extensível cobre
  esse caso quando for priorizado (Fase 7).

## 8. Não escopo desta arquitetura

- Sem renderização 3D, sem `three.js`/`react-three-fiber`, sem câmera
  perspectiva — reforço explícito de RNF-04.
- Sem backend próprio (servidor HTTP customizado) no MVP.
- Sem app nativo — apenas web responsivo.
