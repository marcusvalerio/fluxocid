-- FluxoCit — esquema inicial D1 (Fase 9)
--
-- Um "projeto" já carrega Layout + Fluxo no mesmo registro (mesmo modelo da Fase 8, onde
-- `Layout.objects` + `Layout.flowNodes/flowConnections` pertencem ao mesmo projeto) — por isso
-- layout_objects/flow_nodes/flow_connections vivem como colunas JSON em `projects`, em vez de
-- tabelas PROJECT_LAYOUT/PROJECT_FLOW separadas: os boards são sempre lidos/gravados por inteiro
-- (nunca objeto a objeto), então JSON evita um custo de N escritas a cada autosave sem perder
-- nada em termos de modelagem. Ver docs/ARCHITECTURE.md § Persistência (Fase 9).

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  must_change_password INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Sessões: o cookie do navegador guarda o token bruto; só o hash dele é persistido, então um
-- vazamento do banco não permite forjar sessões existentes.
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

CREATE TABLE password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT
);
CREATE INDEX idx_reset_tokens_user_id ON password_reset_tokens(user_id);

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  scale_px_per_meter REAL NOT NULL DEFAULT 50,
  grid_step_m REAL NOT NULL DEFAULT 0.1,
  width_m REAL,
  height_m REAL,
  layout_objects TEXT NOT NULL DEFAULT '[]',
  flow_nodes TEXT NOT NULL DEFAULT '[]',
  flow_connections TEXT NOT NULL DEFAULT '[]',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_projects_user_id ON projects(user_id);
