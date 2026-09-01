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
})
