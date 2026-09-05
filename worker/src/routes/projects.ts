import { Hono } from 'hono'
import {
  createProject,
  deleteProject,
  duplicateProject,
  findProjectForUser,
  listProjectsForUser,
  renameProject,
  saveProjectFlow,
  saveProjectLayout,
} from '../db'
import { readJsonBody } from '../http'
import { requireAuth } from '../middleware'
import type { Env, ProjectRow, SessionUser } from '../types'

export const projectRoutes = new Hono<{ Bindings: Env; Variables: { user: SessionUser } }>()

projectRoutes.use('*', requireAuth)

function toSummary(row: ProjectRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toFull(row: ProjectRow) {
  return {
    ...toSummary(row),
    scalePxPerMeter: row.scale_px_per_meter,
    gridStepM: row.grid_step_m,
    widthM: row.width_m ?? undefined,
    heightM: row.height_m ?? undefined,
    objects: JSON.parse(row.layout_objects),
    flowNodes: JSON.parse(row.flow_nodes),
    flowConnections: JSON.parse(row.flow_connections),
    version: row.version,
  }
}

projectRoutes.get('/', async (c) => {
  const rows = await listProjectsForUser(c.env, c.get('user').id)
  return c.json({ projects: rows.map(toSummary) })
})

projectRoutes.post('/', async (c) => {
  const body = await readJsonBody<{ name?: string; description?: string; widthM?: number; heightM?: number }>(c)
  const name = body.name?.trim() || 'Novo projeto'
  const row = await createProject(c.env, c.get('user').id, {
    name,
    description: body.description?.trim() || undefined,
    widthM: body.widthM,
    heightM: body.heightM,
  })
  return c.json({ project: toFull(row) }, 201)
})

projectRoutes.get('/:id', async (c) => {
  const row = await findProjectForUser(c.env, c.req.param('id'), c.get('user').id)
  if (!row) return c.json({ error: 'Projeto não encontrado.' }, 404)
  return c.json({ project: toFull(row) })
})

projectRoutes.patch('/:id', async (c) => {
  const userId = c.get('user').id
  const id = c.req.param('id')
  const body = await readJsonBody<{ name?: string }>(c)
  const name = body.name?.trim()
  if (!name) return c.json({ error: 'Nome não pode ser vazio.' }, 400)

  const ok = await renameProject(c.env, id, userId, name)
  if (!ok) return c.json({ error: 'Projeto não encontrado.' }, 404)
  return c.body(null, 204)
})

projectRoutes.delete('/:id', async (c) => {
  const ok = await deleteProject(c.env, c.req.param('id'), c.get('user').id)
  if (!ok) return c.json({ error: 'Projeto não encontrado.' }, 404)
  return c.body(null, 204)
})

projectRoutes.post('/:id/duplicate', async (c) => {
  const userId = c.get('user').id
  const source = await findProjectForUser(c.env, c.req.param('id'), userId)
  if (!source) return c.json({ error: 'Projeto não encontrado.' }, 404)
  const copy = await duplicateProject(c.env, source, `${source.name} (cópia)`)
  return c.json({ project: toFull(copy) }, 201)
})

projectRoutes.put('/:id/layout', async (c) => {
  const userId = c.get('user').id
  const id = c.req.param('id')
  const body = await readJsonBody<{
    objects?: unknown[]
    widthM?: number
    heightM?: number
    scalePxPerMeter?: number
    gridStepM?: number
  }>(c)
  if (!Array.isArray(body.objects)) {
    return c.json({ error: 'Corpo inválido: objects deve ser uma lista.' }, 400)
  }
  const ok = await saveProjectLayout(c.env, id, userId, {
    objects: body.objects,
    widthM: body.widthM,
    heightM: body.heightM,
    scalePxPerMeter: body.scalePxPerMeter,
    gridStepM: body.gridStepM,
  })
  if (!ok) return c.json({ error: 'Projeto não encontrado.' }, 404)
  return c.body(null, 204)
})

projectRoutes.put('/:id/flow', async (c) => {
  const userId = c.get('user').id
  const id = c.req.param('id')
  const body = await readJsonBody<{ flowNodes?: unknown[]; flowConnections?: unknown[] }>(c)
  if (!Array.isArray(body.flowNodes) || !Array.isArray(body.flowConnections)) {
    return c.json({ error: 'Corpo inválido: flowNodes/flowConnections devem ser listas.' }, 400)
  }
  const ok = await saveProjectFlow(c.env, id, userId, body.flowNodes, body.flowConnections)
  if (!ok) return c.json({ error: 'Projeto não encontrado.' }, 404)
  return c.body(null, 204)
})
