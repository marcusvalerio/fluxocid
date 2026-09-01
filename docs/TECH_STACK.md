# FluxoCit — Stack Tecnológica

> Decisões técnicas de baixo risco assumidas com autonomia, conforme
> autorizado no prompt mestre. Onde há dependência de credencial externa
> (ex.: Supabase), isso é sinalizado explicitamente.

## 1. Frontend

| Camada | Escolha | Justificativa |
|--------|---------|----------------|
| Linguagem | TypeScript | Segurança de tipos para o modelo de objetos do editor, que é o núcleo do produto. |
| Framework | React 18 | Ecossistema maduro, bom suporte a bibliotecas de canvas, equipe/IA já opera bem nele. |
| Build tool | Vite | Build e dev server rápidos, essencial para iterar via ambiente remoto/mobile. |
| Roteamento | React Router v6 | Padrão de mercado, simples para as rotas do MVP (login, lista, editor). |
| Estilo | Tailwind CSS | Produtividade alta, consistente com um design system tokenizado (ver `DESIGN_SYSTEM.md`), mobile-first por padrão. |
| Estado global (app) | Zustand | Leve, sem boilerplate, adequado para estado de UI + estado do editor. |
| Estado do editor / histórico | Zustand + middleware de histórico próprio (undo/redo) | Necessidade de controle fino sobre o que entra no histórico (ver `BUSINESS_RULES.md` BR-30..33); implementação própria evita dependências pesadas. |
| Canvas 2D | Konva.js + react-konva | Motor de canvas 2D com suporte nativo a: seleção, transformação (mover/rotacionar/redimensionar), eventos de toque, camadas (layers) e boa performance com muitos objetos. Evita reinventar manipulação de canvas em baixo nível. |
| Formulários / inputs numéricos | Componentes próprios (leves) | O painel de propriedades tem necessidades específicas (unidades, conversão m↔px); não justifica biblioteca externa de formulários no MVP. |
| Testes unitários/integração | Vitest + React Testing Library | Integração nativa com Vite, rápido. |
| Testes E2E (pós-MVP) | Playwright | Já disponível no ambiente; útil para validar fluxos de touch/canvas mais adiante. |

## 2. Backend / dados

**DECISÃO PROPOSTA (impacto médio — segue com autonomia, mas registrada
para visibilidade):** usar **Supabase** (Postgres gerenciado + Auth +
Storage) como backend as a service.

Justificativa:
- Reduz drasticamente trabalho operacional de backend (autenticação,
  banco, API), coerente com a diretriz de minimizar trabalho manual do
  usuário pelo celular.
- Postgres real permite modelagem relacional adequada para
  organizações, usuários, layouts e objetos (inclusive `jsonb` para
  propriedades extensíveis por tipo de objeto).
- Auth pronta (e-mail/senha no MVP, social login possível depois).
- Row Level Security (RLS) nativo do Postgres cobre bem o requisito de
  isolamento de dados por organização (RF-05).

**Implicação de credencial:** para ativar Supabase será necessário que o
usuário crie um projeto em supabase.com e informe `SUPABASE_URL` e
`SUPABASE_ANON_KEY` (chaves públicas, não secretas) como variáveis de
ambiente do frontend. Isso será solicitado explicitamente quando a Fase
4 chegar a essa integração — **até lá, o editor funciona com um
repositório de persistência local (localStorage/IndexedDB)**, atrás de
uma interface (`LayoutRepository`) que será trocada pela implementação
Supabase sem alterar o núcleo do editor.

Alternativa descartada: backend próprio em Node/Express + banco
próprio — mais controle, porém mais trabalho operacional (deploy de
servidor, migrations, infra) sem benefício claro para o MVP. Pode ser
revisitado se o produto exigir lógica de servidor complexa no futuro.

## 3. Hospedagem / deploy

**DECISÃO PROPOSTA:** frontend estático (Vite build) hospedado em
**Vercel** (ou Netlify como alternativa equivalente); backend/dados no
Supabase. Nenhum servidor próprio para manter.

## 4. Estrutura de repositório

Monorepo simples (não é necessário workspace multi-pacote no MVP — um
único app frontend consumindo Supabase diretamente):

```
fluxocid/
  docs/                 # documentação do produto
  src/
    app/                # bootstrap da aplicação, rotas, providers
    features/
      auth/              # login, cadastro, sessão
      layouts/            # listagem/CRUD de layouts (projetos)
      editor/              # núcleo do editor 2D
        canvas/            # componentes de canvas (Konva)
        objects/           # catálogo de tipos de objeto + renderers
        state/             # store do editor (zustand), histórico
        properties-panel/  # painel de propriedades
        library-panel/     # biblioteca de objetos
    shared/
      ui/                 # componentes de design system reutilizáveis
      lib/                # utilitários (geometria, conversão de unidades)
      data/               # camada de repositório (local + supabase)
    types/                # tipos compartilhados (modelo de objetos etc.)
  tests/
```

Esta estrutura é referenciada em `ARCHITECTURE.md`.

## 5. Qualidade de código

- ESLint + Prettier (config padrão TypeScript/React).
- TypeScript em modo `strict`.
- CI mínimo (GitHub Actions, quando chegarmos à Fase 10) rodando lint,
  typecheck e testes em cada push/PR.
