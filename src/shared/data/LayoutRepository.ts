import type { Layout, LayoutObject, LayoutSummary, NewLayoutInput } from '../../types/layout'

/**
 * Persistence abstraction consumed by features/layouts and features/editor.
 * See docs/ARCHITECTURE.md § 2.3. Implementations: LocalLayoutRepository (active
 * today) and a future SupabaseLayoutRepository, swapped without touching callers.
 */
export interface LayoutRepository {
  listLayouts(): Promise<LayoutSummary[]>
  getLayout(id: string): Promise<Layout | null>
  createLayout(input: NewLayoutInput): Promise<Layout>
  renameLayout(id: string, name: string): Promise<void>
  deleteLayout(id: string): Promise<void>
  saveLayoutObjects(id: string, objects: LayoutObject[]): Promise<void>
}
