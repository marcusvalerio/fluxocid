import { create } from 'zustand'
import { createId } from '../../../shared/lib/id'
import { normalizeDeg } from '../../../shared/lib/units'
import { getBoundingBox, snapToGrid } from '../../../shared/lib/geometry'
import type { Layout, LayoutObject, ObjectTypeKey } from '../../../types/layout'
import { OBJECT_CATALOG } from '../objects/catalog'

export type AlignMode = 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY'
export type DistributeAxis = 'x' | 'y'

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
  /** Mobile: entered via long-press on an object; while true, taps toggle selection instead of replacing it. */
  multiSelectMode: boolean
  saveStatus: SaveStatus
  history: { past: LayoutObject[][]; future: LayoutObject[][] }

  loadLayout: (layout: Layout) => void
  addObject: (objectType: ObjectTypeKey, worldXCm: number, worldYCm: number) => void
  moveObjectLive: (id: string, xCm: number, yCm: number) => void
  commitObject: (id: string, patch: Partial<LayoutObject>) => void
  setProperty: (id: string, key: string, value: unknown) => void
  selectObject: (id: string | null) => void
  toggleSelect: (id: string) => void
  selectMany: (ids: string[], additive: boolean) => void
  deleteObject: (id: string) => void
  duplicateObject: (id: string) => void
  rotateObject: (id: string, deltaDeg: number) => void
  deleteSelected: () => void
  duplicateSelected: () => void
  rotateSelected: (deltaDeg: number) => void
  moveManyLive: (updates: { id: string; x: number; y: number }[]) => void
  commitMany: (updates: { id: string; patch: Partial<LayoutObject> }[]) => void
  alignSelected: (mode: AlignMode) => void
  distributeSelected: (axis: DistributeAxis) => void
  undo: () => void
  redo: () => void
  setCamera: (camera: Partial<Camera>) => void
  setSnapEnabled: (enabled: boolean) => void
  toggleGrid: () => void
  setSaveStatus: (status: SaveStatus) => void
  setMultiSelectMode: (enabled: boolean) => void
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
  multiSelectMode: false,
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

  selectObject: (id) =>
    set({ selectedIds: id ? [id] : [], multiSelectMode: id ? get().multiSelectMode : false }),

  toggleSelect: (id) => {
    const { selectedIds } = get()
    set({
      selectedIds: selectedIds.includes(id)
        ? selectedIds.filter((s) => s !== id)
        : [...selectedIds, id],
    })
  },

  selectMany: (ids, additive) => {
    if (!additive) {
      set({ selectedIds: ids })
      return
    }
    const existing = get().selectedIds
    const merged = new Set(existing)
    for (const id of ids) merged.add(id)
    set({ selectedIds: Array.from(merged) })
  },

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

  deleteSelected: () => {
    const { objects, history, selectedIds } = get()
    if (selectedIds.length === 0) return
    const ids = new Set(selectedIds)
    set({
      objects: objects.filter((o) => !ids.has(o.id)),
      selectedIds: [],
      history: { past: [...history.past, snapshot(objects)].slice(-MAX_HISTORY), future: [] },
    })
  },

  duplicateSelected: () => {
    const { objects, history, selectedIds } = get()
    if (selectedIds.length === 0) return
    const ids = new Set(selectedIds)
    const maxZ = objects.length
    const copies: LayoutObject[] = []
    objects.forEach((o, i) => {
      if (!ids.has(o.id)) return
      copies.push({
        ...o,
        id: createId(),
        x: o.x + 20,
        y: o.y + 20,
        properties: { ...o.properties },
        zIndex: maxZ + i,
      })
    })
    set({
      objects: [...objects, ...copies],
      selectedIds: copies.map((c) => c.id),
      history: { past: [...history.past, snapshot(objects)].slice(-MAX_HISTORY), future: [] },
    })
  },

  rotateSelected: (deltaDeg) => {
    const { objects, history, selectedIds } = get()
    if (selectedIds.length === 0) return
    const ids = new Set(selectedIds)
    set({
      objects: objects.map((o) =>
        ids.has(o.id) ? { ...o, rotationDeg: normalizeDeg(o.rotationDeg + deltaDeg) } : o,
      ),
      history: { past: [...history.past, snapshot(objects)].slice(-MAX_HISTORY), future: [] },
    })
  },

  /** Updates several objects' positions during an active multi-drag without touching undo history. */
  moveManyLive: (updates) => {
    const byId = new Map(updates.map((u) => [u.id, u]))
    set({
      objects: get().objects.map((o) => {
        const u = byId.get(o.id)
        return u ? { ...o, x: u.x, y: u.y } : o
      }),
    })
  },

  /** Commits several changes (multi-drag end, align, distribute) as a single undo step. */
  commitMany: (updates) => {
    const { objects, history } = get()
    const before = snapshot(objects)
    const byId = new Map(updates.map((u) => [u.id, u.patch]))
    set({
      objects: objects.map((o) => {
        const patch = byId.get(o.id)
        return patch ? { ...o, ...patch } : o
      }),
      history: { past: [...history.past, before].slice(-MAX_HISTORY), future: [] },
    })
  },

  alignSelected: (mode) => {
    const { objects, selectedIds } = get()
    const targets = objects.filter((o) => selectedIds.includes(o.id))
    if (targets.length < 2) return

    const boxes = targets.map((o) => ({ obj: o, box: getBoundingBox(o) }))
    const minX = Math.min(...boxes.map((b) => b.box.minX))
    const maxX = Math.max(...boxes.map((b) => b.box.maxX))
    const minY = Math.min(...boxes.map((b) => b.box.minY))
    const maxY = Math.max(...boxes.map((b) => b.box.maxY))
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    const updates = boxes.map(({ obj, box }) => {
      let dx = 0
      let dy = 0
      switch (mode) {
        case 'left':
          dx = minX - box.minX
          break
        case 'right':
          dx = maxX - box.maxX
          break
        case 'top':
          dy = minY - box.minY
          break
        case 'bottom':
          dy = maxY - box.maxY
          break
        case 'centerX':
          dx = centerX - (box.minX + box.maxX) / 2
          break
        case 'centerY':
          dy = centerY - (box.minY + box.maxY) / 2
          break
      }
      return { id: obj.id, patch: { x: obj.x + dx, y: obj.y + dy } }
    })

    get().commitMany(updates)
  },

  distributeSelected: (axis) => {
    const { objects, selectedIds } = get()
    const targets = objects.filter((o) => selectedIds.includes(o.id))
    if (targets.length < 3) return

    const withBoxes = targets.map((o) => ({ obj: o, box: getBoundingBox(o) }))
    const sorted = [...withBoxes].sort((a, b) =>
      axis === 'x' ? a.box.minX - b.box.minX : a.box.minY - b.box.minY,
    )

    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    const span =
      axis === 'x' ? last.box.maxX - first.box.minX : last.box.maxY - first.box.minY
    const totalSize = sorted.reduce(
      (sum, { box }) => sum + (axis === 'x' ? box.maxX - box.minX : box.maxY - box.minY),
      0,
    )
    const gap = (span - totalSize) / (sorted.length - 1)

    let cursor = axis === 'x' ? first.box.minX : first.box.minY
    const updates = sorted.map(({ obj, box }) => {
      const size = axis === 'x' ? box.maxX - box.minX : box.maxY - box.minY
      const targetMin = cursor
      cursor += size + gap
      const dx = axis === 'x' ? targetMin - box.minX : 0
      const dy = axis === 'y' ? targetMin - box.minY : 0
      return { id: obj.id, patch: { x: obj.x + dx, y: obj.y + dy } }
    })

    get().commitMany(updates)
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
  setMultiSelectMode: (enabled) => set({ multiSelectMode: enabled }),
}))
