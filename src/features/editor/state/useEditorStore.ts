import { create } from 'zustand'
import { createId } from '../../../shared/lib/id'
import { normalizeDeg } from '../../../shared/lib/units'
import { snapToGrid } from '../../../shared/lib/geometry'
import type { Layout, LayoutObject, ObjectTypeKey } from '../../../types/layout'
import { OBJECT_CATALOG } from '../objects/catalog'

const MAX_HISTORY = 100

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface Camera {
  x: number
  y: number
  zoom: number
}

interface EditorState {
  layoutId: string | null
  layoutName: string
  scalePxPerMeter: number
  gridStepM: number
  objects: LayoutObject[]
  selectedIds: string[]
  camera: Camera
  snapEnabled: boolean
  gridVisible: boolean
  saveStatus: SaveStatus
  history: { past: LayoutObject[][]; future: LayoutObject[][] }

  loadLayout: (layout: Layout) => void
  addObject: (objectType: ObjectTypeKey, worldXCm: number, worldYCm: number) => void
  moveObjectLive: (id: string, xCm: number, yCm: number) => void
  commitObject: (id: string, patch: Partial<LayoutObject>) => void
  setProperty: (id: string, key: string, value: unknown) => void
  selectObject: (id: string | null) => void
  deleteObject: (id: string) => void
  duplicateObject: (id: string) => void
  rotateObject: (id: string, deltaDeg: number) => void
  undo: () => void
  redo: () => void
  setCamera: (camera: Partial<Camera>) => void
  setSnapEnabled: (enabled: boolean) => void
  toggleGrid: () => void
  setSaveStatus: (status: SaveStatus) => void
}

function snapshot(objects: LayoutObject[]): LayoutObject[] {
  return objects.map((o) => ({ ...o, properties: { ...o.properties } }))
}

export const useEditorStore = create<EditorState>((set, get) => ({
  layoutId: null,
  layoutName: '',
  scalePxPerMeter: 50,
  gridStepM: 0.1,
  objects: [],
  selectedIds: [],
  camera: { x: 0, y: 0, zoom: 1 },
  snapEnabled: true,
  gridVisible: true,
  saveStatus: 'idle',
  history: { past: [], future: [] },

  loadLayout: (layout) =>
    set({
      layoutId: layout.id,
      layoutName: layout.name,
      scalePxPerMeter: layout.scalePxPerMeter,
      gridStepM: layout.gridStepM,
      objects: layout.objects,
      selectedIds: [],
      history: { past: [], future: [] },
      saveStatus: 'idle',
    }),

  addObject: (objectType, worldXCm, worldYCm) => {
    const def = OBJECT_CATALOG[objectType]
    const { objects, history, gridStepM, snapEnabled } = get()
    const stepCm = gridStepM * 100
    const x = snapEnabled ? snapToGrid(worldXCm - def.defaultWidth / 2, stepCm) : worldXCm - def.defaultWidth / 2
    const y = snapEnabled ? snapToGrid(worldYCm - def.defaultLength / 2, stepCm) : worldYCm - def.defaultLength / 2

    const newObject: LayoutObject = {
      id: createId(),
      objectType,
      category: def.category,
      x,
      y,
      width: def.defaultWidth,
      length: def.defaultLength,
      rotationDeg: 0,
      zIndex: objects.length,
      properties: { ...(def.defaultProperties ?? {}) },
    }

    set({
      objects: [...objects, newObject],
      selectedIds: [newObject.id],
      history: { past: [...history.past, snapshot(objects)].slice(-MAX_HISTORY), future: [] },
    })
  },

  /** Updates position during an active drag without touching undo history. */
  moveObjectLive: (id, xCm, yCm) => {
    set({
      objects: get().objects.map((o) => (o.id === id ? { ...o, x: xCm, y: yCm } : o)),
    })
  },

  /** Commits a change (drag end, property edit, etc.) and records undo history. */
  commitObject: (id, patch) => {
    const { objects, history } = get()
    const before = snapshot(objects)
    set({
      objects: objects.map((o) => (o.id === id ? { ...o, ...patch } : o)),
      history: { past: [...history.past, before].slice(-MAX_HISTORY), future: [] },
    })
  },

  setProperty: (id, key, value) => {
    const obj = get().objects.find((o) => o.id === id)
    if (!obj) return
    if (key === 'name' || key === 'x' || key === 'y' || key === 'width' || key === 'length' || key === 'rotationDeg') {
      get().commitObject(id, { [key]: value } as Partial<LayoutObject>)
    } else {
      get().commitObject(id, { properties: { ...obj.properties, [key]: value } })
    }
  },

  selectObject: (id) => set({ selectedIds: id ? [id] : [] }),

  deleteObject: (id) => {
    const { objects, history, selectedIds } = get()
    set({
      objects: objects.filter((o) => o.id !== id),
      selectedIds: selectedIds.filter((s) => s !== id),
      history: { past: [...history.past, snapshot(objects)].slice(-MAX_HISTORY), future: [] },
    })
  },

  duplicateObject: (id) => {
    const { objects, history } = get()
    const original = objects.find((o) => o.id === id)
    if (!original) return
    const copy: LayoutObject = {
      ...original,
      id: createId(),
      x: original.x + 20,
      y: original.y + 20,
      properties: { ...original.properties },
      zIndex: objects.length,
    }
    set({
      objects: [...objects, copy],
      selectedIds: [copy.id],
      history: { past: [...history.past, snapshot(objects)].slice(-MAX_HISTORY), future: [] },
    })
  },

  rotateObject: (id, deltaDeg) => {
    const obj = get().objects.find((o) => o.id === id)
    if (!obj) return
    get().commitObject(id, { rotationDeg: normalizeDeg(obj.rotationDeg + deltaDeg) })
  },

  undo: () => {
    const { history, objects } = get()
    const previous = history.past.at(-1)
    if (!previous) return
    set({
      objects: previous,
      history: {
        past: history.past.slice(0, -1),
        future: [snapshot(objects), ...history.future].slice(0, MAX_HISTORY),
      },
      selectedIds: [],
    })
  },

  redo: () => {
    const { history, objects } = get()
    const next = history.future[0]
    if (!next) return
    set({
      objects: next,
      history: {
        past: [...history.past, snapshot(objects)].slice(-MAX_HISTORY),
        future: history.future.slice(1),
      },
      selectedIds: [],
    })
  },

  setCamera: (camera) => set({ camera: { ...get().camera, ...camera } }),
  setSnapEnabled: (enabled) => set({ snapEnabled: enabled }),
  toggleGrid: () => set({ gridVisible: !get().gridVisible }),
  setSaveStatus: (status) => set({ saveStatus: status }),
}))
