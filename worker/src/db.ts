import type { Env, ProjectRow, UserRow } from './types'

const nowIso = () => new Date().toISOString()
const newId = () => crypto.randomUUID()

export async function findUserByEmail(env: Env, email: string): Promise<UserRow | null> {
  return (await env.DB.prepare('SELECT * FROM users WHERE email = ?1 COLLATE NOCASE').bind(email).first<UserRow>()) ?? null
}

export async function findUserById(env: Env, id: string): Promise<UserRow | null> {
  return (await env.DB.prepare('SELECT * FROM users WHERE id = ?1').bind(id).first<UserRow>()) ?? null
}

export async function createUser(env: Env, email: string, passwordHash: string): Promise<UserRow> {
  const id = newId()
  const now = nowIso()
  await env.DB.prepare(
    'INSERT INTO users (id, email, password_hash, must_change_password, created_at, updated_at) VALUES (?1, ?2, ?3, 1, ?4, ?4)',
  ).bind(id, email, passwordHash, now).run()
  return { id, email, password_hash: passwordHash, must_change_password: 1, created_at: now, updated_at: now }
}

export async function updateUserPassword(env: Env, userId: string, passwordHash: string, mustChangePassword: boolean): Promise<void> {
  await env.DB.prepare('UPDATE users SET password_hash = ?1, must_change_password = ?2, updated_at = ?3 WHERE id = ?4')
    .bind(passwordHash, mustChangePassword ? 1 : 0, nowIso(), userId).run()
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

export async function createSession(env: Env, userId: string, tokenHash: string): Promise<void> {
  const now = new Date()
  await env.DB.prepare('INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?1, ?2, ?3, ?4)')
    .bind(tokenHash, userId, now.toISOString(), new Date(now.getTime() + SESSION_TTL_MS).toISOString()).run()
}

export async function findValidSession(env: Env, tokenHash: string): Promise<{ userId: string } | null> {
  const row = await env.DB.prepare('SELECT user_id, expires_at FROM sessions WHERE id = ?1').bind(tokenHash).first<{ user_id: string; expires_at: string }>()
  if (!row) return null
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    await env.DB.prepare('DELETE FROM sessions WHERE id = ?1').bind(tokenHash).run()
    return null
  }
  return { userId: row.user_id }
}

export async function deleteSession(env: Env, tokenHash: string): Promise<void> {
  await env.DB.prepare('DELETE FROM sessions WHERE id = ?1').bind(tokenHash).run()
}

export async function deleteAllSessionsForUser(env: Env, userId: string): Promise<void> {
  await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?1').bind(userId).run()
}

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000

export async function createPasswordResetToken(env: Env, userId: string, tokenHash: string): Promise<void> {
  const now = new Date()
  await env.DB.prepare('INSERT INTO password_reset_tokens (id, user_id, created_at, expires_at) VALUES (?1, ?2, ?3, ?4)')
    .bind(tokenHash, userId, now.toISOString(), new Date(now.getTime() + RESET_TOKEN_TTL_MS).toISOString()).run()
}

export async function consumePasswordResetToken(env: Env, tokenHash: string): Promise<{ userId: string } | null> {
  const row = await env.DB.prepare('SELECT user_id, expires_at, used_at FROM password_reset_tokens WHERE id = ?1').bind(tokenHash)
    .first<{ user_id: string; expires_at: string; used_at: string | null }>()
  if (!row || row.used_at || new Date(row.expires_at).getTime() <= Date.now()) return null
  const result = await env.DB.prepare('UPDATE password_reset_tokens SET used_at = ?1 WHERE id = ?2 AND used_at IS NULL')
    .bind(nowIso(), tokenHash).run()
  return (result.meta.changes ?? 0) > 0 ? { userId: row.user_id } : null
}

export async function listProjectsForUser(env: Env, userId: string): Promise<ProjectRow[]> {
  const { results } = await env.DB.prepare('SELECT * FROM projects WHERE user_id = ?1 ORDER BY updated_at DESC').bind(userId).all<ProjectRow>()
  return results
}

