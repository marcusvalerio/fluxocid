import { createId } from '../lib/id'
import type { Layout, LayoutObject, LayoutSummary, NewLayoutInput } from '../../types/layout'
import type { FlowConnection, FlowNode } from '../../types/flow'
import type { LayoutRepository } from './LayoutRepository'
import { RemoteLayoutRepository } from './RemoteLayoutRepository'

const STORAGE_KEY = 'fluxocit:layouts'
const LOCAL_ORG_ID = 'local'

type PendingSnapshot = { objects?: LayoutObject[]; flowNodes?: FlowNode[]; flowConnections?: FlowConnection[] }
const pendingSnapshots = new Map<string, PendingSnapshot>()

function readAll(): Layout[] {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? (JSON.parse(raw) as Layout[]) : [] } catch { return [] }
}
function writeAll(layouts: Layout[]): void { localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts)) }

export function flushLocalLayoutSnapshot(id: string, objects: LayoutObject[], flowNodes: FlowNode[], flowConnections: FlowConnection[]): void {
  try {
    const layouts = readAll(); const layout = layouts.find((item) => item.id === id)
    if (!layout) return
    layout.objects = objects; layout.flowNodes = flowNodes; layout.flowConnections = flowConnections; layout.updatedAt = new Date().toISOString()
    writeAll(layouts); pendingSnapshots.delete(id)
  } catch { /* never block page close */ }
}

function flushPendingSnapshots(): void {
  if (pendingSnapshots.size === 0) return
  try {
    const layouts = readAll(); let changed = false
    for (const [id, pending] of pendingSnapshots) {
      const layout = layouts.find((item) => item.id === id); if (!layout) continue
      let layoutChanged = false
      if (pending.objects) { layout.objects = pending.objects; layoutChanged = true }
      if (pending.flowNodes) { layout.flowNodes = pending.flowNodes; layoutChanged = true }
      if (pending.flowConnections) { layout.flowConnections = pending.flowConnections; layoutChanged = true }
      if (layoutChanged) { layout.updatedAt = new Date().toISOString(); changed = true }
    }
    if (changed) writeAll(layouts)
    pendingSnapshots.clear()
  } catch { /* never block page close */ }
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushPendingSnapshots)
  window.addEventListener('beforeunload', flushPendingSnapshots)
}

export class LocalLayoutRepository implements LayoutRepository {
  private writeQueue: Promise<void> = Promise.resolve()
  private enqueueWrite(task: () => void): Promise<void> { const next = this.writeQueue.then(task); this.writeQueue = next.catch(() => undefined); return next }

  async listLayouts(): Promise<LayoutSummary[]> {
    return readAll().map(({ id, organizationId, name, createdAt, updatedAt }) => ({ id, organizationId, name, createdAt, updatedAt })).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }
  async getLayout(id: string): Promise<Layout | null> { return readAll().find((l) => l.id === id) ?? null }
  async createLayout(input: NewLayoutInput): Promise<Layout> {
    const now = new Date().toISOString()
    const layout: Layout = { id: createId(), organizationId: LOCAL_ORG_ID, name: input.name, scalePxPerMeter: 50, gridStepM: 0.1, widthM: input.widthM, heightM: input.heightM, createdAt: now, updatedAt: now, objects: [] }
    const layouts = readAll(); layouts.push(layout); writeAll(layouts); return layout
  }
  async renameLayout(id: string, name: string): Promise<void> {
    const layouts = readAll(); const layout = layouts.find((l) => l.id === id); if (!layout) return
    layout.name = name; layout.updatedAt = new Date().toISOString(); writeAll(layouts)
  }
  async deleteLayout(id: string): Promise<void> { writeAll(readAll().filter((l) => l.id !== id)) }
  async saveLayoutObjects(id: string, objects: LayoutObject[]): Promise<void> {
    const pending = pendingSnapshots.get(id) ?? {}; pending.objects = objects; pendingSnapshots.set(id, pending)
    return this.enqueueWrite(() => {
      const layouts = readAll(); const layout = layouts.find((l) => l.id === id); if (!layout) return
      layout.objects = objects; layout.updatedAt = new Date().toISOString(); writeAll(layouts)
      const current = pendingSnapshots.get(id)
      if (current?.objects === objects) { delete current.objects; if (!current.flowNodes && !current.flowConnections) pendingSnapshots.delete(id) }
    })
  }
  async updateLayoutSettings(id: string, settings: Partial<Pick<Layout, 'widthM' | 'heightM'>>): Promise<void> {
    const layouts = readAll(); const layout = layouts.find((l) => l.id === id); if (!layout) return
    Object.assign(layout, settings); layout.updatedAt = new Date().toISOString(); writeAll(layouts)
  }
  async saveFlowBoard(id: string, flowNodes: FlowNode[], flowConnections: FlowConnection[]): Promise<void> {
    const pending = pendingSnapshots.get(id) ?? {}; pending.flowNodes = flowNodes; pending.flowConnections = flowConnections; pendingSnapshots.set(id, pending)
    return this.enqueueWrite(() => {
      const layouts = readAll(); const layout = layouts.find((l) => l.id === id); if (!layout) return
      layout.flowNodes = flowNodes; layout.flowConnections = flowConnections; layout.updatedAt = new Date().toISOString(); writeAll(layouts)
      const current = pendingSnapshots.get(id)
      if (current?.flowNodes === flowNodes && current?.flowConnections === flowConnections) { delete current.flowNodes; delete current.flowConnections; if (!current.objects) pendingSnapshots.delete(id) }
    })
  }
}

const localRepository: LayoutRepository = new LocalLayoutRepository()
let activeRepository: LayoutRepository = localRepository

export function activateRemoteRepository(userId: string): void { activeRepository = new RemoteLayoutRepository(userId) }
export function activateLocalRepository(): void { activeRepository = localRepository }
export function getLocalLayoutRepository(): LayoutRepository { return localRepository }

export const layoutRepository: LayoutRepository = {
  listLayouts: (...args) => activeRepository.listLayouts(...args),
  getLayout: (...args) => activeRepository.getLayout(...args),
  createLayout: (...args) => activeRepository.createLayout(...args),
  renameLayout: (...args) => activeRepository.renameLayout(...args),
  deleteLayout: (...args) => activeRepository.deleteLayout(...args),
  saveLayoutObjects: (...args) => activeRepository.saveLayoutObjects(...args),
  updateLayoutSettings: (...args) => activeRepository.updateLayoutSettings(...args),
  saveFlowBoard: (...args) => activeRepository.saveFlowBoard(...args),
}
