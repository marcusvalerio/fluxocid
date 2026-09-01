import { beforeEach, describe, expect, it } from 'vitest'
import { useEditorStore } from './useEditorStore'
import type { Layout } from '../../../types/layout'

function emptyLayout(): Layout {
  return {
    id: 'layout-1',
    organizationId: 'local',
    name: 'Test layout',
    scalePxPerMeter: 50,
    gridStepM: 0.1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    objects: [],
  }
}

beforeEach(() => {
  useEditorStore.getState().loadLayout(emptyLayout())
})

describe('useEditorStore', () => {
  it('adds an object snapped to the grid, centered on the insertion point', () => {
    useEditorStore.getState().addObject('pallet', 500, 500)
    const [obj] = useEditorStore.getState().objects
    expect(obj.objectType).toBe('pallet')
    // default pallet is 120x100 cm, centered on (500,500) -> top-left (440, 450)
    expect(obj.x).toBe(440)
    expect(obj.y).toBe(450)
  })

  it('records undo history on commit and supports undo/redo', () => {
    useEditorStore.getState().addObject('pallet', 500, 500)
    const id = useEditorStore.getState().objects[0].id

    useEditorStore.getState().commitObject(id, { x: 999 })
    expect(useEditorStore.getState().objects[0].x).toBe(999)

    useEditorStore.getState().undo()
    expect(useEditorStore.getState().objects[0].x).toBe(440)

    useEditorStore.getState().redo()
    expect(useEditorStore.getState().objects[0].x).toBe(999)
  })

  it('does not record history for live drag updates', () => {
    useEditorStore.getState().addObject('pallet', 500, 500)
    const id = useEditorStore.getState().objects[0].id
    const historyLengthBefore = useEditorStore.getState().history.past.length

    useEditorStore.getState().moveObjectLive(id, 700, 700)

    expect(useEditorStore.getState().history.past.length).toBe(historyLengthBefore)
    expect(useEditorStore.getState().objects[0].x).toBe(700)
  })

  it('duplicates an object with an offset and selects the copy', () => {
    useEditorStore.getState().addObject('pallet', 500, 500)
    const originalId = useEditorStore.getState().objects[0].id

    useEditorStore.getState().duplicateObject(originalId)

    const { objects, selectedIds } = useEditorStore.getState()
    expect(objects).toHaveLength(2)
    const copy = objects.find((o) => o.id !== originalId)!
    expect(copy.x).toBe(objects[0].x + 20)
    expect(selectedIds).toEqual([copy.id])
  })

  it('rotates an object and normalizes the angle', () => {
    useEditorStore.getState().addObject('pallet', 500, 500)
    const id = useEditorStore.getState().objects[0].id

    useEditorStore.getState().rotateObject(id, -90)
    expect(useEditorStore.getState().objects[0].rotationDeg).toBe(270)
  })

  it('deletes an object and clears its selection', () => {
    useEditorStore.getState().addObject('pallet', 500, 500)
    const id = useEditorStore.getState().objects[0].id

    useEditorStore.getState().deleteObject(id)

    expect(useEditorStore.getState().objects).toHaveLength(0)
    expect(useEditorStore.getState().selectedIds).toEqual([])
  })

  describe('multi-selection', () => {
    it('toggles membership in the selection', () => {
      useEditorStore.getState().addObject('pallet', 500, 500)
      const id = useEditorStore.getState().objects[0].id
      useEditorStore.getState().selectObject(null) // addObject auto-selects; start from empty

      useEditorStore.getState().toggleSelect(id)
      expect(useEditorStore.getState().selectedIds).toEqual([id])

      useEditorStore.getState().toggleSelect(id)
      expect(useEditorStore.getState().selectedIds).toEqual([])
    })

    it('selectMany replaces or merges the selection', () => {
      useEditorStore.getState().addObject('pallet', 100, 100)
      useEditorStore.getState().addObject('pallet', 300, 300)
      const [a, b] = useEditorStore.getState().objects.map((o) => o.id)

      useEditorStore.getState().selectMany([a], false)
      expect(useEditorStore.getState().selectedIds).toEqual([a])

      useEditorStore.getState().selectMany([b], true)
      expect(new Set(useEditorStore.getState().selectedIds)).toEqual(new Set([a, b]))
    })

    it('moveManyLive updates positions without history, commitMany records one undo step', () => {
      useEditorStore.getState().addObject('pallet', 100, 100)
      useEditorStore.getState().addObject('pallet', 300, 300)
      const [a, b] = useEditorStore.getState().objects.map((o) => o.id)
      const historyBefore = useEditorStore.getState().history.past.length

      useEditorStore.getState().moveManyLive([
        { id: a, x: 1000, y: 1000 },
        { id: b, x: 2000, y: 2000 },
      ])
      expect(useEditorStore.getState().history.past.length).toBe(historyBefore)
      expect(useEditorStore.getState().objects.map((o) => o.x)).toEqual([1000, 2000])

      useEditorStore.getState().commitMany([
        { id: a, patch: { x: 1500 } },
        { id: b, patch: { x: 2500 } },
      ])
      expect(useEditorStore.getState().history.past.length).toBe(historyBefore + 1)
      expect(useEditorStore.getState().objects.map((o) => o.x)).toEqual([1500, 2500])

      useEditorStore.getState().undo()
      expect(useEditorStore.getState().objects.map((o) => o.x)).toEqual([1000, 2000])
    })

    it('deleteSelected removes every selected object as one undo step', () => {
      useEditorStore.getState().addObject('pallet', 100, 100)
      useEditorStore.getState().addObject('pallet', 300, 300)
      useEditorStore.getState().addObject('pallet', 500, 500)
      const [a, b] = useEditorStore.getState().objects.map((o) => o.id)

      useEditorStore.getState().selectMany([a, b], false)
      useEditorStore.getState().deleteSelected()

      expect(useEditorStore.getState().objects).toHaveLength(1)
      expect(useEditorStore.getState().selectedIds).toEqual([])

      useEditorStore.getState().undo()
      expect(useEditorStore.getState().objects).toHaveLength(3)
    })

    it('duplicateSelected copies every selected object with an offset', () => {
      useEditorStore.getState().addObject('pallet', 100, 100)
      useEditorStore.getState().addObject('pallet', 300, 300)
      const ids = useEditorStore.getState().objects.map((o) => o.id)

      useEditorStore.getState().selectMany(ids, false)
      useEditorStore.getState().duplicateSelected()

      expect(useEditorStore.getState().objects).toHaveLength(4)
      expect(useEditorStore.getState().selectedIds).toHaveLength(2)
    })
  })

  describe('align and distribute', () => {
    it('aligns selected objects to the left edge of the group bounding box', () => {
      useEditorStore.getState().addObject('pallet', 100, 100) // -> x=40
      useEditorStore.getState().addObject('pallet', 500, 100) // -> x=440
      const ids = useEditorStore.getState().objects.map((o) => o.id)

      useEditorStore.getState().selectMany(ids, false)
      useEditorStore.getState().alignSelected('left')

      const xs = useEditorStore.getState().objects.map((o) => o.x)
      expect(xs[0]).toBe(xs[1])
      expect(xs[0]).toBe(40)
    })

    it('aligns selected objects to their combined horizontal center', () => {
      useEditorStore.getState().addObject('pallet', 100, 100)
      useEditorStore.getState().addObject('pallet', 700, 100)
      const ids = useEditorStore.getState().objects.map((o) => o.id)

      useEditorStore.getState().selectMany(ids, false)
      useEditorStore.getState().alignSelected('centerX')

      const centers = useEditorStore.getState().objects.map((o) => o.x + o.width / 2)
      expect(centers[0]).toBeCloseTo(centers[1], 5)
    })

    it('does not align a single-object selection', () => {
      useEditorStore.getState().addObject('pallet', 100, 100)
      const id = useEditorStore.getState().objects[0].id
      const xBefore = useEditorStore.getState().objects[0].x

      useEditorStore.getState().selectMany([id], false)
      useEditorStore.getState().alignSelected('left')

      expect(useEditorStore.getState().objects[0].x).toBe(xBefore)
    })

    it('distributes 3+ objects with equal spacing between bounding boxes', () => {
      useEditorStore.getState().addObject('pallet', 100, 100)
      useEditorStore.getState().addObject('pallet', 400, 100)
      useEditorStore.getState().addObject('pallet', 1200, 100)
      const ids = useEditorStore.getState().objects.map((o) => o.id)

      useEditorStore.getState().selectMany(ids, false)
      useEditorStore.getState().distributeSelected('x')

      const sorted = [...useEditorStore.getState().objects].sort((a, b) => a.x - b.x)
      const gap1 = sorted[1].x - (sorted[0].x + sorted[0].width)
      const gap2 = sorted[2].x - (sorted[1].x + sorted[1].width)
      expect(gap1).toBeCloseTo(gap2, 5)
    })

    it('does not distribute fewer than 3 objects', () => {
      useEditorStore.getState().addObject('pallet', 100, 100)
      useEditorStore.getState().addObject('pallet', 400, 100)
      const ids = useEditorStore.getState().objects.map((o) => o.id)
      const before = useEditorStore.getState().objects.map((o) => o.x)

      useEditorStore.getState().selectMany(ids, false)
      useEditorStore.getState().distributeSelected('x')

      expect(useEditorStore.getState().objects.map((o) => o.x)).toEqual(before)
    })
  })
})