export async function findProjectForUser(env: Env, id: string, userId: string): Promise<ProjectRow | null> {
  return (await env.DB.prepare('SELECT * FROM projects WHERE id = ?1 AND user_id = ?2').bind(id, userId).first<ProjectRow>()) ?? null
}

export interface NewProjectInput { name: string; description?: string; widthM?: number; heightM?: number }

export async function createProject(env: Env, userId: string, input: NewProjectInput): Promise<ProjectRow> {
  const id = newId(); const now = nowIso()
  const row: ProjectRow = { id, user_id: userId, name: input.name, description: input.description ?? null, status: 'active', scale_px_per_meter: 50, grid_step_m: 0.1, width_m: input.widthM ?? null, height_m: input.heightM ?? null, layout_objects: '[]', flow_nodes: '[]', flow_connections: '[]', version: 1, created_at: now, updated_at: now }
  await env.DB.prepare(`INSERT INTO projects (id,user_id,name,description,status,scale_px_per_meter,grid_step_m,width_m,height_m,layout_objects,flow_nodes,flow_connections,version,created_at,updated_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15)`).bind(row.id,row.user_id,row.name,row.description,row.status,row.scale_px_per_meter,row.grid_step_m,row.width_m,row.height_m,row.layout_objects,row.flow_nodes,row.flow_connections,row.version,row.created_at,row.updated_at).run()
  return row
}

export async function renameProject(env: Env, id: string, userId: string, name: string): Promise<boolean> {
  const result = await env.DB.prepare('UPDATE projects SET name = ?1, updated_at = ?2 WHERE id = ?3 AND user_id = ?4').bind(name, nowIso(), id, userId).run()
  return (result.meta.changes ?? 0) > 0
}

export async function deleteProject(env: Env, id: string, userId: string): Promise<boolean> {
  const result = await env.DB.prepare('DELETE FROM projects WHERE id = ?1 AND user_id = ?2').bind(id, userId).run()
  return (result.meta.changes ?? 0) > 0
}

export interface LayoutSaveInput { objects: unknown[]; widthM?: number; heightM?: number; scalePxPerMeter?: number; gridStepM?: number }

export async function saveProjectLayout(env: Env, id: string, userId: string, input: LayoutSaveInput): Promise<boolean> {
  const result = await env.DB.prepare(`UPDATE projects SET layout_objects=?1,width_m=COALESCE(?2,width_m),height_m=COALESCE(?3,height_m),scale_px_per_meter=COALESCE(?4,scale_px_per_meter),grid_step_m=COALESCE(?5,grid_step_m),version=version+1,updated_at=?6 WHERE id=?7 AND user_id=?8`).bind(JSON.stringify(input.objects),input.widthM ?? null,input.heightM ?? null,input.scalePxPerMeter ?? null,input.gridStepM ?? null,nowIso(),id,userId).run()
  return (result.meta.changes ?? 0) > 0
}

export async function saveProjectFlow(env: Env, id: string, userId: string, flowNodes: unknown[], flowConnections: unknown[]): Promise<boolean> {
  const result = await env.DB.prepare('UPDATE projects SET flow_nodes=?1,flow_connections=?2,version=version+1,updated_at=?3 WHERE id=?4 AND user_id=?5').bind(JSON.stringify(flowNodes),JSON.stringify(flowConnections),nowIso(),id,userId).run()
  return (result.meta.changes ?? 0) > 0
}

export async function duplicateProject(env: Env, source: ProjectRow, newName: string): Promise<ProjectRow> {
  const id = newId(); const now = nowIso()
  const row = { ...source, id, name: newName, version: 1, created_at: now, updated_at: now }
  await env.DB.prepare(`INSERT INTO projects (id,user_id,name,description,status,scale_px_per_meter,grid_step_m,width_m,height_m,layout_objects,flow_nodes,flow_connections,version,created_at,updated_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15)`).bind(row.id,row.user_id,row.name,row.description,row.status,row.scale_px_per_meter,row.grid_step_m,row.width_m,row.height_m,row.layout_objects,row.flow_nodes,row.flow_connections,row.version,row.created_at,row.updated_at).run()
  return row
}
