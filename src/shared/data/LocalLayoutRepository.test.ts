import { beforeEach, describe, expect, it } from 'vitest'
import { LocalLayoutRepository, flushLocalLayoutSnapshot } from './LocalLayoutRepository'

beforeEach(() => localStorage.clear())

describe('LocalLayoutRepository', () => {
  it('persists Layout and Fluxo in the same project', async () => {
    const repo = new LocalLayoutRepository()
    const layout = await repo.createLayout({ name: 'CD teste', widthM: 20, heightM: 15 })
    const object = { id: 'obj-1', objectType: 'pallet' as const, category: 'pallet' as const, x: 100, y: 200, width: 120, length: 100, rotationDeg: 0, zIndex: 0, properties: {} }
    const node = { id: 'node-1', type: 'receiving' as const, x: 10, y: 20 }

    await repo.saveLayoutObjects(layout.id, [object])
    await repo.saveFlowBoard(layout.id, [node], [])

    const loaded = await repo.getLayout(layout.id)
    expect(loaded?.objects).toEqual([object])
    expect(loaded?.flowNodes).toEqual([node])
    expect(loaded?.flowConnections).toEqual([])
  })

  it('flushes a latest snapshot synchronously for page-close recovery', async () => {
    const repo = new LocalLayoutRepository()
    const layout = await repo.createLayout({ name: 'Flush teste' })
    const object = { id: 'obj-2', objectType: 'rack' as const, category: 'storage' as const, x: 500, y: 600, width: 270, length: 110, rotationDeg: 0, zIndex: 0, properties: {} }

    flushLocalLayoutSnapshot(layout.id, [object], [], [])

    await expect(repo.getLayout(layout.id)).resolves.toMatchObject({ objects: [object] })
  })

  it('keeps pending Layout and Fluxo writes from overwriting each other', async () => {
    const repo = new LocalLayoutRepository()
    const layout = await repo.createLayout({ name: 'Concorrência' })
    const object = { id: 'obj-3', objectType: 'pallet' as const, category: 'pallet' as const, x: 0, y: 0, width: 120, length: 100, rotationDeg: 0, zIndex: 0, properties: {} }
    const node = { id: 'node-3', type: 'shipping' as const, x: 50, y: 50 }

    await Promise.all([repo.saveLayoutObjects(layout.id, [object]), repo.saveFlowBoard(layout.id, [node], [])])

    const loaded = await repo.getLayout(layout.id)
    expect(loaded?.objects).toEqual([object])
    expect(loaded?.flowNodes).toEqual([node])
  })
})
