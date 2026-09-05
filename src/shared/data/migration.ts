import { getLocalLayoutRepository } from './LocalLayoutRepository'
import { RemoteLayoutRepository } from './RemoteLayoutRepository'

const PREFIX = 'fluxocit:migrated:'

function migratedKey(userId: string): string { return `${PREFIX}${userId}` }
function readMigrated(userId: string): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(migratedKey(userId)) ?? '[]') as string[]) } catch { return new Set() }
}
function writeMigrated(userId: string, ids: Set<string>): void { localStorage.setItem(migratedKey(userId), JSON.stringify([...ids])) }

/** Copies local-only projects into the signed-in user's D1 account once. Local data is never deleted. */
export async function migrateLocalLayoutsToRemote(userId: string): Promise<number> {
  if (typeof window === 'undefined') return 0
  const local = getLocalLayoutRepository(); const remote = new RemoteLayoutRepository(userId); const migrated = readMigrated(userId)
  const layouts = await local.listLayouts(); let count = 0
  for (const summary of layouts) {
    if (migrated.has(summary.id)) continue
    const layout = await local.getLayout(summary.id)
    if (!layout) { migrated.add(summary.id); continue }
    const created = await remote.createLayout({ name: layout.name, widthM: layout.widthM, heightM: layout.heightM })
    await remote.saveLayoutObjects(created.id, layout.objects)
    await remote.updateLayoutSettings(created.id, { widthM: layout.widthM, heightM: layout.heightM })
    await remote.saveFlowBoard(created.id, layout.flowNodes ?? [], layout.flowConnections ?? [])
    migrated.add(summary.id); count++
  }
  writeMigrated(userId, migrated)
  return count
}
