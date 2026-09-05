import { Hono } from 'hono'
import { createProject, deleteProject, duplicateProject, findProjectForUser, listProjectsForUser, renameProject, saveProjectFlow, saveProjectLayout } from '../db'
import { readJsonBody } from '../http'
import { requireAuth } from '../middleware'
import type { Env, ProjectRow, SessionUser } from '../types'

export const projectRoutes = new Hono<{ Bindings: Env; Variables: { user: SessionUser } }>()
projectRoutes.use('*', requireAuth)

const toSummary = (row: ProjectRow) => ({ id: row.id, name: row.name, description: row.description, createdAt: row.created_at, updatedAt: row.updated_at })
const toFull = (row: ProjectRow) => ({ ...toSummary(row), scalePxPerMeter: row.scale_px_per_meter, gridStepM: row.grid_step_m, widthM: row.width_m ?? undefined, heightM: row.height_m ?? undefined, objects: JSON.parse(row.layout_objects), flowNodes: JSON.parse(row.flow_nodes), flowConnections: JSON.parse(row.flow_connections), version: row.version })

projectRoutes.get('/', async (c) => c.json({ projects: (await listProjectsForUser(c.env, c.get('user').id)).map(toSummary) }))

projectRoutes.post('/', async (c) => {
  const body = await readJsonBody<{ name?: string; description?: string; widthM?: number; heightM?: number }>(c)
  const row = await createProject(c.env, c.get('user').id, { name: body.name?.trim() || 'Novo projeto', description: body.description?.trim() || undefined, widthM: body.widthM, heightM: body.heightM })
  return c.json({ project: toFull(row) }, 201)
})

projectRoutes.get('/:id', async (c) => {
  const row = await findProjectForUser(c.env, c.req.param('id'), c.get('user').id)
  return row ? c.json({ project: toFull(row) }) : c.json({ error: 'Projeto não encontrado.' }, 404)
})

projectRoutes.patch('/:id', async (c) => {
  const body = await readJsonBody<{ name?: string }>(c); const name = body.name?.trim()
  if (!name) return c.json({ error: 'Nome não pode ser vazio.' }, 400)
  return (await renameProject(c.env, c.req.param('id'), c.get('user').id, name)) ? c.body(null, 204) : c.json({ error: 'Projeto não encontrado.' }, 404)
})

projectRoutes.delete('/:id', async (c) => (await deleteProject(c.env, c.req.param('id'), c.get('user').id)) ? c.body(null, 204) : c.json({ error: 'Projeto não encontrado.' }, 404))

projectRoutes.post('/:id/duplicate', async (c) => {
  const source = await findProjectForUser(c.env, c.req.param('id'), c.get('user').id)
  if (!source) return c.json({ error: 'Projeto não encontrado.' }, 404)
  return c.json({ project: toFull(await duplicateProject(c.env, source, `${source.name} (cópia)`)) }, 201)
})

projectRoutes.put('/:id/layout', async (c) => {
  const body = await readJsonBody<{ objects?: unknown[]; widthM?: number; heightM?: number; scalePxPerMeter?: number; gridStepM?: number }>(c)
  if (!Array.isArray(body.objects)) return c.json({ error: 'Corpo inválido: objects deve ser uma lista.' }, 400)
  const ok = await saveProjectLayout(c.env, c.req.param('id'), c.get('user').id, body)
  return ok ? c.body(null, 204) : c.json({ error: 'Projeto não encontrado.' }, 404)
})

projectRoutes.put('/:id/flow', async (c) => {
  const body = await readJsonBody<{ flowNodes?: unknown[]; flowConnections?: unknown[] }>(c)
  if (!Array.isArray(body.flowNodes) || !Array.isArray(body.flowConnections)) return c.json({ error: 'Corpo inválido: flowNodes/flowConnections devem ser listas.' }, 400)
  const ok = await saveProjectFlow(c.env, c.req.param('id'), c.get('user').id, body.flowNodes, body.flowConnections)
  return ok ? c.body(null, 204) : c.json({ error: 'Projeto não encontrado.' }, 404)
})
