import type { Layout, LayoutObject, LayoutSummary, NewLayoutInput } from '../../types/layout'
import type { FlowConnection, FlowNode } from '../../types/flow'

/**
 * Persistence abstraction consumed by features/layouts and features/editor.
 * See docs/ARCHITECTURE.md § 2.3. Implementations: LocalLayoutRepository (local-only, used before
 * login / as the Fase 9 migration source) and RemoteLayoutRepository (Cloudflare Worker + D1,
 * active once a user is signed in) — swapped without touching callers, see shared/data/repository.ts.
 */
export interface LayoutRepository {
  listLayouts(): Promise<LayoutSummary[]>
  getLayout(id: string): Promise<Layout | null>
  createLayout(input: NewLayoutInput): Promise<Layout>
  renameLayout(id: string, name: string): Promise<void>
  duplicateLayout(id: string): Promise<Layout>
  deleteLayout(id: string): Promise<void>
  saveLayoutObjects(id: string, objects: LayoutObject[]): Promise<void>
  /** Updates layout-level settings (environment size, scale, grid step) — not the object list. */
  updateLayoutSettings(id: string, settings: Partial<Pick<Layout, 'widthM' | 'heightM'>>): Promise<void>
  /** Persists the Fluxo board (nodes + connections) — same project as `objects`, saved
   * independently so editing one board never touches the other's data. */
  saveFlowBoard(id: string, flowNodes: FlowNode[], flowConnections: FlowConnection[]): Promise<void>
}
