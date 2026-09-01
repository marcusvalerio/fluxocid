import { describe, expect, it } from 'vitest'
import { findStorageOverlaps } from './spatialRules'
import type { LayoutObject } from '../../types/layout'

function makeObject(overrides: Partial<LayoutObject> = {}): LayoutObject {
  return {
    id: overrides.id ?? '1',
    objectType: 'rack',
    category: 'storage',
    x: 0,
    y: 0,
    width: 270,
    length: 110,
    rotationDeg: 0,
    zIndex: 0,
    properties: {},
    ...overrides,
  }
}

describe('findStorageOverlaps', () => {
  it('flags two racks whose footprints genuinely overlap', () => {
    const a = makeObject({ id: 'a', x: 0, y: 0 })
    const b = makeObject({ id: 'b', x: 100, y: 0 }) // overlaps a (a spans x:0-270)
    expect(findStorageOverlaps([a, b])).toEqual(new Set(['a', 'b']))
  })

  it('does not flag racks placed edge-to-edge with no real overlap', () => {
    const a = makeObject({ id: 'a', x: 0, y: 0 })
    const b = makeObject({ id: 'b', x: 270, y: 0 }) // touches a's right edge exactly
    expect(findStorageOverlaps([a, b])).toEqual(new Set())
  })

  it('does not flag racks that are simply near each other', () => {
    const a = makeObject({ id: 'a', x: 0, y: 0 })
    const b = makeObject({ id: 'b', x: 400, y: 400 })
    expect(findStorageOverlaps([a, b])).toEqual(new Set())
  })

  it('ignores overlap with non-storage types (e.g. a dock deliberately on a wall)', () => {
    const wall = makeObject({ id: 'wall', objectType: 'wall', category: 'structure', x: 0, y: 0, width: 300, length: 20 })
    const dock = makeObject({ id: 'dock', objectType: 'dock', category: 'structure', x: 0, y: 0, width: 300, length: 50 })
    expect(findStorageOverlaps([wall, dock])).toEqual(new Set())
  })

  it('flags a corridor overlapped by a rack', () => {
    const corridor = makeObject({ id: 'c', objectType: 'corridor', category: 'storage', x: 0, y: 0, width: 300, length: 150 })
    const rack = makeObject({ id: 'r', x: 50, y: 50 })
    expect(findStorageOverlaps([corridor, rack])).toEqual(new Set(['c', 'r']))
  })

  it('accounts for rotation via the bounding box', () => {
    // a 270x110 rack rotated 90deg occupies a 110x270 footprint centered the same place
    const a = makeObject({ id: 'a', x: 0, y: 0, rotationDeg: 90 })
    const b = makeObject({ id: 'b', x: 90, y: -50 })
    expect(findStorageOverlaps([a, b]).size).toBeGreaterThan(0)
  })
})
