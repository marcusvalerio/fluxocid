import { getLocalLayoutRepository, layoutRepository } from './repository'
import type { LayoutSummary } from '../../types/layout'

const MIGRATION_KEY = 'fluxocit:migration-state'

interface MigrationState {
  /** Local layout ids already imported into a remote account — never re-offered, so re-visiting
   * this page (or logging in again) can't create duplicates. */
  importedIds: string[]
}

function readState(): MigrationState {
  try {
    const raw = localStorage.getItem(MIGRATION_KEY)
    const parsed = raw ? (JSON.parse(raw) as Partial<MigrationState>) : null
    return { importedIds: parsed?.importedIds ?? [] }
  } catch {
    return { importedIds: [] }
  }
}

function writeState(state: MigrationState): void {
  try {
    localStorage.setItem(MIGRATION_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable/full — the import itself already succeeded remotely; at worst the
    // banner offers this layout again next time, which is a duplicate risk we accept over
    // silently losing track of what's local (see importLocalLayout — it's still additive, never
    // overwrites), rather than a data-loss risk.
  }
}

/** Local layouts (from the pre-Fase-9 localStorage repository) not yet imported into the signed-in
 * account's remote projects — the source list for the "importar para minha conta" banner. */
export async function getPendingLocalLayouts(): Promise<LayoutSummary[]> {
  const state = readState()
  const local = await getLocalLayoutRepository().listLayouts()
  return local.filter((l) => !state.importedIds.includes(l.id))
}

/** Copies one local layout (Layout + Fluxo) into a brand-new remote project — always additive,
 * never overwrites or merges into an existing remote project, so there's no way for this to
 * silently clobber real work. Marks the source as imported so it's never offered again. */
export async function importLocalLayout(id: string): Promise<void> {
  const localRepo = getLocalLayoutRepository()
  const source = await localRepo.getLayout(id)
  if (!source) return

  const created = await layoutRepository.createLayout({
    name: source.name,
    description: source.description,
    widthM: source.widthM,
    heightM: source.heightM,
  })
  await layoutRepository.saveLayoutObjects(created.id, source.objects)
  if ((source.flowNodes && source.flowNodes.length > 0) || (source.flowConnections && source.flowConnections.length > 0)) {
    await layoutRepository.saveFlowBoard(created.id, source.flowNodes ?? [], source.flowConnections ?? [])
  }

  const state = readState()
  state.importedIds.push(id)
  writeState(state)
}

/** Imports every pending local layout in sequence (not parallel — keeps behavior predictable and
 * avoids hammering the API), reporting progress as it goes. Returns how many were imported. */
export async function importAllPendingLocalLayouts(
  onProgress?: (done: number, total: number) => void,
): Promise<number> {
  const pending = await getPendingLocalLayouts()
  for (let i = 0; i < pending.length; i++) {
    const layout = pending[i]
    if (!layout) continue
    await importLocalLayout(layout.id)
    onProgress?.(i + 1, pending.length)
  }
  return pending.length
}
