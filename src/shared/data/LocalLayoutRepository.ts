import { createId } from '../lib/id'
import type { Layout, LayoutObject, LayoutSummary, NewLayoutInput } from '../../types/layout'
import type { LayoutRepository } from './LayoutRepository'

const STORAGE_KEY = 'fluxocit:layouts'
const LOCAL_ORG_ID = 'local'

function readAll(): Layout[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Layout[]) : []
  } catch {
    return []
  }
}

function writeAll(layouts: Layout[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts))
}

/** localStorage-backed implementation, used until Supabase credentials are configured (docs/TECH_STACK.md § 2). */
export class LocalLayoutRepository implements LayoutRepository {
  async listLayouts(): Promise<LayoutSummary[]> {
    return readAll()
      .map(({ id, organizationId, name, createdAt, updatedAt }) => ({
        id,
        organizationId,
        name,
        createdAt,
        updatedAt,
      }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  async getLayout(id: string): Promise<Layout | null> {
    return readAll().find((l) => l.id === id) ?? null
  }

  async createLayout(input: NewLayoutInput): Promise<Layout> {
    const now = new Date().toISOString()
    const layout: Layout = {
      id: createId(),
      organizationId: LOCAL_ORG_ID,
      name: input.name,
      scalePxPerMeter: 50,
      gridStepM: 0.1,
      widthM: input.widthM,
      heightM: input.heightM,
      createdAt: now,
      updatedAt: now,
      objects: [],
    }
    const layouts = readAll()
    layouts.push(layout)
    writeAll(layouts)
    return layout
  }

  async renameLayout(id: string, name: string): Promise<void> {
    const layouts = readAll()
    const layout = layouts.find((l) => l.id === id)
    if (!layout) return
    layout.name = name
    layout.updatedAt = new Date().toISOString()
    writeAll(layouts)
  }

  async deleteLayout(id: string): Promise<void> {
    writeAll(readAll().filter((l) => l.id !== id))
  }

  async saveLayoutObjects(id: string, objects: LayoutObject[]): Promise<void> {
    const layouts = readAll()
    const layout = layouts.find((l) => l.id === id)
    if (!layout) return
    layout.objects = objects
    layout.updatedAt = new Date().toISOString()
    writeAll(layouts)
  }
}

export const layoutRepository: LayoutRepository = new LocalLayoutRepository()
