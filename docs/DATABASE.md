# FluxoCit — Modelo de Dados

> Modelo relacional alvo (Postgres via Supabase — ver `TECH_STACK.md`).
> Até a integração com Supabase ser ativada (requer credenciais do
> usuário), o mesmo modelo lógico é usado em um repositório local
> (IndexedDB/localStorage) atrás da interface `LayoutRepository`
> descrita em `ARCHITECTURE.md`, para que a migração não exija
> remodelagem.

## 1. Diagrama lógico (visão geral)

```
organizations 1───* memberships *───1 users (auth.users do Supabase)
organizations 1───* layouts
layouts       1───* layout_objects
```

## 2. Tabelas

### 2.1 `organizations`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid, PK | |
| name | text, not null | Nome da organização/workspace. |
| created_at | timestamptz, default now() | |

### 2.2 `memberships`

Relaciona usuários (do Supabase Auth) a organizações.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid, PK | |
| organization_id | uuid, FK → organizations.id | |
| user_id | uuid, FK → auth.users.id | |
| role | text, enum (`owner`, `editor`, `viewer`) | Papel do usuário na organização. MVP: todo usuário criado vira `owner` da sua própria organização pessoal, criada automaticamente no cadastro. |
| created_at | timestamptz | |

Constraint: `unique (organization_id, user_id)`.

### 2.3 `layouts`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid, PK | |
| organization_id | uuid, FK → organizations.id | |
| name | text, not null | |
| scale_px_per_meter | numeric, not null, default 50 | Escala de referência do canvas (BR-02). |
| grid_step_m | numeric, not null, default 0.1 | Passo de snap à grade (BR-20). |
| width_m | numeric, nullable | Largura de referência do espaço (opcional, informativo). |
| height_m | numeric, nullable | Altura/profundidade de referência do espaço (opcional). |
| created_by | uuid, FK → auth.users.id | |
| created_at | timestamptz, default now() | |
| updated_at | timestamptz, default now() | Atualizado a cada save (autosave inclusive). |

### 2.4 `layout_objects`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid, PK | |
| layout_id | uuid, FK → layouts.id, on delete cascade | |
| object_type | text, not null | Chave do tipo no catálogo (ex.: `pallet`, `rack`, `wall`, `forklift`). Ver `ARCHITECTURE.md` § catálogo de objetos. |
| category | text, not null | Categoria (`structure`, `storage`, `pallet`, `equipment`, `area`, `flow`, `other`) — desnormalizado do catálogo para facilitar consulta/filtro. |
| name | text, nullable | Nome/identificação definido pelo usuário (BR-51). |
| x_cm | integer, not null | Posição X em centímetros (BR-01). |
| y_cm | integer, not null | Posição Y em centímetros. |
| width_cm | integer, not null | Largura do bounding box antes da rotação. |
| length_cm | integer, not null | Comprimento (profundidade) do bounding box antes da rotação. |
| rotation_deg | numeric, not null, default 0 | `[0, 360)` (BR-04). |
| z_index | integer, not null, default 0 | Ordem de empilhamento visual. |
| properties | jsonb, not null, default '{}' | Propriedades específicas do tipo (ex.: capacidade de um rack, orientação de picking) — extensível sem migration a cada novo campo. |
| created_at | timestamptz, default now() | |
| updated_at | timestamptz, default now() | |

Índice: `(layout_id)` para carregar todos os objetos de um layout
rapidamente.

### 2.5 `object_catalog` (opcional no MVP — pode iniciar como constante no código)

No MVP, o catálogo de tipos de objeto (dimensões padrão, categoria,
metadados de renderização) vive como dados estáticos no código
(`src/features/editor/objects/catalog.ts`), não em tabela — evita
complexidade de sincronização antes de haver necessidade real de
customização por organização. Caso o produto evolua para permitir
catálogos customizados por organização (pós-MVP), esta tabela é
introduzida espelhando a mesma forma usada no código.

## 3. Segurança de dados (Row Level Security)

Regras propostas (a aplicar via políticas RLS do Postgres quando
Supabase for integrado):

- `organizations`: usuário só lê/escreve organizações onde possui
  `membership`.
- `memberships`: usuário só lê memberships da própria organização;
  apenas `owner` pode alterar papéis.
- `layouts`: usuário só lê/escreve layouts cuja `organization_id`
  corresponde a uma organização da qual é membro; `viewer` tem apenas
  leitura.
- `layout_objects`: mesma regra de `layouts`, via join em `layout_id`.

## 4. Persistência local (fase pré-Supabase)

Enquanto a integração com Supabase não está ativa, o mesmo modelo é
espelhado em IndexedDB (via uma pequena camada própria, sem biblioteca
extra) com uma única "organização local implícita" e sem tabela de
usuários — a interface `LayoutRepository` expõe as mesmas operações
(`listLayouts`, `getLayout`, `createLayout`, `updateLayout`,
`deleteLayout`, `saveLayoutObjects`) que a futura implementação Supabase
implementará, garantindo que a troca de backend não exija mudanças no
editor.
