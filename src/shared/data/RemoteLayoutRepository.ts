import { ApiError, apiFetch } from './apiClient'
import type { Layout, LayoutObject, LayoutSummary, NewLayoutInput } from '../../types/layout'
import type { FlowConnection, FlowNode } from '../../types/flow'
import type { LayoutRepository } from './LayoutRepository'

interface ApiProjectSummary { id: string; name: string; createdAt: string; updatedAt: string }
interface ApiProjectFull extends ApiProjectSummary { scalePxPerMeter: number; gridStepM: number; widthM?: number; heightM?: number; objects: LayoutObject[]; flowNodes: FlowNode[]; flowConnections: FlowConnection[] }

function toSummary(p: ApiProjectSummary, userId: string): LayoutSummary {
  return { id: p.id, organizationId: userId, name: p.name, createdAt: p.createdAt, updatedAt: p.updatedAt }
}

function toLayout(p: ApiProjectFull, userId: string): Layout {
  return { ...toSummary(p, userId), scalePxPerMeter: p.scalePxPerMeter, gridStepM: p.gridStepM, widthM: p.widthM, heightM: p.heightM, objects: p.objects, flowNodes: p.flowNodes, flowConnections: p.flowConnections }
}

export class RemoteLayoutRepository implements LayoutRepository {
  constructor(private readonly userId: string) {}

  async listLayouts(): Promise<LayoutSummary[]> {
    const { projects } = await apiFetch<{ projects: ApiProjectSummary[] }>('/api/projects')
    return projects.map((p) => toSummary(p, this.userId))
  }

  async getLayout(id: string): Promise<Layout | null> {
    try {
      const { project } = await apiFetch<{ project: ApiProjectFull }>(`/api/projects/${id}`)
      return toLayout(project, this.userId)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null
      throw err
    }
  }

  async createLayout(input: NewLayoutInput): Promise<Layout> {
    const { project } = await apiFetch<{ project: ApiProjectFull }>('/api/projects', { method: 'POST', body: JSON.stringify(input) })
    return toLayout(project, this.userId)
  }

  async renameLayout(id: string, name: string): Promise<void> {
    await apiFetch(`/api/projects/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) })
  }

  async deleteLayout(id: string): Promise<void> {
    await apiFetch(`/api/projects/${id}`, { method: 'DELETE' })
  }

  async saveLayoutObjects(id: string, objects: LayoutObject[]): Promise<void> {
    await apiFetch(`/api/projects/${id}/layout`, { method: 'PUT', body: JSON.stringify({ objects }) })
  }

  async updateLayoutSettings(id: string, settings: Partial<Pick<Layout, 'widthM' | 'heightM'>>): Promise<void> {
    const current = await this.getLayout(id)
    await apiFetch(`/api/projects/${id}/layout`, { method: 'PUT', body: JSON.stringify({ objects: current?.objects ?? [], ...settings }) })
  }

  async saveFlowBoard(id: string, flowNodes: FlowNode[], flowConnections: FlowConnection[]): Promise<void> {
    await apiFetch(`/api/projects/${id}/flow`, { method: 'PUT', body: JSON.stringify({ flowNodes, flowConnections }) })
  }
}
